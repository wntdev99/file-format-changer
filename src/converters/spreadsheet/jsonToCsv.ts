import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

export const jsonToCsv: Converter = {
  id: 'json-to-csv',
  label: 'JSON → CSV',
  category: 'spreadsheet',
  inputExtension: 'json',
  outputExtension: 'csv',
  inputAccept: '.json,application/json',
  description: 'JSON 배열을 CSV 파일로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(30)

    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('유효하지 않은 JSON 파일입니다.')
    }

    if (!Array.isArray(data)) {
      throw new Error('JSON 파일의 최상위 구조가 배열이어야 합니다.')
    }
    onProgress?.(60)

    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    onProgress?.(90)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    onProgress?.(100)
    return blob
  },
}
