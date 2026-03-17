import { makeFFmpegConverter } from './_ffmpegConvert'

export const mp4ToMp3 = makeFFmpegConverter({
  id: 'mp4-to-mp3',
  label: 'MP4 → MP3',
  category: 'video',
  inputExtension: 'mp4',
  outputExtension: 'mp3',
  inputAccept: '.mp4,video/mp4',
  description: 'MP4 동영상에서 오디오를 MP3로 추출합니다.',
  outputMime: 'audio/mpeg',
  args: ['-vn', '-acodec', 'libmp3lame', '-q:a', '2'],
})
