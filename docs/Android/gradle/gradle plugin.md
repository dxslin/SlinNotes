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

#### 1：在buildSrc中编写插件

在buildSrc编写的插件可以直接在项目的build.gradle文件中通过类名引用，而且任务（Task）可以进行调试。但是只能在本项目中使用。

1. 创建buildSrc 模块（Module），在setting.gradle中删除`include ':buildSrc'`。（buildSrc为保留模块名称，用于扩展Gradle项目构建能力）
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

![image-20211104201805797](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/image-20211104201805797.png)



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

6. 发布到本地仓库

如果插件在buildSrc模块中无法发布直接发布，需要创建新的模块，将之前的代码复制到其中。然后在build.gradle中配置发布



详见[build.gradle](https://github.com/dxslin/PluginStudy/blob/master/SlinGradlePlugin/build.gradle)



### 四、添加任务（Task）



### 五、新建DSL



### 六、总结



### 参考文档

1. [What is Gradle?](https://docs.gradle.org/current/userguide/what_is_gradle.html)
2. [Gradle插件开发](https://www.jianshu.com/p/3c59eded8155)
3. 

