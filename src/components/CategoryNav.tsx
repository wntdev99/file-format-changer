import type { ConverterCategory } from '../types/converter'

const CATEGORY_META: Record<ConverterCategory, { label: string; icon: string }> = {
  spreadsheet: { label: '스프레드시트', icon: '📊' },
  image: { label: '이미지', icon: '🖼️' },
  video: { label: '비디오', icon: '🎬' },
  document: { label: '문서', icon: '📄' },
  audio: { label: '오디오', icon: '🎵' },
}

interface CategoryNavProps {
  categories: ConverterCategory[]
  selected: ConverterCategory | null
  onSelect: (category: ConverterCategory | null) => void
}

export function CategoryNav({ categories, selected, onSelect }: CategoryNavProps) {
  return (
    <nav className="category-nav">
      <button
        className={`category-btn ${selected === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        전체
      </button>
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat]
        return (
          <button
            key={cat}
            className={`category-btn ${selected === cat ? 'active' : ''}`}
            onClick={() => onSelect(cat)}
          >
            <span className="category-icon">{meta.icon}</span>
            {meta.label}
          </button>
        )
      })}
    </nav>
  )
}
