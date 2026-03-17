import TurndownService from 'turndown'
import type { Converter } from '../../types/converter'

export const htmlToMarkdown: Converter = {
  id: 'html-to-markdown',
  label: 'HTML → Markdown',
  category: 'document',
  inputExtension: 'html',
  outputExtension: 'md',
  inputAccept: '.html,.htm,text/html',
  description: 'HTML 문서를 Markdown 형식으로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const html = await file.text()
    onProgress?.(40)

    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    })

    // <body> 내용만 추출, 없으면 전체 사용
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const content = bodyMatch ? bodyMatch[1] : html
    onProgress?.(70)

    const markdown = td.turndown(content)
    onProgress?.(95)

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    onProgress?.(100)
    return blob
  },
}
