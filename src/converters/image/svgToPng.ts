import type { Converter } from '../../types/converter'

export const svgToPng: Converter = {
  id: 'svg-to-png',
  label: 'SVG → PNG',
  category: 'image',
  inputExtension: 'svg',
  outputExtension: 'png',
  inputAccept: '.svg,image/svg+xml',
  description: 'SVG 벡터 이미지를 PNG 래스터 이미지로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const svgText = await file.text()
    onProgress?.(30)

    // SVG의 실제 크기 파싱 (없으면 기본값)
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgEl = svgDoc.documentElement

    const viewBox = svgEl.getAttribute('viewBox')?.split(/[\s,]+/).map(Number)
    const attrWidth = parseFloat(svgEl.getAttribute('width') ?? '0')
    const attrHeight = parseFloat(svgEl.getAttribute('height') ?? '0')

    const width = attrWidth || viewBox?.[2] || 800
    const height = attrHeight || viewBox?.[3] || 600
    onProgress?.(50)

    const blob = new Blob([svgText], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // 고해상도 출력 (2x)
        const scale = 2
        canvas.width = width * scale
        canvas.height = height * scale

        const ctx = canvas.getContext('2d')!
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        onProgress?.(90)

        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            onProgress?.(100)
            resolve(pngBlob)
          } else {
            reject(new Error('PNG 변환에 실패했습니다.'))
          }
        }, 'image/png')
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('SVG 파일을 불러올 수 없습니다.'))
      }
      img.src = url
    })
  },
}
