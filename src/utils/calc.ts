import { UNIT_NON_RESIDENTIAL, UNIT_RESIDENTIAL } from './constants'

function round2(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return Math.round((x + Number.EPSILON) * 100) / 100
}

export function calcFee(form) {
  const aboveArea = Number(form.aboveArea) || 0
  const underArea = Number(form.underArea) || 0
  const aboveResidentialArea = Number(form.aboveResidentialArea) || 0
  const civilAirArea = Number(form.civilAirArea) || 0
  const reductionAmount = form.hasReduction ? Number(form.reductionAmount) || 0 : 0

  const underResidentialArea =
    aboveArea === 0 ? 0 : round2((underArea - civilAirArea) * (aboveResidentialArea / aboveArea))
  const residentialArea = round2(underResidentialArea + aboveResidentialArea)
  const nonResidentialArea = round2(aboveArea + (underArea - civilAirArea) - residentialArea)
  const rawReceivable =
    residentialArea * UNIT_RESIDENTIAL + nonResidentialArea * UNIT_NON_RESIDENTIAL - reductionAmount
  // 应收金额不应出现负数（面积未输入或免征金额大于计算金额时）
  const autoReceivable = round2(Math.max(rawReceivable, 0))

  // 拆复建：实际应收金额 = max(当前应收 - 原有项目应收, 0)
  const isRebuild = form.projectSubtype === '拆复建'
  const archivedReceivable = isRebuild ? Number(form.archivedReceivable) || 0 : 0
  const actualReceivable = isRebuild
    ? round2(Math.max(autoReceivable - archivedReceivable, 0))
    : autoReceivable

  return {
    underResidentialArea,
    residentialArea,
    nonResidentialArea,
    autoReceivable,
    archivedReceivable: isRebuild ? archivedReceivable : 0,
    actualReceivable,
    receivable: form.amountManual ? Number(form.receivable) || 0 : actualReceivable
  }
}

export function emptyForm() {
  return {
    projectName: '',
    plotInfo: '',
    fundSource: '',
    fundSourceRemark: '',
    landUses: [],
    landUseRemark: '',
    builderName: '',
    contact: '',
    phone: '',
    permitNo: '',
    aboveArea: null,
    underArea: null,
    aboveResidentialArea: null,
    civilAirArea: null,
    bizType: '',
    projectSubtype: '',
    isFourCerts: false,
    hasReduction: false,
    reductionAmount: null,
    reductionBasis: '',
    materials: {
      feeForm: false,
      permitCopy: false,
      civilAirForm: false
    },
    underResidentialArea: 0,
    residentialArea: 0,
    nonResidentialArea: 0,
    receivable: 0,
    amountManual: false,
    // 拆复建相关字段
    relatedPermitNo: '',
    relatedProjectName: '',
    archivedResidentialArea: 0,
    archivedNonResidentialArea: 0,
    archivedCivilAirArea: 0,
    archivedReceivable: 0,
    actualReceivable: 0,
    acceptOpinion: '',
    reviewOpinion: '',
    issueOpinion: '',
    status: ''
  }
}

export function applyCalc(form) {
  const fee = calcFee(form)
  form.underResidentialArea = fee.underResidentialArea
  form.residentialArea = fee.residentialArea
  form.nonResidentialArea = fee.nonResidentialArea
  form.archivedReceivable = fee.archivedReceivable
  form.actualReceivable = fee.actualReceivable
  if (!form.amountManual) form.receivable = fee.receivable
  return form
}

export function formatMoney(n) {
  const x = Number(n) || 0
  return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDate(v) {
  if (!v) return '—'
  return String(v).slice(0, 10)
}

export function nowText() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function todayText() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function landUseText(row) {
  const list = row.landUses || []
  const extra = row.landUseRemark && list.includes('其他') ? `（${row.landUseRemark}）` : ''
  return list.length ? list.join('、') + extra : '—'
}

export function exportCsv(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map((h) => escape(h.label)).join(',')]
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(typeof h.value === 'function' ? h.value(row) : row[h.key])).join(','))
  })
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
