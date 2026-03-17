import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const pngToWebp: Converter = {
  id: 'png-to-webp',
  label: 'PNG → WebP',
  category: 'image',
  inputExtension: 'png',
  outputExtension: 'webp',
  inputAccept: '.png,image/png',
  description: 'PNG 이미지를 WebP 형식으로 변환합니다.',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/webp', 0.9, onProgress)
  },
}
