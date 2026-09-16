import request from '@/config/axios'
import type { Request as UpdateRequest } from '@/views/Create/type'
import type { ProjectApplicationRespVO } from '@/views/Pending/type'
import type { ApprovalRecordRespVO, ApprovalProcessReqVO, ApprovalRejectReqVO } from './type'

enum Api {
  /** 查看详情 */
  get = '/business/project-application/get',
  /** 查询归档（已办结）项目列表 */
  archivedList = '/business/project-application/archived-list',
  /** 修改（提交审核 / 草稿编辑保存） */
  update = '/business/project-application/update',
  /** 审批流 */
  approval = '/business/approval/record/list-by-application',
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
  /** 提交审核 */
  submit = '/business/approval/submit',
  /** 建设科复核 */
  issueReview = '/business/approval/issue1-review',
  /** 建设科过会 */
  issueMeeting = '/business/approval/issue2-meeting',
  /** 建设科退回（复核/过会阶段） */
  constructionReturn = '/business/approval/construction-return'
}

/** 查看详情 */
export const getDetail = (id: number) =>
  request.post<ProjectApplicationRespVO>({ url: Api.get, data: { id } })

/** 查询归档（已办结）项目列表 */
export const getArchivedList = (data: { keyword: string }) =>
  request.post<any>({ url: Api.archivedList, data })

/** 修改 / 提交审核（入参与新建一致，多了 id 字段） */
export const updateItem = (data: UpdateRequest) => request.post<boolean>({ url: Api.update, data })

/** 获取审批记录列表 */
export const getApprovalRecords = (id: number) =>
  request.post<ApprovalRecordRespVO[]>({ url: Api.approval, data: { id } })

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
