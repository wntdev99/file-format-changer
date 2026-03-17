import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

export const xlsxToCsv: Converter = {
  id: 'xlsx-to-csv',
  label: 'XLSX → CSV',
  category: 'spreadsheet',
  inputExtension: 'xlsx',
  outputExtension: 'csv',
  inputAccept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  description: 'Excel(XLSX) 파일을 CSV 형식으로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const buffer = await file.arrayBuffer()
    onProgress?.(40)

    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    onProgress?.(70)

    const csv = XLSX.utils.sheet_to_csv(firstSheet)
    onProgress?.(95)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    onProgress?.(100)
    return blob
  },
}
