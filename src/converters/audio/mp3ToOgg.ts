import { makeFFmpegConverter } from '../video/_ffmpegConvert'

export const mp3ToOgg = makeFFmpegConverter({
  id: 'mp3-to-ogg',
  label: 'MP3 → OGG',
  category: 'audio',
  inputExtension: 'mp3',
  outputExtension: 'ogg',
  inputAccept: '.mp3,audio/mpeg',
  description: 'MP3 오디오를 OGG 형식으로 변환합니다.',
  outputMime: 'audio/ogg',
  args: ['-acodec', 'libvorbis', '-q:a', '4'],
})
