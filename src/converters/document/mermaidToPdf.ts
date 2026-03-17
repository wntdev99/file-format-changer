import { renderMermaidSvg, svgToPngBlob } from '../../utils/mermaid'
import jsPDF from 'jspdf'
import type { Converter } from '../../types/converter'

export const mermaidToPdf: Converter = {
  id: 'mermaid-to-pdf',
  label: 'Mermaid → PDF',
  category: 'document',
  inputExtension: 'mmd',
  outputExtension: 'pdf',
  inputAccept: '.mmd,.mermaid,text/plain',
  description: 'Mermaid 다이어그램을 PDF 문서로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const code = await file.text()
    onProgress?.(20)

    // htmlLabels:false → <foreignObject> 없는 순수 SVG → canvas drawImage 호환
    const svg = await renderMermaidSvg(code)
    onProgress?.(45)

    const pngBlob = await svgToPngBlob(svg, 2)
    onProgress?.(65)

    // PNG Blob → HTMLImageElement (자연 크기 확보)
    const pngUrl = URL.createObjectURL(pngBlob)
    let naturalW: number
    let naturalH: number
    try {
      ;({ naturalWidth: naturalW, naturalHeight: naturalH } = await new Promise<HTMLImageElement>(
        (resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error('PNG 로드에 실패했습니다.'))
          img.src = pngUrl
        },
      ))
    } finally {
      URL.revokeObjectURL(pngUrl)
    }
    onProgress?.(78)

    // 이미지 → canvas → JPEG dataURL (jsPDF 호환)
    const canvas = document.createElement('canvas')
    canvas.width = naturalW
    canvas.height = naturalH
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, naturalW, naturalH)
    const drawImg = new Image()
    drawImg.src = URL.createObjectURL(pngBlob)
    await new Promise<void>((res) => {
      drawImg.onload = () => res()
    })
    URL.revokeObjectURL(drawImg.src)
    ctx.drawImage(drawImg, 0, 0)
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    onProgress?.(88)

    // A4 기준 여백 포함 최대 크기로 배치
    const MARGIN = 15
    const A4_W = 210
    const A4_H = 297
    const maxW = A4_W - MARGIN * 2
    const maxH = A4_H - MARGIN * 2
    const aspect = naturalW / naturalH
    let imgW = maxW
    let imgH = imgW / aspect
    if (imgH > maxH) {
      imgH = maxH
      imgW = imgH * aspect
    }

    const pdf = new jsPDF({
      orientation: imgW > imgH ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN, imgW, imgH)
    onProgress?.(95)

    const pdfBlob = pdf.output('blob')
    onProgress?.(100)
    return pdfBlob
  },
}
