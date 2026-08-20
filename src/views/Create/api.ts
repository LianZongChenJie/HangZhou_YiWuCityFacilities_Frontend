import request from '@/config/axios'
import type { Request } from './type'

enum Api {
  /** 提交审核 */
  create = '/business/approval/create-and-submit',
  /** 保存草稿 */
  draft = '/business/project-application/create'
}

/** 提交审核 */
export const create = (data: Request) => request.post<number>({ url: Api.create, data })

/** 保存草稿 */
export const draft = (data: Request) => request.post<number>({ url: Api.draft, data })
