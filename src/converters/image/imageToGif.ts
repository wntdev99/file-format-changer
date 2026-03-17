import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import type { Converter } from '../../types/converter'

function makeImageToGif(
  id: string,
  label: string,
  inputExtension: string,
  inputAccept: string,
  description: string,
): Converter {
  return {
    id,
    label,
    category: 'image',
    inputExtension,
    outputExtension: 'gif',
    inputAccept,
    description,

    async convert(file, onProgress) {
      onProgress?.(10)

      const bitmap = await createImageBitmap(file)
      onProgress?.(30)

      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height

      const ctx = canvas.getContext('2d')!
      // GIF는 투명 배경을 지원하나 팔레트 기반이므로 흰 배경으로 평탄화
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(bitmap, 0, 0)
      bitmap.close()
      onProgress?.(50)

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      onProgress?.(65)

      // GIF는 최대 256색 팔레트
      const palette = quantize(data, 256)
      const index = applyPalette(data, palette)
      onProgress?.(80)

      const gif = GIFEncoder()
      gif.writeFrame(index, canvas.width, canvas.height, { palette })
      gif.finish()
      onProgress?.(95)

      const blob = new Blob([gif.bytes().buffer as ArrayBuffer], { type: 'image/gif' })
      onProgress?.(100)
      return blob
    },
  }
}

export const pngToGif = makeImageToGif(
  'png-to-gif',
  'PNG → GIF',
  'png',
  '.png,image/png',
  'PNG 이미지를 GIF 형식으로 변환합니다.',
)

export const jpgToGif = makeImageToGif(
  'jpg-to-gif',
  'JPG → GIF',
  'jpg',
  '.jpg,.jpeg,image/jpeg',
  'JPG 이미지를 GIF 형식으로 변환합니다.',
)

export const webpToGif = makeImageToGif(
  'webp-to-gif',
  'WebP → GIF',
  'webp',
  '.webp,image/webp',
  'WebP 이미지를 GIF 형식으로 변환합니다.',
)
