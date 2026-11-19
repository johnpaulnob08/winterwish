const key = (code) => `ww:session:${String(code).toUpperCase()}`

export function saveSession(code, token, expiresAt) {
  try { sessionStorage.setItem(key(code), JSON.stringify({ token, expiresAt })) } catch { /* storage unavailable */ }
}
export function clearSession(code) {
  try { sessionStorage.removeItem(key(code)) } catch { /* ignore */ }
}
export function getSession(code) {
  try {
    const s = JSON.parse(sessionStorage.getItem(key(code)))
    if (s && s.expiresAt > Date.now()) return s
  } catch { /* ignore */ }
  clearSession(code)
  return null
}
