import { fetchFile } from '@ffmpeg/util'
import { getFFmpeg } from './_ffmpegLoader'
import type { Converter, ConverterCategory } from '../../types/converter'

interface FFmpegConverterOptions {
  id: string
  label: string
  category: ConverterCategory
  inputExtension: string
  outputExtension: string
  inputAccept: string
  description: string
  outputMime: string
  /** ffmpeg 변환 인수 (입력 파일명, 출력 파일명 제외) */
  args: string[]
}

/**
 * ffmpeg.wasm 기반 변환기 팩토리.
 * args에 ffmpeg CLI 옵션만 넘기면 변환기를 생성합니다.
 */
export function makeFFmpegConverter(opts: FFmpegConverterOptions): Converter {
  return {
    id: opts.id,
    label: opts.label,
    category: opts.category,
    inputExtension: opts.inputExtension,
    outputExtension: opts.outputExtension,
    inputAccept: opts.inputAccept,
    description: opts.description,

    async convert(file, onProgress) {
      onProgress?.(5)

      // ffmpeg 로드 (최초 1회만 실제 로드, 이후 캐시 반환)
      const ffmpeg = await getFFmpeg((p) => onProgress?.(5 + p * 0.3))
      onProgress?.(35)

      const inputName = `input.${opts.inputExtension}`
      const outputName = `output.${opts.outputExtension}`

      await ffmpeg.writeFile(inputName, await fetchFile(file))
      onProgress?.(50)

      let data: Uint8Array | string
      try {
        await ffmpeg.exec(['-i', inputName, ...opts.args, outputName])
        onProgress?.(85)
        data = await ffmpeg.readFile(outputName)
        onProgress?.(92)
      } finally {
        // exec 성공·실패 무관하게 가상 FS 임시 파일 정리
        await ffmpeg.deleteFile(inputName).catch(() => {})
        await ffmpeg.deleteFile(outputName).catch(() => {})
      }
      onProgress?.(95)

      const blobPart = data instanceof Uint8Array
        ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
        : new TextEncoder().encode(data as string).buffer as ArrayBuffer
      const blob = new Blob([blobPart], { type: opts.outputMime })
      onProgress?.(100)
      return blob
    },
  }
}
