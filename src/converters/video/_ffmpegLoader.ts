import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

// ffmpeg 인스턴스 싱글톤 — 한 번 로드 후 재사용
let ffmpegInstance: FFmpeg | null = null
let loadingPromise: Promise<FFmpeg> | null = null

/**
 * ffmpeg.wasm 인스턴스를 로드하고 반환합니다.
 * 이미 로드된 경우 캐시된 인스턴스를 즉시 반환합니다.
 */
export async function getFFmpeg(onProgress?: (percent: number) => void): Promise<FFmpeg> {
  // 캐시된 인스턴스가 있으면 진행률을 100으로 즉시 완료 처리 후 반환
  if (ffmpegInstance) {
    onProgress?.(100)
    return ffmpegInstance
  }

  // 동시 다중 호출 시 하나의 로딩 Promise를 공유
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const ffmpeg = new FFmpeg()
    try {
      // public 폴더에 복사된 ffmpeg core 파일을 Blob URL로 로드
      // (scripts/copy-ffmpeg.js 로 생성, git 미포함)
      const baseURL = `${window.location.origin}/`
      const coreURL = await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript')
      const wasmURL = await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm')
      onProgress?.(30)

      await ffmpeg.load({ coreURL, wasmURL })
      onProgress?.(100)

      ffmpegInstance = ffmpeg
      return ffmpeg
    } finally {
      // 성공·실패 무관하게 loadingPromise 초기화
      // 실패 시: 다음 호출에서 재시도 가능
      // 성공 시: 이후 ffmpegInstance 경로로 즉시 반환
      loadingPromise = null
    }
  })()

  return loadingPromise
}
