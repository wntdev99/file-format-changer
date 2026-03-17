import { renderMermaidSvg } from '../../utils/mermaid'
import type { Converter } from '../../types/converter'

export const mermaidToSvg: Converter = {
  id: 'mermaid-to-svg',
  label: 'Mermaid → SVG',
  category: 'document',
  inputExtension: 'mmd',
  outputExtension: 'svg',
  inputAccept: '.mmd,.mermaid,text/plain',
  description: 'Mermaid 다이어그램을 SVG 벡터 이미지로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const code = await file.text()
    onProgress?.(30)

    const svg = await renderMermaidSvg(code)
    onProgress?.(90)

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    onProgress?.(100)
    return blob
  },
}
