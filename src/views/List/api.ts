import request from '@/config/axios'
import type { Request, ProjectApplicationRespVO } from './type'

enum Api {
  /** 列表分页查询 */
  page = '/business/project-application/page',
  /** 作废办件 */
  invalid = '/business/approval/invalid'
}

/**
 * 列表分页查询接口
 */
export const getPageList = (data: Request) =>
  request.post<{ list: ProjectApplicationRespVO[]; total: number }>({ url: Api.page, data })

/**
 * 作废办件
 */
export const invalidApplication = (data: { applicationId: number; opinion?: string }) =>
  request.post<void>({ url: Api.invalid, data })
