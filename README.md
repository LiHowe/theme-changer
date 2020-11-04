# H-Theme-Changer

A simply way to change theme

## Install

`npm i h-theme-changer --save`

```javascript

import Theme from 'h-theme-changer'

Theme.setOption({
  // theme-changer option
})

Theme.changeTheme('theme-name')

```

## Option

+ **mode** `number`
  实现方式

  + Theme.mode.ROOT_CSS: 通过CSS全局变量实现 (**默认**)
  + Theme.mode.STRING_TEMPLATE: 通过主题字符串模板实现
  + Theme.mode.LINK_TAG(**WIP**): 通过style link链接实现 (**正在开发**)

+ **colorDefine** `{[key: string]: { [key: string]: string }}`
  主题颜色定义对象

+ **cache** `boolean`
  是否缓存, 默认开启

+ **cacheType**
  缓存类型

  + Theme.cacheType.LOCAL_STORAGE: localStorage缓存
  + Theme.cacheType.DOM: DOM缓存 (**默认**)
  + Theme.cacheType.HEAP: 内存缓存

+ **mountTarget** `string`
  style标签挂载点. 在`mode = Theme.mode.STRING_TEMPLATE | Theme.mode.LINK_TAG`模式下可用
  + body: `<body>`
  + head: `<head>`(**默认**)

+ **idPrefix** `string`
  生成样式标签id前缀, 默认为`--theme-`

+ **styleLinkMap** `Map<string, string>`
  颜色style标签对应引用地址

+ **templateGenerator** `Function`
  主题字符串模板生成器, 返回值应该是**以主题名称为key, 样式表字符串为value的对象**

+ **changeWhenInit** `boolean`
  是否在初始化的时候就调用changeTheme方法, 默认为`true`
