import { makeFFmpegConverter } from './_ffmpegConvert'

export const mp4ToGif = makeFFmpegConverter({
  id: 'mp4-to-gif',
  label: 'MP4 → GIF',
  category: 'video',
  inputExtension: 'mp4',
  outputExtension: 'gif',
  inputAccept: '.mp4,video/mp4',
  description: 'MP4 동영상을 GIF 애니메이션으로 변환합니다. (앞 10초, 320px)',
  outputMime: 'image/gif',
  // 앞 10초, 너비 320px, 15fps로 변환
  // split 노드가 있는 filter_complex는 -vf가 아닌 -filter_complex로 지정해야 함
  args: [
    '-t', '10',
    '-filter_complex', 'fps=15,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
    '-f', 'gif',
  ],
})
