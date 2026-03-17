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

  // JPEG는 투명 채널을 지원하지 않으므로 흰 배경을 먼저 채워 검정 배경 방지
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

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
