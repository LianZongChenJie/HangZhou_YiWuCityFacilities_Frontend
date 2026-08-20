/**
 * 提交单据请求入参
 */
export interface Request {
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
     * 应收金额是否人工修改：false-自动计算 true-保留人工值
     */
    amountManual?: boolean;
    /**
     * 业务类型（初次/变更/竣备/历史补缴）
     */
    bizType: string;
    /**
     * 建设单位名称
     */
    builderName: string;
    /**
     * 人防面积（㎡）
     */
    civilAirArea?: number;
    /**
     * 联系人
     */
    contact?: string;
    /**
     * 资金来源
     */
    fundSource: string;
    /**
     * 资金来源为其他时的补充说明
     */
    fundSourceRemark?: string;
    /**
     * 是否有免征：0-否 1-是
     */
    hasReduction?: boolean;
    /**
     * 主键ID（修改时必填）
     */
    id?: number;
    /**
     * 是否四证齐发：0-否 1-是
     */
    isFourCerts: boolean;
    /**
     * 签发意见
     */
    issueOpinion?: string;
    /**
     * 土地用途为其他时的补充说明
     */
    landUseRemark?: string;
    /**
     * 土地用途（逗号分隔）
     */
    landUses?: string;
    /**
     * 纸质材料-人防工程易地建设核实核定表复印件
     */
    materialsCivilAirForm?: boolean;
    /**
     * 纸质材料-征收缴费表（一式两份，盖章）
     */
    materialsFeeForm?: boolean;
    /**
     * 纸质材料-工程规划许可证复印件
     */
    materialsPermitCopy?: boolean;
    /**
     * 父办件ID（变更/补缴时指向初次办件）
     */
    parentApplicationId?: number;
    /**
     * 工程规划许可证号（四证齐发场景可为空）
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
    projectName: string;
    /**
     * 项目细分（新建/改扩建/拆复建/旧城改造拆建，仅初次时选择）
     */
    projectSubtype?: string;
    /**
     * 应收金额（元，系统自动计算，支持人工修改）
     * 拆复建项目为实际应收金额（差额或0）
     */
    receivable?: number;
    /**
     * 免征金额（元）
     */
    reductionAmount?: number;
    /**
     * 政策依据（免征时填写）
     */
    reductionBasis?: string;
    /**
     * 关联工规证号（拆复建项目关联已办结项目）
     */
    relatedPermitNo?: string;
    /**
     * 关联原有项目名称（拆复建项目）
     */
    relatedProjectName?: string;
    /**
     * 原有项目住宅面积（拆复建项目）
     */
    archivedResidentialArea?: number;
    /**
     * 原有项目应收金额（拆复建项目）
     */
    archivedReceivable?: number;
    /**
     * 实际应收金额（拆复建项目，差额或0）
     */
    actualReceivable?: number;
    /**
     * 审核意见
     */
    reviewOpinion?: string;
    /**
     * 地下建筑面积（㎡）
     */
    underArea?: number;
    [property: string]: any;
}
