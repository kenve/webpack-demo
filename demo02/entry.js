//entry.js

require("!style!css!./style.css")//载入style.css
document.write('It works.')

document.write(require('./module.js'))  //添加模块