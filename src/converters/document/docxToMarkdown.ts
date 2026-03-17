import type { Converter } from '../../types/converter'

export const docxToMarkdown: Converter = {
  id: 'docx-to-markdown',
  label: 'DOCX → Markdown',
  category: 'document',
  inputExtension: 'docx',
  outputExtension: 'md',
  inputAccept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  description: 'Word 문서를 Markdown 형식으로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const buf = await file.arrayBuffer()
    onProgress?.(30)

    // mammoth: DOCX → HTML
    const { convertToHtml } = await import('mammoth')
    const { value: html } = await convertToHtml({ arrayBuffer: buf })
    onProgress?.(60)

    // TurndownService: HTML → Markdown
    const TurndownService = (await import('turndown')).default
    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    })
    const markdown = td.turndown(html)
    onProgress?.(95)

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    onProgress?.(100)
    return blob
  },
}
