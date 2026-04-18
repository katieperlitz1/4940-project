import { db } from './config'
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'

function firebaseWarn(fn, e) {
  console.warn(`Firebase [${fn}]:`, e.message)
}

export async function logEvent(userId, { type, label, sport = null, section = null }) {
  try {
    await addDoc(collection(db, 'users', userId, 'events'), {
      type, label, sport, section, timestamp: serverTimestamp(),
    })
  } catch (e) { firebaseWarn('logEvent', e) }
}

export async function getRecentEvents(userId, count = 50) {
  try {
    const q = query(
      collection(db, 'users', userId, 'events'),
      orderBy('timestamp', 'desc'),
      limit(count)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data()).reverse()
  } catch (e) {
    firebaseWarn('getRecentEvents', e)
    return []
  }
}

export async function getEventCount(userId) {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'events'))
    return snap.size
  } catch (e) {
    firebaseWarn('getEventCount', e)
    return 0
  }
}

export async function getProfile(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'profile', 'data'))
    return snap.exists() ? snap.data() : {}
  } catch (e) {
    firebaseWarn('getProfile', e)
    return {}
  }
}

export async function getCachedUI(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'cachedUI', 'latest'))
    return snap.exists() ? snap.data() : null
  } catch (e) {
    firebaseWarn('getCachedUI', e)
    return null
  }
}

export async function setCachedUI(userId, jsx, eventCount) {
  try {
    await setDoc(doc(db, 'users', userId, 'cachedUI', 'latest'), {
      jsx,
      generatedAt: serverTimestamp(),
      eventCountAtGeneration: eventCount,
    })
  } catch (e) { firebaseWarn('setCachedUI', e) }
}

export async function resetUser(userId) {
  try {
    const eventsSnap = await getDocs(collection(db, 'users', userId, 'events'))
    await Promise.all(eventsSnap.docs.map(d => deleteDoc(d.ref)))
    const cacheRef = doc(db, 'users', userId, 'cachedUI', 'latest')
    const cacheSnap = await getDoc(cacheRef)
    if (cacheSnap.exists()) await deleteDoc(cacheRef)
    const profileRef = doc(db, 'users', userId, 'profile', 'data')
    const profileSnap = await getDoc(profileRef)
    if (profileSnap.exists()) await deleteDoc(profileRef)
  } catch (e) { firebaseWarn('resetUser', e) }
}

export async function seedKatieIfEmpty(userId) {
  try {
    const count = await getEventCount(userId)
    if (count > 0) return

    const seed = [
      { type: 'CLICKED', label: "NCAA Men's Lacrosse", sport: 'lacrosse', section: 'nav' },
      { type: 'CLICKED', label: 'Cornell Big Red Lacrosse', sport: 'lacrosse', section: 'scoreboard' },
      { type: 'CLICKED', label: 'Cornell vs Princeton 4/5', sport: 'lacrosse', section: 'scoreboard' },
      { type: 'SEARCHED', label: 'Cornell lacrosse schedule 2026', sport: 'lacrosse', section: 'search' },
      { type: 'CLICKED', label: 'Masters Tournament Leaderboard', sport: 'golf', section: 'scoreboard' },
      { type: 'SEARCHED', label: 'Masters betting odds', sport: 'golf', section: 'search' },
      { type: 'CLICKED', label: 'PGA Tour standings', sport: 'golf', section: 'nav' },
      { type: 'CLICKED', label: 'Scottie Scheffler scorecard', sport: 'golf', section: 'scoreboard' },
      { type: 'SCROLLED_PAST', label: 'NFL scores section', sport: 'football', section: 'scoreboard' },
      { type: 'SCROLLED_PAST', label: 'NBA standings', sport: 'basketball', section: 'standings' },
      { type: 'SCROLLED_PAST', label: 'NFL Draft coverage', sport: 'football', section: 'news' },
      { type: 'CLICKED', label: 'Ivy League Lacrosse standings', sport: 'lacrosse', section: 'standings' },
      { type: 'CLICKED', label: "Women's College Lacrosse scores", sport: 'lacrosse', section: 'scoreboard' },
      { type: 'SEARCHED', label: 'US Open golf 2026 dates', sport: 'golf', section: 'search' },
      { type: 'CLICKED', label: 'USGA news', sport: 'golf', section: 'news' },
      { type: 'SCROLLED_PAST', label: 'NBA Playoffs bracket', sport: 'basketball', section: 'hero' },
      { type: 'CLICKED', label: 'Cornell vs Yale lacrosse highlights', sport: 'lacrosse', section: 'news' },
    ]

    for (const event of seed) {
      await addDoc(collection(db, 'users', userId, 'events'), {
        ...event, timestamp: serverTimestamp(),
      })
    }
  } catch (e) { firebaseWarn('seedKatieIfEmpty', e) }
}
