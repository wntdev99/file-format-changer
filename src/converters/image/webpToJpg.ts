import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const webpToJpg: Converter = {
  id: 'webp-to-jpg',
  label: 'WebP → JPG',
  category: 'image',
  inputExtension: 'webp',
  outputExtension: 'jpg',
  inputAccept: '.webp,image/webp',
  description: 'WebP 이미지를 JPG 형식으로 변환합니다.',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/jpeg', 0.92, onProgress)
  },
}
