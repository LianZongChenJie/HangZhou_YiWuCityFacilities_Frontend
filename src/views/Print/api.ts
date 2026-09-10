import request from '@/config/axios'

enum Api {
  /** 查看详情 */
  get = '/business/project-application/get'
}

/** 查看详情 */
export const getDetail = (id: number) =>
  request.post<any>({ url: Api.get, data: { id } })
