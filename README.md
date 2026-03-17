# File Format Changer

브라우저에서 동작하는 클라이언트 사이드 파일 형식 변환 웹 애플리케이션입니다.
서버 없이 스프레드시트·이미지·문서·비디오·오디오 파일을 변환하고, 변환 전후 미리보기를 제공합니다.

---

## 기능

- **35개 변환기** — 스프레드시트, 이미지, 문서, 비디오, 오디오 5개 카테고리
- **파일 미리보기** — 변환 전 입력 파일, 변환 후 출력 파일을 나란히 미리보기
- **서버리스** — 모든 변환이 브라우저 내에서 처리 (파일 업로드 없음)
- **비디오·오디오** — ffmpeg.wasm 기반으로 MP4, WebM, AVI, MP3, WAV, OGG 변환

---

## 지원 변환기 목록

### 스프레드시트 (8개)

| 변환기 | 설명 |
|--------|------|
| CSV → XLSX | CSV를 Excel 파일로 변환 |
| XLSX → CSV | Excel 첫 번째 시트를 CSV로 변환 |
| CSV ↔ JSON | CSV와 JSON 배열 상호 변환 |
| XLSX ↔ JSON | Excel 첫 번째 시트와 JSON 배열 상호 변환 |
| CSV → HTML | CSV를 HTML 테이블로 변환 |
| XLSX → HTML | Excel을 HTML 테이블로 변환 |

### 이미지 (13개)

| 변환기 | 설명 |
|--------|------|
| PNG ↔ JPG | PNG와 JPG 상호 변환 (투명 배경 → 흰 배경) |
| PNG ↔ WebP | PNG와 WebP 상호 변환 |
| JPG ↔ WebP | JPG와 WebP 상호 변환 |
| SVG → PNG | SVG 벡터를 PNG 래스터로 변환 |
| GIF → PNG / WebP | GIF 첫 프레임을 PNG 또는 WebP로 변환 |
| PNG / JPG / WebP → GIF | 정지 이미지를 GIF로 변환 |
| HEIC → JPG | iPhone 촬영 파일(HEIC)을 JPG로 변환 |

### 문서 (5개)

| 변환기 | 설명 |
|--------|------|
| Markdown ↔ HTML | Markdown과 HTML 상호 변환 |
| HTML → PDF | HTML 문서를 PDF로 변환 (A4 자동 분할) |
| TXT → PDF | 텍스트 파일을 PDF로 변환 (CJK 지원) |
| DOCX → PDF | Word 문서를 PDF로 변환 |

### 비디오 (5개)

| 변환기 | 설명 |
|--------|------|
| MP4 ↔ WebM | MP4와 WebM 상호 변환 |
| MP4 → GIF | MP4 영상을 GIF 애니메이션으로 변환 |
| MP4 → MP3 | MP4에서 오디오 트랙 추출 |
| MP4 → AVI | MP4를 AVI로 변환 |

### 오디오 (4개)

| 변환기 | 설명 |
|--------|------|
| MP3 ↔ WAV | MP3와 WAV 상호 변환 |
| MP3 ↔ OGG | MP3와 OGG 상호 변환 |

---

## 시작하기

### 요구사항

- **Node.js** v18 이상
- **npm** v8 이상

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/wntdev99/file-format-changer.git
cd file-format-changer

# 2. 초기 환경 설정 (최초 1회)
./setup.sh

# 3. 개발 서버 실행
./run.sh
```

브라우저에서 `http://localhost:5173` 을 열면 됩니다.

### npm 스크립트로 실행

```bash
npm run dev      # 개발 서버 실행 (setup 포함)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과물 미리보기
```

---

## 스크립트 설명

### `setup.sh` — 최초 1회 실행

저장소를 클론한 뒤 개발 환경을 구성합니다.

1. Node.js(v18+), npm, git 설치 여부 확인
2. nvm 자동 로드 (non-interactive 셸 지원)
3. `npm install` — 의존성 설치
4. `scripts/copy-ffmpeg.js` — ffmpeg.wasm 파일(~31 MB)을 `public/`에 복사

### `run.sh` — 매번 실행

변경사항을 감지하고 개발 서버를 기동합니다.

1. Node.js / npm 설치 여부 확인
2. `package.json` / `package-lock.json` 변경 감지 → 자동 `npm install`
3. ffmpeg wasm 누락 또는 패키지 버전 갱신 감지 → 자동 재복사
4. `npx vite` 개발 서버 실행

### alias 등록 (선택)

