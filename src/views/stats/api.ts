import request from '@/config/axios'
import type { Request, PageResultReportApplicationVO, ReportSummaryVO } from './type'

enum Api {
  /** 列表 */
  list = '/business/report/page',
  /** 统计汇总数据 */
  summary = '/business/report/summary',
  /** 导出 */
  export = '/business/report/export-excel'
}

/** 报表分页列表 */
export const getList = (data: Request) =>
  request.post<PageResultReportApplicationVO>({ url: Api.list, data })

/** 统计汇总数据 */
export const getSummary = (data: Request) =>
  request.post<ReportSummaryVO>({ url: Api.summary, data })

/** 导出 Excel */
export const exportList = (data: Request) => request.post({ url: Api.export, data })
