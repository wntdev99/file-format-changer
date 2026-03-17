import type { Converter } from '../types/converter'

interface ConverterCardProps {
  converter: Converter
  selected: boolean
  onSelect: (converter: Converter) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  spreadsheet: '#16a34a',
  image: '#2563eb',
  video: '#7c3aed',
  document: '#d97706',
  audio: '#db2777',
}

export function ConverterCard({ converter, selected, onSelect }: ConverterCardProps) {
  const color = CATEGORY_COLORS[converter.category] ?? '#6b7280'

  return (
    <button
      className={`converter-card ${selected ? 'selected' : ''}`}
      style={{ '--accent': color } as React.CSSProperties}
      onClick={() => onSelect(converter)}
    >
      <div className="converter-badge">
        <span className="ext-from">.{converter.inputExtension.toUpperCase()}</span>
        <span className="arrow">→</span>
        <span className="ext-to">.{converter.outputExtension.toUpperCase()}</span>
      </div>
      <p className="converter-desc">{converter.description}</p>
    </button>
  )
}
