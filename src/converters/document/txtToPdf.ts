import jsPDF from 'jspdf'
import type { Converter } from '../../types/converter'

export const txtToPdf: Converter = {
  id: 'txt-to-pdf',
  label: 'TXT → PDF',
  category: 'document',
  inputExtension: 'txt',
  outputExtension: 'pdf',
  inputAccept: '.txt,text/plain',
  description: '텍스트 파일을 PDF 문서로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(30)

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const PAGE_WIDTH = 210
    const PAGE_HEIGHT = 297
    const MARGIN = 15
    const LINE_HEIGHT = 7
    const FONT_SIZE = 11
    const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2
    const MAX_Y = PAGE_HEIGHT - MARGIN

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(FONT_SIZE)

    const lines = text.split('\n')
    let y = MARGIN + LINE_HEIGHT

    for (let i = 0; i < lines.length; i++) {
      // 긴 줄은 자동 줄바꿈
      const wrapped = pdf.splitTextToSize(lines[i] || ' ', MAX_WIDTH) as string[]

      for (const segment of wrapped) {
        if (y > MAX_Y) {
          pdf.addPage()
          y = MARGIN + LINE_HEIGHT
        }
        pdf.text(segment, MARGIN, y)
        y += LINE_HEIGHT
      }

      onProgress?.(30 + Math.round((i / lines.length) * 60))
    }

    onProgress?.(95)
    const blob = pdf.output('blob')
    onProgress?.(100)
    return blob
  },
}
