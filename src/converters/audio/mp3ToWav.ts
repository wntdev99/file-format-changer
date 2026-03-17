import { makeFFmpegConverter } from '../video/_ffmpegConvert'

export const mp3ToWav = makeFFmpegConverter({
  id: 'mp3-to-wav',
  label: 'MP3 → WAV',
  category: 'audio',
  inputExtension: 'mp3',
  outputExtension: 'wav',
  inputAccept: '.mp3,audio/mpeg',
  description: 'MP3 오디오를 WAV 형식으로 변환합니다.',
  outputMime: 'audio/wav',
  args: ['-acodec', 'pcm_s16le'],
})
