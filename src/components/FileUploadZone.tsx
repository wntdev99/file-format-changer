import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import type { Converter } from '../types/converter'

interface FileUploadZoneProps {
  converter: Converter
  onFileSelect: (file: File) => void
}

export function FileUploadZone({ converter, onFileSelect }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return

    // inputAccept에서 .ext 형태의 확장자만 추출해 허용 목록 구성
    // (.jpeg, .jpg, .htm, .html 등 별칭 확장자 모두 허용)
    const allowedExts = converter.inputAccept
      .split(',')
      .filter((s) => s.trim().startsWith('.'))
      .map((s) => s.trim().slice(1).toLowerCase())

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!allowedExts.includes(ext)) {
      alert(`${allowedExts.map((e) => `.${e.toUpperCase()}`).join(', ')} 파일만 업로드할 수 있습니다.`)
      return
    }
    onFileSelect(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
    e.target.value = ''
  }

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="upload-icon">📁</div>
      <p className="upload-text">
        <strong>.{converter.inputExtension.toUpperCase()}</strong> 파일을 여기에 끌어다 놓거나
      </p>
      <button
        className="upload-btn"
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
      >
        파일 선택
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={converter.inputAccept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  )
}
