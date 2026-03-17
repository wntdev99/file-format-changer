import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

function rowsToMarkdownTable(rows: string[][]): string {
  if (rows.length === 0) return ''

  const headers = rows[0].map((h) => String(h ?? ''))
  const dataRows = rows.slice(1).map((row) => headers.map((_, i) => String(row[i] ?? '')))

  const colWidths = headers.map((h, i) => {
    const maxData = dataRows.reduce((max, row) => Math.max(max, row[i].length), 0)
    return Math.max(h.length, maxData, 3)
  })

  const formatRow = (cells: string[]) =>
    '| ' + cells.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ') + ' |'

  const separator = '| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |'

  return [formatRow(headers), separator, ...dataRows.map(formatRow)].join('\n')
}

export const csvToMarkdown: Converter = {
  id: 'csv-to-markdown',
  label: 'CSV → Markdown',
  category: 'spreadsheet',
  inputExtension: 'csv',
  outputExtension: 'md',
  inputAccept: '.csv,text/csv',
  description: 'CSV 파일을 Markdown 표로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(30)

    const wb = XLSX.read(text, { type: 'string' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    onProgress?.(60)

    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][]
    const markdown = rowsToMarkdownTable(rows)
    onProgress?.(90)

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    onProgress?.(100)
    return blob
  },
}
