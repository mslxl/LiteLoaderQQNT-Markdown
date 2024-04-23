function wrapUnescape(originalRenderName) {
    return (md) => {
        const renderer = md.renderer.rules[originalRenderName]
        md.renderer.rules[originalRenderName] = (tokens, ...args) => {
            const unescapedTokens = tokens.map((t) => ({
                ...t,
                content: md.utils.unescapeAll(t.content)
            }))
            return renderer(unescapedTokens, ...args)
        }
    }
}

module.exports = {
    wrapUnescape,
    qqImage: (md) => {
        // markdownit 规则
        // 给 img 套上和 QQ 一样的样式，以达成相同的显示效果
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
    },
    qqInlineBlock: (md) => {
        // markdownit 规则 行内代码反转义
        // 因代码高亮需要分析语法，普通代码块不在此处执行，而在高亮函数中反转义
        wrapUnescape('code_inline')(md)
    }

}