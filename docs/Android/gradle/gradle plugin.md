# Android Gradle Plugin



### 一、Gradle插件介绍

[Gradle](http://www.gradle.org/) 是一个灵活而强大的通用构建工具，它可以用于构建任何软件，Android Studio 便是使用Gradle 自动执行和管理构建流程。

Android编译构建系统是由Gradle和Android Plugin for Gradle组成，Android Plugin for Gradle便是专门用于构建安卓app的Gradle插件。我们也可以自定义插件来封装我们自己的编译规则和功能。

Gradle 的核心模型基于任务的有向无环图，即是基于它们之间的依赖（dependOn）将一组任务连接在一起。创建任务图后，Gradle 会确定哪些任务需要以何种顺序运行，然后继续执行它们。

该图显示了两个示例任务图，一个是抽象的，另一个是具体的，任务之间的依赖关系用箭头表示：

![ *Gradle 任务图的两个示例*](https://docs.gradle.org/current/userguide/img/task-dag-examples.png)

Gradle构建分为三个阶段：

1. 初始化

   为构建设置环境并确定哪些项目将参与其中。

2. 配置

   为构建构建和配置任务图，然后根据用户想要运行的任务确定需要运行哪些任务以及以何种顺序运行。

3. 执行

   运行在配置阶段结束时选择的任务。



### 二、插件开发语言选择

Gradle插件可以使用Java、Groovy或者Kotlin编写，选择自己熟悉的语言即可。但是Java支持的语法糖较少，稍微会麻烦一点。



### 三、创建插件（Plugin）

插件可以创建在buildSrc模块（Module）中，也可以创建在自定义模块中。在buildSrc编写的插件可以直接在项目的build.gradle文件中通过类名引用，而且任务（Task）可以进行调试，但是只能在本项目中使用。自定义模块中的插件，只能先发布到仓库，然后再导入引用。

#### 1. 创建在buildSrc模块中

1. 创建buildSrc 模块，在setting.gradle中删除`include ':buildSrc'`。（buildSrc为保留模块名称，用于扩展Gradle项目构建能力）
2. 修改buildSrc中build.gradle文件如下：

```groovy
plugins {
    id 'java'
    // 如果使用Groovy编写插件引入
    id 'groovy'
}

dependencies {
    // 插件相关的API
    implementation gradleApi()
    // 测试相关的api
    testImplementation gradleTestKit()
    // 如果使用Groovy编写的，引入相应api
    implementation localGroovy()
    // 安卓项目结构的API，与根目录build.gradle文件中dependencies引入的安卓build插件一致。
    implementation "com.android.tools.build:gradle:4.2.2"
}

// 仓库设置，如果想导入第三方的library需要配置
repositories {
    google()
    mavenCentral()
}

// 配置Java版本
java {
    sourceCompatibility = JavaVersion.VERSION_1_8
    targetCompatibility = JavaVersion.VERSION_1_8
}
```

这里即配置了Java版本，也配置了groovy版本，如果不需要使用groovy，删除相关配置即可。其中`com.android.tools.build:gradle:4.2.2`是配置构建安卓项目的插件api（即根目录build.gradle文件中引用的`classpath "com.android.tools.build:gradle:4.2.2"`），如果需要使用到android相关的配置，比如签名配置、渠道配置等可以引用（引用该插件必须得配置google()仓库）。

如果使用kotlin编写，参考：[build.gradle.kts](https://github.com/dxslin/SlinLibrary/blob/master/buildSrc/build.gradle.kts)，需要将“build.gradle”改为“build.gradle.kts”。

3. 编写Plugin。

创建一个类并实现Plugin<Project>接口

```java
public class VersionPlugin implements Plugin<Project> {

    public void apply(Project target) {
        // 创建一个Task
        target.task("greeting", task -> {
            // 将task添加到version组，如果改组不存在，会自动创建
            task.setGroup("version");
            task.doLast(task1 -> {
                System.out.println("greeting: doLast");
            });
            System.out.println("Version Plugin: Hello Slin");
        });
    }
}
```

4. 引用自定义的Plugin

在应用的模块中的build.gradle添加如下代码导入plugin，同步（sync）之后就会发现多了一个version分组和一个greeting的Task，右键任务可以执行或者调试。

```groovy
import com.slin.study.buildsrc.VersionPlugin
// 导入VersionPlugin插件
apply plugin: VersionPlugin
```

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/image-20211104201805797.png"  alt=""/>
    <br>
    <div style="font-size:12px; color:orange; border-bottom: 1px solid #d9d9d9;display: inline-block;color: #aaa;padding: 2px;">
      greeting任务<br>
        Tips：如果没有Tasks的话，需要前往File -> Settings -> Experimental -> 取消勾选 “Do not build Gradle task list during Gradle sync”
  	</div>
</center>





5. 创建索引

> 一般发布的插件都不是直接通过类名引用，而是通过别称来引用插件，比如`com.android.application`或者`java-library`，因此也需要创建一个对应于Plugin的一个索引。

在模块下面新建`src/main/resources/META-INF/gradle-plugins/`目录，然后新建文件`xx.properties`，`xx`为索引名称，一般为`包名`+`插件名`，比如`com.slin.study.version.properties`，那么`com.slin.study.version`便是引用的索引。然后在文件中填写插件类名，如果有多个插件可以创建多个properties文件。

```properties
# 实现类
implementation-class=com.slin.study.buildsrc.VersionPlugin
```

直接通过名称引用插件：

```groovy
apply plugin: 'com.slin.study.version'
```



#### 2. 创建在自定义模块中

1. 创建自定义模块

如果插件在buildSrc模块中无法发布直接发布，需要创建新的模块（这个模块需要配置在setting.gradle中），重新按照上面的步骤配置项目。

2. 发布到本地仓库

在build.gradle中如下打包发布配置：

```groovy
// maven发布插件，用于将插件打包发布上传到仓库
apply plugin: 'maven-publish'

// project组，引用插件时用到
group = "com.slin.study.gradle.plugin"
// 版本
version = "1.0.0"

// 上传仓库配置
uploadArchives {
    repositories {
        // 配置成本地仓库
        ivy { url "${rootDir.path}/plugin_release" }
        // flatDir name: 'libs', dirs: "${rootDir.path}/plugin_release"
    }
}
```

这里配置的将插件的打包发布到项目的`plugin_release`文件夹中，运行`uploadArchives`任务打包发布。仓库配置还可以设置成flatDir、maven、jcenter、mavenCentral、mavenLocal等。

详见[build.gradle](https://github.com/dxslin/PluginStudy/blob/master/SlinGradlePlugin/build.gradle)

3. 引用本地仓库插件

在项目根目录build.gradle文件中添加自定义仓库，然后在dependencies中导入相应的插件（“`group`:`moduleName`:`version`”），之后便可以使用`apply plugin`引用插件。

```groovy
buildscript {
    repositories {
        google()
        mavenCentral()
        // 上面配置的本地仓库
        ivy { url "${rootDir.path}/plugin_release" }
    }
    dependencies {
        classpath "com.android.tools.build:gradle:4.2.2"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.31"
		// 导入插件库
        classpath "com.slin.study.gradle.plugin:SlinGradlePlugin:1.0.0"

    }
}
```

```groovy
apply plugin: 'com.slin.study.gradle.plugin.slin_gradle_plugin'
```



### 四、创建任务（Task）

#### 1.任务的基本概念

Gradle 在一个项目上可以做的工作都是由一个或多个*任务* 定义的。任务代表构建执行的一些原子工作。它们可能是编译一些类、创建 JAR、生成 Javadoc 或将一些档案发布到存储库。

任务与函数一样，包括输入、输出、和执行过程，如下图。

![任务输入输出](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/taskInputsOutputs.png)

从上图中可以看出，输入的一个重要特征是它会影响一个或多个输出，如果输入或输出没有任何变化，依然去执行任务，将会消耗很多资源，因此Gradle 任务采用增量构建。Gradle 会检测自上次构建以来是否有任何任务输入或输出发生了变化。如果没有，Gradle 可以认为任务是最新的，因此跳过执行其操作。另请注意，不管任务有多少输入，必须至少有一个输出，否则增量构建将不起作用。

如果任务属性影响输出，请确保将其注册为输入，否则该任务可能会被错误的认为是最新的。相反，如果属性不影响输出，则不要将它们注册为输入，否则任务可能会在不需要时执行。还要注意那种相同输入生成不同输出的非确定性任务：不应为增量构建配置这些任务，因为最新检查将不起作用。

任务执行之后，会打印其执行方式：

`(no label)` 或者 `EXECUTED`

任务执行其所有的操作，即正常执行。

`UP-TO-DATE`

任务的输出没有改变。任务可能执行了操作，但是告诉没有任何输出改变。或者没有可执行操作并且所有依赖项都是`UP-TO-DATE`。

`FROM-CACHE`

任务的输出可以从之前的执行中找到，并从构建缓存恢复。

`SKIPPED`

任务未执行其操作。比如[从命令行中明确排除任务](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:excluding_tasks_from_the_command_line)或者有一个[`onlyIf`](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:using_a_predicate)返回假。

`NO-SOURCE`

任务不需要执行其操作。任务有输入和输出，但输入标记为[`@SkipWhenEmpty`](https://docs.gradle.org/current/userguide/more_about_tasks.html#skip-when-empty)且为空。例如，源文件是[JavaCompile 的](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.compile.JavaCompile.html)`.java`文件。

#### 2. 创建一个自定义任务

Gradle中所有的任务都是继承自`DefaultTask`，其支持三个主要类别的输入和输出：

- 简单值

  字符串和数字之类的东西。更一般地说，一个简单的值可以有任何实现 的类型`Serializable`，通过Property包装。

- 文件系统类型

  它们包括标准`File`类，但也包括 Gradle 的[FileCollection](https://docs.gradle.org/current/javadoc/org/gradle/api/file/FileCollection.html)类型的派生类，以及任何其他可以传递给[Project.file(java.lang.Object)](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:file(java.lang.Object))方法（用于单个文件/目录属性）或[Project.files(java.lang.Object)](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:file(java.lang.Object))方法的类型。

- 嵌套值

  不符合其他两个类别但具有自己的输入或输出属性的自定义类型。实际上，任务输入或输出嵌套在这些自定义类型中。

  

```java
//ProcessTemplatesTask.java
public abstract class ProcessTemplatesTask extends DefaultTask {

    @Input
    public abstract Property<TemplateEngine> getTemplateEngine();

    @InputFiles
    public abstract ConfigurableFileCollection getSourceFiles();

    @Nested
    public abstract TemplateData getTemplateData();

    @OutputDirectory
    public abstract DirectoryProperty getOutputDir();

    @TaskAction
    public void processTemplate(){

    }

}
```

```java
//TemplateData.java
public abstract class TemplateData {

    @Input
    public abstract Property<String> getName();

    @Input
    public abstract MapProperty<String, String> getVariables();

}

```



- 



| 注解                      | 预期属性类型                                         | 描述                                                         |
| :------------------------ | :--------------------------------------------------- | :----------------------------------------------------------- |
| `@Input`                  | 任何`Serializable`类型                               | 一个简单的输入值                                             |
| `@InputFile`              | `File`*                                              | 单个输入文件（不是目录）                                     |
| `@InputDirectory`         | `File`*                                              | 单个输入目录（不是文件）                                     |
| `@InputFiles`             | `Iterable<File>`*                                    | 输入文件和目录的迭代                                         |
| `@Classpath`              | `Iterable<File>`*                                    | 代表 Java 类路径的输入文件和目录的可迭代对象。这允许任务忽略对属性的不相关更改，例如相同文件的不同名称。它类似于注释属性，`@PathSensitive(RELATIVE)`但它会忽略直接添加到类路径的 JAR 文件的名称，并将文件顺序的更改视为类路径的更改。Gradle 将检查类路径上 jar 文件的内容并忽略不影响类路径语义的更改（例如文件日期和条目顺序）。另请参阅[使用类路径注释](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_input_using_classpath_annotations)。**注：**该`@Classpath`注释在摇篮3.2中引入。为了与早期的 Gradle 版本保持兼容，类路径属性也应该用`@InputFiles`. |
| `@CompileClasspath`       | `Iterable<File>`*                                    | 代表 Java 编译类路径的输入文件和目录的可迭代对象。这允许任务忽略不影响类路径中类的 API 的不相关更改。另请参阅[使用类路径注释](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_input_using_classpath_annotations)。以下对类路径的更改将被忽略：更改 jar 或顶级目录的路径。更改时间戳和 Jars 中的条目顺序。对资源和 Jar 清单的更改，包括添加或删除资源。对私有类元素的更改，例如私有字段、方法和内部类。代码更改，例如方法主体、静态初始化程序和字段初始化程序（常量除外）。对调试信息的更改，例如当对注释的更改影响类调试信息中的行号时。对目录的更改，包括 Jars 中的目录条目。该`@CompileClasspath`注解是在 Gradle 3.4 中引入的。为了与 Gradle 3.3 和 3.2 保持兼容，编译类路径属性也应该用`@Classpath`. 为了与 3.2 之前的 Gradle 版本兼容，该属性也应该用`@InputFiles`. |
| `@OutputFile`             | `File`*                                              | 单个输出文件（不是目录）                                     |
| `@OutputDirectory`        | `File`*                                              | 单个输出目录（不是文件）                                     |
| `@OutputFiles`            | `Map<String, File>`** 或`Iterable<File>`*            | 输出文件的可迭代或映射。使用文件树会关闭任务的[缓存](https://docs.gradle.org/current/userguide/build_cache.html#sec:task_output_caching)。 |
| `@OutputDirectories`      | `Map<String, File>`** 或`Iterable<File>`*            | 一个可迭代的输出目录。使用文件树会关闭任务的[缓存](https://docs.gradle.org/current/userguide/build_cache.html#sec:task_output_caching)。 |
| `@Destroys`               | `File`或`Iterable<File>`*                            | 指定此任务删除的一个或多个文件。请注意，任务可以定义输入/输出或可销毁对象，但不能同时定义两者。 |
| `@LocalState`             | `File`或`Iterable<File>`*                            | 指定一个或多个代表[任务本地状态的](https://docs.gradle.org/current/userguide/custom_tasks.html#sec:storing_incremental_task_state)文件。当任务从缓存中加载时，这些文件将被删除。 |
| `@Nested`                 | 任何自定义类型                                       | 一种自定义类型，它可能不会实现，`Serializable`但至少有一个字段或属性用此表中的注释之一标记。它甚至可能是另一个`@Nested`。 |
| `@Console`                | 任何类型                                             | 表示该属性既不是输入也不是输出。它只是以某种方式影响任务的控制台输出，例如增加或减少任务的详细程度。 |
| `@Internal`               | 任何类型                                             | 表示该属性在内部使用，但既不是输入也不是输出。               |
| `@ReplacedBy`             | 任何类型                                             | 表示该属性已被另一个替换，应作为输入或输出忽略。             |
| `@SkipWhenEmpty`          | `File`或`Iterable<File>`*                            | 与`@InputFiles`或`@InputDirectory`一起使用，如果相应的文件或目录为空，则告诉 Gradle 跳过任务，以及使用此注释声明的所有其他输入文件。由于使用此注释声明为空的所有输入文件而被跳过的任务将导致明显的“无源”结果。例如，`NO-SOURCE`将在控制台输出中发出。暗示`@Incremental`。 |
| `@Incremental`            | `Provider<FileSystemLocation>` 或者 `FileCollection` | 与`@InputFiles`或`@InputDirectory`用于指示 Gradle 跟踪对带注释的文件属性的更改，因此可以通过. 所需的[增量任务](https://docs.gradle.org/current/userguide/custom_tasks.html#incremental_tasks)。`@InputChanges.getFileChanges()` |
| `@Optional`               | 任何类型                                             | 与[可选](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/Optional.html)API 文档中列出的任何属性类型注释一起使用。此注释禁用对相应属性的验证检查。有关更多详细信息，请参阅[验证部分](https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_input_output_validation)。 |
| `@PathSensitive`          | `File`或`Iterable<File>`*                            | 与任何输入文件属性一起使用，告诉 Gradle 只将文件路径的给定部分视为重要的。例如，如果一个属性用 注释`@PathSensitive(PathSensitivity.NAME_ONLY)`，那么在不更改其内容的情况下移动文件不会使任务过时。 |
| `@IgnoreEmptyDirectories` | `File`或`Iterable<File>`*                            | 与`@InputFiles`或`@InputDirectory`一起使用，指示 Gradle 仅跟踪目录内容的更改，而不跟踪目录本身的差异。例如，在目录结构中的某处删除、重命名或添加空目录不会使任务过时。 |
| `@NormalizeLineEndings`   | `File`或`Iterable<File>`*                            | 与`@InputFiles`,`@InputDirectory`或`@Classpath`一起使用，用于指示 Gradle 在计算最新检查或构建缓存键时规范化行尾。例如，在 Unix 行尾和 Windows 行尾（或反之亦然）之间切换文件不会使任务过时。 |

> 注释必须放在 getter 或 Groovy 属性上。放置在 setter 或 Java 字段上没有相应的带注释的 getter 的注释将被忽略。



### 五、新建DSL







### 六、总结



### 参考文档

1. [What is Gradle?](https://docs.gradle.org/current/userguide/what_is_gradle.html)
2. [Gradle插件开发](https://www.jianshu.com/p/3c59eded8155)
3. 

