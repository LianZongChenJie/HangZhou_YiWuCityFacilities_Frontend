/**
 * 列表查询请求参数
 */
export interface Request {
  permitNo?: string
  builderName?: string
  projectName?: string
  /** 受理时间区间 */
  acceptDates?: string[]
  bizType?: string
  /** 办件状态 */
  statusFilter?: string
  /** 第二时间类型：closeDate-办结时间/issueDate-开票时间/payDate-到账时间 */
  timeKind?: string
  /** 第二时间区间 */
  otherDates?: string[]
  /** 是否免征：1-有免征 0-无免征 */
  reduction?: number
  /** 金额区间 [最小, 最大] */
  amount?: number[]
  /** 页码 */
  pageNo: number
  /** 每页条数 */
  pageSize: number
  [property: string]: any
}

/**
 * 项目申请响应数据
 */
export interface ProjectApplicationRespVO {
  /** 地上建筑面积 */
  aboveArea?: number
  /** 地上住宅面积 */
  aboveResidentialArea?: number
  /** 受理意见 */
  acceptOpinion?: string
  /** 应收金额是否人工修改 */
  amountManual?: boolean
  /** 办件编号 */
  applicationNo?: string
  /** 业务类型 */
  bizType?: string
  /** 建设单位名称 */
  builderName?: string
  /** 人防面积 */
  civilAirArea?: number
  /** 办结归档时间 */
  closedAt?: string
  /** 联系人 */
  contact?: string
  /** 创建时间 */
  createTime?: string
  /** 创建人ID */
  creator?: string
  /** 资金来源 */
  fundSource?: string
  /** 资金来源备注 */
  fundSourceRemark?: string
  /** 是否有免征 */
  hasReduction?: boolean
  /** 主键ID */
  id?: number
  /** 是否四证齐发 */
  isFourCerts?: boolean
  /** 签发意见 */
  issueOpinion?: string
  /** 土地用途备注 */
  landUseRemark?: string
  /** 土地用途 */
  landUses?: string
  /** 人防核实核定表复印件 */
  materialsCivilAirForm?: boolean
  /** 征收缴费表 */
  materialsFeeForm?: boolean
  /** 工程规划许可证复印件 */
  materialsPermitCopy?: boolean
  /** 非住宅计费面积 */
  nonResidentialArea?: number
  /** 工规证号 */
  permitNo?: string
  /** 联系电话 */
  phone?: string
  /** 地块信息 */
  plotInfo?: string
  /** 项目名称 */
  projectName?: string
  /** 项目细分 */
  projectSubtype?: string
  /** 应收金额 */
  receivable?: number
  /** 免征金额 */
  reductionAmount?: number
  /** 政策依据 */
  reductionBasis?: string
  /** 关联工规证号 */
  relatedPermitNo?: string
  /** 住宅计费面积 */
  residentialArea?: number
  /** 审核意见 */
  reviewOpinion?: string
  /** 办件状态 */
  status?: string
  /** 地下建筑面积 */
  underArea?: number
  /** 开票时间（缴款通知书签发时间） */
  paymentNoticeIssuedAt?: string
  /** 到账时间（财务确认到账时间） */
  paymentReceivedDate?: string
  /** 关联项目名称 */
  relatedProjectName?: string
  /** 原有项目住宅面积 */
  archivedResidentialArea?: number
  /** 原有项目应收金额 */
  archivedReceivable?: number
  /** 实际应收金额 */
  actualReceivable?: number
  [property: string]: any
}
