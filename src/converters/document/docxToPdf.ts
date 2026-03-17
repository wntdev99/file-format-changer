import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Converter } from '../../types/converter'

export const docxToPdf: Converter = {
  id: 'docx-to-pdf',
  label: 'DOCX → PDF',
  category: 'document',
  inputExtension: 'docx',
  outputExtension: 'pdf',
  inputAccept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  description: 'Word(DOCX) 문서를 PDF 파일로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(5)

    // mammoth는 무거우므로 사용 시점에 동적 로드
    const { convertToHtml } = await import('mammoth')
    onProgress?.(15)

    const arrayBuffer = await file.arrayBuffer()
    onProgress?.(25)

    const { value: bodyHtml } = await convertToHtml({ arrayBuffer })
    onProgress?.(45)

    // 변환된 HTML을 문서 스타일과 함께 iframe에 렌더링
    const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      padding: 60px 72px;
      margin: 0;
      color: #000;
      word-break: break-word;
    }
    h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; }
    p { margin: 0 0 0.8em; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    td, th { border: 1px solid #999; padding: 4px 8px; }
    img { max-width: 100%; }
    ul, ol { padding-left: 2em; margin-bottom: 0.8em; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;border:none;'
    document.body.appendChild(iframe)

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('문서 로드 시간이 초과되었습니다. (10초)')),
        10_000,
      )
      iframe.onload = () => { clearTimeout(timer); resolve() }
      iframe.srcdoc = wrappedHtml
    })
    onProgress?.(60)

    let canvas: HTMLCanvasElement
    try {
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
    const imgHeightMM = (canvas.height * A4_WIDTH_MM) / canvas.width

    let yOffset = 0
    let remaining = imgHeightMM

    while (remaining > 0) {
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, A4_WIDTH_MM, imgHeightMM)
      remaining -= A4_HEIGHT_MM
      yOffset += A4_HEIGHT_MM
      if (remaining > 0) pdf.addPage()
    }
    onProgress?.(95)

    const blob = pdf.output('blob')
    onProgress?.(100)
    return blob
  },
}
