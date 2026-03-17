import { useState } from 'react'
import type { Converter, ConverterCategory } from './types/converter'
import {
  getAllConverters,
  getAvailableCategories,
} from './converters/registry'
import { CategoryNav } from './components/CategoryNav'
import { ConverterCard } from './components/ConverterCard'
import { FileUploadZone } from './components/FileUploadZone'
import { ConversionPanel } from './components/ConversionPanel'
import { useConverter } from './hooks/useConverter'

const ALL_CONVERTERS = getAllConverters()
const AVAILABLE_CATEGORIES = getAvailableCategories()

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ConverterCategory | null>(null)
  const [selectedConverter, setSelectedConverter] = useState<Converter | null>(null)
  const { status, progress, result, error, run, reset } = useConverter()

  const displayedConverters = selectedCategory
    ? ALL_CONVERTERS.filter((c) => c.category === selectedCategory)
    : ALL_CONVERTERS

  function handleConverterSelect(converter: Converter) {
    setSelectedConverter(converter)
    reset()
  }

  function handleCategorySelect(category: ConverterCategory | null) {
    setSelectedCategory(category)
    setSelectedConverter(null)
    reset()
  }

  function handleFileSelect(file: File) {
    if (!selectedConverter) return
    run(selectedConverter, file)
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

        {/* 파일 업로드 & 결과 */}
        {selectedConverter && (
          <section className="conversion-section">
            {status === 'idle' && (
              <FileUploadZone
                converter={selectedConverter}
                onFileSelect={handleFileSelect}
              />
            )}
            <ConversionPanel
              status={status}
              progress={progress}
              result={result}
              error={error}
              onReset={reset}
            />
          </section>
        )}

        {!selectedConverter && (
          <p className="hint">위에서 변환 형식을 선택하세요.</p>
        )}
      </main>
    </div>
  )
}
