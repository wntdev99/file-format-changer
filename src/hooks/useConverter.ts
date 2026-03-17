import { useState, useCallback } from 'react'
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

  const run = useCallback(async (converter: Converter, file: File) => {
    setStatus('converting')
    setProgress(0)
    setResult(null)
    setError(null)

    try {
      const blob = await converter.convert(file, setProgress)

      const baseName = file.name.replace(/\.[^.]+$/, '')
      const fileName = `${baseName}.${converter.outputExtension}`

      setResult({ blob, fileName, sizeBytes: blob.size })
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '변환 중 오류가 발생했습니다.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, result, error, run, reset }
}
