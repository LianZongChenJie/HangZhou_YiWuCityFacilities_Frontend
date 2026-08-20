/**
 * 已办结项目（用于拆复建项目"关联-工规证号"下拉选择）
 *
 * ArchivedApplicationVO
 */
export interface ArchivedApplicationVO {
    /**
     * 地上建筑面积（㎡）
     */
    aboveArea?: number;
    /**
     * 地上住宅面积（㎡）
     */
    aboveResidentialArea?: number;
    /**
     * 人防面积（㎡）
     */
    civilAirArea?: number;
    /**
     * 办件ID
     */
    id?: number;
    /**
     * 非住宅面积（㎡）
     */
    nonResidentialArea?: number;
    /**
     * 工程规划许可证号
     */
    permitNo?: string;
    /**
     * 项目名称
     */
    projectName?: string;
    /**
     * 应收金额（元）
     */
    receivable?: number;
    /**
     * 住宅面积（㎡）
     */
    residentialArea?: number;
    /**
     * 地下建筑面积（㎡）
     */
    underArea?: number;
    [property: string]: any;
}
