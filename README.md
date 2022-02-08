# Slin笔记

## 一、 概述

本仓库是尝试使用  [mkdocs](https://www.mkdocs.org/) + [typora](https://www.typora.io/)<img src="https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/typora-icon.png" alt="typora" width="36" /> + [PicGo](https://github.com/Molunerfinn/PicGo/releases) 创建的笔记记事仓库。

## 二、项目配置

1. 克隆此仓库

```bash
clone https://github.com/dxslin/SlinNotes.git
```

2. 安装mkdocs和相关主题

   ```bash
   #安装Mkdocs
   pip install mkdocs
   #安装material主题
   pip install mkdocs-material
   #安装文件更新日期插件
   pip install mkdocs-git-revision-date-localized-plugin
   #缩减html和js
   pip install mkdocs-minify-plugin

   ```
3. 执行 `mkdocs serve` 并访问[http://localhost:8000/](http://localhost:8000/)查看

## 三、其他编辑Markdown文件方式

1. 使用vs code安装`vditor`(vscode all markdown)插件，打开插件设置，修改Image:Path Type为picgo，然后配置PicGo:Config Path为PicGo配置文件目录，我这里为“C:\Users\Administrator\AppData\Roaming\picgo\data.json”（打开PicGo设置，打开配置文件即可看到）

![PicGo](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img/1641276462604.png)

2. 使用Android Studio编辑markdown

（1） search everywhere 搜索“Choose Boot Java Runtime for the IDE...”，打开后选择一个带“JetBrains Runtime with JCEF”的java版本，比如“11.0.11+9-b1341.60 JetBrains Runtime with JCEF”

（2） 安装Markdown Editor插件

（3） 图床安装 Markdown Image Kit插件
![Markdown Image Kit插件](https://raw.githubusercontent.com/dxslin/SlinNotes/main/docs/assets/img//Accja8.png)

## 参考仓库：

1. [mkdocs](https://github.com/mkdocs/mkdocs/):  https://github.com/mkdocs/mkdocs/
2. [compose-library](https://github.com/compose-museum/compose-library):  https://github.com/compose-museum/compose-library
3. [pymdown-extensions](https://github.com/facelessuser/pymdown-extensions): https://github.com/facelessuser/pymdown-extensions
