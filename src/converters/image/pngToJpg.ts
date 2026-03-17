import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const pngToJpg: Converter = {
  id: 'png-to-jpg',
  label: 'PNG → JPG',
  category: 'image',
  inputExtension: 'png',
  outputExtension: 'jpg',
  inputAccept: '.png,image/png',
  description: 'PNG 이미지를 JPG 형식으로 변환합니다.',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/jpeg', 0.92, onProgress)
  },
}
