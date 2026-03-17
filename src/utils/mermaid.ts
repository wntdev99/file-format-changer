/**
 * Mermaid SVG 렌더링 유틸리티
 *
 * 핵심 문제 두 가지를 처리합니다:
 * 1. width="100%": mermaid가 항상 width="100%"로 생성 → <img> 로드 실패/크기 불명
 *    → renderMermaidSvg 내에서 viewBox 기준 명시적 px 값으로 교체
 * 2. <foreignObject>: <img>로 SVG 로딩 시 foreignObject 내용이 제거됨 (브라우저 보안)
 *    → PNG/PDF 내보내기 시 htmlLabels:false로 순수 SVG <text> 요소 사용
 */

/**
 * Mermaid를 초기화하고 SVG 문자열로 렌더링합니다.
 *
 * @param code     Mermaid 다이어그램 코드
 * @param htmlLabels true  → HTML 레이블 허용 (미리보기, SVG 내보내기용)
 *                  false → 순수 SVG text 요소 사용 (PNG/PDF 내보내기용, canvas 호환)
 */
export async function renderMermaidSvg(code: string): Promise<string> {
  const mod = await import('mermaid')
  const mermaid = mod.default

  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    sequence: { useMaxWidth: false },
  })

  const id = `mermaid-render-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
  const { svg: rawSvg } = await mermaid.render(id, code.trim())

  // mermaid v10 이 DOM에 남기는 고아 요소 정리
  document.getElementById(id)?.remove()
  document.getElementById(`d${id}`)?.remove()

  // width="100%" → 명시적 px 값으로 교체 (<img> 로딩 및 canvas 렌더링 안정화)
  return fixSvgDimensions(rawSvg)
}

/**
 * SVG의 width="100%" / style="max-width:..." 를 viewBox 기준 명시적 px 값으로 교체합니다.
 */
function fixSvgDimensions(svg: string): string {
  const { width, height } = parseSvgDimensions(svg)

  return svg
    // width="100%" → 명시적 너비
    .replace(/(<svg\b[^>]*?\s)width="[^"]*"/, `$1width="${width}"`)
    // style 에서 max-width 제거 (명시적 width 와 충돌)
    .replace(/(<svg\b[^>]*?\s)style="[^"]*max-width[^"]*"/, '$1')
    // height 속성이 없으면 추가
    .replace(/(<svg\b(?![^>]*\bheight=)[^>]*)>/, `$1 height="${height}">`)
}

/**
 * SVG 문자열에서 렌더링 크기를 추출합니다.
 * viewBox > width/height 속성 > style max-width 순으로 시도합니다.
 */
export function parseSvgDimensions(svg: string): { width: number; height: number } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svg, 'image/svg+xml')
  const el = doc.querySelector('svg')
  if (!el) return { width: 800, height: 600 }

  // 1) viewBox
  const vb = el.getAttribute('viewBox')
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number)
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0)
      return { width: parts[2], height: parts[3] }
  }

  // 2) width / height 속성 (% 단위 제외)
  const aw = parseFloat(el.getAttribute('width') ?? '0')
  const ah = parseFloat(el.getAttribute('height') ?? '0')
  if (aw > 0 && ah > 0 && !String(el.getAttribute('width')).includes('%'))
    return { width: aw, height: ah }

  // 3) style="max-width: Npx" (mermaid 특유의 반응형 SVG)
  const mwMatch = (el.getAttribute('style') ?? '').match(/max-width:\s*([\d.]+)px/)
  if (mwMatch) {
    const w = parseFloat(mwMatch[1])
    return { width: w, height: w * 0.6 }
  }

  return { width: 800, height: 600 }
}

/**
 * SVG의 <foreignObject> 요소를 SVG <text>/<tspan> 요소로 교체합니다.
 *
 * DOMParser+XMLSerializer 대신 순수 문자열(regex) 치환을 사용합니다.
 * DOMParser로 파싱 후 재직렬화하면 mermaid SVG의 <style>/<defs> 내용이
 * 손상되어 <img> 로드가 실패하는 문제를 방지합니다.
 */
function deforeignize(svg: string): string {
  return svg.replace(
    /<foreignObject([^>]*)>([\s\S]*?)<\/foreignObject>/gi,
    (_, attrs, inner) => {
      const numAttr = (name: string, fallback = 0) => {
        const m = attrs.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))
        return m ? parseFloat(m[1]) : fallback
      }
      const x = numAttr('x', 0)
      const y = numAttr('y', 0)
      const w = numAttr('width', 100)
      const h = numAttr('height', 20)

      const lines = inner
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim()
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)

      if (lines.length === 0) return ''

      const xmlEscape = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

      const fontSize = 13
      const lineHeight = fontSize * 1.35
      const totalH = lines.length * lineHeight
      const startY = y + (h - totalH) / 2 + fontSize
      const cx = x + w / 2

      const tspans = lines
        .map((line: string, i: number) =>
          i === 0
            ? `<tspan x="${cx}">${xmlEscape(line)}</tspan>`
            : `<tspan x="${cx}" dy="${lineHeight}">${xmlEscape(line)}</tspan>`,
        )
        .join('')

      return `<text x="${cx}" y="${startY}" text-anchor="middle" font-family='"Trebuchet MS",verdana,arial,sans-serif' font-size="${fontSize}" fill="#333">${tspans}</text>`
    },
  )
}

/**
 * SVG 문자열을 PNG Blob으로 변환합니다.
 * <foreignObject>를 SVG 텍스트로 교체 후 canvas.drawImage()로 래스터화합니다.
 * @param scale 픽셀 밀도 배율 (기본 2 = 레티나급 해상도)
 */
export function svgToPngBlob(svg: string, scale = 2): Promise<Blob> {
  const { width, height } = parseSvgDimensions(svg)
  // foreignObject 제거 → canvas drawImage 호환
  const safeSvg = deforeignize(svg)

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(width * scale)
    canvas.height = Math.ceil(height * scale)

    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)

    const blobUrl = URL.createObjectURL(
      new Blob([safeSvg], { type: 'image/svg+xml;charset=utf-8' }),
    )
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(blobUrl)
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('PNG 변환에 실패했습니다.'))),
        'image/png',
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      reject(new Error('SVG 이미지 로드에 실패했습니다.'))
    }
    img.src = blobUrl
  })
}
