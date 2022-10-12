## 安装依赖

```
npm install webpack webpack-cli -D
```

## 工作模式

webpack在4以后支持0配置打包

1.新建src/index.js

```
const a = 'Hello!'
console.log(a)
```

2.添加 start script到**Package.json**文件

```
"start": "webpack"
```

3.运行npm start触发打包

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0a53e027c98489996769e6f83a03fa9~tplv-k3u1fbpfcp-watermark.image?)

打包完成之后会生成一个dist/main.js文件

并且发现日志中有一个提示：The 'mode' option has not been set

> **模式：** 供 mode 配置选项，告知 webpack 使用相应模式的内置优化，默认值为 `production`，另外还有 `development`、`none`，他们的区别如下

| 选项        | 描述                                                  |
| ----------- | ----------------------------------------------------- |
| development | 开发模式，打包更加快速，省了代码优化步骤              |
| production  | 生产模式，打包比较慢，会开启 tree-shaking 和 压缩代码 |
| none        | 不使用任何默认优化选项                                |

怎么配置呢？

修改start script为 `webpack --mode=development`



## 基础配置文件

1. 新建webpack.config.js，添加基础配置

```
const path = require('path')

module.exports = {
  mode: 'development', // 模式
  entry: './src/index.js', // 打包入口地址
  output: {
    filename: 'bundle.js', // 输出文件名
    path: path.join(__dirname, 'dist') // 输出文件目录
  }
}
```



## Loader

把入口文件改成CSS文件，会打包成功吗

1.新增src/index.css

```
body {
  background: red;
}
```

2.修改配置

```
const path = require('path')

module.exports = {
  mode: 'development', // 模式
  entry: './src/index.css', // 打包入口地址
  output: {
    filename: 'bundle.css', // 输出文件名
    path: path.join(__dirname, 'dist') // 输出文件目录
  }
}
```

3.运行npm start，发现打包失败

原因： **webpack 默认支持处理 JS 与 JSON 文件，其他类型都处理不了，这里必须借助 Loader 来对不同类型的文件的进行处理。**

4.安装css-loader来编译CSS

```
npm i -D css-loader
```

5.配置资源加载模块

```
const path = require('path')

module.exports = {
  entry: './src/index.css', // 打包入口地址
  output: {
    filename: 'bundle.js', // 输出文件名
    path: path.join(__dirname, 'dist') // 输出文件目录
  },
  module: {
    rules: [ // 转换规则
      {
        test: /\.css$/, //匹配所有的 css 文件
        use: 'css-loader' // use: 对应的 Loader 名称
      }
    ]
  }
}
```

6.重新运行命令，打包成功！

这里我们可以得到一个结论：**Loader 就是将 Webpack 不认识的内容转化为认识的内容**

## 插件（plugin）

与 Loader 用于转换特定类型的文件不同，**插件（Plugin）可以贯穿 Webpack 打包的生命周期，执行不同的任务**

1.新建 `./src/index.html` 文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ITEM</title>
</head>
<body>
  
</body>
</html>
```


如果我想打包后的资源文件（例如：js 或者 css 文件）可以自动引入到 Html 中，就需要使用插件 [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)

2.本地安装 `html-webpack-plugin`

```bash
npm i -D html-webpack-plugin 
```

3.配置插件

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js', // 打包入口地址
  output: {
    filename: 'bundle.js', // 输出文件名
    path: path.join(__dirname, 'dist') // 输出文件目录
  },
  module: { 
    rules: [
      {
        test: /\.css$/, //匹配所有的 css 文件
        use: 'css-loader' // use: 对应的 Loader 名称
      }
    ]
  },
  plugins:[ // 配置插件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}
```

4.运行打包之后，打开 dist 目录下生成的 index.html 文件，可以看到它自动引入了打包好的 bundle.js

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>webpack</title>
</head>
<body>
<h1>Hello</h1>
</body>
</html>
```

## 自动清空打包目录

每次打包的时候，打包目录都会遗留上次打包的文件，为了保持打包目录的纯净，我们需要在打包前将打包目录清空

这里我们可以使用插件 [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) 来实现

1. 安装

```js
npm i -D clean-webpack-plugin 
```

2.配置

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 引入插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  // ...
  plugins:[ // 配置插件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CleanWebpackPlugin() // 引入插件
  ]
}
```

## 区分环境

本地开发和部署线上是有不同的需求，需要做的就是做好环境的区分

**本地环境：**

- 需要更快的构建速度
- 需要打印 debug 信息
- 需要 live reload 或 hot reload 功能
- 需要 sourcemap 方便定位问题
- ...

**生产环境：**

- 需要更小的包体积，代码压缩+tree-shaking
- 需要进行代码分割
- 需要压缩图片体积
- ...

