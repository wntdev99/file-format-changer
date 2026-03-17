import { makeFFmpegConverter } from './_ffmpegConvert'

export const webmToMp4 = makeFFmpegConverter({
  id: 'webm-to-mp4',
  label: 'WebM → MP4',
  category: 'video',
  inputExtension: 'webm',
  outputExtension: 'mp4',
  inputAccept: '.webm,video/webm',
  description: 'WebM 동영상을 MP4 형식으로 변환합니다.',
  outputMime: 'video/mp4',
  args: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac'],
})
