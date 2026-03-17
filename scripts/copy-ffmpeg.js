// ffmpeg.wasm core 파일을 node_modules에서 public 폴더로 복사
// 파일 크기가 크므로 git에 포함하지 않고 이 스크립트로 생성합니다.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcDir = join(root, 'node_modules/@ffmpeg/core/dist/esm')
const destDir = join(root, 'public')

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm']

for (const file of files) {
  const src = join(srcDir, file)
  const dest = join(destDir, file)
  // 대상 파일이 없거나 소스 파일이 더 최신이면 복사 (버전 갱신 대응)
  const needsCopy = !existsSync(dest) || statSync(src).mtimeMs > statSync(dest).mtimeMs
  if (needsCopy) {
    copyFileSync(src, dest)
    console.log(`Copied: ${file}`)
  }
}