1. 本地安装 [cross-env](https://www.npmjs.com/package/cross-env)

```bash
npm i -D cross-env 
```

1. 配置启动命令

打开 `./package.json`

```json
"scripts": {
    "dev": "cross-env NODE_ENV=dev webpack serve --mode development", 
    "test": "cross-env NODE_ENV=test webpack --mode production",
    "build": "cross-env NODE_ENV=prod webpack --mode production"
  },
```



## 启动 devServer

1.安装 [webpack-dev-server](https://webpack.docschina.org/configuration/dev-server/#devserver)

```bash
npm i -D webpack-dev-server
```

2.修改配置

```
const config = {
  //...
  devServer: {
    allowedHosts: 'all',
    static: {
      directory: path.join(__dirname, 'dist'),
    }, // 静态文件目录
    compress: true, //是否启动压缩 gzip
    port: 3000, // 端口号
    open: true,  // 是否自动打开浏览器
    hot: false, //为了 liveReload 能够生效，devServer.hot 配置项必须禁用
  },
  //...
}

module.exports = config
```

从 webpack-dev-server v4 开始，HMR 是默认启用的。默认情况下，当监听到文件变化时 dev-server 将会重新加载或刷新页面。为了 `liveReload` 能够生效，[`devServer.hot`](https://webpack.docschina.org/configuration/dev-server/#devserverhot) 配置项必须禁用或者 [`devServer.watchFiles`](https://webpack.docschina.org/configuration/dev-server/#devserverwatchfiles) 配置项必须启用。

配置static.directory的好处：因为 webpack 在进行打包的时候，对静态文件的处理，例如图片，都是直接 copy 到 dist 目录下面。但是对于本地开发来说，这个过程太费时，也没有必要，所以在设置 contentBase 之后，就直接到对应的静态目录下面去读取文件，而不需对文件做任何移动，节省了时间和性能开销。

3.在public目录下添加一张图片test.jpeg，并运行`npm run dev`启动服务

打开地址http://localhost:8080/test.jpeg ，正常访问没问题

## 引入 CSS

上面，我们在 Loader 里面讲到了使用 css-loader 来处理 css，但是单靠 css-loader 是没有办法将样式加载到页面上。这个时候，我们需要再安装一个 style-loader 来完成这个功能

style-loader 就是将处理好的 css 通过 style 标签的形式添加到页面上

1.安装 [style-loader](https://www.npmjs.com/package/style-loader)

```bash
npm i -D style-loader
```

2.配置 Loader

```js
const config = {
  // ...
  module: { 
    rules: [
      {
        test: /\.css$/, //匹配所有的 css 文件
        use: ['style-loader','css-loader']
      }
    ]
  },
  // ...
}
复制代码
```

> **⚠️注意：** Loader 的执行顺序是固定从后往前，即按 `css-loader --> style-loader` 的顺序执行

3.重启服务，就能发现样式生效了


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39b6cd8556764cfabca8dcf092d86ab9~tplv-k3u1fbpfcp-watermark.image?)

## CSS 兼容性

使用 [postcss-loader](https://webpack.docschina.org/loaders/postcss-loader/)，自动添加 CSS3 部分属性的浏览器前缀

在CSS文件中添加使用 `transform: translateX(50%);`，可以使用 postcss-loader 来帮助我们加上不同的浏览器前缀

1.安装postcss-loader和postcss

```
npm i -D postcss postcss-loader postcss-preset-env
```

2.配置loader

```
const config = {
  // ...
  module: { 
    rules: [
      {
        test: /\.css$/, //匹配所有的 css 文件
        use: ['style-loader','css-loader', 'postcss-loader']
      }
    ]
  },
  // ...
}
```

3.创建 postcss 配置文件 `postcss.config.js`

```js
module.exports = {
  plugins: [require('postcss-preset-env')]
}
```

4.创建 postcss-preset-env 配置文件 `.browserslistrc`

```bash
last 2 versions # 回退两个浏览器版本
> 0.5% # 全球超过0.5%人使用的浏览器，可以通过 caniuse.com 查看不同浏览器不同版本占有率
IE 10 # 兼容IE 10
```

项目中可以根据实际需求添加兼容的浏览器版本

5.重启服务，前缀添加成功


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7c10767dc644dfe93227e18c13bd5dd~tplv-k3u1fbpfcp-watermark.image?)

如果对 `.browserslistrc` 不同配置产生的效果感兴趣，可以使用 [autoprefixer](http://autoprefixer.github.io/) 进行在线转化查看效果

同样可以通过[autoprefixer](https://github.com/postcss/autoprefixer)包来使用 caniuse.com 中的值添加 CSS 属性的浏览器前缀

##  引入 Less 或者 Sass

less 和 sass 同样是 Webpack 无法识别的，需要使用对应的 Loader 来处理一下

| 文件类型 | loader                             |
| -------- | ---------------------------------- |
| Less     | less-loader                        |
| Sass     | sass-loader node-sass 或 dart-sass |

Less 处理相对比较简单，直接添加对应的 Loader 就好了

Sass 不光需要安装 `sass-loader` 还得搭配一个 `node-sass`

1.安装

```
npm install -D sass-loader node-sass
```

2.新建sass.scss文件

```
$greed: rgb(157, 236, 6);

h1 {
  color: $greed;
}
```

3.在index.js中引入sass文件

```
import './sass.scss' 
```

4.修改配置

```
const config = {
   // ...
   rules: [
      {
        test: /\.(s[ac]|c)ss$/i, //匹配所有的 sass/scss/css 文件
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader', 
        ]
      },
    ]
  },
  // ...
}
```

## 分离样式文件

前面结束到依赖 `style-loader` 将样式通过 style 标签的形式添加到页面上

但是，通常我们都是通过 CSS 文件的形式引入到页面上

1.安装 [`mini-css-extract-plugin`](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fplugins%2Fmini-css-extract-plugin%2F)

```shell
npm install mini-css-extract-plugin -D
```

2.修改 `webpack.config.js` 配置

```js
// ...
// 引入插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


const config = {
  // ...
  module: { 
    rules: [
      // ...
      {
        test: /\.(s[ac]|c)ss$/i, //匹配所有的 sass/scss/css 文件
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader, // 添加 loader
          'css-loader',
          'postcss-loader',
          'sass-loader', 
        ] 
      },
    ]
  },
  // ...
  plugins:[ // 配置插件
    // ...
    new MiniCssExtractPlugin({ // 添加插件
      filename: '[name].[hash:8].css'
    }),
    // ...
  ]
}
```

2.运行打包，查看打包结果


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/743ae11095ae42f8910ac8b5bff7c5d4~tplv-k3u1fbpfcp-watermark.image?)


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cccc8e29fdef45e28851ae7473aa3135~tplv-k3u1fbpfcp-watermark.image?)


## 图片和字体文件

虽然开发环境可以通过配置devServer.static直接读取静态文件，但是生产环境会找不到资源

实际上，Webpack 无法识别图片文件，需要在打包的时候处理

常用的处理图片文件的 Loader 包含：

| Loader      | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| file-loader | 解决图片引入问题，并将图片 copy 到指定目录，默认为 dist      |
| url-loader  | 解依赖 file-loader，当图片小于 limit 值的时候，会将图片转为 base64 编码，大于 limit 值的时候依然是使用 file-loader 进行拷贝 |
| img-loader  | 压缩图片                                                     |

1. 安装 `file-loader`

```bash
npm install file-loader -D
```

2.修改配置

```
const config = {
  //...
  module: { 
    rules: [
      {
         // ...
      }, 
      {
        test: /\.(jpe?g|png|gif)$/i, // 匹配图片文件
        use:[
          'file-loader' // 使用 file-loader
        ]
      }
    ]
  },
  // ...
}
```

#### JS 兼容性（Babel）

在开发中我们想使用最新的 Js 特性，但是有些新特性的浏览器支持并不是很好，所以 Js 也需要做兼容处理，常见的就是将 ES6 语法转化为 ES5。

需要用到 Babel

1. 安装依赖

```bash
$ npm install babel-loader @babel/core @babel/preset-env -D
复制代码
```

- `babel-loader` 使用 Babel 加载 ES2015+ 代码并将其转换为 ES5
- `@babel/core`  Babel 编译的核心包
- `@babel/preset-env` Babel 编译的预设，可以理解为 Babel 插件的超集

2. 配置 Babel 预设

```
// webpack.config.js
// ...
const config = {
  //...
  module: { 
    rules: [
      {
        test: /\.js$/i,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ],
            }
          }
        ]
      },
    // ...
    ]
  },
  //...
}
// ...
```

尽然是做兼容处理，我们自然也可以指定到底要兼容哪些浏览器

为了避免 `webpack.config.js` 太臃肿，建议将 Babel 配置文件提取出来

根目录下新增 `.babelrc.js`

```
// ./babelrc.js

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        // useBuiltIns: false 默认值，无视浏览器兼容配置，引入所有 polyfill
        // useBuiltIns: entry 根据配置的浏览器兼容，引入浏览器不兼容的 polyfill
        // useBuiltIns: usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添加
        useBuiltIns: "entry",
        corejs: "3.9.1", // 是 core-js 版本号
        targets: {
          chrome: "58",
          ie: "11",
        },
      },
    ],
  ],
};

```

修改webpack.config.js

```
const config = {
  //...
  module: { 
    rules: [
      {
        test: /\.js$/i,
        use: [
          {
            loader: 'babel-loader'
            }
          }
        ]
      },
    // ...
    ]
  },
  //...
}
// ...
```



这里一个简单的 Babel 预设就配置完了

常见 Babel 预设还有：

- `@babel/preset-flow`
- `@babel/preset-react`
- `@babel/preset-typescript`
