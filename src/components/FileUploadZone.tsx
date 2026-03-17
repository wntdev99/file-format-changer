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

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (ext !== converter.inputExtension) {
      alert(`${converter.inputExtension.toUpperCase()} 파일만 업로드할 수 있습니다.`)
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
