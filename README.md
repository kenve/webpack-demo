# webpack-demo
[Webpack](//webpack.github.io) 学习笔记

## HelloWorld
创建一个静态页面 `index.html` 和一个 JS 入口文件 `entry.js`,（查看[Demo](demo01/)）；
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>
    <meta charset="utf-8">
    <title>Webpack Demo01</title>
</head>
<body>
    <script src="bundle.js"></script>
</body>
</html>
```
```js
//entry.js
document.write('It works.');
```
然后编译 entry.js 并打包到 bundle.js：
```bash
$ webpack entry.js bundle.js
```
打包完成后，用浏览器打开 `index.html` 将会看到 `It works.` 。
接下来添加一个模块 `module.js` 并修改入口 `entry.js`：
```js
// module.js
module.exports='It works from module.js';
```
```js
//entry.js
document.write('It works.')

document.write(require('./module.js'))  //添加模块
```
重新打包`webpack entry.js bundle.js` 后刷新页面看到变化 `It works.It works from module.js.`
Webpack 会分析入口文件，解析包含依赖关系的各个文件。这些文件（模块）都打包到 bundle.js 。Webpack 会给每个模块分配一个唯一的 id 并通过这个 id 索引和访问模块。在页面启动时，会先执行 entry.js 中的代码，其它模块会在运行 require 的时候再执行。
## Loader
Webpack 本身只能处理 JavaScript 模块，如果要处理其他类型的文件，就需要使用 loader 进行转换。

Loader 可以理解为是模块和资源的转换器，它本身是一个函数，接受源文件作为参数，返回转换的结果。这样，我们就可以通过 `require` 来加载任何类型的模块或文件，比如 CoffeeScript、 JSX、 LESS 或图片。

先来看看 loader 有哪些特性？

* Loader 可以通过管道方式链式调用，每个 loader 可以把资源转换成任意格式并传递给下一个 loader ，但是最后一个 loader 必须返回 JavaScript。
* Loader 可以同步或异步执行。
* Loader 运行在 node.js 环境中，所以可以做任何可能的事情。
* Loader 可以接受参数，以此来传递配置项给 loader。
* Loader 可以通过文件扩展名（或正则表达式）绑定给不同类型的文件。
* Loader 可以通过 npm 发布和安装。
* 除了通过 `package.json` 的 `main`指定，通常的模块也可以导出一个loader来使用。
* Loader 可以访问配置。
* 插件可以让 loader 拥有更多特性。
* Loader 可以分发出附加的任意文件。
* Loader 本身也是运行在 node.js 环境中的 JavaScript 模块，它通常会返回一个函数。大多数情况下，我们通过 npm 来管理 loader，但是你也可以在项目中自己写 loader 模块。

按照惯例，而非必须，loader 一般以`xxx-loader`的方式命名，`xxx`代表了这个`loader`要做的转换功能，比如`json-loader`。
在引用 loader 的时候可以使用全名`json-loader`，或者使用短名`json`。这个命名规则和搜索优先级顺序在 webpack 的 `resolveLoader.moduleTemplates` api中定义。
```js
Default: ["*-webpack-loader", "*-web-loader", "*-loader", "*"]
```
Loader 可以在`require()`引用模块的时候添加，也可以在 webpack 全局配置中进行绑定，还可以通过命令行的方式使用。
接上一节的例子，我们要在页面中引入一个 CSS 文件`style.css`，首页将`style.css`也看成是一个模块，然后用`css-loader`来读取它，再用`style-loader`把它插入到页面中(查看[查看Demo](demo02/))。
```css
/*style.css*/

body {
    background: yellow;
}
```
修改 entry.js：
```js
//entry.js

require("!style!css./style.css")//载入style.css

document.write('It works.')

document.write(require('./module.js'))  //添加模块
```
安装loader:
```bash
 npm install css-loader style-loader
```
重新编译打包，刷新页面，就可以看到黄色的页面背景了。

如果每次 `require` CSS 文件的时候都要写 loader 前缀，是一件很繁琐的事情。我们可以根据模块类型（扩展名）来自动绑定需要的 loader。
将 entry.js 中的 `require("!style!css!./style.css")` 修改为 `require("./style.css")` ，然后执行：
```bash
$ webpack entry.js bundle.js --module-bind 'css=style!css'
```
显然，这两种使用 loader 的方式，效果是一样的。
## 配置文件
Webpack 在执行的时候，除了在命令行传入参数，还可以通过指定的配置文件来执行。默认情况下，会搜索当前目录的`webpack.config.js`文件，这个文件是一个 node.js 模块，返回一个 json 格式的配置信息对象，或者通过 `--config` 选项来指定配置文件。
继续上面的案例（查看[Demo](demo03/)）在项目根目录目录的控制台中输入`npm init`来创建`package.json` 来添加 webpack 需要的依赖：

```
{
    "name": "demo03",
    "version": "1.0.0",
    "description": "A simple webpack example.",
    "main": "bundle.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [
        "webpack"
    ],
    "author": "xzw",
    "license": "MIT",
    "devDependencies": {
        "css-loader": "^0.23.1",
        "style-loader": "^0.13.1"
    }
}
```

```bash
// 安装依赖模块
 npm install css-loader style-loader --save
