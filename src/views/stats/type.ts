/**
 * 列表请求/导出请求参数
 * 
 */
export interface Request {
    /**
     * 受理时间区间（[开始, 结束]）
     */
    acceptDates?: string[];
    /**
     * 金额区间（[最小, 最大]，按应收金额 receivable）
     */
    amount?: string[];
    /**
     * 第二时间区间（[开始, 结束]，与 timeKind 配合）
     */
    otherDates?: string[];
    /**
     * 页码，从 1 开始
     */
    pageNo: number;
    /**
     * 每页条数，最大值为 200
     */
    pageSize: number;
    /**
     * 是否免征：1-有免征 0-无免征（可为空）
     */
    reduction?: number;
    /**
     * 办件状态（可按状态过滤）
     */
    status?: string;
    /**
     * 第二时间类型：closeDate-办结时间/issueDate-开票时间/payDate-到账时间
     */
    timeKind?: string;
    [property: string]: any;
}

/**
 * 列表返回数据
 *
 */
export interface PageResultReportApplicationVO {
    /**
     * 数据
     */
    list?: ReportApplicationVO[];
    /**
     * 页码
     */
    pageNo?: number;
    /**
     * 每页条数
     */
    pageSize?: number;
    /**
     * 总量
     */
    total?: number;
    [property: string]: any;
}

/**
 * cn.iocoder.uifcas.module.business.controller.admin.report.vo.ReportApplicationVO
 *
 * ReportApplicationVO
 */
export interface ReportApplicationVO {
    /**
     * 建设单位
     */
    builderName?: string;
    /**
     * 人防面积
     */
    civilAirArea?: number;
    /**
     * 建设单位联系人
     */
    contact?: string;
    /**
     * 资金来源
     */
    fundSource?: string;
    /**
     * 是否有免征
     */
    hasReduction?: boolean;
    /**
     * 办件ID
     */
    id?: number;
    /**
     * 签发日期
     */
    issueDate?: string;
    /**
     * 土地用途
     */
    landUses?: string;
    /**
     * 非住宅面积
     */
    nonResidentialArea?: number;
    /**
     * 缴费到账日期
     */
    payDate?: string;
    /**
     * 工程规划许可证号
     */
    permitNo?: string;
    /**
     * 联系电话
     */
    phone?: string;
    /**
     * 建设项目名称
     */
    projectName?: string;
    /**
     * 应缴城市基础设施配套费
     */
    receivable?: number;
    /**
     * 住宅面积
     */
    residentialArea?: number;
    /**
     * 办件状态
     */
    status?: string;
    [property: string]: any;
}

