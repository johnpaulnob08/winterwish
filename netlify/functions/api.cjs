const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

class ApiError extends Error {
  constructor(code, message) { super(message); this.code = code }
}
const STATUS = { 'invalid-argument': 400, unauthenticated: 401, 'permission-denied': 403, 'not-found': 404, 'resource-exhausted': 429, internal: 500 }

const SESSION_MS = 2 * 60 * 60 * 1000 // unlock lasts 2 hours
const WINDOW_MS = 15 * 60 * 1000
const MAX_IP_FAILS = 5
const MAX_GROUP_FAILS = 40
const BCRYPT_ROUNDS = 12
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

let _db
function db() {
  if (!_db) {
    if (!getApps().length) {
      const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: key } = process.env
      if (!projectId || !clientEmail || !key) throw new ApiError('internal', 'Server is not configured.')
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey: key.replace(/\\n/g, '\n') }) })
    }
    _db = getFirestore()
    try { _db.settings({ preferRest: true }) } catch { /* already configured */ }
  }
  return _db
}
function secret() {
  if (!process.env.TOKEN_SECRET) throw new ApiError('internal', 'Server is not configured.')
  return process.env.TOKEN_SECRET
}

// ---------- helpers ----------
const normCode = (c) => (typeof c === 'string' ? c.trim().toUpperCase().slice(0, 40) : '')
const iso = (v) => (v && v.toDate ? v.toDate().toISOString() : v || null)

async function findGroupByCode(code) {
  if (!code) return null
  const snap = await db().collection('groups').where('groupCode', '==', code).limit(1).get()
  return snap.empty ? null : snap.docs[0]
}
async function countMembers(groupId) {
  const c = await db().collection(`groups/${groupId}/members`).count().get()
  return c.data().count
}
const publicGroup = async (doc) => ({
  groupCode: doc.get('groupCode'),
  groupName: doc.get('groupName'),
  partyDate: iso(doc.get('partyDate')),
  memberCount: await countMembers(doc.id),
})

async function requireAdmin(event) {
  const m = (event.headers.authorization || '').match(/^Bearer (.+)$/)
  if (!m) throw new ApiError('unauthenticated', 'Sign in first.')
  db()
  let decoded
  try { decoded = await getAuth().verifyIdToken(m[1]) } catch { throw new ApiError('unauthenticated', 'Sign in again.') }
  const snap = await db().doc(`adminUsers/${decoded.uid}`).get()
  if (!snap.exists) throw new ApiError('permission-denied', 'Administrators only.')
  return decoded.uid
}

function validatePassword(p) {
  if (typeof p !== 'string' || p.length < 8 || p.length > 100) {
    throw new ApiError('invalid-argument', 'Password must be 8 to 100 characters.')
  }
}
const hashIp = (ip) => crypto.createHash('sha256').update(String(ip || 'unknown') + secret()).digest('hex').slice(0, 32)

async function checkLimit(ref, max) {
  const s = await ref.get()
  if (!s.exists) return
  const d = s.data()
  if (Date.now() - d.windowStart.toMillis() > WINDOW_MS) return
  if (d.fails >= max) throw new ApiError('resource-exhausted', 'Too many attempts.')
}
async function recordFail(ref) {
  await db().runTransaction(async (t) => {
    const s = await t.get(ref)
    const now = Date.now()
    const expireAt = Timestamp.fromMillis(now + 24 * 60 * 60 * 1000)
    if (!s.exists || now - s.data().windowStart.toMillis() > WINDOW_MS) {
      t.set(ref, { fails: 1, windowStart: Timestamp.fromMillis(now), expireAt })
    } else {
      t.update(ref, { fails: FieldValue.increment(1), expireAt })
    }
  })
}
async function generateUniqueCode(year) {
  for (let i = 0; i < 10; i++) {
    let suffix = ''
    for (let j = 0; j < 4; j++) suffix += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]
    const code = `WINTER-${year}-${suffix}`
    if (!(await findGroupByCode(code))) return code
  }
  throw new ApiError('internal', 'Could not generate a unique code. Try again.')
}

