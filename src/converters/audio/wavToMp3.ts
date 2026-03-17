import { makeFFmpegConverter } from '../video/_ffmpegConvert'

export const wavToMp3 = makeFFmpegConverter({
  id: 'wav-to-mp3',
  label: 'WAV → MP3',
  category: 'audio',
  inputExtension: 'wav',
  outputExtension: 'mp3',
  inputAccept: '.wav,audio/wav',
  description: 'WAV 오디오를 MP3 형식으로 변환합니다.',
  outputMime: 'audio/mpeg',
  args: ['-acodec', 'libmp3lame', '-q:a', '2'],
})
