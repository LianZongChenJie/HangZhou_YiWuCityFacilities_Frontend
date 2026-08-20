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
