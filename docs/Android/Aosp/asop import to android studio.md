# 将AOSP导入到Android Studio


### 一、编译idegen模块，生成IDE项目文件

在源码中，存在idegen模块，该模块专门用来为idea工具生成系统源码的project.默认情况下aosp编译并不会生成该文件。
在开始编译该模块之前，首先确保你已经编译过Android源码了，如果没有，先要进行AOSP编译。和编译普通的模块一样，我们用mmm命令编译idegen.

在开始编译之前，检查out/host/linux-x86/framework/目录下是否存在idegen.jar文件，存在则说明你已经编译过该模块，否者，则需要编译.执行如下命令即可:

```bash
source build/envsetup.sh 将脚本添加到系统内
lunch 并选择要编译的项目
mmm development/tools/idegen/ 
sudo ./development/tools/idegen/idegen.sh

```

> 如果执行脚本报`./development/tools/idegen/idegen.sh: line 17: java: command not found`，那么需要通过下面方式安装java

```bash
sudo apt install default-jre
sudo update-alternatives --config java
```

简单的说明一下这三个文件的作用:

android.ipr:通常是保存工程相关的设置，比如编译器配置，入口，相关的libraries等
android.iml:则是主要是描述了modules，比如modules的路径，依赖关系等.
android.iws:则主要是包含了一些个人工作区的设置.

> "android.iml"和"android.ipr"一般是"只读"的属性，我们这里建议大家，把这两个文件改成可读可写，否则，在更改一些项目配置的时候可能会出现无法保存的情况，执行如下两条命令即可。

```bash
sudo chmod 777 android.iml
sudo chmod 777 android.ipr
```

### 二、导入到Android Studio

##### 1. 排除不需要的模块

因为整个aosp项目文件非常多，我们只需要添加我们关注的模块，将不需要关注的模块全部排出在项目外。打开`android.iml`文件，搜索`excludeFolder`关键字，然后按照格式添加下面的排除项。

```bash
      <excludeFolder url="file://$MODULE_DIR$/.repo" />
      <excludeFolder url="file://$MODULE_DIR$/abi" />
      <excludeFolder url="file://$MODULE_DIR$/art" />
      <excludeFolder url="file://$MODULE_DIR$/bionic" />
      <excludeFolder url="file://$MODULE_DIR$/bootable" />
      <excludeFolder url="file://$MODULE_DIR$/build" />
      <excludeFolder url="file://$MODULE_DIR$/cts" />
      <excludeFolder url="file://$MODULE_DIR$/dalvik" />
      <excludeFolder url="file://$MODULE_DIR$/developers" />
      <excludeFolder url="file://$MODULE_DIR$/development" />
      <excludeFolder url="file://$MODULE_DIR$/device" />
      <excludeFolder url="file://$MODULE_DIR$/docs" />
      <excludeFolder url="file://$MODULE_DIR$/external" />
      <excludeFolder url="file://$MODULE_DIR$/external/bluetooth" />
      <excludeFolder url="file://$MODULE_DIR$/external/chromium" />
      <excludeFolder url="file://$MODULE_DIR$/external/emma" />
      <excludeFolder url="file://$MODULE_DIR$/external/icu4c" />
      <excludeFolder url="file://$MODULE_DIR$/external/jdiff" />
      <excludeFolder url="file://$MODULE_DIR$/external/webkit" />
      <excludeFolder url="file://$MODULE_DIR$/frameworks/base/docs" />
      <excludeFolder url="file://$MODULE_DIR$/frameworks/base/extension" />
      <excludeFolder url="file://$MODULE_DIR$/hardware" />
      <excludeFolder url="file://$MODULE_DIR$/kernel" />
      <excludeFolder url="file://$MODULE_DIR$/kernel-3.18" />
      <excludeFolder url="file://$MODULE_DIR$/libcore" />
      <excludeFolder url="file://$MODULE_DIR$/libnativehelper" />
      <excludeFolder url="file://$MODULE_DIR$/ndk" />
      <excludeFolder url="file://$MODULE_DIR$/oem-release" />
      <excludeFolder url="file://$MODULE_DIR$/out" />
      <excludeFolder url="file://$MODULE_DIR$/out/eclipse" />
      <excludeFolder url="file://$MODULE_DIR$/out/host" />
      <excludeFolder url="file://$MODULE_DIR$/out/target/common/docs" />
      <excludeFolder url="file://$MODULE_DIR$/out/target/common/obj/JAVA_LIBRARIES/android_stubs_current_intermediates" />
      <excludeFolder url="file://$MODULE_DIR$/out/target/product" />
      <excludeFolder url="file://$MODULE_DIR$/pdk" />
      <excludeFolder url="file://$MODULE_DIR$/platform_testing" />
      <excludeFolder url="file://$MODULE_DIR$/prebuilt" />
      <excludeFolder url="file://$MODULE_DIR$/prebuilts" />
      <excludeFolder url="file://$MODULE_DIR$/rc_projects" />
      <excludeFolder url="file://$MODULE_DIR$/sdk" />
      <excludeFolder url="file://$MODULE_DIR$/system" />
      <excludeFolder url="file://$MODULE_DIR$/tools" />
      <excludeFolder url="file://$MODULE_DIR$/trusty" />
      <excludeFolder url="file://$MODULE_DIR$/vendor" />

```

