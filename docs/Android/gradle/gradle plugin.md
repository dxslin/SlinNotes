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

Gradle插件可以使用Java、Groovy或者Kotlin编写，选择自己熟悉的语音即可。但是Java支持的语法糖较少，稍微会麻烦一点。



### 三、创建插件（Plugin）

#### 方式1：在buildSrc中编写插件

在buildSrc编写的插件可以直接在项目的build.gradle文件中通过类名引用，而且任务（Task）可以进行调试，编写测试时尽量在buildSrc中写好。

1. 创建buildSrc Module，在setting.gradle中删除`include ':buildSrc'`。buildSrc为保留Module名称，用于扩展Gradle项目构建能力。
2. 修改buildSrc中build.gradle文件如下：

```groovy
plugins {
    id 'java'
    // 如果使用Groovy编写插件引入
    id 'groovy'
}

dependencies {
    // 如果使用Groovy编写插件引入
    implementation localGroovy()
}

// 配置Java版本
java {
    sourceCompatibility = JavaVersion.VERSION_1_8
    targetCompatibility = JavaVersion.VERSION_1_8
}
```

如果使用kotlin编写，参考：[build.gradle.kts](https://github.com/dxslin/SlinLibrary/blob/master/buildSrc/build.gradle.kts)，需要将“build.gradle”改为“build.gradle.kts”。

3. 编写Plugin。

创建一个类并实现Plugin<Project>接口

```java
public class VersionPlugin implements Plugin<Project> {

    public void apply(Project target) {
        target.task("greeting", task -> {
            task.setGroup("version");
            task.doLast(task1 -> {
                System.out.println("greeting: doLast");
            });
            System.out.println("Version Plugin: Hello Slin");
        });
    }
}
```



方式2：在独立的项目中编写

1. 创建Java-Library Module，



详见[build.gradle](https://github.com/dxslin/PluginStudy/blob/master/SlinGradlePlugin/build.gradle)







### 四、添加任务（Task）



### 五、新建DSL



### 六、总结



### 参考文档

1. [What is Gradle?](https://docs.gradle.org/current/userguide/what_is_gradle.html)
2. [Gradle插件开发](https://www.jianshu.com/p/3c59eded8155)
3. 

