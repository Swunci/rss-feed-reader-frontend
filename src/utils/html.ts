export function fixLinks(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
  })

  return doc.body.innerHTML
}
