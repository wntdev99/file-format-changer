import { Marked, Renderer } from 'marked'
import hljs from 'highlight.js/lib/common'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Converter } from '../../types/converter'

// 전역 marked 오염 방지 + 코드 구문 강조 적용
const renderer = new Renderer()
renderer.code = ({ text: code, lang }: { text: string; lang?: string }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(code, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}
const localMarked = new Marked({ renderer })

export const markdownToPdf: Converter = {
  id: 'markdown-to-pdf',
  label: 'Markdown → PDF',
  category: 'document',
  inputExtension: 'md',
  outputExtension: 'pdf',
  inputAccept: '.md,.markdown,text/markdown',
  description: 'Markdown 파일을 PDF 문서로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(20)

    const body = await localMarked.parse(text)
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 740px; margin: 1.5rem auto;
           padding: 0 1rem; line-height: 1.7; color: #1e293b; font-size: 14px; }
    h1 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2em; }
    h3, h4, h5, h6 { margin: 1em 0 0.5em; }
    p { margin: 0 0 0.8em; }
    pre { background: #f6f8fa; padding: 1rem; border-radius: 6px; overflow: visible;
          font-size: 12px; word-break: break-all; white-space: pre-wrap; }
    code { font-family: 'Courier New', monospace; font-size: 0.88em;
           background: #f1f5f9; padding: 0.1em 0.3em; border-radius: 3px; }
    pre code.hljs { background: transparent; padding: 0; }
    blockquote { border-left: 4px solid #94a3b8; margin: 0 0 0.8em;
                 padding: 0.2em 1rem; color: #64748b; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid #cbd5e1; padding: 0.4em 0.7em; }
    th { background: #f1f5f9; font-weight: 600; }
    img { max-width: 100%; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
    ul, ol { padding-left: 1.8em; margin-bottom: 0.8em; }
    .hljs { color: #24292e; }
    .hljs-comment,.hljs-punctuation { color: #6a737d; }
    .hljs-attr,.hljs-attribute,.hljs-keyword,.hljs-name,.hljs-operator,.hljs-selector-tag { color: #d73a49; }
    .hljs-class .hljs-title,.hljs-title,.hljs-title.class_ { color: #6f42c1; }
    .hljs-number,.hljs-literal { color: #005cc5; }
    .hljs-string,.hljs-doctag,.hljs-regexp { color: #032f62; }
    .hljs-built_in,.hljs-variable.language_ { color: #e36209; }
    .hljs-function .hljs-title,.hljs-title.function_ { color: #6f42c1; }
    .hljs-tag { color: #22863a; }
    .hljs-meta { color: #735c0f; }
    .hljs-emphasis { font-style: italic; }
    .hljs-strong { font-weight: bold; }
  </style>
</head>
<body>${body}</body>
</html>`
    onProgress?.(35)

    const iframe = document.createElement('iframe')
    iframe.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none;'
    document.body.appendChild(iframe)

    let canvas: HTMLCanvasElement
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('HTML 로드 시간이 초과되었습니다. (10초)')),
          10_000,
        )
        iframe.onload = () => {
          clearTimeout(timer)
          resolve()
        }
        iframe.srcdoc = html
      })
      onProgress?.(55)

      canvas = await html2canvas(iframe.contentDocument!.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 794,
      })
    } finally {
      document.body.removeChild(iframe)
    }
    onProgress?.(80)

    const A4_WIDTH_MM = 210
    const A4_HEIGHT_MM = 297
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const imgWidthMM = A4_WIDTH_MM
    const imgHeightMM = (canvas.height * A4_WIDTH_MM) / canvas.width

    let yOffset = 0
    let remainingHeight = imgHeightMM
    while (remainingHeight > 0) {
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, imgWidthMM, imgHeightMM)
      remainingHeight -= A4_HEIGHT_MM
      yOffset += A4_HEIGHT_MM
      if (remainingHeight > 0) pdf.addPage()
    }
    onProgress?.(95)

    const pdfBlob = pdf.output('blob')
    onProgress?.(100)
    return pdfBlob
  },
}
