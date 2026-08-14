export const ROLES = {
  accept: 'accept',
  review: 'review',
  issue: 'issue',
  close: 'close',
  admin: 'admin'
}

export const ROLE_LABEL = {
  accept: '受理岗',
  review: '审核岗',
  issue: '签发岗',
  close: '办结岗',
  admin: '管理岗'
}

export const HOME_PATH = {
  accept: '/workbench',
  review: '/case/pending',
  issue: '/case/pending',
  close: '/case/pending',
  admin: '/stats'
}

export const STATUS = {
  draft: 'draft',
  review: 'review',
  issue: 'issue',
  pay: 'pay',
  close: 'close',
  archived: 'archived'
}

export const STATUS_LABEL = {
  draft: '待提交',
  review: '待审核',
  issue: '待签发',
  pay: '待缴款',
  close: '待办结',
  archived: '已归档'
}

export const STATUS_TAG = {
  draft: 'info',
  review: 'warning',
  issue: '',
  pay: 'danger',
  close: 'success',
  archived: 'success'
}

export const FLOW_NODES = [
  { key: 'draft', label: '待提交' },
  { key: 'review', label: '待审核' },
  { key: 'issue', label: '待签发' },
  { key: 'pay', label: '待缴款' },
  { key: 'close', label: '待办结' },
  { key: 'archived', label: '已归档' }
]

export const FUND_SOURCES = ['私营', '政府', '国有', '集体', '外资', '其他']

export const LAND_USES = [
  '居住',
  '住宅',
  '商业',
  '工业',
  '教育',
  '商务金融',
  '城镇村道路',
  '物流',
  '物流仓储',
  '其他'
]

export const BIZ_TYPES = ['初次', '变更', '竣备', '历史补缴', '减免']

export const PROJECT_SUBTYPES = ['新建', '扩建', '改建', '拆复建', '旧城改造拆建']

export const DEFAULT_ACCEPT_OPINION = '资料齐全，申报建筑面积与工规证一致，缴费金额无误'
export const DEFAULT_REVIEW_OPINION = '申报材料符合要求，建筑面积与工规证一致，费用核算无误'

export const UNIT_RESIDENTIAL = 30
export const UNIT_NON_RESIDENTIAL = 80