```
若直接手动创建或修改`package.json`文件保存后要运行`npm install`命令。
然后创建一个配置文件 `webpack.config.js`：
```js
module.exports={
	entry:'./entry.js',
	output:{
		path:__dirname,
		filename:'bundle.js'
	},
	module:{
		loaders:[{
			test:/\.css$/,
			loader:'style!css'
		}]
	}

}
```
同时简化 `entry.js` 中的 `style.css` 加载方式：
```js
require("./style.css")//载入style.css
```
最后控制台运行`webpack`，可以看到webpack 通过配置文件执行的结果和上一章节通过命令行 `webpack entry.js bundle.js --module-bind 'css=style!css'` 执行的结果是一样的。

## 插件
插件可以完成更多 loader 不能完成的功能。

插件的使用一般是在 webpack 的配置信息 `plugins` 选项中指定。

Webpack 本身内置了一些常用的插件，还可以通过 npm 安装第三方插件,使用内置插件需要通过`npm install webpack --save-dev`把webpack安装到项目内容。

接下来，我们利用一个最简单的 `BannerPlugin` 内置插件来实践插件的配置和运行，这个插件的作用是给输出的文件头部添加注释信息(查看[Demo](demo04/))。
修改 `webpack.config.js`，添加 `plugins`：
```js
var webpack=require('webpack');
module.exports={
	entry:'./entry.js',
	output:{
		path:__dirname,
		filename:'bundle.js'
	},
	module:{
		loaders:[{
			test:/\.css$/,
			loader:'style!css'
		}]
	},
	plugins:[
	new webpack.BannerPlugin('This file created by kenve')
	]
}
```
然后运行 `webpack`，打开`bundle.js`，可以看到文件头部出现了我们指定的注释信息：
## 开发环境
当项目逐渐变大，webpack 的编译时间会变长，可以通过参数让编译的输出内容带有进度和颜色。
```
$ webpack --progress --colors
```
如果不想每次修改模块后都重新编译，那么可以启动监听模式。开启监听模式后，没有变化的模块会在编译后缓存到内存中，而不会每次都被重新编译，所以监听模式的整体速度是很快的。
```
$ webpack --progress --colors --watch
```
当然，使用`webpack-dev-server` 开发服务是一个更好的选择。它将在localhost:8080 启动一个 express 静态资源 web 服务器，并且会以监听模式自动运行 webpack，在浏览器打开 [http://localhost:8080/](http://localhost:8080/) 或 [http://localhost:8080/webpack-dev-server/](http://localhost:8080/webpack-dev-server/) 可以浏览项目中的页面和编译后的资源输出，并且通过一个 socket.io 服务实时监听它们的变化并自动刷新页面。
```bash
# 安装
$ npm install webpack-dev-server -g

# 运行
$ webpack-dev-server --progress --colors
```
## 故障处理
Webpack 的配置比较复杂，很容出现错误，下面是一些通常的故障处理手段。

一般情况下，webpack 如果出问题，会打印一些简单的错误信息，比如模块没有找到。我们还可以通过参数 `--display-error-details` 来打印错误详情。
```bash
$ webpack --display-error-details
```
Webpack 的配置提供了 `resolve` 和 `resolveLoader` 参数来设置模块解析的处理细节，`resolve` 用来配置应用层的模块（要被打包的模块）解析，`resolveLoader` 用来配置 `loader` 模块的解析。

当引入通过 npm 安装的 node.js 模块时，可能出现找不到依赖的错误。Node.js 模块的依赖解析算法很简单，是通过查看模块的每一层父目录中的 `node_modules` 文件夹来查询依赖的。当出现 Node.js 模块依赖查找失败的时候，可以尝试设置 `resolve.fallback `和 `resolveLoader.fallback` 来解决问题。
```js
module.exports = {
  resolve: { fallback: path.join(__dirname, "node_modules") },
  resolveLoader: { fallback: path.join(__dirname, "node_modules") }
};
```
Webpack 中涉及路径配置最好使用绝对路径，建议通过 `path.resolve(__dirname, "app/folder") `或 `path.join(__dirname, "app", "folder")` 的方式来配置，以兼容 Windows 环境。
## 更多

查看[webpack官方文档](http://webpack.github.io/docs/)
## License
MIT
