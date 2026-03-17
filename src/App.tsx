import { useState, useRef } from 'react'
import type { Converter, ConverterCategory } from './types/converter'
import { getAllConverters, getAvailableCategories } from './converters/registry'
import { CategoryNav } from './components/CategoryNav'
import { ConverterCard } from './components/ConverterCard'
import { FileUploadZone } from './components/FileUploadZone'
import { PreviewPane } from './components/PreviewPane'
import { useConverter } from './hooks/useConverter'

const ALL_CONVERTERS = getAllConverters()
const AVAILABLE_CATEGORIES = getAvailableCategories()

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ConverterCategory | null>(null)
  const [selectedConverter, setSelectedConverter] = useState<Converter | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { status, progress, result, error, run, reset } = useConverter()
  const downloadUrlRef = useRef<string | null>(null)

  function revokeDownloadUrl() {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }
  }

  const displayedConverters = selectedCategory
    ? ALL_CONVERTERS.filter((c) => c.category === selectedCategory)
    : ALL_CONVERTERS

  function handleConverterSelect(converter: Converter) {
    revokeDownloadUrl()
    setSelectedConverter(converter)
    setSelectedFile(null)
    reset()
  }

  function handleCategorySelect(category: ConverterCategory | null) {
    revokeDownloadUrl()
    setSelectedCategory(category)
    setSelectedConverter(null)
    setSelectedFile(null)
    reset()
  }

  function handleFileSelect(file: File) {
    setSelectedFile(file)
  }

  function handleConvert() {
    if (!selectedConverter || !selectedFile) return
    run(selectedConverter, selectedFile)
  }

  // 파일 변경: 업로드 존으로 돌아감
  function handleChangeFile() {
    revokeDownloadUrl()
    setSelectedFile(null)
    reset()
  }

  function handleDownload() {
    if (!result) return
    revokeDownloadUrl()
    downloadUrlRef.current = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = downloadUrlRef.current
    a.download = result.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(revokeDownloadUrl, 1000)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">File Format Changer</h1>
        <p className="app-subtitle">다양한 파일 형식을 빠르게 변환하세요</p>
      </header>

      <main className="app-main">
        {/* 카테고리 탭 */}
        <CategoryNav
          categories={AVAILABLE_CATEGORIES}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />

        {/* 변환기 목록 */}
        <section className="converter-grid">
          {displayedConverters.map((converter) => (
            <ConverterCard
              key={converter.id}
              converter={converter}
              selected={selectedConverter?.id === converter.id}
              onSelect={handleConverterSelect}
            />
          ))}
        </section>

        {/* 파일 업로드 & 미리보기 & 결과 */}
        {selectedConverter && (
          <section className="conversion-section">
            {!selectedFile ? (
              // 파일 미선택: 업로드 존
              <FileUploadZone
                converter={selectedConverter}
                onFileSelect={handleFileSelect}
              />
            ) : (
              // 파일 선택됨: 양측 미리보기 레이아웃
              <div className="preview-layout">
                {/* 입력 패널 */}
                <div className="preview-col">
                  <PreviewPane
                    source={selectedFile}
                    ext={selectedConverter.inputExtension}
                    label={selectedFile.name}
                  />
                  <button
                    className="btn-change-file"
                    onClick={handleChangeFile}
                    disabled={status === 'converting'}
                  >
                    파일 변경
                  </button>
                </div>

                {/* 구분 화살표 */}
                <div className="preview-arrow-col">
                  <span className="preview-arrow">→</span>
                </div>

                {/* 출력 패널 */}
                <div className="preview-col">
                  {status === 'idle' && (
                    <div className="preview-output-placeholder">
                      <p className="preview-output-hint">
                        .{selectedConverter.outputExtension.toUpperCase()} 파일로 변환됩니다
                      </p>
                      <button className="btn-convert" onClick={handleConvert}>
                        변환 시작
                      </button>
                    </div>
                  )}

                  {status === 'converting' && (
                    <div className="preview-output-placeholder">
                      <p className="preview-converting-label">변환 중...</p>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="progress-label">{progress}%</span>
                    </div>
                  )}

                  {status === 'done' && result && (
                    <>
                      <PreviewPane
                        source={result.blob}
                        ext={selectedConverter.outputExtension}
                        label={result.fileName}
                      />
                      <div className="panel-actions">
                        <button className="btn-download" onClick={handleDownload}>
                          다운로드
                        </button>
                        <button className="btn-reset" onClick={() => reset()}>
                          다시 변환
                        </button>
                        <button className="btn-change-file" onClick={handleChangeFile}>
                          파일 변경
                        </button>
                      </div>
                    </>
                  )}

                  {status === 'error' && (
                    <div className="preview-output-placeholder">
                      <div className="error-icon">❌</div>
                      <p className="error-msg">{error}</p>
                      <div className="panel-actions">
                        <button className="btn-reset" onClick={handleConvert}>
                          다시 시도
                        </button>
                        <button className="btn-change-file" onClick={handleChangeFile}>
                          파일 변경
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {!selectedConverter && (
          <p className="hint">위에서 변환 형식을 선택하세요.</p>
        )}
      </main>
    </div>
  )
}
