import { useState, useEffect } from 'react'

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'])
const VIDEO_EXTS = new Set(['mp4', 'webm'])
const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg'])
const UNSUPPORTED_EXTS = new Set(['avi', 'heic'])

// state의 kind에 미디어 타입을 직접 인코딩 → JSX에서 ext 참조 불필요
type PreviewState =
  | { kind: 'loading' }
  | { kind: 'unsupported' }
  | { kind: 'error' }
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string }
  | { kind: 'audio'; url: string }
  | { kind: 'pdf'; url: string }
  | { kind: 'text'; content: string }
  | { kind: 'html'; html: string }
  | { kind: 'table'; html: string }

interface PreviewPaneProps {
  source: File | Blob
  ext: string
  label: string
}

export function PreviewPane({ source, ext, label }: PreviewPaneProps) {
  const [state, setState] = useState<PreviewState>({ kind: 'loading' })

  useEffect(() => {
    // e는 effect 내부에서만 계산 — deps는 원본 prop인 ext 사용
    const e = ext.toLowerCase().replace(/^\./, '')
    let cancelled = false

    setState({ kind: 'loading' })

    if (UNSUPPORTED_EXTS.has(e)) {
      setState({ kind: 'unsupported' })
      return
    }

    if (IMAGE_EXTS.has(e)) {
      const url = URL.createObjectURL(source)
      setState({ kind: 'image', url })
      return () => URL.revokeObjectURL(url)
    }

    if (VIDEO_EXTS.has(e)) {
      const url = URL.createObjectURL(source)
      setState({ kind: 'video', url })
      return () => URL.revokeObjectURL(url)
    }

    if (AUDIO_EXTS.has(e)) {
      const url = URL.createObjectURL(source)
      setState({ kind: 'audio', url })
      return () => URL.revokeObjectURL(url)
    }

    if (e === 'pdf') {
      const url = URL.createObjectURL(source)
      setState({ kind: 'pdf', url })
      return () => URL.revokeObjectURL(url)
    }

    // 텍스트/스프레드시트/문서 — 비동기 처리
    ;(async () => {
      try {
        if (e === 'txt') {
          const text = await source.text()
          if (cancelled) return
          setState({ kind: 'text', content: text })

        } else if (e === 'json') {
          const raw = await source.text()
          if (cancelled) return
          let content: string
          try { content = JSON.stringify(JSON.parse(raw), null, 2) }
          catch { content = raw }
          setState({ kind: 'text', content })

        } else if (e === 'html' || e === 'htm') {
          const html = await source.text()
          if (cancelled) return
          setState({ kind: 'html', html })

        } else if (e === 'md') {
          const [{ marked }, text] = await Promise.all([import('marked'), source.text()])
          if (cancelled) return
          const body = await marked(text as string)
          setState({ kind: 'html', html: wrapMarkdownHtml(body as string) })

        } else if (e === 'csv') {
          const [{ read, utils }, text] = await Promise.all([import('xlsx'), source.text()])
          if (cancelled) return
          const wb = read(text, { type: 'string' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const full = utils.sheet_to_html(ws)
          const match = full.match(/<table[\s\S]*<\/table>/i)
          setState({ kind: 'table', html: match?.[0] ?? '<p>변환 실패</p>' })

        } else if (e === 'xlsx') {
          const [{ read, utils }, buf] = await Promise.all([import('xlsx'), source.arrayBuffer()])
          if (cancelled) return
          const wb = read(buf, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const full = utils.sheet_to_html(ws)
          const match = full.match(/<table[\s\S]*<\/table>/i)
          setState({ kind: 'table', html: match?.[0] ?? '<p>변환 실패</p>' })

        } else if (e === 'docx') {
          const [{ convertToHtml }, buf] = await Promise.all([
            import('mammoth'),
            source.arrayBuffer(),
          ])
          if (cancelled) return
          const { value } = await convertToHtml({ arrayBuffer: buf })
          setState({ kind: 'html', html: wrapDocxHtml(value) })

        } else {
          setState({ kind: 'unsupported' })
        }
      } catch {
        if (!cancelled) setState({ kind: 'error' })
      }
    })()

    return () => { cancelled = true }
  }, [source, ext])

  return (
    <div className="preview-pane">
      <div className="preview-pane-label" title={label}>{label}</div>
      <div className="preview-pane-body">
        {state.kind === 'loading' && (
          <span className="preview-msg">불러오는 중...</span>
        )}
        {state.kind === 'unsupported' && (
          <span className="preview-msg">미리보기 미지원</span>
        )}
        {state.kind === 'error' && (
          <span className="preview-msg preview-msg--error">미리보기 로드 실패</span>
        )}
        {state.kind === 'image' && (
          <img src={state.url} alt="preview" className="preview-img" />
        )}
        {state.kind === 'video' && (
          <video src={state.url} controls className="preview-video" />
        )}
        {state.kind === 'audio' && (
          <audio src={state.url} controls className="preview-audio" />
        )}
        {state.kind === 'pdf' && (
          <iframe src={state.url} className="preview-iframe" title="PDF 미리보기" />
        )}
        {state.kind === 'text' && (
          <pre className="preview-text">{state.content}</pre>
        )}
        {state.kind === 'html' && (
          <iframe
            srcDoc={state.html}
            className="preview-iframe"
            title="미리보기"
            sandbox="allow-same-origin"
          />
        )}
        {state.kind === 'table' && (
          <div
            className="preview-table-wrapper"
            dangerouslySetInnerHTML={{ __html: state.html }}
          />
        )}
      </div>
    </div>
  )
}

function wrapMarkdownHtml(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: system-ui, sans-serif; padding: 1rem 1.2rem;
         line-height: 1.7; color: #1e293b; font-size: 0.9rem; }
  h1, h2, h3 { margin: 1em 0 0.4em; }
  p { margin: 0 0 0.7em; }
  code { background: #f1f5f9; padding: 0.1em 0.35em; border-radius: 3px; }
  pre { background: #f1f5f9; padding: 0.8rem; border-radius: 6px;
        overflow: auto; font-size: 0.85rem; }
  a { color: #2563eb; }
  blockquote { border-left: 3px solid #e2e8f0; margin: 0; padding-left: 1rem; color: #64748b; }
</style></head><body>${body}</body></html>`
}

function wrapDocxHtml(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt;
         line-height: 1.6; padding: 1rem; color: #000; word-break: break-word; }
  h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; }
  p { margin: 0 0 0.8em; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
  td, th { border: 1px solid #999; padding: 4px 8px; }
  img { max-width: 100%; }
  ul, ol { padding-left: 2em; margin-bottom: 0.8em; }
</style></head><body>${body}</body></html>`
}
