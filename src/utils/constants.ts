/**
 * Created by 芋道源码
 *
 * 枚举类
 */

// ========== COMMON 模块 ==========
// 全局通用状态枚举
export const CommonStatusEnum = {
  ENABLE: 0, // 开启
  DISABLE: 1 // 禁用
}

// 全局用户类型枚举
export const UserTypeEnum = {
  MEMBER: 1, // 会员
  ADMIN: 2 // 管理员
}

// ========== SYSTEM 模块 ==========
/**
 * 菜单的类型枚举
 */
export const SystemMenuTypeEnum = {
  DIR: 1, // 目录
  MENU: 2, // 菜单
  BUTTON: 3 // 按钮
}

/**
 * 角色的类型枚举
 */
export const SystemRoleTypeEnum = {
  SYSTEM: 1, // 内置角色
  CUSTOM: 2 // 自定义角色
}

/**
 * 数据权限的范围枚举
 */
export const SystemDataScopeEnum = {
  ALL: 1, // 全部数据权限
  DEPT_CUSTOM: 2, // 指定部门数据权限
  DEPT_ONLY: 3, // 部门数据权限
  DEPT_AND_CHILD: 4, // 部门及以下数据权限
  DEPT_SELF: 5 // 仅本人数据权限
}

/**
 * 用户的社交平台的类型枚举
 */
export const SystemUserSocialTypeEnum = {
  DINGTALK: {
    title: '钉钉',
    type: 20,
    source: 'dingtalk',
    img: 'https://s1.ax1x.com/2022/05/22/OzMDRs.png'
  },
  WECHAT_ENTERPRISE: {
    title: '企业微信',
    type: 30,
    source: 'wechat_enterprise',
    img: 'https://s1.ax1x.com/2022/05/22/OzMrzn.png'
  }
}

/**
 * 用户性别枚举（对齐后端 system_user_sex 字典）
 */
export const SystemUserSexEnum = {
  UNKNOWN: 0, // 未知
  MALE: 1, // 男
  FEMALE: 2 // 女
}

// ========== INFRA 模块 ==========
/**
 * 代码生成模板类型
 */
export const InfraCodegenTemplateTypeEnum = {
  CRUD: 1, // 基础 CRUD
  TREE: 2, // 树形 CRUD
  SUB: 15 // 主子表 CRUD
}

/**
 * 任务状态的枚举
 */
export const InfraJobStatusEnum = {
  INIT: 0, // 初始化中
  NORMAL: 1, // 运行中
  STOP: 2 // 暂停运行
}

/**
 * API 异常数据的处理状态
 */
export const InfraApiErrorLogProcessStatusEnum = {
  INIT: 0, // 未处理
  DONE: 1, // 已处理
  IGNORE: 2 // 已忽略
}

// ========== PAY 模块 ==========
/**
 * 支付渠道枚举
 */
export const PayChannelEnum = {
  WX_PUB: {
    code: 'wx_pub',
    name: '微信 JSAPI 支付'
  },
  WX_LITE: {
    code: 'wx_lite',
    name: '微信小程序支付'
  },
  WX_APP: {
    code: 'wx_app',
    name: '微信 APP 支付'
  },
  WX_NATIVE: {
    code: 'wx_native',
    name: '微信 Native 支付'
  },
  WX_WAP: {
    code: 'wx_wap',
    name: '微信 WAP 网站支付'
  },
  WX_BAR: {
    code: 'wx_bar',
    name: '微信条码支付'
  },
  ALIPAY_PC: {
    code: 'alipay_pc',
    name: '支付宝 PC 网站支付'
  },
  ALIPAY_WAP: {
    code: 'alipay_wap',
    name: '支付宝 WAP 网站支付'
  },
  ALIPAY_APP: {
    code: 'alipay_app',
    name: '支付宝 APP 支付'
  },
  ALIPAY_QR: {
    code: 'alipay_qr',
    name: '支付宝扫码支付'
  },
  ALIPAY_BAR: {
    code: 'alipay_bar',
    name: '支付宝条码支付'
  },
  WALLET: {
    code: 'wallet',
    name: '钱包支付'
  },
  MOCK: {
    code: 'mock',
    name: '模拟支付'
  }
}

/**
 * 支付的展示模式每局
 */
export const PayDisplayModeEnum = {
  URL: {
    mode: 'url'
  },
  IFRAME: {
    mode: 'iframe'
  },
  FORM: {
    mode: 'form'
  },
  QR_CODE: {
    mode: 'qr_code'
  },
  APP: {
    mode: 'app'
  }
}

/**
 * 支付类型枚举
 */
export const PayType = {
  WECHAT: 'WECHAT',
  ALIPAY: 'ALIPAY',
  MOCK: 'MOCK'
}

/**
 * 支付订单状态枚举
 */
