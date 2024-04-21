// 运行在 Electron 主进程 下的插件入口
const { shell, ipcMain } = require("electron");

onLoad();

// 加载插件时触发
function onLoad() {
    // markdownit 规则
    // 给 img 套上和 QQ 一样的样式，以达成相同的显示效果
    const qqImage = (md) => {
        const image = md.renderer.rules.image
        md.renderer.rules.image = (...args) => {
            let raw = image(...args)
            // QQ 采用了 vue scoped，不能使用 class 来复用样式
            // 此处直接复制粘贴了 QQ 9.9.9-22868 的样式
            raw = raw.replace("<img", `<img class="image-content" style="
                height: 100%;
                image-rendering: -webkit-optimize-contrast;
                object-fit: cover;
                object-position: center top;
                text-indent: 100%;
                width: 100%;"`)
            return `
                <div class="image pic-element" role="img" aria-label="图片" style="
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                    border-bottom-left-radius: 4px;
                    max-width: 100%;
                    overflow-x: hidden;
                    overflow-y: hidden;
                    margin: 4px 0px;

                    line-height: 0;
                    position: relative;
                    user-select: none;
                ">
                    ${raw}
                </div>
            `
        }
    }

    const plugin_path = LiteLoader.plugins["markdown_it"].path.plugin;
    const hljs = require(`${plugin_path}/src/lib/highlight.js`);
    const katex = require(`${plugin_path}/src/lib/markdown-it-katex.js`);
    const mark = require(`${plugin_path}/src/lib/markdown-it.js`)({
        html: true, // 在源码中启用 HTML 标签
        xhtmlOut: true, // 使用 '/' 来闭合单标签 （比如 <br />）。
        // 这个选项只对完全的 CommonMark 模式兼容。
        breaks: true, // 转换段落里的 '\n' 到 <br>。
        langPrefix: "language-", // 给围栏代码块的 CSS 语言前缀。对于额外的高亮代码非常有用。
        linkify: true, // 将类似 URL 的文本自动转换为链接。

        // 启用一些语言中立的替换 + 引号美化
        typographer: false,

        // 双 + 单引号替换对，当 typographer 启用时。
        // 或者智能引号等，可以是 String 或 Array。
        //
        // 比方说，你可以支持 '«»„“' 给俄罗斯人使用， '„“‚‘'  给德国人使用。
        // 还有 ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] 给法国人使用（包括 nbsp）。
        quotes: "“”‘’",

        // 高亮函数，会返回转义的HTML。
        // 或 '' 如果源字符串未更改，则应在外部进行转义。
        // 如果结果以 <pre ... 开头，内部包装器则会跳过。
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return (
                        '<pre class="hljs"><code>' +
                        hljs.highlight(lang, str, true).value +
                        "</code></pre>"
                    );
                } catch (__) { }
            }

            return (
                '<pre class="hljs"><code>' +
                mark.utils.escapeHtml(str) +
                "</code></pre>"
            );
        }
    })
        .use(katex)
        .use(qqImage);
    ipcMain.handle("LiteLoader.markdown_it.render", (event, content) => {
        // console.log(`[Markdown-It] Rendering content: \n${mark.render(content)}`);
        return mark.render(content);
    });
    ipcMain.handle("LiteLoader.markdown_it.open_link", (event, content) => {
        if (content.indexOf("http") != 0) {
            content = "http://" + content;
        }
        return shell.openExternal(content);
    });
}

// 这两个函数都是可选的
module.exports = {
    // onLoad
};
