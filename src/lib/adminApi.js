import { auth } from './firebase'
import { call } from './api'

const admin = async (fn, data) => call(fn, data, await auth.currentUser.getIdToken())

export const createGroupFn = (data) => admin('createGroup', data)
export const changeGroupPasswordFn = (groupId, password) => admin('changeGroupPassword', { groupId, password })
export const deleteGroupFn = (groupId) => admin('deleteGroup', { groupId })
export const deleteMemberFn = (groupId, memberId) => admin('deleteMember', { groupId, memberId })

export const fnError = (e) => (e?.code?.startsWith('functions/') && e.message ? e.message : 'Something went wrong. Please try again.')