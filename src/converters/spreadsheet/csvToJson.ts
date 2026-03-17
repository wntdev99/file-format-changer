import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

export const csvToJson: Converter = {
  id: 'csv-to-json',
  label: 'CSV → JSON',
  category: 'spreadsheet',
  inputExtension: 'csv',
  outputExtension: 'json',
  inputAccept: '.csv,text/csv',
  description: 'CSV 파일을 JSON 배열로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(40)

    const workbook = XLSX.read(text, { type: 'string' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    onProgress?.(70)

    const json = XLSX.utils.sheet_to_json(firstSheet)
    onProgress?.(90)

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    onProgress?.(100)
    return blob
  },
}