// ---------- public ----------
async function searchGroups(data) {
  const q = typeof data.query === 'string' ? data.query.trim().toLowerCase().slice(0, 60) : ''
  const snap = await db().collection('groups').where('status', '==', 'active').limit(200).get()
  const docs = snap.docs
    .filter((d) => !q || d.get('groupName').toLowerCase().includes(q) || d.get('groupCode').toLowerCase().includes(q))
    .sort((a, b) => a.get('partyDate').toMillis() - b.get('partyDate').toMillis())
    .slice(0, 30)
  return Promise.all(docs.map(publicGroup))
}

async function getGroupPreview(data) {
  const g = await findGroupByCode(normCode(data.groupCode))
  if (!g || g.get('status') !== 'active') throw new ApiError('not-found', 'Group not available.')
  return publicGroup(g)
}

async function verifyGroupPassword(data, ctx) {
  const code = normCode(data.groupCode)
  const password = data.password
  if (!code || typeof password !== 'string' || !password || password.length > 200) {
    throw new ApiError('invalid-argument', 'Group code and password are required.')
  }
  const g = await findGroupByCode(code)
  if (!g || g.get('status') !== 'active') throw new ApiError('not-found', 'Group not available.')

  const ipRef = db().doc(`rateLimits/${g.id}_${hashIp(ctx.ip)}`)
  const groupRef = db().doc(`rateLimits/${g.id}_all`)
  await checkLimit(ipRef, MAX_IP_FAILS)
  await checkLimit(groupRef, MAX_GROUP_FAILS)

  const sec = await db().doc(`groupSecrets/${g.id}`).get()
  const ok = sec.exists && (await bcrypt.compare(password, sec.get('passwordHash')))
  if (!ok) {
    await Promise.all([recordFail(ipRef), recordFail(groupRef)])
    throw new ApiError('permission-denied', 'Wrong password.')
  }
  await ipRef.delete().catch(() => {})

  const token = jwt.sign({ gid: g.id, pv: sec.get('version') }, secret(), {
    expiresIn: Math.floor(SESSION_MS / 1000),
    issuer: 'winterwish',
  })
  return { token, expiresAt: Date.now() + SESSION_MS }
}

async function getGroupContent(data) {
  const code = normCode(data.groupCode)
  if (!code || typeof data.token !== 'string') throw new ApiError('unauthenticated', 'Unlock the group first.')
  let claims
  try { claims = jwt.verify(data.token, secret(), { issuer: 'winterwish' }) } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError('unauthenticated', 'Access expired.')
  }
  const g = await findGroupByCode(code)
  if (!g || g.id !== claims.gid) throw new ApiError('unauthenticated', 'Token is for a different group.')
  if (g.get('status') !== 'active') throw new ApiError('not-found', 'Group not available.')
  const sec = await db().doc(`groupSecrets/${g.id}`).get()
  if (!sec.exists || sec.get('version') !== claims.pv) throw new ApiError('unauthenticated', 'Password was changed.')

  const memberSnap = await db().collection(`groups/${g.id}/members`).orderBy('createdAt', 'asc').get()
  const members = await Promise.all(
    memberSnap.docs.map(async (m) => {
      const items = await db().collection(`groups/${g.id}/members/${m.id}/wishlist`).orderBy('sortOrder', 'asc').get()
      return {
        id: m.id,
        fullName: m.get('fullName'),
        photoURL: m.get('photoURL') || null,
        note: m.get('note') || '',
        wishlist: items.docs.map((i) => ({
          id: i.id,
          itemName: i.get('itemName'),
          description: i.get('description') || '',
          productLink: i.get('productLink') || '',
          imageURL: i.get('imageURL') || '',
          priority: i.get('priority') || 'Medium',
          sortOrder: i.get('sortOrder') ?? 0,
        })),
      }
    })
  )
  return {
    group: { groupName: g.get('groupName'), description: g.get('description') || '', partyDate: iso(g.get('partyDate')) },
    members,
  }
}

