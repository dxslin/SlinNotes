# apt使用示例

### 一、apt介绍

APT英文全称：Android annotation process tool是一种处理注解的工具，它会在编译时找出注解标注的地方，并提供接口供我们进行扩展处理，一般用来生成额外源文件，替代一些模板代码。常用的使用了apt技术的框架有 ButterKnife，dagger等。

本项目创建了一个例子，我们只需要编写初始化模块，然后使用 `Initialize`标记，apt将自动生成一个初始化类，调用所有的使用 `Initialize`标记的类或者方法。为了尽量展示各个类型的用法，请不必在意设计是否合理。

### 二、开始使用

##### 1. 创建APT模块

（1） 创建 `:apt:annotation`模块，用于放置注解和一些接口等信息，这个模块可以最后需要给外部引用，也可以将注解和接口帮助类等分开创建不同的模块

（2） 创建 `:apt:processor`模块，编译时，apt调用的模块。实现AbstractProcess，处理注解标注的代码，结合 `javapoet`或者 `kotlinpoet`生成模板代码。这个模块需要依赖上面的 `:apt:annotation`

（3） 创建 `:apt:test`模块，这是一个测试模块，可以不创建，本项目在其中编写了一些使用注解标注了的需要apt处理的代码

##### 2. 定义需要处理的注解类型和接口

（1） 在模块 `:apt:annotation`中创建Initialize注解

```kotlin
// Initialize.kt
@Retention(AnnotationRetention.SOURCE)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FIELD, AnnotationTarget.FUNCTION)
annotation class Initialize {

}
```

Target标记注解可以添加在类、成员变量或者方法上面

（2） 创建Initial接口

```kotlin
// Initial.kt
interface Initial {

    fun initial()

}
```

##### 3. 实现注解处理器

（1） 在 `:apt:processor`模块中引入 `auto-service`和 `kotlinpoet`

```gradle
// build.gradle
    implementation project(path: ':apt:annotation')
    kapt "com.google.auto.service:auto-service:1.0.1"
    implementation "com.google.auto.service:auto-service:1.0.1"
    implementation 'com.squareup:kotlinpoet:1.10.2'
```

> 引入 `auto-service`是为了自动生成 `resources/META-INF/services/ javax.annotation.processing.Processor`文件，文件内容为注解处理器的全称（包括包名），比如 `com.slin.study.processor.InitialProcessor`；如果不引入的话，创建文件，自己填写也行。

> 引入 `kotlinpoet`是为了方便生成kotlin代码

（2） 实现注解处理器

创建新的 `Processor`继承 `AbstractProcessor`，添加注解 `@AutoService(Processor::class)`。

```kotlin
// InitialProcessor.kt

@AutoService(Processor::class)
class InitialProcessor: AbstractProcessor() {

    override fun init(processingEnv: ProcessingEnvironment) {
        super.init(processingEnv)
    }

    override fun getSupportedSourceVersion(): SourceVersion {
        return SourceVersion.latestSupported()
    }

    override fun getSupportedAnnotationTypes(): MutableSet<String> {
        return ImmutableSet.of(Initialize::class.java.name)
    }

    override fun process(typeElementSet: MutableSet<out TypeElement>, roundEnvironment: RoundEnvironment): Boolean {
        // todo
        return true
    }


}
```

重写关键方法

* `init`：初始化。可以得到 `ProcessingEnviroment`，`ProcessingEnviroment`提供很多有用的工具类 `Elements`, `Types` 和 `Filer`
* `getSupportedAnnotationTypes`：指定这个注解处理器是注册给哪个注解的，这里说明是注解 `Initialize`
* `getSupportedSourceVersion`：指定使用的Java版本，通常这里返回 `SourceVersion.latestSupported()`
* `process`：可以在这里写扫描、评估和处理注解的代码，生成Kotlin/Java文件。其中 `typeElementSet`为注解的类型，`roundEnvironment`为环境，可以通过 `roundEnvironment.getElementsAnnotatedWith(typeElement)`查找使用了该类型注解源码，