export const PayOrderStatusEnum = {
  WAITING: {
    status: 0,
    name: '未支付'
  },
  SUCCESS: {
    status: 10,
    name: '已支付'
  },
  CLOSED: {
    status: 20,
    name: '未支付'
  }
}

// ========== MALL - 商品模块 ==========
/**
 * 商品 SPU 状态
 */
export const ProductSpuStatusEnum = {
  RECYCLE: {
    status: -1,
    name: '回收站'
  },
  DISABLE: {
    status: 0,
    name: '下架'
  },
  ENABLE: {
    status: 1,
    name: '上架'
  }
}

// ========== MALL - 营销模块 ==========
/**
 * 优惠劵模板的有限期类型的枚举
 */
export const CouponTemplateValidityTypeEnum = {
  DATE: {
    type: 1,
    name: '固定日期可用'
  },
  TERM: {
    type: 2,
    name: '领取之后可用'
  }
}

/**
 * 优惠劵模板的领取方式的枚举
 */
export const CouponTemplateTakeTypeEnum = {
  USER: {
    type: 1,
    name: '直接领取'
  },
  ADMIN: {
    type: 2,
    name: '指定发放'
  },
  REGISTER: {
    type: 3,
    name: '新人券'
  }
}

/**
 * 营销的商品范围枚举
 */
export const PromotionProductScopeEnum = {
  ALL: {
    scope: 1,
    name: '通用劵'
  },
  SPU: {
    scope: 2,
    name: '商品劵'
  },
  CATEGORY: {
    scope: 3,
    name: '品类劵'
  }
}

/**
 * 营销的条件类型枚举
 */
export const PromotionConditionTypeEnum = {
  PRICE: {
    type: 10,
    name: '满 N 元'
  },
  COUNT: {
    type: 20,
    name: '满 N 件'
  }
}

/**
 * 优惠类型枚举
 */
export const PromotionDiscountTypeEnum = {
  PRICE: {
    type: 1,
    name: '满减'
  },
  PERCENT: {
    type: 2,
    name: '折扣'
  }
}

// ========== MALL - 交易模块 ==========
/**
 * 分销关系绑定模式枚举
 */
export const BrokerageBindModeEnum = {
  ANYTIME: {
    mode: 1,
    name: '首次绑定'
  },
  REGISTER: {
    mode: 2,
    name: '注册绑定'
  },
  OVERRIDE: {
    mode: 3,
    name: '覆盖绑定'
  }
}
/**
 * 分佣模式枚举
 */
export const BrokerageEnabledConditionEnum = {
  ALL: {
    condition: 1,
    name: '人人分销'
  },
  ADMIN: {
    condition: 2,
    name: '指定分销'
  }
}
/**
 * 佣金记录业务类型枚举
 */
export const BrokerageRecordBizTypeEnum = {
  ORDER: {
    type: 1,
    name: '获得推广佣金'
  },
  WITHDRAW: {
    type: 2,
    name: '提现申请'
  }
}
/**
 * 佣金提现状态枚举
 */
export const BrokerageWithdrawStatusEnum = {
  AUDITING: {
    status: 0,
    name: '审核中'
  },
  AUDIT_SUCCESS: {
    status: 10,
    name: '审核通过'
  },
  AUDIT_FAIL: {
    status: 20,
    name: '审核不通过'
  },
  WITHDRAW_SUCCESS: {
    status: 11,
    name: '提现成功'
  },
  WITHDRAW_FAIL: {
    status: 21,
    name: '提现失败'
  }
}
/**
 * 佣金提现类型枚举
 */
export const BrokerageWithdrawTypeEnum = {
  WALLET: {
    type: 1,
    name: '钱包'
  },
  BANK: {
    type: 2,
    name: '银行卡'
  },
  WECHAT: {
    type: 3,
    name: '微信'
  },
  ALIPAY: {
    type: 4,
    name: '支付宝'
  }
}

/**
 * 配送方式枚举
 */
export const DeliveryTypeEnum = {
  EXPRESS: {
    type: 1,
    name: '快递发货'
  },
  PICK_UP: {
    type: 2,
    name: '到店自提'
  }
}
/**
 * 交易订单 - 状态
 */
export const TradeOrderStatusEnum = {
  UNPAID: {
    status: 0,
    name: '待支付'
  },
  UNDELIVERED: {
    status: 10,
    name: '待发货'
  },
  DELIVERED: {
    status: 20,
    name: '已发货'
  },
  COMPLETED: {
    status: 30,
    name: '已完成'
  },
  CANCELED: {
    status: 40,
    name: '已取消'
  }
}

// ========== ERP - 企业资源计划 ==========

export const ErpBizType = {
  PURCHASE_ORDER: 10,
  PURCHASE_IN: 11,
  PURCHASE_RETURN: 12,
  SALE_ORDER: 20,
  SALE_OUT: 21,
  SALE_RETURN: 22
}

