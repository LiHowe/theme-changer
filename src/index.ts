/**
 * root: 使用css :root{} 实现
 * style: 使用动态<style>标签实现
 */
type RenderNode = 'body' | 'head'

type ThemeOptions = {
  mode: ThemeMode // 主题类型
  colorDefine?: { [key: string]: { [key: string]: string } } // 主题颜色定义
  cache?: boolean // 是否缓存
  cacheType?: ThemeCacheType // 缓存类型
  mountTarget?: RenderNode // 挂载点
  idPrefix?: string // 样式id前缀
  styleLinkMap?: Map<string, string> | null // 颜色style标签对应的引用地址
  templateGenerator?: Function
  changeWhenInit?: string // 是否在初始化的时候改变主题
}

declare global {
  interface Window {
    __theme: Theme
  }
  interface Element {
    disabled: boolean
  }
}

enum ThemeMode {
  ROOT_CSS,
  STRING_TEMPLATE,
  LINK_TAG
}

enum ThemeCacheType {
  LOCAL_STORAGE,
  DOM,
  HEAP
}


class Theme {

  private readonly defaultColor = {
    default: {
      primary: '#EC6300'
    }
  }
  private static theme: Theme
  private styleSheetCache: Map<string, Element> = new Map()
  private readonly defaultOption: ThemeOptions = {
    mode: ThemeMode.ROOT_CSS,
    colorDefine: this.defaultColor,
    cache: true,
    cacheType: ThemeCacheType.DOM,
    mountTarget: 'head',
    idPrefix: '--theme-'
  }
  private readonly options: ThemeOptions = this.defaultOption
  private __dev__: boolean = process ? process.env.NODE_ENV !== 'production' : false
  private themeName: string = ''
  private formattedThemeName: string = ''

  private constructor(options?: ThemeOptions) {
    if (this.__dev__) {
      if (!options) return
      if (options.mode === ThemeMode.ROOT_CSS) {
        console.warn('IE browser not support this type, please use \'stringTemplate\' to instead of it')
      }
    }
    this.options = Object.assign(this.defaultOption, options)
  }

  mode = ThemeMode
  cacheType = ThemeCacheType

  static getInstance = (opt?: ThemeOptions):Theme => {
    if (!Theme.theme) {
      Theme.theme = new Theme(opt)
    }
    if (Theme.theme.__dev__) {
      if (window) {
        window.__theme = Theme.theme
      }
    }
    if (Theme.theme.options.changeWhenInit) {
      Theme.theme.changeTheme(Theme.theme.options.changeWhenInit)
    }
    return Theme.theme
  }

  /**
   * 构建<style>标签
   * create <style>
   * @param themeName 主题名
   * @param generateWhenNotExist 在标签不存在的时候是否构建标签
   */
  private getStyleElementByThemeName = (themeName: string, generateWhenNotExist: boolean = false): Element | null => {
    let existStyleElement: Element | null = document.querySelector(`#${this.options.idPrefix}${themeName}`)
    if (existStyleElement) return existStyleElement
    if (this.styleSheetCache.get(themeName)) {
      return this.styleSheetCache.get(themeName) || null
    }
    if (generateWhenNotExist) {
     this.generateStyleElement(themeName)
    }
    return null
  }

  /**
   * 生成style标签
   * @param themeName
   */
  private generateStyleElement = (themeName: string): Element => {
    const cachedEl = this.getCachedStyleElement(themeName)
    if (cachedEl) return cachedEl
    const styleElement = document.createElement('style')
    styleElement.id = this.options.idPrefix + themeName
    styleElement.innerHTML = this.generateStyleContent(themeName)
    return styleElement
  }

  /**
   * 构建:root{} 全局css变量
   */
  private generateRootVariable = (themeName: string): void => {
    if (!this.options.colorDefine) {
      throw new Error('You must define theme color in ROOT_CSS mode')
    }
    Object.keys(this.options.colorDefine[themeName]).forEach((key: string) => {
      if (this.options.colorDefine && this.options.colorDefine[themeName]) {
        document.documentElement.style.setProperty(`--${key}`, this.options.colorDefine[themeName][key])
      }
    })
  }

  /**
   * 构建style link标签
   */
  private generateLinkTag = () => {
    if (this.options.styleLinkMap) {
      const root = document.createDocumentFragment()
      this.options.styleLinkMap.forEach((value, key) => {
        const link = document.createElement('link')
        link.href = value
        link.rel = 'preload'
        link.as = 'style'
        link.id = this.getFormattedThemeName(key) // 为了之后启用查找用
        root.appendChild(link)
      })
      document.head.appendChild(root)
    }
  }

  /**
   * 删除style标签
   * @param themeName
   * @param styleElement?
   */
  private deleteStyleElement = (themeName: string, styleElement?: Element) => {
    if (styleElement) {
      document[this.options.mountTarget!].removeChild(styleElement)
      return
    }
    const existElement = document.querySelector(`#${this.options.idPrefix}${themeName}`)
    if (existElement) {
      document[this.options.mountTarget!].removeChild(existElement)
    }
  }

  /**
   * append <style> to <html> or <body>
   * @param styleNode
   */
  private activeStyleSheet = (styleNode: Element) => {
    if (this.options.cache && styleNode.hasAttribute('is-cache')) {
      styleNode.disabled = false
    } else {
      document[this.options.mountTarget!].appendChild(styleNode)
    }
  }

