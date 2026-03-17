import type { Converter } from '../../types/converter'

export const heicToJpg: Converter = {
  id: 'heic-to-jpg',
  label: 'HEIC → JPG',
  category: 'image',
  inputExtension: 'heic',
  outputExtension: 'jpg',
  inputAccept: '.heic,.heif,image/heic,image/heif',
  description: 'iPhone 등에서 촬영한 HEIC/HEIF 이미지를 JPG 형식으로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)

    // 초기 번들 크기를 줄이기 위해 사용 시점에 동적으로 로드
    const { default: heic2any } = await import('heic2any')
    onProgress?.(30)

    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    })
    onProgress?.(90)

    // heic2any는 단일 이미지면 Blob, 복수면 Blob[]을 반환
    const blob = Array.isArray(result) ? result[0] : result
    onProgress?.(100)

    return blob
  },
}
