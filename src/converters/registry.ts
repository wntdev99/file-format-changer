import type { Converter, ConverterCategory } from '../types/converter'
import { csvToXlsx } from './spreadsheet/csvToXlsx'

/**
 * 전체 변환기 목록.
 * 새 변환기를 추가할 때는 이 배열에만 추가하면 됩니다.
 *
 * 추후 추가 예시:
 *   import { pngToWebp } from './image/pngToWebp'
 *   import { mp4ToWebm } from './video/mp4ToWebm'
 */
const ALL_CONVERTERS: Converter[] = [
  // Spreadsheet
  csvToXlsx,

  // Image (준비 중)
  // pngToWebp,
  // jpgToPng,

  // Video (준비 중)
  // mp4ToWebm,
  // mp4ToGif,

  // Document (준비 중)
  // docxToPdf,
]

/** 전체 변환기 목록 반환 */
export function getAllConverters(): Converter[] {
  return ALL_CONVERTERS
}

/** 카테고리별 변환기 반환 */
export function getConvertersByCategory(category: ConverterCategory): Converter[] {
  return ALL_CONVERTERS.filter((c) => c.category === category)
}

/** ID로 변환기 검색 */
export function getConverterById(id: string): Converter | undefined {
  return ALL_CONVERTERS.find((c) => c.id === id)
}

/** 입력 확장자로 사용 가능한 변환기 목록 반환 */
export function getConvertersByInputExtension(ext: string): Converter[] {
  return ALL_CONVERTERS.filter((c) => c.inputExtension === ext.toLowerCase())
}

/** 등록된 카테고리 목록 (중복 제거) */
export function getAvailableCategories(): ConverterCategory[] {
  return [...new Set(ALL_CONVERTERS.map((c) => c.category))]
}
