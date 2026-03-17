import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const webpToPng: Converter = {
  id: 'webp-to-png',
  label: 'WebP → PNG',
  category: 'image',
  inputExtension: 'webp',
  outputExtension: 'png',
  inputAccept: '.webp,image/webp',
  description: 'WebP 이미지를 PNG 형식으로 변환합니다.',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/png', 1, onProgress)
  },
}
