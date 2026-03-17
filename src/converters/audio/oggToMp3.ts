import { makeFFmpegConverter } from '../video/_ffmpegConvert'

export const oggToMp3 = makeFFmpegConverter({
  id: 'ogg-to-mp3',
  label: 'OGG → MP3',
  category: 'audio',
  inputExtension: 'ogg',
  outputExtension: 'mp3',
  inputAccept: '.ogg,audio/ogg',
  description: 'OGG 오디오를 MP3 형식으로 변환합니다.',
  outputMime: 'audio/mpeg',
  args: ['-acodec', 'libmp3lame', '-q:a', '2'],
})