（3） 生成kotlin代码

```kotlin
// ElementModel.kt
data class ElementModel(
    val packageName: String,        // 包名
    val className: String,          // 类名
    val methodName: String,         // 方法名
    val hasContext: Boolean = false,    // 是否有context参数
    val createInstance: Boolean,        // 是否需要创建实例，object class不需要创建
    val isVariable:Boolean = false,     // 是否成员变量
)
```

* 创建一个对象存储生成代码的信息

```kotlin
// ElementModel.kt

const val CONTEXT = "android.content.Context"
const val APPLICATION = "android.app.Application"

fun ExecutableElement.asElementModel(): ElementModel {
    if (enclosingElement !is TypeElement) {
        throw IllegalArgumentException("Methods of this type are not supported")
    }
    val typeElement = enclosingElement as TypeElement
    val className = typeElement.asClassName()
    var createInstance = true
    for (enclosedElement in typeElement.enclosedElements) {
        // object class 包含一个INSTANCE对象
        if (enclosedElement is VariableElement && enclosedElement.simpleName.contentEquals("INSTANCE")) {
            createInstance = false
            break
        }
    }

    return ElementModel(
        packageName = className.packageName,
        className = className.simpleName,
        methodName = simpleName.toString(),
        hasContext = hasContext(),
        createInstance = createInstance
    )
}

private fun ExecutableElement.hasContext(): Boolean {
    if (parameters.size > 1) {
        throw IllegalArgumentException("Only support no-args function or 1-arg function like fun(${CONTEXT})")
    }
    return parameters.size == 1 && parameters[0].isContext()
}

private fun VariableElement.isContext():Boolean {
    return asType().toString() == CONTEXT || asType().toString() == APPLICATION
}

```

