import type { ConversionStatus, ConversionResult } from '../types/converter'

interface ConversionPanelProps {
  status: ConversionStatus
  progress: number
  result: ConversionResult | null
  error: string | null
  onReset: () => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ConversionPanel({ status, progress, result, error, onReset }: ConversionPanelProps) {
  if (status === 'idle') return null

  function handleDownload() {
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="conversion-panel">
      {status === 'converting' && (
        <div className="panel-converting">
          <p>변환 중...</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>
      )}

      {status === 'done' && result && (
        <div className="panel-done">
          <div className="done-icon">✅</div>
          <p className="done-filename">{result.fileName}</p>
          <p className="done-size">{formatSize(result.sizeBytes)}</p>
          <div className="panel-actions">
            <button className="btn-download" onClick={handleDownload}>
              다운로드
            </button>
            <button className="btn-reset" onClick={onReset}>
              다시 변환
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="panel-error">
          <div className="error-icon">❌</div>
          <p className="error-msg">{error}</p>
          <button className="btn-reset" onClick={onReset}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  )
}
