export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'

export const sortWishlist = (items = []) => [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

export function errorMessage(e) {
  switch (e?.code) {
    case 'functions/permission-denied': return 'That password is not correct. Check it and try again.'
    case 'functions/resource-exhausted': return 'Too many attempts. Wait a few minutes before trying again.'
    case 'functions/not-found': return 'This group is not available. It may have been archived or the code is wrong.'
    case 'functions/unavailable':
    case 'functions/internal': return 'The server is not responding. Check your connection and try again.'
    default: return 'Something went wrong. Please try again.'
  }
}
