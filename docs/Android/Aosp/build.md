# 在WSL-Ubuntu环境下编译AOSP

### 一、下载Android源码

##### 1. 安装 Repo

[下载源代码  |  Android 开源项目  |  Android Open Source Project (google.cn)](https://source.android.google.cn/source/downloading?hl=zh-cn)

Repo 是一款工具，可让您在 Android 环境中更轻松地使用 Git。要详细了解 Repo，请参阅[开发](https://source.android.google.cn/source/developing?hl=zh-cn)部分。

要安装 Repo，请执行以下操作：

1. 确保主目录下有一个 bin/ 目录，并且该目录包含在路径中：

   ```
   mkdir ~/bin
   PATH=~/bin:$PATH
   ```
2. 下载 Repo 工具，并确保它可执行：

   ```
   curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo
   chmod a+x ~/bin/repo
   ```

##### 2. 下载源码

清华源下载已经被限速，推荐使用中科大源：

清华源下载帮助：[AOSP | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/help/AOSP/)

中科大下载帮助：[AOSP 镜像使用帮助 — USTC Mirror Help 文档](https://mirrors.ustc.edu.cn/help/aosp.html)

推荐直接下载每日打包文件然后加压，使用方法如下:

```
wget -c https://mirrors.ustc.edu.cn/aosp-monthly/aosp-latest.tar # 下载初始化包
tar xf aosp-latest.tar
cd AOSP   # 解压得到的 AOSP 工程目录
# 这时 ls 的话什么也看不到，因为只有一个隐藏的 .repo 目录
repo sync # 正常同步一遍即可得到完整目录
# 或 repo sync -l 仅checkout代码
```

此后，每次只需运行 `repo sync` 即可保持同步。 **我们强烈建议您保持每天同步，并尽量选择凌晨等低峰时间**

### 二、编译前的准备

##### 1.  添加WSL配置

WSL默认为Ubuntu分配的内存为Windows内存的一半，如果电脑只有16G内存，那么Ubuntu只有8G内存，但是AOSP要求最低16G内存，因此我们需要添加配置文件，增加内存分配。

新建文件`C:\Users\<UserName>\.wslconfig`，分配12G内存和20G交换空间（虚拟内存）：

```plaintext
# Settings apply across all Linux distros running on WSL 2
[wsl2]

# Limits VM memory to use no more than 4 GB, this can be set as whole numbers using GB or MB
memory=12GB 

# Sets the VM to use two virtual processors
#processors=24

# Specify a custom Linux kernel to use with your installed distros. The default kernel used can be found at https://github.com/microsoft/WSL2-Linux-Kernel
# kernel=C:\\temp\\myCustomKernel

# Sets additional kernel parameters, in this case enabling older Linux base images such as Centos 6
# kernelCommandLine = vsyscall=emulate

# Sets amount of swap storage space to 8GB, default is 25% of available RAM
swap=20GB

# Sets swapfile path location, default is %USERPROFILE%\AppData\Local\Temp\swap.vhdx
swapfile=E:\\Subsystem\\wsl-ubuntu-22.04\\wsl-swap.vhdx

# Disable page reporting so WSL retains all allocated memory claimed from Windows and releases none back when free
# pageReporting=false

# Turn off default connection to bind WSL 2 localhost to Windows localhost
# localhostforwarding=true

# Disables nested virtualization
# nestedVirtualization=false

# Turns on output console showing contents of dmesg when opening a WSL 2 distro for debugging
# debugConsole=true

```


### 三、编译

要构建 Android，您必须选择要使用`lunch`命令构建的[目标](https://source.android.com/docs/setup/build/building#choose-a-target)设备类型。目标是设备排列，例如特定型号或外形规格。

下面包含的设备目标`aosp_cf_x86_64_phone-userdebug`使您能够构建[Cuttlefish](https://source.android.com/docs/setup/create/cuttlefish)虚拟 Android 设备以在没有物理设备的情况下进行测试。

要改为构建和更新物理设备，请选择另一个目标并按照[闪烁设备](https://source.android.com/docs/setup/build/running)的说明进行操作。

1. 通过从源代码签出的根目录运行以下命令来设置构建 Android 设备的环境：

   ```
   source build/envsetup.sh
   ```
2. 将构建目标传递给 lunch 命令，如下所示：

   ```
   lunch aosp_cf_x86_64_phone-userdebug
   ```
3. 使用以下方法从结帐中的任何位置[构建](https://source.android.com/docs/setup/build/building#build-the-code)代码：

   ```
   m
   ```

预计第一次构建需要数小时。后续构建花费的时间要少得多。

四、报错处理

1. 报soong启动错误

```
20:56:15 soong bootstrap failed with: exit status 1
ninja: build stopped: subcommand failed.
```

解决办法：增加内存，如果物理内存不够，参考上面增加虚拟内存。


2. out/build_error文件里面报OOM

需要增大运行内存，之前给WSL分配的8G内存，一直报OOM，但是分配12G内存之后不再报错。
