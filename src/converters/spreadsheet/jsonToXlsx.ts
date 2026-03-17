import * as XLSX from 'xlsx'
import type { Converter } from '../../types/converter'

export const jsonToXlsx: Converter = {
  id: 'json-to-xlsx',
  label: 'JSON → XLSX',
  category: 'spreadsheet',
  inputExtension: 'json',
  outputExtension: 'xlsx',
  inputAccept: '.json,application/json',
  description: 'JSON 배열을 Excel(XLSX) 파일로 변환합니다.',

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
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    onProgress?.(95)

    const blob = new Blob([xlsxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    onProgress?.(100)
    return blob
  },
}
