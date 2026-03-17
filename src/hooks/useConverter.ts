import { useState, useCallback, useRef } from 'react'
import type { Converter, ConversionResult, ConversionStatus } from '../types/converter'

interface UseConverterReturn {
  status: ConversionStatus
  progress: number
  result: ConversionResult | null
  error: string | null
  run: (converter: Converter, file: File) => Promise<void>
  reset: () => void
}

export function useConverter(): UseConverterReturn {
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 현재 실행 중인 변환의 ID — 이전 변환 결과가 state를 덮어쓰는 race condition 방지
  const runIdRef = useRef(0)

  const run = useCallback(async (converter: Converter, file: File) => {
    const currentId = ++runIdRef.current

    setStatus('converting')
    setProgress(0)
    setResult(null)
    setError(null)

    try {
      const blob = await converter.convert(file, (percent) => {
        if (runIdRef.current === currentId) setProgress(percent)
      })

      if (runIdRef.current !== currentId) return

      const baseName = file.name.replace(/\.[^.]+$/, '')
      const fileName = `${baseName}.${converter.outputExtension}`

      setResult({ blob, fileName, sizeBytes: blob.size })
      setStatus('done')
    } catch (err) {
      if (runIdRef.current !== currentId) return
      setError(err instanceof Error ? err.message : '변환 중 오류가 발생했습니다.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    runIdRef.current++ // 진행 중인 변환 무효화
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, result, error, run, reset }
}
