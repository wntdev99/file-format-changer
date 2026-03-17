import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

/**
 * CSV → XLSX 변환기
 */
export const csvToXlsx: Converter = {
  id: 'csv-to-xlsx',
  label: 'CSV → XLSX',
  category: 'spreadsheet',
  inputExtension: 'csv',
  outputExtension: 'xlsx',
  inputAccept: '.csv,text/csv',
  description: 'CSV 파일을 Excel(XLSX) 형식으로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)

    const text = await file.text()
    onProgress?.(40)

    const workbook = XLSX.read(text, { type: 'string' })
    onProgress?.(70)

    const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    onProgress?.(95)

    const blob = new Blob([xlsxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    onProgress?.(100)

    return blob
  },
}
