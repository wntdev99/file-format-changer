import { renderMermaidSvg, svgToPngBlob } from '../../utils/mermaid'
import type { Converter } from '../../types/converter'

export const mermaidToPng: Converter = {
  id: 'mermaid-to-png',
  label: 'Mermaid → PNG',
  category: 'document',
  inputExtension: 'mmd',
  outputExtension: 'png',
  inputAccept: '.mmd,.mermaid,text/plain',
  description: 'Mermaid 다이어그램을 PNG 이미지로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const code = await file.text()
    onProgress?.(25)

    // htmlLabels:false → <foreignObject> 없는 순수 SVG → canvas drawImage 호환
    const svg = await renderMermaidSvg(code)
    onProgress?.(60)

    const blob = await svgToPngBlob(svg, 2)
    onProgress?.(100)
    return blob
  },
}
