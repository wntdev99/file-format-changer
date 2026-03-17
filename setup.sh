#!/usr/bin/env bash
# file-format-changer 최초 환경 설정 스크립트
# 저장소를 클론한 뒤 처음 한 번만 실행하면 됩니다.
set -euo pipefail

# ─── 경로 설정 ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── 색상 출력 헬퍼 ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()     { echo -e "${RED}[ERROR]${NC} $*" >&2; }
title()   { echo -e "\n${BOLD}$*${NC}"; }
success() { echo -e "\n${GREEN}${BOLD}$*${NC}"; }
fail()    { err "$*"; exit 1; }

# ─── 1. 전제 조건 확인 ───────────────────────────────────────────────────────
title "── 전제 조건 확인 ─────────────────────────────────────"

# nvm이 있으면 로드 (non-interactive 셸에서는 자동 로드 안 됨)
if [ -z "$(command -v node 2>/dev/null)" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
fi

# Node.js
if ! command -v node &>/dev/null; then
  err "Node.js가 설치되어 있지 않습니다."
  err "  권장 설치 방법:"
  err "    nvm install --lts   (nvm 사용 시)"
  err "    https://nodejs.org  (직접 설치 시)"
  exit 1
fi
NODE_VER=$(node -v)
# v18 이상 요구 (Vite 5, ffmpeg.wasm 호환)
NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  fail "Node.js $NODE_VER 은 지원되지 않습니다. v18 이상이 필요합니다."
fi
ok "Node.js $NODE_VER"

# npm
if ! command -v npm &>/dev/null; then
  fail "npm이 설치되어 있지 않습니다."
fi
ok "npm v$(npm -v)"

# git (선택적 — 없어도 진행)
if command -v git &>/dev/null; then
  ok "git $(git --version | awk '{print $3}')"
else
  warn "git을 찾을 수 없습니다. 버전 관리 기능은 사용할 수 없습니다."
fi

# package.json 존재 확인
if [ ! -f "package.json" ]; then
  fail "package.json을 찾을 수 없습니다. 프로젝트 루트에서 실행하세요."
fi
ok "package.json 확인"

# ─── 2. 의존성 설치 ──────────────────────────────────────────────────────────
title "── 의존성 설치 (npm install) ──────────────────────────"

if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ] \
   && [ "node_modules/.package-lock.json" -nt "package-lock.json" ]; then
  ok "node_modules 최신 상태 — 설치 생략"
else
  info "npm install 실행 중..."
  npm install
  ok "의존성 설치 완료 ($(npm list --depth=0 2>/dev/null | wc -l | tr -d ' ')개 패키지)"
fi

# ─── 3. ffmpeg wasm 복사 ─────────────────────────────────────────────────────
title "── ffmpeg wasm 설정 (scripts/copy-ffmpeg.js) ──────────"

FFMPEG_SRC="node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js"

if [ ! -f "$FFMPEG_SRC" ]; then
  fail "@ffmpeg/core 패키지를 찾을 수 없습니다. npm install이 정상적으로 완료되었는지 확인하세요."
fi

info "ffmpeg-core.js, ffmpeg-core.wasm 복사 중..."
node scripts/copy-ffmpeg.js

if [ ! -f "public/ffmpeg-core.js" ] || [ ! -f "public/ffmpeg-core.wasm" ]; then
  fail "ffmpeg wasm 파일 복사에 실패했습니다."
fi
WASM_SIZE=$(du -sh public/ffmpeg-core.wasm | awk '{print $1}')
ok "ffmpeg wasm 복사 완료 (ffmpeg-core.wasm: $WASM_SIZE)"

# ─── 4. 설정 완료 ────────────────────────────────────────────────────────────
success "✓ 설정이 완료되었습니다!"
echo ""
echo -e "  개발 서버 실행:  ${BOLD}./run.sh${NC}  또는  ${BOLD}npm run dev${NC}"
echo -e "  alias 등록 여부: ${BOLD}grep ffc ~/.bashrc${NC} 로 확인"
echo ""
