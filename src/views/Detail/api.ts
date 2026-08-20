import request from '@/config/axios'
import type { Request as UpdateRequest } from '@/views/Create/type'
import type { ProjectApplicationRespVO } from '@/views/Pending/type'
import type { ApprovalRecordRespVO } from './type'

enum Api {
  /** 查看详情 */
  get = '/business/project-application/get',
  /** 修改 */
  update = '/business/project-application/update',
  /** 审批流 */
  approval = '/business/approval/record/list-by-application'
}

/** 查看详情 */
export const getDetail = (id: number) =>
  request.post<ProjectApplicationRespVO>({ url: Api.get, data: { id } })

/** 修改 */
export const update = (data: UpdateRequest) =>
  request.post<boolean>({ url: Api.update, data })

/** 获取审批记录列表 */
export const getApprovalRecords = (id: number) =>
  request.post<ApprovalRecordRespVO[]>({ url: Api.approval, data: { id } })
