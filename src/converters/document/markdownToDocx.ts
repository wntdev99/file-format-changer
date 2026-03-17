import type { Converter } from '../../types/converter'

// Markdown 인라인 토큰을 평탄한 run 속성 배열로 변환
type RunProps = {
  text: string
  bold?: boolean
  italics?: boolean
  strike?: boolean
  code?: boolean
  color?: string
}

function inlineToRunProps(tokens: unknown[], inherited: Omit<RunProps, 'text'> = {}): RunProps[] {
  const result: RunProps[] = []
  for (const t of tokens as Array<Record<string, unknown>>) {
    const type = t.type as string
    if (type === 'text' || type === 'escape') {
      if (Array.isArray(t.tokens) && t.tokens.length > 0) {
        result.push(...inlineToRunProps(t.tokens as unknown[], inherited))
      } else {
        result.push({ text: (t.text ?? t.raw ?? '') as string, ...inherited })
      }
    } else if (type === 'strong') {
      result.push(...inlineToRunProps(
        (t.tokens ?? []) as unknown[],
        { ...inherited, bold: true },
      ))
    } else if (type === 'em') {
      result.push(...inlineToRunProps(
        (t.tokens ?? []) as unknown[],
        { ...inherited, italics: true },
      ))
    } else if (type === 'del') {
      result.push(...inlineToRunProps(
        (t.tokens ?? []) as unknown[],
        { ...inherited, strike: true },
      ))
    } else if (type === 'codespan') {
      result.push({ text: (t.text ?? '') as string, code: true, ...inherited })
    } else if (type === 'link') {
      result.push(...inlineToRunProps(
        (t.tokens ?? [{ type: 'text', text: t.text, raw: t.text }]) as unknown[],
        { ...inherited, color: '2563eb' },
      ))
    } else if (type === 'br') {
      result.push({ text: '\n', ...inherited })
    } else if (type === 'html' || type === 'image') {
      // HTML 태그·이미지는 원시 텍스트로 무시
    } else {
      const raw = (t.raw ?? '') as string
      if (raw) result.push({ text: raw, ...inherited })
    }
  }
  return result
}

