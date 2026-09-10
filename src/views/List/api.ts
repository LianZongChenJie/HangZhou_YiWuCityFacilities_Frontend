import request from '@/config/axios'
import type { Request, ProjectApplicationRespVO } from './type'

enum Api {
  /** 列表分页查询 */
  page = '/business/project-application/page'
}

/**
 * 列表分页查询接口
 */
export const getPageList = (data: Request) =>
  request.post<{ list: ProjectApplicationRespVO[]; total: number }>({ url: Api.page, data })
