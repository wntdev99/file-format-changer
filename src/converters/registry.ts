import type { Converter, ConverterCategory } from '../types/converter'
import { csvToXlsx } from './spreadsheet/csvToXlsx'
import { xlsxToCsv } from './spreadsheet/xlsxToCsv'
import { csvToJson } from './spreadsheet/csvToJson'
import { jsonToCsv } from './spreadsheet/jsonToCsv'
import { xlsxToJson } from './spreadsheet/xlsxToJson'
import { jsonToXlsx } from './spreadsheet/jsonToXlsx'
import { pngToJpg } from './image/pngToJpg'
import { jpgToPng } from './image/jpgToPng'
import { pngToWebp } from './image/pngToWebp'
import { jpgToWebp } from './image/jpgToWebp'
import { webpToPng } from './image/webpToPng'
import { webpToJpg } from './image/webpToJpg'
import { svgToPng } from './image/svgToPng'
import { gifToPng } from './image/gifToPng'
import { gifToWebp } from './image/gifToWebp'
import { pngToGif, jpgToGif, webpToGif } from './image/imageToGif'
import { heicToJpg } from './image/heicToJpg'
import { markdownToHtml } from './document/markdownToHtml'
import { markdownToPdf } from './document/markdownToPdf'
import { markdownToDocx } from './document/markdownToDocx'
import { htmlToPdf } from './document/htmlToPdf'
import { htmlToMarkdown } from './document/htmlToMarkdown'
import { docxToMarkdown } from './document/docxToMarkdown'
import { txtToPdf } from './document/txtToPdf'
import { docxToPdf } from './document/docxToPdf'
import { csvToMarkdown } from './spreadsheet/csvToMarkdown'
import { jsonToMarkdown } from './spreadsheet/jsonToMarkdown'
import { mp4ToWebm } from './video/mp4ToWebm'
import { webmToMp4 } from './video/webmToMp4'
import { mp4ToGif } from './video/mp4ToGif'
import { mp4ToMp3 } from './video/mp4ToMp3'
import { mp4ToAvi } from './video/mp4ToAvi'
import { mp3ToWav } from './audio/mp3ToWav'
import { wavToMp3 } from './audio/wavToMp3'
import { mp3ToOgg } from './audio/mp3ToOgg'
import { oggToMp3 } from './audio/oggToMp3'
import { csvToHtml } from './spreadsheet/csvToHtml'
import { xlsxToHtml } from './spreadsheet/xlsxToHtml'

/**
 * 전체 변환기 목록.
 * 새 변환기를 추가할 때는 이 배열에만 추가하면 됩니다.
 */
const ALL_CONVERTERS: Converter[] = [
  // Spreadsheet
  csvToXlsx,
  xlsxToCsv,
  csvToJson,
  jsonToCsv,
  xlsxToJson,
  jsonToXlsx,
  csvToHtml,
  xlsxToHtml,
  csvToMarkdown,
  jsonToMarkdown,

  // Image
  pngToJpg,
  jpgToPng,
  pngToWebp,
  jpgToWebp,
  webpToPng,
  webpToJpg,
  svgToPng,
  gifToPng,
  gifToWebp,
  pngToGif,
  jpgToGif,
  webpToGif,
  heicToJpg,

  // Document
  markdownToHtml,
  markdownToPdf,
  markdownToDocx,
  htmlToPdf,
  htmlToMarkdown,
  docxToMarkdown,
  txtToPdf,
  docxToPdf,

  // Video
  mp4ToWebm,
  webmToMp4,
  mp4ToGif,
  mp4ToMp3,
  mp4ToAvi,

  // Audio
  mp3ToWav,
  wavToMp3,
  mp3ToOgg,
  oggToMp3,
]

/** 전체 변환기 목록 반환 */
export function getAllConverters(): Converter[] {
  return ALL_CONVERTERS
}

/** 카테고리별 변환기 반환 */
export function getConvertersByCategory(category: ConverterCategory): Converter[] {
  return ALL_CONVERTERS.filter((c) => c.category === category)
}

/** ID로 변환기 검색 */
export function getConverterById(id: string): Converter | undefined {
  return ALL_CONVERTERS.find((c) => c.id === id)
}

/** 입력 확장자로 사용 가능한 변환기 목록 반환 */
export function getConvertersByInputExtension(ext: string): Converter[] {
  return ALL_CONVERTERS.filter((c) => c.inputExtension === ext.toLowerCase())
}

/** 등록된 카테고리 목록 (중복 제거) */
export function getAvailableCategories(): ConverterCategory[] {
  return [...new Set(ALL_CONVERTERS.map((c) => c.category))]
}