// ========== BPM 模块 ==========

export const BpmModelType = {
  BPMN: 10, // BPMN 设计器
  SIMPLE: 20 // 简易设计器
}

export const BpmModelFormType = {
  NORMAL: 10, // 流程表单
  CUSTOM: 20 // 业务表单
}

export const BpmProcessInstanceStatus = {
  NOT_START: -1, // 未开始
  RUNNING: 1, // 审批中
  APPROVE: 2, // 审批通过
  REJECT: 3, // 审批不通过
  CANCEL: 4 // 已取消
}

export const BpmAutoApproveType = {
  NONE: 0, // 不自动通过
  APPROVE_ALL: 1, // 仅审批一次，后续重复的审批节点均自动通过
  APPROVE_SEQUENT: 2 // 仅针对连续审批的节点自动通过
}

// ========== SYSTEM - 地区模块 ==========
/**
 * 地区选择器层级枚举
 */
export const AreaLevelEnum = {
  PROVINCE: 1, // 省
  CITY: 2, // 市
  DISTRICT: 3 // 区
}

export const ROLES = {
  accept: 'accept',
  review: 'review',
  issue: 'issue',
  issue1: 'issue1',
  issue2: 'issue2',
  close: 'close',
  admin: 'admin'
}

export const ROLE_LABEL = {
  accept: '受理岗',
  review: '审核岗',
  issue: '签发岗',
  issue1: '签发岗(建设科复核)',
  issue2: '签发岗(建设科过会)',
  close: '办结岗',
  admin: '管理岗'
}

export const HOME_PATH = {
  accept: '/workbench',
  review: '/pending',
  issue: '/pending',
  close: '/pending',
  admin: '/pending'
}

export const STATUS = {
  draft: 'draft',
  review: 'review',
  issue: 'issue',
  issue1: 'issue1',
  issue2: 'issue2',
  pay: 'pay',
  close: 'close',
  archived: 'archived'
}

/** 审批流动作类型 → 中文标签（仅审批流使用） */
export const STATUS_LABEL = {
  SUBMIT: '提交',
  APPROVE: '审批通过',
  RETURN: '退回修改',
  ISSUE: '已签发',
  ISSUE1_REVIEW: '通过',
  ISSUE2_MEETING: '通过',
  CONFIRM_PAID: '已确认到账',
  SUPPLEMENT: '已补录',
  CLOSE: '已办结',
  CONSTRUCTION_RETURN: '建设科退回',
  ARCHIVE: '已归档'
}

/** 办件业务状态 → 中文标签（列表/统计/待办等业务页面使用） */
export const CASE_STATUS_LABEL = {
  draft: '待提交',
  review: '待审核',
  issue: '待签发',
  issue1: '待签发（建设科复核）',
  issue2: '待签发（建设科过会）',
  pay: '待缴款',
  close: '待办结',
  archived: '已归档',
  returned: '退回待修改',
  secondReview: '待补录'
}

export const FLOW_NODE = {
  RECEPTION: '受理',
  REVIEW: '审核',
  ISSUE: '签发',
  ISSUE1_REVIEW: '建设科复核',
  ISSUE2_MEETING: '建设科过会',
  PAY: '缴款',
  CLOSE: '办结',
  ARCHIVE: '归档',
  RETURN: '退回待修改',
  SUPPLEMENT: '证号补录',
  CONSTRUCTION_RETURN: '建设科'
}

export const STATUS_TAG = {
  draft: 'info',
  review: 'warning',
  issue: 'primary',
  issue1: 'primary',
  issue2: 'primary',
  pay: 'danger',
  close: 'success',
  archived: 'success',
  returned: 'danger',
  secondReview: 'warning'
}

export const FLOW_NODES = [
  { key: 'draft', label: '待提交' },
  { key: 'review', label: '待审核' },
  { key: 'issue', label: '待签发' },
  { key: 'issue1', label: '待签发(建设科复核)' },
  { key: 'issue2', label: '待签发(建设科过会)' },
  { key: 'pay', label: '待缴款' },
  { key: 'close', label: '待办结' },
  { key: 'archived', label: '已归档' },
  { key: 'returned', label: '退回待修改' }
]

export const FUND_SOURCES = ['私营', '政府', '国有', '集体', '外资', '其他']

export const LAND_USES = [
  '居住',
  '住宅',
  '商业',
  '工业',
  '教育',
  '商务金融',
  '城镇村道路',
  '物流',
  '物流仓储',
  '其他'
]

export const BIZ_TYPES = ['初次', '变更', '竣备', '免征']

export const PROJECT_SUBTYPES = ['新建', '改扩建', '拆复建', '旧城改造拆建']

export const UNIT_RESIDENTIAL = 30
export const UNIT_NON_RESIDENTIAL = 80
