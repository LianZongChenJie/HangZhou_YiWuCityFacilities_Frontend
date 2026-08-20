/**
 * 待办理列表请求参数
 */
export interface Request {
    permitNo?: string;
    status: string;
    /** 页码 */
    pageNo: number;
    /** 每页条数 */
    pageSize: number;
    [property: string]: any;
}

/**
 *
 * 待办理列表返回数据
 */
export interface ProjectApplicationRespVO {
    /**
     * 地上建筑面积（㎡）
     */
    aboveArea?: number;
    /**
     * 地上住宅面积（㎡）
     */
    aboveResidentialArea?: number;
    /**
     * 受理意见
     */
    acceptOpinion?: string;
    /**
     * 应收金额是否人工修改
     */
    amountManual?: boolean;
    /**
     * 办件编号
     */
    applicationNo?: string;
    /**
     * 业务类型（初次/变更/竣备/历史补缴）
     */
    bizType?: string;
    /**
     * 建设单位名称
     */
    builderName?: string;
    /**
     * 人防面积（㎡）
     */
    civilAirArea?: number;
    /**
     * 办结归档时间
     */
    closedAt?: string;
    /**
     * 办结操作人ID
     */
    closedBy?: number;
    /**
     * 联系人
     */
    contact?: string;
    /**
     * 创建时间
     */
    createTime?: string;
    /**
     * 创建人ID
     */
    creator?: string;
    /**
     * 本次实际应补/退金额
     */
    finalPayable?: number;
    /**
     * 资金来源
     */
    fundSource?: string;
    /**
     * 资金来源为其他时的补充说明
     */
    fundSourceRemark?: string;
    /**
     * 是否有免征
     */
    hasReduction?: boolean;
    /**
     * 主键ID
     */
    id?: number;
    /**
     * 是否已归档
     */
    isArchived?: boolean;
    /**
     * 是否四证齐发
     */
    isFourCerts?: boolean;
    /**
     * 是否已缴费
     */
    isPaid?: boolean;
    /**
     * 签发意见
     */
    issueOpinion?: string;
    /**
     * 土地用途为其他时的补充说明
     */
    landUseRemark?: string;
    /**
     * 土地用途
     */
    landUses?: string;
    /**
     * 纸质材料-人防核实核定表复印件
     */
    materialsCivilAirForm?: boolean;
    /**
     * 纸质材料-征收缴费表
     */
    materialsFeeForm?: boolean;
    /**
     * 纸质材料-工程规划许可证复印件
     */
    materialsPermitCopy?: boolean;
    /**
     * 非住宅计费面积（㎡）
     */
    nonResidentialArea?: number;
    /**
     * 父办件已缴金额
     */
    paidAmountFromParent?: number;
    /**
     * 父办件ID
     */
    parentApplicationId?: number;
    /**
     * 缴款通知书签发时间
     */
    paymentNoticeIssuedAt?: string;
    /**
     * 缴款通知书编号
     */
    paymentNoticeNo?: string;
    /**
     * 财务确认到账时间
     */
    paymentReceivedDate?: string;
    /**
     * 工程规划许可证号
     */
    permitNo?: string;
    /**
     * 联系电话
     */
    phone?: string;
    /**
     * 地块信息
     */
    plotInfo?: string;
    /**
     * 项目名称
     */
    projectName?: string;
    /**
     * 项目细分（新建/改扩建/拆复建/旧城改造拆建）
     */
    projectSubtype?: string;
    /**
     * 缴费表领取时间
     */
    receiptSignedAt?: string;
    /**
     * 缴费表领取人签字
     */
    receiptSigner?: string;
    /**
     * 应收金额（元）
     */
    receivable?: number;
    /**
     * 免征金额
     */
    reductionAmount?: number;
    /**
     * 免征审批通过时间
     */
    reductionApprovedAt?: string;
    /**
     * 政策依据
     */
    reductionBasis?: string;
    /**
     * 免征审批状态
     */
    reductionStatus?: string;
    /**
     * 关联工规证号（拆复建项目关联已办结项目）
     */
    relatedPermitNo?: string;
    /**
     * 住宅计费面积（㎡）
     */
    residentialArea?: number;
    /**
     * 审核意见
     */
    reviewOpinion?: string;
    /**
     * 办件状态
     */
    status?: string;
    /**
     * 本次应缴总额
     */
    totalPayable?: number;
    /**
     * 地下建筑面积（㎡）
     */
    underArea?: number;
    /**
     * 非住宅单价（元/㎡）
     */
    unitPriceNonResidential?: number;
    /**
     * 住宅单价（元/㎡）
     */
    unitPriceResidential?: number;
    /**
     * 更新时间
     */
    updateTime?: string;
    [property: string]: any;
}

/**
 * 审批通过请求参数
 * 
 */
export interface ApprovalProcessReqVO {
    /**
     * 办件ID
     */
    applicationId: number;
    /**
     * 审批意见（退回修改时必填）
     */
    opinion?: string;
    /**
     * 确认到账金额/实际缴款金额（签发岗确认到账时使用）
     */
    paidAmount?: number;
    /**
     * 缴款通知书编号（签发岗开具时填写）
     */
    paymentNoticeNo?: string;
    /**
     * 补录的工程规划许可证号（四证齐发补录时填写）
     */
    permitNo?: string;
    /**
     * 缴费表领取人签字（办结时填写）
     */
    receiptSigner?: string;
}

/**
 * 退回修改请求参数
 * 
 */
export interface ApprovalRejectReqVO {
    /**
     * 办件ID
     */
    applicationId: number;
    /**
     * 审批意见（退回修改时必填）
     */
    opinion?: string;
    /**
     * 确认到账金额/实际缴款金额（签发岗确认到账时使用）
     */
    paidAmount?: number;
    /**
     * 缴款通知书编号（签发岗开具时填写）
     */
    paymentNoticeNo?: string;
    /**
     * 补录的工程规划许可证号（四证齐发补录时填写）
     */
    permitNo?: string;
    /**
     * 缴费表领取人签字（办结时填写）
     */
    receiptSigner?: string;
}