// ---------- admin ----------
async function createGroup(data, ctx) {
  const { groupName, description, partyDate, password } = data
  if (typeof groupName !== 'string' || !groupName.trim() || groupName.length > 100) {
    throw new ApiError('invalid-argument', 'Group name is required (100 characters max).')
  }
  const date = new Date(partyDate)
  if (Number.isNaN(date.getTime())) throw new ApiError('invalid-argument', 'Party date is invalid.')
  validatePassword(password)

  const groupCode = await generateUniqueCode(date.getUTCFullYear())
  const ref = db().collection('groups').doc()
  const batch = db().batch()
  batch.set(ref, {
    groupCode,
    groupName: groupName.trim(),
    description: typeof description === 'string' ? description.trim().slice(0, 500) : '',
    partyDate: Timestamp.fromDate(date),
    organizerId: ctx.uid,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  batch.set(db().doc(`groupSecrets/${ref.id}`), {
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    version: 1,
    updatedAt: FieldValue.serverTimestamp(),
  })
  await batch.commit()
  return { groupId: ref.id, groupCode }
}

async function changeGroupPassword(data) {
  const { groupId, password } = data
  if (typeof groupId !== 'string' || !groupId) throw new ApiError('invalid-argument', 'groupId is required.')
  validatePassword(password)
  const ref = db().doc(`groupSecrets/${groupId}`)
  if (!(await ref.get()).exists) throw new ApiError('not-found', 'Group not found.')
  // Bumping the version signs out everyone who unlocked with the old password.
  await ref.update({
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    version: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return { ok: true }
}

async function deleteGroup(data) {
  const { groupId } = data
  if (typeof groupId !== 'string' || !groupId) throw new ApiError('invalid-argument', 'groupId is required.')
  await db().recursiveDelete(db().doc(`groups/${groupId}`))
  await db().doc(`groupSecrets/${groupId}`).delete()
  return { ok: true }
}

async function deleteMember(data) {
  const { groupId, memberId } = data
  if (typeof groupId !== 'string' || typeof memberId !== 'string' || !groupId || !memberId) {
    throw new ApiError('invalid-argument', 'groupId and memberId are required.')
  }
  await db().recursiveDelete(db().doc(`groups/${groupId}/members/${memberId}`))
  return { ok: true }
}

const FUNCTIONS = {
  searchGroups: { run: searchGroups },
  getGroupPreview: { run: getGroupPreview },
  verifyGroupPassword: { run: verifyGroupPassword },
  getGroupContent: { run: getGroupContent },
  createGroup: { run: createGroup, admin: true },
  changeGroupPassword: { run: changeGroupPassword, admin: true },
  deleteGroup: { run: deleteGroup, admin: true },
  deleteMember: { run: deleteMember, admin: true },
}

const respond = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') throw new ApiError('invalid-argument', 'POST only.')
    let body
    try { body = JSON.parse(event.body || '{}') } catch { throw new ApiError('invalid-argument', 'Invalid JSON.') }
    const entry = FUNCTIONS[body.fn]
    if (!entry) throw new ApiError('not-found', 'Unknown function.')
    const ctx = { ip: event.headers['x-nf-client-connection-ip'] || (event.headers['x-forwarded-for'] || '').split(',')[0].trim() }
    if (entry.admin) ctx.uid = await requireAdmin(event)
    return respond(200, await entry.run(body.data || {}, ctx))
  } catch (e) {
    if (e instanceof ApiError) return respond(STATUS[e.code] || 500, { code: e.code, message: e.message })
    console.error(e)
    return respond(500, { code: 'internal', message: 'Server error.' })
  }
}