export const markdownToDocx: Converter = {
  id: 'markdown-to-docx',
  label: 'Markdown → DOCX',
  category: 'document',
  inputExtension: 'md',
  outputExtension: 'docx',
  inputAccept: '.md,.markdown,text/markdown',
  description: 'Markdown 파일을 Word 문서(DOCX)로 변환합니다.',

  async convert(file, onProgress) {
    onProgress?.(10)
    const text = await file.text()
    onProgress?.(20)

    const [{ marked }, docxModule] = await Promise.all([
      import('marked'),
      import('docx'),
    ])

    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      HeadingLevel,
      Table,
      TableRow,
      TableCell,
      WidthType,
      BorderStyle,
      ShadingType,
    } = docxModule

    onProgress?.(40)

    const tokens = marked.lexer(text)

    function makeRuns(runProps: RunProps[]): InstanceType<typeof TextRun>[] {
      return runProps.map(
        (p) =>
          new TextRun({
            text: p.text,
            bold: p.bold,
            italics: p.italics,
            strike: p.strike,
            color: p.color,
            font: p.code ? { name: 'Courier New' } : undefined,
            size: p.code ? 18 : undefined,
          }),
      )
    }

    const HEADING_LEVELS = [
      HeadingLevel.HEADING_1,
      HeadingLevel.HEADING_2,
      HeadingLevel.HEADING_3,
      HeadingLevel.HEADING_4,
      HeadingLevel.HEADING_5,
      HeadingLevel.HEADING_6,
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections: any[] = []

    for (const token of tokens as Array<Record<string, unknown>>) {
      const type = token.type as string

      if (type === 'heading') {
        const depth = Math.min((token.depth as number) - 1, 5)
        sections.push(
          new Paragraph({
            heading: HEADING_LEVELS[depth],
            children: makeRuns(inlineToRunProps((token.tokens ?? []) as unknown[])),
          }),
        )
      } else if (type === 'paragraph') {
        sections.push(
          new Paragraph({
            children: makeRuns(inlineToRunProps((token.tokens ?? []) as unknown[])),
            spacing: { after: 160 },
          }),
        )
      } else if (type === 'code') {
        // 코드 블록: 배경 음영 + Courier New
        const lines = ((token.text ?? '') as string).split('\n')
        for (const line of lines) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: line, font: { name: 'Courier New' }, size: 18 })],
              shading: { type: ShadingType.SOLID, fill: 'F1F5F9', color: 'F1F5F9' },
              spacing: { before: 0, after: 0 },
              indent: { left: 360 },
            }),
          )
        }
        // 코드 블록 뒤 간격
        sections.push(new Paragraph({ children: [], spacing: { after: 160 } }))
      } else if (type === 'blockquote') {
        // 블록 인용: 왼쪽 테두리 + 들여쓰기
        const inner = token.tokens as Array<Record<string, unknown>> | undefined
        const innerText = inner
          ? inner.flatMap((t) =>
              inlineToRunProps((t.tokens ?? [{ type: 'text', text: t.text, raw: t.text }]) as unknown[]),
            )
          : [{ text: (token.text ?? '') as string }]

        sections.push(
          new Paragraph({
            children: makeRuns(innerText.map((r) => ({ ...r, color: r.color ?? '64748b' }))),
            border: {
              left: { style: BorderStyle.SINGLE, size: 6, color: '94a3b8', space: 8 },
            },
            indent: { left: 480 },
            spacing: { after: 160 },
          }),
        )
      } else if (type === 'list') {
        const items = (token.items ?? []) as Array<Record<string, unknown>>
        const ordered = token.ordered as boolean
        items.forEach((item, idx) => {
          // 각 list_item 에서 text/paragraph 토큰의 인라인 토큰 추출
          const itemTokens = (item.tokens ?? []) as Array<Record<string, unknown>>
          const inlineTokens = itemTokens
            .filter((t) => t.type === 'text' || t.type === 'paragraph')
            .flatMap((t) =>
              Array.isArray(t.tokens) && t.tokens.length > 0
                ? (t.tokens as unknown[])
                : [{ type: 'text', text: t.text, raw: t.text }],
            )

          const runs = makeRuns(inlineToRunProps(inlineTokens as unknown[]))

          if (ordered) {
            // 번호 목록: 수동으로 번호 추가
            runs.unshift(new TextRun({ text: `${idx + 1}. ` }))
            sections.push(
              new Paragraph({ children: runs, indent: { left: 360 }, spacing: { after: 80 } }),
            )
          } else {
            sections.push(
              new Paragraph({ bullet: { level: 0 }, children: runs, spacing: { after: 80 } }),
            )
          }
        })
      } else if (type === 'table') {
        const header = (token.header ?? []) as Array<Record<string, unknown>>
        const rows = (token.rows ?? []) as Array<Array<Record<string, unknown>>>

        const tableRows = [
          // 헤더 행
          new TableRow({
            tableHeader: true,
            children: header.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: makeRuns(inlineToRunProps((cell.tokens ?? []) as unknown[])),
                    }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: 'E2E8F0', color: 'E2E8F0' },
                }),
            ),
          }),
          // 데이터 행
          ...rows.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: makeRuns(inlineToRunProps((cell.tokens ?? []) as unknown[])),
                        }),
                      ],
                    }),
                ),
              }),
          ),
        ]

        sections.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
        )
        sections.push(new Paragraph({ children: [], spacing: { after: 160 } }))
      } else if (type === 'hr') {
        sections.push(
          new Paragraph({
            children: [],
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'e2e8f0', space: 1 } },
            spacing: { after: 160 },
          }),
        )
      } else if (type === 'space') {
        sections.push(new Paragraph({ children: [], spacing: { after: 120 } }))
      }
    }

    onProgress?.(75)

    const doc = new Document({
      sections: [{ children: sections }],
    })

    const blob = await Packer.toBlob(doc)
    onProgress?.(100)
    return blob
  },
}
