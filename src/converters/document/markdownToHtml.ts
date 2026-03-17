import { marked } from 'marked'
import type { Converter } from '../../types/converter'

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

    const body = await marked(text)
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${file.name.replace(/\.[^.]+$/, '')}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1e293b; }
    pre { background: #f1f5f9; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'Fira Code', monospace; font-size: 0.9em; }
    blockquote { border-left: 4px solid #94a3b8; margin: 0; padding-left: 1rem; color: #64748b; }
    img { max-width: 100%; }
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
