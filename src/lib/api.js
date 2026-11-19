export async function call(fn, data, token) {
  let res
  try {
    res = await fetch('/.netlify/functions/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ fn, data }),
    })
  } catch {
    throw Object.assign(new Error('Network error.'), { code: 'functions/unavailable' })
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(json.message || 'Request failed.'), { code: `functions/${json.code || 'internal'}` })
  return json
}

export const searchGroups = (query) => call('searchGroups', { query })
export const getGroupPreview = (groupCode) => call('getGroupPreview', { groupCode })
export const verifyGroupPassword = (groupCode, password) => call('verifyGroupPassword', { groupCode, password })
export const getGroupContent = (groupCode, token) => call('getGroupContent', { groupCode, token })