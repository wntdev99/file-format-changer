import type { Converter } from '../../types/converter'
import { convertImageViaCanvas } from './_canvasConvert'

export const gifToWebp: Converter = {
  id: 'gif-to-webp',
  label: 'GIF → WebP',
  category: 'image',
  inputExtension: 'gif',
  outputExtension: 'webp',
  inputAccept: '.gif,image/gif',
  description: 'GIF 이미지를 WebP 형식으로 변환합니다. (애니메이션 GIF는 첫 번째 프레임만 변환)',

  async convert(file, onProgress) {
    return convertImageViaCanvas(file, 'image/webp', 0.9, onProgress)
  },
}
