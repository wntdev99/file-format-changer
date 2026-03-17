import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

export const xlsxToHtml: Converter = {
  id: 'xlsx-to-html',
  label: 'XLSX → HTML',
  category: 'spreadsheet',
  inputExtension: 'xlsx',
  outputExtension: 'html',
  inputAccept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  description: 'Excel(XLSX) 파일을 HTML 테이블로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const buffer = await file.arrayBuffer()
    onProgress?.(40)

    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    onProgress?.(70)

    // sheet_to_html()은 전체 HTML 문서를 반환하므로 <table> 부분만 추출
    const rawHtml = XLSX.utils.sheet_to_html(firstSheet)
    const tableOnly = rawHtml.match(/<table[\s\S]*<\/table>/i)?.[0] ?? ''
    const baseName = file.name.replace(/\.[^.]+$/, '')

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${baseName}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.9rem; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
  </style>
</head>
<body>
${tableOnly}
</body>
</html>`

    onProgress?.(100)
    return new Blob([html], { type: 'text/html;charset=utf-8;' })
  },
}
