import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Converter } from '../../types/converter'

export const htmlToPdf: Converter = {
  id: 'html-to-pdf',
  label: 'HTML → PDF',
  category: 'document',
  inputExtension: 'html',
  outputExtension: 'pdf',
  inputAccept: '.html,.htm,text/html',
  description: 'HTML 파일을 PDF 문서로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const html = await file.text()
    onProgress?.(20)

    // 숨겨진 iframe에 HTML 렌더링
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none;'
    document.body.appendChild(iframe)

    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve()
      iframe.srcdoc = html
    })
    onProgress?.(40)

    const iframeDoc = iframe.contentDocument!
    const body = iframeDoc.body

    // 전체 높이로 canvas 생성
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      windowWidth: 794,
    })
    onProgress?.(75)

    document.body.removeChild(iframe)

    // A4 기준으로 PDF 생성 (210mm × 297mm)
    const A4_WIDTH_MM = 210
    const A4_HEIGHT_MM = 297
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const imgWidthMM = A4_WIDTH_MM
    const imgHeightMM = (canvas.height * A4_WIDTH_MM) / canvas.width

    let yOffset = 0
    let remainingHeight = imgHeightMM

    // 페이지 분할
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