##### 2. 打开aosp项目

打开Android Studio，然后选择open，选择aosp文件夹即可打开。

##### 3. 配置源码正确的跳转

当我们导入完源码后，就可以查看整个系统的源码，但是有个问题，打开的Java代码，查看集成关系或者调用关系的时候，还是会跳转到.class文件中，而不是相应的Java类，
比如PhoneWindow.java继承了Window.java，但是我们跳转的时候却跳到了Window.class，并没有跳转到frameworks目录下对应的源码类，而是jar包中的类。
我们需要让其跳转到相应的类中。我们就需要新建一个没有任何jar库的SDK给到系统源码项目的依赖， 这里的配置JDK/SDK，是用于解决在分析和调试源码的过程，能正确地跳转到目标源码，
而非SDK中的代码。


* 新建JDK
  Project Structure -> SDKs， 新建 JDK， 其中JDK目录可选择跟原本JDK一致即可，任意取一个名字，这里取empty_jdk 然后删除这里取empty_jdk其classpath和SourcePath的内容，确保使用Android系统源码文件

![img](https://img-blog.csdnimg.cn/img_convert/828b0e6024c2df388aac0bb8637f7e9b.png)

* 配置SDK
  Project Structure -> SDKs， 选中与自己编译的AOSP对应的SDk版本(如果没有对应的就到SDKmanager里面取下载一个对应的版本) Android API 28 Platform， 然后选择其Java SDK为前面新建的empty_jdk

![](https://img-blog.csdnimg.cn/img_convert/6898bcba8832a74115e3d61699c7055f.png)

* 选择SDK
  Project Structure -> Project -> 选中Project SDK， 选择前面的Android API 28 Platform

![](https://img-blog.csdnimg.cn/img_convert/8b879adc7f133b775f9d48f0d01ac7e0.png)

* 建立依赖
  Project Structure -> Modules -> android -> Dependencies: Module选择我们上面编辑过的SDK。然后点击下图绿色的+号来选择Jars or directories，将 aosp/frameworks 目录添加进来，再按照同样的步骤将aosp/external 目录， 也可添加其他所关注的源码；
  然后选中其他所有的依赖，点击右边的下移箭头将其他依赖移动到我们添加的目录下面。(或者将其他的所有依赖删除)
  ![](https://img-blog.csdnimg.cn/img_convert/16ea889ffabb0ff8ce2610dca8ba4c04.png)

> 注意，一般我们大部分人不在ubuntu下开发app ，为了能在Windows或Mac系统下也能使用Android Studio查看源码，
> 可以按照上面的步骤，那样直接拷贝ubuntu下的android.iml和android.ipr文件到Windows或Mac系统下的android源码根目录下，
> 然后导入Adnroid Studio中，这样就可以在这两个平台上进行查看源码了。



### 参考文档

1. [下载AOSP源码编译、调试、刷机_PalmerYang的博客-CSDN博客_aosp 禁用kvm](https://blog.csdn.net/unreliable_narrator/article/details/101637891?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0-101637891-blog-120396315.pc_relevant_recovery_v2&spm=1001.2101.3001.4242.1&utm_relevant_index=2)

2. [Android Studio 导入 AOSP 源码 - 腾讯云开发者社区-腾讯云 (tencent.com)](https://cloud.tencent.com/developer/article/1552441)
