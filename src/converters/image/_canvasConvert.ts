/**
 * Canvas API를 이용한 이미지 포맷 변환 유틸리티
 */
export async function convertImageViaCanvas(
  file: File,
  mimeType: string,
  quality: number,
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  onProgress?.(10)

  const bitmap = await createImageBitmap(file)
  onProgress?.(50)

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  onProgress?.(80)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100)
          resolve(blob)
        } else {
          reject(new Error('이미지 변환에 실패했습니다.'))
        }
      },
      mimeType,
      quality,
    )
  })
}
