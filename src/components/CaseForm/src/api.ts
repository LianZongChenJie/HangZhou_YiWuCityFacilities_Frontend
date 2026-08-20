import request from '@/config/axios';

/** 查询归档列表 */
export const getList = (data: { keyword: string }) =>
  request.post<any>({ url: '/business/project-application/archived-list', data })
