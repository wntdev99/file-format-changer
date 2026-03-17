import { makeFFmpegConverter } from './_ffmpegConvert'

export const mp4ToWebm = makeFFmpegConverter({
  id: 'mp4-to-webm',
  label: 'MP4 → WebM',
  category: 'video',
  inputExtension: 'mp4',
  outputExtension: 'webm',
  inputAccept: '.mp4,video/mp4',
  description: 'MP4 동영상을 WebM 형식으로 변환합니다.',
  outputMime: 'video/webm',
  args: ['-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-c:a', 'libopus'],
})
