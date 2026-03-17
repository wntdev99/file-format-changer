import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const jpgToWebp: Converter = {
  id: 'jpg-to-webp',
  label: 'JPG → WebP',
  category: 'image',
  inputExtension: 'jpg',
  outputExtension: 'webp',
  inputAccept: '.jpg,.jpeg,image/jpeg',
  description: 'JPG 이미지를 WebP 형식으로 변환합니다.',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/webp', 0.9, onProgress)
  },
}