创建一系列扩展函数，将apt获取出来的element转化为 `ElementModel`，比如下面将方法`ExecutableElement`对应的转化为 `ElementModel`。另外还有类对应的`TypeElement`和成员变量对应的`VariableElement`。完成代码参考[ElementModel.kt](https://github.com/dxslin/PluginStudy/blob/master/apt/processor/src/main/java/com/slin/study/processor/ElementModel.kt)

element中`enclosingElement`表示包裹此元素的外层元素，比如这里方法元素`ExecutableElement`的外层就是类元素`TypeElement`，而类元素`TypeElement`的外层则是包元素`PackageElement`。`enclosedElement`表示此元素包裹的元素，比如类元素`TypeElement`里面就是方法元素`ExecutableElement`和成员变量元素`VariableElement`，方法元素`ExecutableElement`如果有参数的话，里层也拥有变量元素`VariableElement`。

> 注：上面说的元素element都是接口，实现类都是XXSymbol（比如ClassSymbol），但是我们如果使用了这些Symbol，编译无法通过，暂不知如何解决

* 创建kotlin文件生成器

```kotlin
class InitiatorCreator(private val env: ProcessingEnvironment) {

    private val mPackageName: String = "com.slin.apt.generated"
    private val mClassName: String = "Initiator"

    private val elementList: MutableList<ElementModel> = mutableListOf()

    fun addElement(element: ElementModel) {
        elementList.add(element)
    }

    fun generate() {
        val fileSpecBuilder = FileSpec.builder(mPackageName, mClassName)
        elementList.forEach {
            fileSpecBuilder.addImport(it.packageName, it.className)
        }
        val fileSpec = fileSpecBuilder.addImport("android.app", "Application")
            .addType(initiatorType())
            .build()
        fileSpec.writeTo(System.out)
        fileSpec.writeTo(env.filer)
    }

    private fun initiatorType(): TypeSpec {
        return TypeSpec.objectBuilder(mClassName)
            .addFunction(
                FunSpec.builder("initial")
                    .addParameter("context", ClassName("android.app", "Application"))
                    .addCode(initCode())
                    .build()
            )
            .build()
    }

    private fun initCode(): CodeBlock {
        val codeBlock = CodeBlock.builder()
        for (element in elementList) {
            when {
                element.methodName.isEmpty() -> {
                    codeBlock.add("${element.className}${if (element.createInstance) "(${if (element.hasContext) "context" else ""})" else ""}\n")
                }
                element.isVariable -> {
                    codeBlock.add("${element.className}${if (element.createInstance) "()" else ""}.${element.methodName} = context\n")
                }
                else -> {
                    codeBlock.add("${element.className}${if (element.createInstance) "()" else ""}.${element.methodName}(${if (element.hasContext) "context" else ""})\n")
                }
            }
        }
        return codeBlock.build()
    }

}
```

首先创建一个列表保存ElementModel，然后创建Initiator类和initial方法，并根据列表中保存的数据

* 将注解标记的元素添加到生成器中，并生成kotlin文件

```kotlin

    private lateinit var messager:Messager

    // 初始化代码生成器
    private lateinit var initiatorCreator:InitiatorCreator

    override fun init(processingEnv: ProcessingEnvironment) {
        super.init(processingEnv)
        messager = processingEnv.messager

        initiatorCreator = InitiatorCreator(processingEnv)
    }

    override fun process(typeElementSet: MutableSet<out TypeElement>, roundEnvironment: RoundEnvironment): Boolean {

        log("InitialProcessor process: $typeElementSet $roundEnvironment")

        // 如果前面的processor发生错误，或者获取到的注解为空，则直接返回不处理
        if(roundEnvironment.errorRaised() || roundEnvironment.processingOver() || typeElementSet.isEmpty()){
            return false
        }

        for (typeElement in typeElementSet){
            log("typeElement: $typeElement")
            if(typeElement.qualifiedName.contentEquals(Initialize::class.java.name)){
//                val elementSet = roundEnvironment.getElementsAnnotatedWith(Initialize::class.java)
                val elementSet = roundEnvironment.getElementsAnnotatedWith(typeElement)
                for (element in elementSet){
                    log("element: $element")
                    when(element){
                        is TypeElement ->{
                            initiatorCreator.addElement(element.asElementModel())
                        }
                        is ExecutableElement ->{
                            initiatorCreator.addElement(element.asElementModel())
                        }
                        is VariableElement ->{
                            initiatorCreator.addElement(element.asElementModel())
                        }
                    }
                }
                // 生成kotlin文件
                initiatorCreator.generate()
                return true
            }
        }
        return false
    }

    private fun log(msg:CharSequence){
        messager.printMessage(Diagnostic.Kind.WARNING, msg)
    }

```

获取 所有`Initialize`注解标注的源码element，然后全部转为`ElementModel `，再添加到 `initiatorCreator`，最后一起生成`Initiator`类。

### 三、测试

在`:apt:test`模块中添加引用

```gradle
    // build.gradle
    implementation project(path: ':apt:annotation')
    kapt project(path: ':apt:processor')
```

创建测试类，并添加`Initialize`注解，更多示例，查看[测试例子](https://github.com/dxslin/PluginStudy/tree/master/apt/test/src/main/java/com/slin/study/test)

```kotlin
object MethodInitial  {

    private val TAG = MethodInitial::class.java.simpleName

    @Initialize
    fun methodInitial(){
        Log.d(TAG, "methodInitial: ")
    }

}
```

在`:app`中导入`:apt:test`

```gradle
    // build.gradle

    implementation project(path: ':apt:test')
```

编译之后就会在"apt\test\build\generated\source\kapt\debug\com\slin\apt\generated"生成`Initiator.kt`

```kotlin
public object Initiator {
  public fun initial(context: Application): Unit {
    MethodInitial.methodInitial()
  }
}
```

---

> 项目地址：[dxslin/PluginStudy](https://github.com/dxslin/PluginStudy)

---

### 参考文档

1. [Android APT及基于APT的简单应用](https://www.jianshu.com/p/94979c056b20)
2. [android进阶---【注解(二)之自定义编译期注解】](https://blog.csdn.net/sinat_26710701/article/details/88873696)
3. [kotlinpoet](https://square.github.io/kotlinpoet/)
4.
