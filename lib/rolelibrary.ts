// lib/rolelibrary.ts

export type RoleId =
  | "BUILDER_FOUNDER" | "PRODUCT_DESIGN" | "NARRATIVE_CREATOR" | "SYSTEM_ARCHITECT"
  | "CONNECTOR_BD" | "GROWTH_MARKETER" | "BIZOPS_MONETIZATION" | "COMMUNITY_OPERATOR"
  | "RESEARCH_STRATEGIST" | "RISK_COMPLIANCE" | "ALLOCATOR_PORTFOLIO" | "PM_DELIVERY"
  | "PEOPLE_CULTURE" | "DATA_ANALYST" | "SALES_CLOSER" | "EDUCATOR_MENTOR";

export type RoleCard = {
  id: RoleId;
  nameZh: string;
  nameEn: string;
  summary: string;
  recommendedCareers: { title: string; reason: string }[];
  investment: {
    style: string;
    strategy: string;
    risk: string;
  };
  bullets: string[];
  tags?: string[];
};

export const ROLE_LIBRARY: Record<RoleId, RoleCard> = {
  // 1. 构建者
  BUILDER_FOUNDER: {
    id: "BUILDER_FOUNDER",
    nameZh: "构建者 / 创业者",
    nameEn: "Builder / Founder",
    summary: "你需要长期投入一个“值得的东西”，用产品或作品堆出时间的复利。",
    recommendedCareers: [
      { title: "个人主理人 / 独立创业者", reason: "基于对根基的执着，最适合拥有私域领地进行商业变现。" },
      { title: "系统架构师 / 产品负责人", reason: "擅长将复杂的情感需求拆解为稳定运行的模块，赋予产品以灵魂。" }
    ],
    investment: {
      style: "价值长跑 / 根基锚定",
      strategy: "适合“核心+卫星”策略：大仓位锁定在具有强护城河的红利资产或房产，平衡安全感焦虑。",
      risk: "容易在底部的波动中产生情绪化防御，导致因小失大，或错失高增长机会。"
    },
    bullets: [
      "优点：韧性极强，能从 0 到 1 建立稳定结构。",
      "问题：容易产生自我感动的勤奋，忽略宏观周期。",
      "建议：建立明确止损线，将自我价值与项目脱钩。"
    ],
    tags: ["长期主义", "复利资产"]
  },

  // 2. 产品设计
  PRODUCT_DESIGN: {
    id: "PRODUCT_DESIGN",
    nameZh: "产品 / 体验设计者",
    nameEn: "Product / Experience Designer",
    summary: "你擅长把人性翻译成结构，通过极致的交互降低世界的混乱感。",
    recommendedCareers: [
      { title: "UI/UX 设计专家", reason: "极强的洞察力，能把复杂的功能需求转化为直觉化的审美体验。" },
      { title: "游戏机制策划", reason: "擅长通过规则设计引导用户行为，制造持续的爽感与留存。" }
    ],
    investment: {
      style: "体验溢价 / 细节博弈",
      strategy: "倾向于投资具有极高“产品力”的公司，寻找能改变生活方式的垄断标的。",
      risk: "容易陷入对“完美标的”的执着而错过大盘机会，或因过度自负拒绝止损。"
    },
    bullets: [
      "优点：用户洞察强，能把复杂变简单。",
      "问题：容易卡在完美主义里，反复打磨边缘细节导致节奏慢。",
      "建议：用版本迭代交付，不要用一次到位拖死推进。"
    ],
    tags: ["体验", "结构化"]
  },

  // 3. 内容叙事
  NARRATIVE_CREATOR: {
    id: "NARRATIVE_CREATOR",
    nameZh: "内容 / 叙事创造者",
    nameEn: "Narrative / Content Creator",
    summary: "你用表达建立个人主权的流量池，用内容作为分发信任的媒介。",
    recommendedCareers: [
      { title: "深度播客主 / 内容博主", reason: "能通过语言构建强力共鸣场域，吸引高粘性的垂直受众。" },
      { title: "品牌公关策略师", reason: "擅长捕捉大众情绪流，将其引导至有利的叙事框架中。" }
    ],
    investment: {
      style: "共识捕捉 / 影响力套利",
      strategy: "适合投资具备“社交货币”属性的资产，收益来自对心理拐点的提前察觉。",
      risk: "容易被反馈数据（如点击量/短期行情）绑架心态，在情绪过热时追高。"
    },
    bullets: [
      "优点：共鸣强，会讲故事，能带动情绪与行动。",
      "问题：容易被反馈绑架，数据一波动心态就跟着走。",
      "建议：把内容资产化，建立主题池与复用链路，别靠灵感干活。"
    ],
    tags: ["表达", "影响力"]
  },

  // 4. 系统架构
  SYSTEM_ARCHITECT: {
    id: "SYSTEM_ARCHITECT",
    nameZh: "系统架构师 / 机制设计",
    nameEn: "System Builder / Architect",
    summary: "你负责把流程、规则与资源组装成自运转的机器。",
    recommendedCareers: [
      { title: "CTO / 架构专家", reason: "天生的大局观，能预测系统在高并发下的压力点。" },
      { title: "流程自动化顾问", reason: "擅长识别低效节点，用技术或工具实现规模化溢价。" }
    ],
    investment: {
      style: "逻辑复利 / 量化视角",
      strategy: "适合基于规则的量化模型或网格交易，利用系统惯性而非主观预测。",
      risk: "容易忽略系统外的“黑天鹅”因素，模型崩坏时缺乏灵活应变。",
    },
    bullets: [
      "优点：极高的可复制性，一旦跑通产出呈指数放大。",
      "问题：过度理性，低估团队合作中的人性成本与非理性阻力。",
      "建议：系统中加入人为容错机制，留出处理随机性的接口。"
    ],
    tags: ["规模化", "自运行系统"]
  },

  // 5. BD 连接
  CONNECTOR_BD: {
    id: "CONNECTOR_BD",
    nameZh: "BD / 连接者",
    nameEn: "Connector / Deal Maker",
    summary: "你通过人和资源的流动创造价值：撮合、谈判、建立合作网络。",
    recommendedCareers: [
      { title: "战略合作负责人", reason: "擅长在缝隙中找到各方的公约数，并在连接中创造增量。" },
      { title: "高净值资源中介", reason: "具备极强的信息整合能力，能在非对称博弈中获利。" }
    ],
    investment: {
      style: "信息溢价 / 圈层套利",
      strategy: "适合投资那些处于“生态交汇点”的项目，利用不对称的信息差进行早期布局。",
      risk: "容易过分相信所谓的人脉和内幕，忽略了资产本身的财务基本面。"
    },
    bullets: [
      "优点：机会密集，资源整合强，能把局做大。",
      "问题：容易被消耗，关系过载导致口头承诺太多。",
      "建议：选择高质量关系，把合作写成条款，不要靠情绪。"
    ],
    tags: ["资源流动", "连接溢价"]
  },

  // 6. 增长营销
  GROWTH_MARKETER: {
    id: "GROWTH_MARKETER",
    nameZh: "增长 / 市场操盘手",
    nameEn: "Growth / Marketer",
    summary: "你擅长用节奏、渠道、活动把产品推到人面前，让增长发生。",
    recommendedCareers: [
      { title: "流量增长官 (CGO)", reason: "能对数据进行病态级别的追踪，并快速执行最小闭环实验。" },
      { title: "新媒体营销专家", reason: "擅长追逐算法规律，用极低的成本撬动海量的自然流量。" }
    ],
    investment: {
      style: "动量交易 / 趋势追踪",
      strategy: "适合配置高波动、高弹性的赛道。你的优势在于对“势头”的敏锐捕捉。",
      risk: "容易在趋势反转时反应慢，或者因为沉迷于“虚荣指标”而无视风险。"
    },
    bullets: [
      "优点：执行快，抓热点强，会放大声量。",
      "问题：容易短期主义，陷入严重的数据焦虑。",
      "建议：关注留存和复利指标，不只是看单次的爆点。"
    ],
    tags: ["动量", "实验思维"]
  },

  // 7. 商业运营
  BIZOPS_MONETIZATION: {
    id: "BIZOPS_MONETIZATION",
    nameZh: "商业化 / 定价与收入",
    nameEn: "Monetization / BizOps",
    summary: "你关注怎么赚钱：定价、成本、现金流、可持续增长。",
    recommendedCareers: [
      { title: "商业化负责人", reason: "极其现实，能从复杂的业务流水中剥离出最赚钱的核心单元。" },
      { title: "战略定价顾问", reason: "理解价值交换的底层逻辑，能帮产品通过定价策略重新定义毛利空间。" }
    ],
    investment: {
      style: "现金流回归 / 折现率模型",
      strategy: "只投那些能产生稳定分红、且具备清晰商业闭环的企业。不做白日梦。",
      risk: "容易因为过度保守而错过技术飞跃期的指数型增产，导致配置过重在夕阳产业。"
    },
    bullets: [
      "优点：现实、会算账、能控风险。",
      "问题：容易过度保守，在机会窗口前犹豫不决。",
      "建议：固定试错预算，允许小额亏损换取大额验证。"
    ],
    tags: ["盈利能力", "现金流"]
  },

  // 8. 社区运营
  COMMUNITY_OPERATOR: {
    id: "COMMUNITY_OPERATOR",
    nameZh: "社区 / 运营",
    nameEn: "Community / Operator",
    summary: "你擅长维护关系与秩序，让群体长期活着并变强。",
    recommendedCareers: [
      { title: "DAO 运营专家 / 社区主理人", reason: "具备极高的情感带宽，能处理去中心化组织里的复杂人际矛盾。" },
      { title: "客户成功负责人", reason: "擅长通过陪伴式服务建立极强的用户信任，产生极高的续费率。" }
    ],
    investment: {
      style: "社群共识 / 粘性估值",
      strategy: "寻找那些具备“宗教式信仰”的品牌或资产，核心逻辑是看忠实粉丝的增量。",
      risk: "容易产生幸存者偏差，把社区内的小众狂欢当成了大众共识的胜利。"
    },
    bullets: [
      "优点：黏性强，会营造氛围，能长期陪跑。",
      "问题：情绪劳动过量，容易过度承担他人的课题。",
      "建议：运营制度化，别靠个人爱心硬扛，建立自动化激励。"
    ],
    tags: ["共识", "粘性"]
  },

  // 9. 研究策略
  RESEARCH_STRATEGIST: {
    id: "RESEARCH_STRATEGIST",
    nameZh: "研究 / 策略顾问",
    nameEn: "Researcher / Strategist",
    summary: "你更适合做判断者：用框架、逻辑和方法论帮团队少走弯路。",
    recommendedCareers: [
      { title: "首席策略分析师", reason: "能从浩如烟海的杂音中提炼出唯一的信号，并形成决策建议。" },
      { title: "独立咨询师", reason: "凭借对底层规律的深刻理解，通过“脑力”产生高溢价的非标准化输出。" }
    ],
    investment: {
      style: "逻辑拆解 / 确定性溢价",
      strategy: "在宏观周期和行业逻辑上花 90% 的时间，只在胜率极高的情况下重仓出击。",
      risk: "容易陷入“纸上谈兵”，在执行细节和入场时机上缺乏手感。"
    },
    bullets: [
      "优点：洞察深，看得远，能做结构化判断。",
      "问题：容易停留在思考，行动出口严重不足。",
      "建议：每个结论配一个最小化行动实验，强制进行反馈循环。"
    ],
    tags: ["洞察", "逻辑框架"]
  },

  // 10. 风险合规
  RISK_COMPLIANCE: {
    id: "RISK_COMPLIANCE",
    nameZh: "风控 / 合规 / 审计",
    nameEn: "Risk / Compliance",
    summary: "你擅长识别漏洞、建立边界，帮团队避开致命的坑。",
    recommendedCareers: [
      { title: "风控总监 / 合规官", reason: "天生的警觉性，能在所有人狂热时发现那条致命的裂缝。" },
      { title: "财务审计专家", reason: "对数据一致性有病态的要求，能看穿任何层面的伪装与泡沫。" }
    ],
    investment: {
      style: "防御优先 / 资本保护",
      strategy: "优先配置那些具有极高安全边际的底层资产。核心目标是“不亏损”。",
      risk: "容易在长期的负面预判中错过指数增长的机会，产生严重的心理损耗。"
    },
    bullets: [
      "优点：稳、严谨，能防止系统性崩溃。",
      "问题：容易把控风险变成拒绝一切机会，导致停滞不前。",
      "建议：建立分级风控体系，小额试错与大额规则分离开。"
    ],
    tags: ["边界", "安全边际"]
  },

  // 11. 配置套利
  ALLOCATOR_PORTFOLIO: {
    id: "ALLOCATOR_PORTFOLIO",
    nameZh: "配置者 / 组合构建",
    nameEn: "Allocator / Portfolio Builder",
    summary: "你不是在追热点，你在搭组合、吃周期、用纪律换复利。",
    recommendedCareers: [
      { title: "基金经理 / 资管总监", reason: "极其重视仓位均衡和相关性，擅长在复杂波动中平滑收益曲线。" },
      { title: "资产配置官", reason: "理解不同资源在时间轴上的生命周期，实现最优的时间/精力配置。" }
    ],
    investment: {
      style: "周期回归 / 均衡化配置",
      strategy: "应建立全天候组合。核心逻辑是各资产相关性对冲，不受单一赛道影响。",
      risk: "容易在局部的大牛市中表现平庸，导致心理落差从而破坏原有的纪律。"
    },
    bullets: [
      "优点：纪律强，耐心好，是团队中最后的安全阀。",
      "问题：容易错过爆发期的尖端进攻窗口。",
      "建议：组合中留出 10% 的实验仓位，专门用来参与爆发性行情。"
    ],
    tags: ["平衡", "组合效应"]
  },

  // 12. 项目交付
  PM_DELIVERY: {
    id: "PM_DELIVERY",
    nameZh: "项目经理 / 交付负责人",
    nameEn: "PM / Delivery Lead",
    summary: "你负责把混乱变成计划，把计划变成最终的交付物。",
    recommendedCareers: [
      { title: "高级项目经理", reason: "极强的颗粒度管理能力，能对齐各方预期并强力落地。" },
      { title: "运营总监 (COO)", reason: "擅长把战略目标拆解为可考核的指标，并驱动组织完成。" }
    ],
    investment: {
      style: "目标驱动 / 时间节点博弈",
      strategy: "寻找那些有明确催化剂（如财报、技术发布）的短平快标的。",
      risk: "容易被眼前的任务清单困住，缺乏对标的物长远商业愿景的判断力。"
    },
    bullets: [
      "优点：推进强，资源对齐快，使命必达。",
      "问题：夹在各方中间左右为难，极度容易产生职场倦怠。",
      "建议：把问题写成决策清单，逼组织做选择，而不是自己扛。"
    ],
    tags: ["落地", "节点控制"]
  },

  // 13. 人才组织
  PEOPLE_CULTURE: {
    id: "PEOPLE_CULTURE",
    nameZh: "组织 / 人才与文化",
    nameEn: "People / Culture Builder",
    summary: "你擅长让人变强：激励、文化、人才密度是你的抓手。",
    recommendedCareers: [
      { title: "CHO / 组织顾问", reason: "能看到显性规则下的隐形张力，擅长通过人才配置优化组织战力。" },
      { title: "领导力导师", reason: "具备极高的情感镜像能力，能帮助高管团队完成深度的心理建设。" }
    ],
    investment: {
      style: "投人逻辑 / 创始团队估值",
      strategy: "只投资那些具有顶级团队文化和核心创始人魅力的企业。核心看组织韧性。",
      risk: "容易陷入对“人格魅力”的过度崇拜，从而忽视了业务层面的平庸。"
    },
    bullets: [
      "优点：稳定团队，是组织最核心的粘合剂。",
      "问题：过度共情，导致在决策时过于软弱、不够果断。",
      "建议：制度先行，不要用个人的人格魅力替代管理的科学性。"
    ],
    tags: ["软实力", "组织资产"]
  },

  // 14. 数据分析
  DATA_ANALYST: {
    id: "DATA_ANALYST",
    nameZh: "数据分析 / 研究运营",
    nameEn: "Data Analyst / Insights",
    summary: "你擅长用数据还原真相，通过指标验证所有的猜想。",
    recommendedCareers: [
      { title: "资深数据分析师", reason: "具备极强的归因能力，能从杂乱的数据中找到真正的增长钥匙。" },
      { title: "量化策略师", reason: "将世界规律代码化，通过冷酷的数学逻辑消除交易中的情绪噪音。" }
    ],
    investment: {
      style: "回测驱动 / 数学期望值",
      strategy: "只参与那些具备统计学优势的机会。你的每一个仓位背后都有概率模型。",
      risk: "容易陷入对历史数据的迷恋，从而在范式转移的黑天鹅面前措手不及。"
    },
    bullets: [
      "优点：客观冷静，能让决策从直觉转变为科学。",
      "问题：容易陷入等完美数据再动手的瘫痪状态。",
      "建议：数据只服务决策，每次分析都必须落到一个具体的动作上。"
    ],
    tags: ["客观", "规律捕捉"]
  },

  // 15. 销售成交
  SALES_CLOSER: {
    id: "SALES_CLOSER",
    nameZh: "销售 / 成交者",
    nameEn: "Sales / Closer",
    summary: "你擅长把价值讲清楚并成交，把虚幻的机会变现为真金白银。",
    recommendedCareers: [
      { title: "大客户销售总监", reason: "具备极强的捕捉窗口期能力，能在最关键时刻完成重磅一击。" },
      { title: "资深融资中介 (FA)", reason: "擅长制造稀缺感和竞争，在价格博弈中为己方争取最大利益。" }
    ],
    investment: {
      style: "窗口博弈 / 现金为王",
      strategy: "寻找那些被市场严重低估、且即将迎来重大情绪反转的“困境反转”标的。",
      risk: "容易在成交的快感中过度加杠杆，导致在波动稍大时就面临爆仓风险。"
    },
    bullets: [
      "优点：结果导向，反应极快，敢于面对拒绝。",
      "问题：为了成交可能过度承诺，给后续的交付留下一地鸡毛。",
      "建议：成交前强制锁定边界，明确交付范围和责任，降低后患。"
    ],
    tags: ["变现", "攻击力"]
  },

  // 16. 教育导师
  EDUCATOR_MENTOR: {
    id: "EDUCATOR_MENTOR",
    nameZh: "教育者 / 导师型",
    nameEn: "Educator / Mentor",
    summary: "你擅长把复杂的东西变成可学习的方法论，带人实现阶层升级。",
    recommendedCareers: [
      { title: "培训体系架构师", reason: "能将隐性知识标准化，大幅降低一个组织的学习曲线和成本。" },
      { title: "职业规划教练", reason: "具备极强的“人本”视角，能帮个体在迷茫中找到确定的成长主轴。" }
    ],
    investment: {
      style: "人力资本投资 / 知识溢价",
      strategy: "大量配置在个人成长、教育和具长期生命力的内容平台标的上。",
      risk: "容易替别人操心导致自己精疲力竭，或因为理想主义而忽略了商业回报。"
    },
    bullets: [
      "优点：表达清晰，能建立极强的信任和长期社会影响力。",
      "问题：容易把别人当成项目，替别人负责过头。",
      "建议：用框架+反馈的系统带人，而不是用情绪去贴身陪伴。"
    ],
    tags: ["赋能", "资产化"]
  }
};