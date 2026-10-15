// File names and browser-side exports (JSON download, PDF through the native print dialog).

const cleanForFileName = (value) =>
  String(value)
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')

export function exportFileName(person, { notes = false, extension = 'pdf' } = {}) {
  const candidate = cleanForFileName(person.candidateName)
  const host = cleanForFileName(person.hostName)
  return `Fiche Yeita - ${candidate} avec ${host} - ${person.date}${notes ? ' - Notes' : ''}.${extension}`
}

export function downloadJson(payload, fileName) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

// The browser proposes document.title as the PDF file name, so it is swapped during printing.
// Printing waits two frames so that React has applied the print mode first.
export function printWithTitle(title) {
  const previousTitle = document.title
  document.title = title
  const restore = () => {
    document.title = previousTitle
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore, { once: true })
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
}