  /**
   * 构建style标签内容
   * generate <style> innerHTML
   * @param themeName 主题名称
   */
  private generateStyleContent = (themeName: string): string => {
    if (!this.options.templateGenerator) {
      throw new Error('The template generator is not set')
    }
    return this.options.templateGenerator(themeName)
  }

  /**
   * 缓存style标签
   * @param themeName
   * @param themeElement?
   */
  private cacheStyleElement = (themeName: string, themeElement?: Element | null): void => {
    const formattedThemeName = this.getFormattedThemeName(themeName)
    if (!themeElement) {
      themeElement = document.querySelector(`#${formattedThemeName}`)
      if (!themeElement) return
    }
    switch (this.options.cacheType) {
      case this.cacheType.DOM:
        themeElement.disabled = true
        themeElement.setAttribute('is-cache', '')
        break
      case this.cacheType.HEAP:
        !this.styleSheetCache.has(formattedThemeName) && this.styleSheetCache.set(formattedThemeName, themeElement)
        break
      case this.cacheType.LOCAL_STORAGE:
        if (!window.localStorage) {
          throw new Error('Your browser not support localStorage, please choose another cache type.')
        }
        window.localStorage.setItem(formattedThemeName, JSON.stringify({
          id: themeElement.id,
          content: themeElement.innerHTML
        }))
        break
    }
  }

  /**
   * 根据主题名称获取style标签
   * @param themeName
   */
  private getCachedStyleElement = (themeName: string): Element | null => {
    switch (this.options.cacheType) {
      case this.cacheType.DOM:
        return document.querySelector(`#${this.getFormattedThemeName(themeName)}`)
      case this.cacheType.HEAP:
        return this.styleSheetCache.get(this.getFormattedThemeName(themeName)) || null
      case this.cacheType.LOCAL_STORAGE:
        const cachedObjStr = window.localStorage.getItem(this.getFormattedThemeName(themeName))
        if (!cachedObjStr) return null
        const cachedObj = JSON.parse(cachedObjStr)
        const el = document.createElement('style')
        el.innerHTML = cachedObj.content
        el.id = cachedObj.id
        return el
      default:
        return null
    }
  }

  /**
   * 清空样式缓存
   */
  private clearCache = (): void => {
    switch (this.options.cacheType) {
      case this.cacheType.DOM:
        const ElementList = document.querySelectorAll('style[cache]')
        ElementList.forEach(el => {
          this.deleteStyleElement('', el)
        })
        break
      case this.cacheType.HEAP:
        this.styleSheetCache.clear()
        break
      case this.cacheType.LOCAL_STORAGE:
        Object.keys(window.localStorage).forEach(key => {
          if (key.startsWith(this.options.idPrefix!)) {
            window.localStorage.removeItem(key)
          }
        })
        break
      default:
        return
    }
  }

  /**
   * 获取添加前缀后的样式名
   * @param themeName
   */
  private getFormattedThemeName = (themeName: string): string => `${this.options.idPrefix}${themeName}`

  /**
   * 获取原始样式名
   * @param formattedThemeName
   */
  private getRawThemeName = (formattedThemeName: string): string => {
    if (this.options.idPrefix) {
      if (formattedThemeName.startsWith(this.options.idPrefix)) {
        return formattedThemeName.split(this.options.idPrefix)[1]
      }
    }
    return formattedThemeName
  }

  /**
   * 获取主题配置信息
   * get the options of Theme
   */
  getOptions = (): ThemeOptions => this.options

  setOption = (opt: ThemeOptions): Theme => {
    Theme.theme = new Theme(Object.assign(this.options, opt))
    return Theme.theme
  }

  setTemplateGenerator = (generator: Function) => {
    this.options.templateGenerator = generator
  }

  getCurrentTheme = () => this.themeName

  /**
   * 主题文件注册器
   * auto theme file loader
   * @param path
   * @param fileReg
   */
  // themeFileRegister = (path: string, fileReg: RegExp = /index\.js$/): {} => {
  //   if (!require) {
  //     throw new Error('webpack environment is required!')
  //   }
  //   const themeFiles = require.context(path, true, fileReg)
  //   return themeFiles.keys().reduce((theme: any, modulePath: string) => {
  //     const reg = /^\.\/(\w+)\/index\.\w+$/
  //     const matchedNameArr = modulePath.match(reg)
  //     if (matchedNameArr && matchedNameArr.length > 0) {
  //       const themeName = matchedNameArr[1]
  //       theme[this.getFormattedThemeName(themeName)] = themeFiles(modulePath).default
  //       return theme
  //     }
  //   }, {})
  // }

  /**
   * 改变主题
   * change theme
   * @param themeName
   */
  changeTheme = (themeName: string): void => {
    // for first time change theme
    if (themeName) {
      this.options.cache
        ? this.cacheStyleElement(this.themeName)
        : this.deleteStyleElement(this.themeName)
    }
    this.themeName = themeName
    switch (this.options.mode) {
      case ThemeMode.ROOT_CSS:
        this.generateRootVariable(themeName)
        break
      case ThemeMode.STRING_TEMPLATE:
        this.activeStyleSheet(this.generateStyleElement(themeName))
        break
      case ThemeMode.LINK_TAG:
        this.generateLinkTag()
        break
    }
  }
}

const initTheme = (option?: ThemeOptions): Theme => Theme.getInstance(option)

export default initTheme()
