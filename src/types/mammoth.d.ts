declare module 'mammoth' {
  interface ConversionResult {
    value: string
    messages: { type: string; message: string }[]
  }
  interface ConvertOptions {
    arrayBuffer?: ArrayBuffer
    styleMap?: string | string[]
  }
  export function convertToHtml(options: ConvertOptions): Promise<ConversionResult>
}
