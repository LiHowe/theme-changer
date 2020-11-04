/**
 * root: 使用css :root{} 实现
 * style: 使用动态<style>标签实现
 */
declare type RenderNode = 'body' | 'head';
declare type ThemeOptions = {
    mode: ThemeMode;
    colorDefine?: {
        [key: string]: {
            [key: string]: string;
        };
    };
    cache?: boolean;
    cacheType?: ThemeCacheType;
    mountTarget?: RenderNode;
    idPrefix?: string;
    styleLinkMap?: Map<string, string> | null;
    templateGenerator?: Function;
    changeWhenInit?: string;
};
declare global {
    interface Window {
        __theme: Theme;
    }
    interface Element {
        disabled: boolean;
    }
}
declare enum ThemeMode {
    ROOT_CSS = 0,
    STRING_TEMPLATE = 1,
    LINK_TAG = 2
}
declare enum ThemeCacheType {
    LOCAL_STORAGE = 0,
    DOM = 1,
    HEAP = 2
}
declare class Theme {
    private readonly defaultColor;
    private static theme;
    private styleSheetCache;
    private readonly defaultOption;
    private readonly options;
    private __dev__;
    private themeName;
    private formattedThemeName;
    private constructor();
    static Mode: typeof ThemeMode;
    static CacheType: typeof ThemeCacheType;
    static getInstance: (opt?: ThemeOptions | undefined) => Theme;
    /**
     * 构建<style>标签
     * create <style>
     * @param themeName 主题名
     * @param generateWhenNotExist 在标签不存在的时候是否构建标签
     */
    private getStyleElementByThemeName;
    /**
     * 生成style标签
     * @param themeName
     */
    private generateStyleElement;
    /**
     * 构建:root{} 全局css变量
     */
    private generateRootVariable;
    /**
     * 构建style link标签
     */
    private generateLinkTag;
    /**
     * 删除style标签
     * @param themeName
     * @param styleElement?
     */
    private deleteStyleElement;
    /**
     * append <style> to <html> or <body>
     * @param styleNode
     */
    private activeStyleSheet;
    /**
     * 构建style标签内容
     * generate <style> innerHTML
     * @param themeName 主题名称
     */
    private generateStyleContent;
    /**
     * 缓存style标签
     * @param themeName
     * @param themeElement?
     */
    private cacheStyleElement;
    /**
     * 根据主题名称获取style标签
     * @param themeName
     */
    private getCachedStyleElement;
    /**
     * 清空样式缓存
     */
    private clearCache;
    /**
     * 获取添加前缀后的样式名
     * @param themeName
     */
    private getFormattedThemeName;
    /**
     * 获取原始样式名
     * @param formattedThemeName
     */
    private getRawThemeName;
    /**
     * 获取主题配置信息
     * get the options of Theme
     */
    getOptions: () => ThemeOptions;
    setOption: (opt: ThemeOptions) => Theme;
    setTemplateGenerator: (generator: Function) => void;
    getCurrentTheme: () => string;
    /**
     * 主题文件注册器
     * auto theme file loader
     * @param path
     * @param fileReg
     */
    /**
     * 改变主题
     * change theme
     * @param themeName
     */
    changeTheme: (themeName: string) => void;
}
declare const _default: Theme;
export default _default;
