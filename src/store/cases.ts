import { defineStore } from 'pinia'
import { seedCases } from '@/mock/cases'
import { applyCalc, nowText, todayText } from '@/utils/calc'

const KEY = 'yw-fee-cases'

function clone(v) {
  return JSON.parse(JSON.stringify(v))
}

function loadSeed() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return clone(seedCases)
}

export const useCaseStore = defineStore('cases', {
  state: () => ({
    list: loadSeed(),
    seq: 100
  }),
  actions: {
    persist() {
      localStorage.setItem(KEY, JSON.stringify(this.list))
    },
    resetDemo() {
      this.list = clone(seedCases)
      this.seq = 100
      this.persist()
    },
    visibleList(user) {
      const all = this.list.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      if (user?.role === 'accept') return all.filter((x) => x.createdBy === user.username)
      return all
    },
    getById(id) {
      return this.list.find((x) => String(x.id) === String(id))
    },
    related(permitNo, exceptId) {
      if (!permitNo) return []
      return this.list.filter((x) => x.permitNo === permitNo && String(x.id) !== String(exceptId))
    },
    nextId() {
      const max = this.list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0)
      this.seq = Math.max(this.seq, max + 1)
      return this.seq++
    },
    addLog(row, user, action, comment = '') {
      row.logs = row.logs || []
      row.logs.push({
        time: nowText(),
        user: user.name,
        action,
        comment
      })
    },
    create(form, user, { submit }) {
      const row = applyCalc({
        ...clone(form),
        id: this.nextId(),
        status: submit ? 'review' : 'draft',
        rejected: false,
        createdBy: user.username,
        createdByName: user.name,
        createdAt: nowText(),
        logs: []
      })
      this.addLog(row, user, submit ? '提交审核' : '保存草稿', '')
      this.list.unshift(row)
      this.persist()
      return row
    },
    save(id, form, user, { submit }) {
      const row = this.getById(id)
      if (!row) return null
      Object.assign(row, applyCalc({ ...form, id: row.id }))
      if (submit) {
        row.status = 'review'
        row.rejected = false
        this.addLog(row, user, '提交审核', '')
      } else {
        this.addLog(row, user, '保存草稿', '')
      }
      this.persist()
      return row
    },
    reviewPass(id, form, user) {
      const row = this.getById(id)
      if (!row) return null
      Object.assign(row, applyCalc({ ...form, id: row.id }))
      row.status = 'issue'
      row.reviewOpinion = form.reviewOpinion || ''
      this.addLog(row, user, '审核通过', row.reviewOpinion)
      this.persist()
      return this.nextPending(user, 'review', id)
    },
    reviewReject(id, form, user, comment) {
      const row = this.getById(id)
      if (!row) return null
      Object.assign(row, applyCalc({ ...form, id: row.id }))
      row.status = 'draft'
      row.rejected = true
      this.addLog(row, user, '退回', comment)
      this.persist()
      return this.nextPending(user, 'review', id)
    },
    confirmIssue(id, form, user) {
      const row = this.getById(id)
      if (!row) return null
      if (form) Object.assign(row, applyCalc({ ...form, id: row.id }))
      row.status = 'pay'
      row.issueDate = form?.issueDate || todayText()
      row.issueOpinion = form?.issueOpinion || row.issueOpinion || ''
      this.addLog(row, user, '确认签发', row.issueOpinion || `签发日期 ${row.issueDate}`)
      this.persist()
      return this.nextPending(user, 'issue', id)
    },
    confirmPay(id, payDate, user) {
      const row = this.getById(id)
      if (!row) return null
      row.status = 'close'
      row.payDate = payDate || todayText()
      this.addLog(row, user, '确认到账', `到账日期 ${row.payDate}`)
      this.persist()
      return this.nextPending(user, 'pay', id)
    },
    archive(id, payload, user) {
      const row = this.getById(id)
      if (!row) return null
      row.status = 'archived'
      row.receiverName = payload.receiverName
      row.receiveTime = payload.receiveTime || nowText()
      row.closeDate = todayText()
      this.addLog(row, user, '办结归档', `领取人 ${row.receiverName}`)
      this.persist()
      return this.nextPending(user, 'close', id)
    },
    fillPermit(id, permitNo, user) {
      const row = this.getById(id)
      if (!row) return null
      row.permitNo = permitNo
      this.addLog(row, user, '补录工规证号', permitNo)
      this.persist()
      return row
    },
    pendingOf(user, tab) {
      const list = this.visibleList(user)
      if (tab === 'returned') return list.filter((x) => x.status === 'draft' && x.rejected)
      if (tab === 'fillPermit') return list.filter((x) => x.isFourCerts && !x.permitNo)
      if (tab === 'review') return list.filter((x) => x.status === 'review')
      if (tab === 'issue') return list.filter((x) => x.status === 'issue')
      if (tab === 'pay') return list.filter((x) => x.status === 'pay')
      if (tab === 'close') return list.filter((x) => x.status === 'close')
      return []
    },
    nextPending(user, tab, currentId) {
      const list = this.pendingOf(user, tab)
      const idx = list.findIndex((x) => String(x.id) === String(currentId))
      if (idx >= 0 && idx < list.length - 1) return list[idx + 1]
      if (idx > 0) return list[idx - 1]
      return list[0] || null
    },
    todoCount(user) {
      const role = user?.role
      const all = this.visibleList(user)
      const fillPermit = all.filter((x) => x.isFourCerts && !x.permitNo).length
      if (role === 'accept') {
        const returned = all.filter((x) => x.status === 'draft' && x.rejected).length
        return { returned, fillPermit, total: returned + fillPermit }
      }
      if (role === 'review') {
        const review = all.filter((x) => x.status === 'review').length
        return { review, total: review }
      }
      if (role === 'issue') {
        const issue = all.filter((x) => x.status === 'issue').length
        const pay = all.filter((x) => x.status === 'pay').length
        return { issue, pay, total: issue + pay }
      }
      if (role === 'close') {
        const close = all.filter((x) => x.status === 'close').length
        return { close, total: close }
      }
      return { total: 0 }
    }
  }
})
