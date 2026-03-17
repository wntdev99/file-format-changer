import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Converter } from '../../types/converter'

export const txtToPdf: Converter = {
  id: 'txt-to-pdf',
  label: 'TXT → PDF',
  category: 'document',
  inputExtension: 'txt',
  outputExtension: 'pdf',
  inputAccept: '.txt,text/plain',
  description: '텍스트 파일을 PDF 문서로 변환합니다. 한국어 등 CJK 문자도 지원합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(20)

    // 시스템 폰트로 렌더링해 한국어 등 CJK 문자 지원
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;border:none;'
    document.body.appendChild(iframe)

    // 텍스트를 HTML로 감싸 렌더링 (공백·줄바꿈 보존)
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    const wrappedHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.7;
         padding: 40px; margin: 0; color: #1e293b; word-break: break-word; }
  pre  { white-space: pre-wrap; margin: 0; font-family: inherit; }
</style></head>
<body><pre>${escaped}</pre></body></html>`

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('HTML 로드 시간이 초과되었습니다.')), 10_000)
      iframe.onload = () => { clearTimeout(timer); resolve() }
      iframe.srcdoc = wrappedHtml
    })
    onProgress?.(40)

    const iframeDoc = iframe.contentDocument!
    const body = iframeDoc.body

    let canvas: HTMLCanvasElement
    try {
      canvas = await html2canvas(body, { scale: 2, useCORS: true, windowWidth: 794 })
    } finally {
      document.body.removeChild(iframe)
    }
    onProgress?.(75)

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
