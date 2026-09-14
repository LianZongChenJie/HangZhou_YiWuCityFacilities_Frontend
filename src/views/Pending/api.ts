import request from '@/config/axios'
import type {
  Request,
  ProjectApplicationRespVO,
  ApprovalProcessReqVO,
  ApprovalRejectReqVO
} from './type'
import type { Request as UpdateRequest } from '@/views/Create/type'

enum Api {
  /** 待办理列表 */
  list = '/business/project-application/page',
  /** 删除 */
  delete = '/business/project-application/delete',
  /** 修改（提交审核 / 草稿编辑保存） */
  update = '/business/project-application/update',
  /** 审核通过 */
  approve = '/business/approval/approve',
  /** 退回修改 */
  returnModify = '/business/approval/return',
  /** 签发 */
  issue = '/business/approval/issue',
  /** 确认到账 */
  confirmPaid = '/business/approval/confirm-paid',
  /** 办结 */
  close = '/business/approval/close',
  /** 补录证号 */
  supplement = '/business/approval/supplement',
  /** 工作台统计 */
  workbench = '/business/project-application/workbench',
  /** 提交审核 */
  submit = '/business/approval/submit',
  /** 建设科复核 */
  issueReview = '/business/approval/issue1-review',
  /** 建设科过会 */
  issueMeeting = '/business/approval/issue2-meeting',
  /** 建设科退回（复核/过会阶段） */
  constructionReturn = '/business/approval/construction-return'
}

/** 待办理列表 */
export const getPendingList = (data: Request) =>
  request.post<{ list: ProjectApplicationRespVO[]; total: number }>({ url: Api.list, data })

/** 删除 */
export const deleteItem = (id: number) => request.post({ url: Api.delete, data: { id } })

/** 修改 / 提交审核（入参与新建一致，多了 id 字段） */
export const updateItem = (data: UpdateRequest) => request.post<boolean>({ url: Api.update, data })

/** 审核通过 */
export const approve = (data: ApprovalProcessReqVO) =>
  request.post<boolean>({ url: Api.approve, data })

/** 退回修改 */
export const returnModify = (data: ApprovalRejectReqVO) =>
  request.post<boolean>({ url: Api.returnModify, data })

/** 签发 */
export const issue = (data: ApprovalProcessReqVO) => request.post<boolean>({ url: Api.issue, data })

/** 确认到账 */
export const confirmPaid = (data: ApprovalProcessReqVO) =>
  request.post<boolean>({ url: Api.confirmPaid, data })

/** 办结 */
export const closeCase = (data: ApprovalProcessReqVO) =>
  request.post<boolean>({ url: Api.close, data })

/** 补录证号 */
export const supplementPermit = (data: ApprovalProcessReqVO) =>
  request.post<boolean>({ url: Api.supplement, data })

/** 工作台统计 */
export const getWorkbench = () => request.post<Record<string, number>>({ url: Api.workbench })

/** 提交审核 */
export const submitItem = (data: { applicationId: number }) =>
  request.post<boolean>({ url: Api.submit, data })

/** 建设科复核 */
export const issueReview = (data: ApprovalProcessReqVO) =>
  request.post<boolean>({ url: Api.issueReview, data })

/** 建设科过会 */
export const issueMeeting = (data: ApprovalProcessReqVO) =>
  request.post<boolean>({ url: Api.issueMeeting, data })

/** 建设科退回（复核/过会阶段） */
export const constructionReturn = (data: ApprovalRejectReqVO) =>
  request.post<boolean>({ url: Api.constructionReturn, data })
