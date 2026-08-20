import request from '@/config/axios'
import type { Request, PageResultReportApplicationVO } from './type'

enum Api {
  /** 列表 */
  list = '/business/report/page',
  /** 统计汇总数据 */
  summary = '/business/report/summary',
  /** 导出 */
  export = '/business/report/export-excel'
}

/** 报表分页列表 */
export const getList = (params: Request) =>
  request.post<PageResultReportApplicationVO>({ url: Api.list, params })

/** 统计汇总数据 */
export const getSummary = (params: Request) =>
  request.post({ url: Api.summary, params })

/** 导出 Excel */
export const exportList = (params: Request) =>
  request.download({ url: Api.export, params })
