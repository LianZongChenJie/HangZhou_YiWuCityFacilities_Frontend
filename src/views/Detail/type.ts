/**
 * 审批流记录
 */
export interface ApprovalRecordRespVO {
    /**
     * 操作类型
     */
    actionType?: string;
    /**
     * 操作后办件状态
     */
    afterStatus?: string;
    /**
     * 关联办件主表ID
     */
    applicationId?: number;
    /**
     * 附件ID列表
     */
    attachments?: number[];
    /**
     * 操作前办件状态
     */
    beforeStatus?: string;
    /**
     * 操作时间
     */
    createTime?: string;
    /**
     * 流程环节
     */
    flowNode?: string;
    /**
     * 主键ID
     */
    id?: number;
    /**
     * 操作人IP地址
     */
    ipAddress?: string;
    /**
     * 操作人ID
     */
    operatorId?: number;
    /**
     * 操作人姓名
     */
    operatorName?: string;
    /**
     * 操作人角色
     */
    operatorRole?: string;
    /**
     * 审批意见/操作备注
     */
    opinion?: string;
    [property: string]: any;
}

/**
 * 审批通过请求参数
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
    /**
     * 签发日期（签发时填写）
     */
    issueDate?: string;
    /**
     * 财务确认到账时间（确认到账时填写）
     */
    paymentReceivedDate?: string;
}

/**
 * 退回修改请求参数
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
