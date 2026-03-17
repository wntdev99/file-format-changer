import { Marked, Renderer } from 'marked'
import hljs from 'highlight.js/lib/common'
import type { Converter } from '../../types/converter'

// 전역 marked를 오염시키지 않도록 독립 인스턴스 사용
const renderer = new Renderer()
renderer.code = ({ text: code, lang }: { text: string; lang?: string }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(code, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}
const localMarked = new Marked({ renderer })

export const markdownToHtml: Converter = {
  id: 'markdown-to-html',
  label: 'Markdown → HTML',
  category: 'document',
  inputExtension: 'md',
  outputExtension: 'html',
  inputAccept: '.md,.markdown,text/markdown',
  description: 'Markdown 파일을 HTML 문서로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(50)

    const body = await localMarked.parse(text)
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${file.name.replace(/\.[^.]+$/, '')}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1e293b; }
    pre { background: #f6f8fa; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.9em; }
    pre code.hljs { background: transparent; padding: 0; }
    blockquote { border-left: 4px solid #94a3b8; margin: 0; padding-left: 1rem; color: #64748b; }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid #cbd5e1; padding: 0.4em 0.7em; }
    th { background: #f1f5f9; }
    /* highlight.js github theme */
    .hljs { color: #24292e; }
    .hljs-comment,.hljs-punctuation { color: #6a737d; }
    .hljs-attr,.hljs-attribute,.hljs-keyword,.hljs-name,.hljs-operator,.hljs-selector-tag { color: #d73a49; }
    .hljs-class .hljs-title,.hljs-title,.hljs-title.class_ { color: #6f42c1; }
    .hljs-number,.hljs-literal { color: #005cc5; }
    .hljs-string,.hljs-doctag,.hljs-regexp { color: #032f62; }
    .hljs-built_in,.hljs-variable.language_ { color: #e36209; }
    .hljs-function .hljs-title,.hljs-title.function_ { color: #6f42c1; }
    .hljs-params { color: #24292e; }
    .hljs-tag { color: #22863a; }
    .hljs-meta { color: #735c0f; }
    .hljs-addition { background: #f0fff4; color: #22863a; }
    .hljs-deletion { background: #ffeef0; color: #b31d28; }
    .hljs-emphasis { font-style: italic; }
    .hljs-strong { font-weight: bold; }
  </style>
</head>
<body>
${body}
</body>
</html>`
    onProgress?.(100)

    return new Blob([html], { type: 'text/html;charset=utf-8;' })
  },
}
