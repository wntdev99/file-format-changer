import { makeFFmpegConverter } from './_ffmpegConvert'

export const mp4ToAvi = makeFFmpegConverter({
  id: 'mp4-to-avi',
  label: 'MP4 → AVI',
  category: 'video',
  inputExtension: 'mp4',
  outputExtension: 'avi',
  inputAccept: '.mp4,video/mp4',
  description: 'MP4 동영상을 AVI 형식으로 변환합니다.',
  outputMime: 'video/x-msvideo',
  args: ['-c:v', 'libx264', '-c:a', 'mp3'],
})
