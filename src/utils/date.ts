export function formatDate(utcString: string) {
  const date = new Date(utcString)

  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)

  const timePart = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return `${datePart} at ${timePart}`
}

export function formatRelativeTime(utcString: string): string {
  const date = new Date(utcString)
  const now = new Date()

  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365

  if (diffSec < minute) return 'just now'
  if (diffSec < hour) return `${Math.floor(diffSec / minute)}m ago`
  if (diffSec < day) return `${Math.floor(diffSec / hour)}h ago`
  if (diffSec < week) return `${Math.floor(diffSec / day)}d ago`
  if (diffSec < month) return `${Math.floor(diffSec / week)}w ago`
  if (diffSec < year) return `${Math.floor(diffSec / month)}mo ago`

  return `${Math.floor(diffSec / year)}y ago`
}
