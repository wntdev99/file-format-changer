/**
 * 변환기 카테고리
 * 새 카테고리 추가 시 여기에 추가하세요.
 */
export type ConverterCategory = 'spreadsheet' | 'image' | 'video' | 'document' | 'audio'

/**
 * 변환 진행 상태
 */
export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error'

/**
 * 변환기 메타데이터 및 실행 함수 정의
 * 새 변환기를 추가할 때 이 인터페이스를 구현하세요.
 */
export interface Converter {
  /** 고유 식별자 (예: "csv-to-xlsx") */
  id: string
  /** 사용자에게 보여줄 이름 */
  label: string
  /** 카테고리 */
  category: ConverterCategory
  /** 입력 파일 확장자 (소문자, 점 없이) */
  inputExtension: string
  /** 출력 파일 확장자 */
  outputExtension: string
  /** input accept 속성용 MIME 타입 또는 확장자 문자열 */
  inputAccept: string
  /** 변환 설명 */
  description: string
  /**
   * 실제 변환 함수.
   * @param file - 입력 파일
   * @param onProgress - 0~100 진행률 콜백 (선택)
   * @returns 변환된 Blob
   */
  convert: (file: File, onProgress?: (percent: number) => void) => Promise<Blob>
}

/**
 * 변환 결과
 */
export interface ConversionResult {
  blob: Blob
  fileName: string
  sizeBytes: number
}
