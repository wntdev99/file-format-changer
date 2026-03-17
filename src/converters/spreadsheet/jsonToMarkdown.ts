import type { Converter } from '../../types/converter'

type Row = Record<string, unknown>

function jsonArrayToMarkdownTable(data: Row[]): string {
  if (data.length === 0) return ''

  // 모든 행에서 키 수집 (순서 보존)
  const keySet = new Set<string>()
  for (const row of data) {
    for (const key of Object.keys(row)) keySet.add(key)
  }
  const headers = [...keySet]

  const dataRows = data.map((row) => headers.map((h) => String(row[h] ?? '')))

  const colWidths = headers.map((h, i) => {
    const maxData = dataRows.reduce((max, row) => Math.max(max, row[i].length), 0)
    return Math.max(h.length, maxData, 3)
  })

  const formatRow = (cells: string[]) =>
    '| ' + cells.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ') + ' |'

  const separator = '| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |'

  return [formatRow(headers), separator, ...dataRows.map(formatRow)].join('\n')
}

export const jsonToMarkdown: Converter = {
  id: 'json-to-markdown',
  label: 'JSON → Markdown',
  category: 'spreadsheet',
  inputExtension: 'json',
  outputExtension: 'md',
  inputAccept: '.json,application/json',
  description: 'JSON 객체 배열을 Markdown 표로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(40)

    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('유효하지 않은 JSON 파일입니다.')
    }

    if (!Array.isArray(data)) {
      throw new Error('JSON 배열 형식이 아닙니다. 객체 배열([ {...}, ... ])이 필요합니다.')
    }
    if (data.length === 0) {
      return new Blob([''], { type: 'text/markdown;charset=utf-8;' })
    }
    if (typeof data[0] !== 'object' || data[0] === null || Array.isArray(data[0])) {
      throw new Error('JSON 배열의 요소가 객체여야 합니다.')
    }

    const markdown = jsonArrayToMarkdownTable(data as Row[])
    onProgress?.(90)

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    onProgress?.(100)
    return blob
  },
}
