import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

export const xlsxToJson: Converter = {
  id: 'xlsx-to-json',
  label: 'XLSX → JSON',
  category: 'spreadsheet',
  inputExtension: 'xlsx',
  outputExtension: 'json',
  inputAccept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  description: 'Excel(XLSX) 파일을 JSON 배열로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const buffer = await file.arrayBuffer()
    onProgress?.(40)

    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    onProgress?.(70)

    const json = XLSX.utils.sheet_to_json(firstSheet)
    onProgress?.(90)

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    onProgress?.(100)
    return blob
  },
}
