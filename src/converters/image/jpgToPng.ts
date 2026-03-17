import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const jpgToPng: Converter = {
  id: 'jpg-to-png',
  label: 'JPG → PNG',
  category: 'image',
  inputExtension: 'jpg',
  outputExtension: 'png',
  inputAccept: '.jpg,.jpeg,image/jpeg',
  description: 'JPG 이미지를 PNG 형식으로 변환합니다.',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/png', 1, onProgress)
  },
}
