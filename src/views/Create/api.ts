import request from '@/config/axios'
import type { Request, ProjectApplicationRespVO } from './type'

enum Api {
  /** 提交审核 */
  create = '/business/approval/create-and-submit',
  /** 二次提交接口 */
  submit = '/business/approval/submit',
  /** 保存草稿 */
  draft = '/business/project-application/create',
  /** 查看详情 */
  get = '/business/project-application/get',
  /** 修改（提交审核 / 草稿编辑保存） */
  update = '/business/project-application/update'
}

/** 提交审核 */
export const createApi = (data: Request) => request.post<number>({ url: Api.create, data })

/** 保存草稿 */
export const draftApi = (data: Request) => request.post<number>({ url: Api.draft, data })

/** 保存之后二次提交 */
export const submitApi = (data: Request) => request.post<boolean>({ url: Api.submit, data })

/** 查看详情 */
export const getDetail = (id: number) =>
  request.post<ProjectApplicationRespVO>({ url: Api.get, data: { id } })

/** 修改 / 提交审核（入参与新建一致，多了 id 字段） */
export const updateApi = (data: Request) => request.post<boolean>({ url: Api.update, data })