```bash
# ~/.bashrc 에 자동 등록됨 (setup.sh 실행 시 안내)
alias ffc='/path/to/file-format-changer/run.sh'

# 적용
source ~/.bashrc

# 이후 어디서든
ffc
```

---

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| UI 프레임워크 | React 18 + TypeScript + Vite |
| 스프레드시트 | [SheetJS (xlsx)](https://sheetjs.com) |
| Markdown 렌더링 | [marked](https://marked.js.org) |
| HTML → Markdown | [Turndown](https://github.com/mixmark-io/turndown) |
| PDF 생성 | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com) |
| DOCX 파싱 | [mammoth](https://github.com/mwilliamson/mammoth.js) |
| HEIC 변환 | [heic2any](https://github.com/alexcorvi/heic2any) |
| GIF 인코딩 | [gifenc](https://github.com/mattdesl/gifenc) |
| 비디오·오디오 | [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) (Single-thread WASM) |

---

## 아키텍처

### 변환기 레지스트리 패턴

모든 변환기는 `Converter` 인터페이스를 구현하며, `src/converters/registry.ts`의 배열에 등록됩니다.
UI는 레지스트리를 읽어 카테고리 탭과 변환기 카드를 자동으로 렌더링합니다.

```
새 변환기 추가 시 필요한 작업:
  1. src/converters/{category}/{변환기}.ts 파일 생성 (Converter 인터페이스 구현)
  2. src/converters/registry.ts의 ALL_CONVERTERS 배열에 추가
```

```typescript
interface Converter {
  id: string
  label: string
  category: 'spreadsheet' | 'image' | 'document' | 'video' | 'audio'
  inputExtension: string   // 소문자, 점 없이 (예: "csv")
  outputExtension: string
  inputAccept: string      // <input accept> 속성값
  description: string
  convert: (file: File, onProgress?: (percent: number) => void) => Promise<Blob>
}
```

### 프로젝트 구조

```
src/
├── types/
│   └── converter.ts          # Converter 인터페이스, ConverterCategory 타입
├── converters/
│   ├── registry.ts           # 변환기 등록 배열 및 조회 함수
│   ├── spreadsheet/          # CSV, XLSX, JSON, HTML 변환기
│   ├── image/                # PNG, JPG, WebP, GIF, SVG, HEIC 변환기
│   ├── document/             # Markdown, HTML, TXT, DOCX, PDF 변환기
│   ├── video/                # MP4, WebM, AVI, GIF, MP3 변환기 (ffmpeg.wasm)
│   └── audio/                # MP3, WAV, OGG 변환기 (ffmpeg.wasm)
├── components/
│   ├── PreviewPane.tsx        # 파일 미리보기 컴포넌트 (입력·출력 공용)
│   ├── FileUploadZone.tsx     # 드래그 앤 드롭 업로드 영역
│   ├── CategoryNav.tsx        # 카테고리 탭 네비게이션
│   └── ConverterCard.tsx      # 변환기 선택 카드
├── hooks/
│   └── useConverter.ts        # 변환 상태 관리 (race condition 처리)
├── styles/index.css
├── App.tsx
└── main.tsx
scripts/
└── copy-ffmpeg.js             # ffmpeg.wasm → public/ 복사 스크립트
```

### ffmpeg.wasm 처리 방식

비디오·오디오 변환에 사용하는 ffmpeg.wasm(~31 MB)은 git 저장소에 포함되지 않습니다.

- `setup.sh` / `npm run setup` 실행 시 `node_modules/@ffmpeg/core`에서 `public/`으로 복사
- 브라우저에서 로드 시 CDN이 아닌 `window.location.origin/` 기준 URL로 로드 (COOP/COEP 헤더 대응)
- FFmpeg 인스턴스는 싱글톤으로 관리되며 최초 로드 후 재사용

---

## 미리보기 지원 형식

| 형식 | 렌더링 방식 | 입력 | 출력 |
|------|------------|:----:|:----:|
| PNG / JPG / WebP / GIF / SVG | `<img>` | ✅ | ✅ |
| MP4 / WebM | `<video>` | ✅ | ✅ |
| MP3 / WAV / OGG | `<audio>` | ✅ | ✅ |
| PDF | `<iframe>` | — | ✅ |
| HTML / HTM | `<iframe srcdoc>` | ✅ | ✅ |
| Markdown | marked 렌더링 → `<iframe>` | ✅ | ✅ |
| TXT / JSON | `<pre>` | ✅ | ✅ |
| CSV / XLSX | SheetJS → 테이블 | ✅ | ✅ |
| DOCX | mammoth → `<iframe>` | ✅ | — |
| AVI / HEIC | 미지원 | — | — |
