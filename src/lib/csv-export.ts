/** Download a CSV string as a file in the browser. */
export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function rowsToCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ]
  return lines.join('\n')
}
