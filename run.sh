#!/usr/bin/env bash
# file-format-changer 로컬 개발 서버 실행 스크립트
set -euo pipefail

# ─── 경로 설정 ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── 색상 출력 헬퍼 ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
title() { echo -e "\n${BOLD}$*${NC}"; }

# ─── 1. Node.js 확인 ─────────────────────────────────────────────────────────
title "── 환경 확인 ──────────────────────────────────────────"

# nvm이 있으면 로드 (non-interactive 셸에서는 자동 로드 안 됨)
if [ -z "$(command -v node 2>/dev/null)" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
fi

if ! command -v node &>/dev/null; then
  err "Node.js가 설치되어 있지 않습니다."
  err "  설치 방법: https://nodejs.org  또는  nvm install --lts"
  exit 1
fi
ok "Node.js $(node -v)"

# ─── 2. npm 확인 ─────────────────────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  err "npm이 설치되어 있지 않습니다."
  exit 1
fi
ok "npm v$(npm -v)"

# ─── 3. 의존성 설치 여부 확인 ────────────────────────────────────────────────
title "── 의존성 확인 ─────────────────────────────────────────"

NEED_INSTALL=0

if [ ! -d "node_modules" ]; then
  warn "node_modules 없음 → npm install 실행"
  NEED_INSTALL=1
elif [ ! -f "node_modules/.package-lock.json" ]; then
  warn "node_modules 불완전 → npm install 재실행"
  NEED_INSTALL=1
elif [ "package-lock.json" -nt "node_modules/.package-lock.json" ]; then
  warn "package-lock.json 변경됨 → npm install 재실행"
  NEED_INSTALL=1
elif [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  warn "package.json 변경됨 → npm install 재실행"
  NEED_INSTALL=1
fi

if [ "$NEED_INSTALL" -eq 1 ]; then
  info "npm install 실행 중..."
  npm install
  ok "의존성 설치 완료"
else
  ok "의존성 최신 상태"
fi

# ─── 4. ffmpeg wasm 파일 확인 ────────────────────────────────────────────────
title "── ffmpeg wasm 확인 ────────────────────────────────────"

FFMPEG_DEST_JS="public/ffmpeg-core.js"
FFMPEG_DEST_WASM="public/ffmpeg-core.wasm"
FFMPEG_SRC_JS="node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js"

NEED_SETUP=0

if [ ! -f "$FFMPEG_DEST_JS" ] || [ ! -f "$FFMPEG_DEST_WASM" ]; then
  warn "ffmpeg wasm 파일 없음 → setup 실행"
  NEED_SETUP=1
elif [ -f "$FFMPEG_SRC_JS" ] && [ "$FFMPEG_SRC_JS" -nt "$FFMPEG_DEST_JS" ]; then
  warn "ffmpeg 패키지 버전 갱신 → setup 재실행"
  NEED_SETUP=1
fi

if [ "$NEED_SETUP" -eq 1 ]; then
  info "scripts/copy-ffmpeg.js 실행 중..."
  node scripts/copy-ffmpeg.js
  ok "ffmpeg wasm 복사 완료"
else
  ok "ffmpeg wasm 최신 상태"
fi

# ─── 5. 개발 서버 실행 ───────────────────────────────────────────────────────
title "── 개발 서버 시작 ──────────────────────────────────────"
echo ""

# npm run dev의 setup 단계는 위에서 처리했으므로 vite 직접 실행
exec npx vite
