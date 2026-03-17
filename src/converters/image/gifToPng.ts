import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const gifToPng: Converter = {
  id: 'gif-to-png',
  label: 'GIF → PNG',
  category: 'image',
  inputExtension: 'gif',
  outputExtension: 'png',
  inputAccept: '.gif,image/gif',
  description: 'GIF 이미지를 PNG 형식으로 변환합니다. (애니메이션 GIF는 첫 번째 프레임만 변환)',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/png', 1, onProgress)
  },
}
