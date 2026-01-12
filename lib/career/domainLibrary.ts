// src/lib/career/domainLibrary.ts
import type { CareerDomain, CareerTag } from "./domainTypes";

export type DomainDef = {
  nameZh: string;
  oneLine: string;
  weights: Partial<Record<CareerTag, number>>;
  tracks: Array<{
    name: string;
    weights: Partial<Record<CareerTag, number>>;
    examples: string[]; // 你后续 UI 可展示
  }>;
};

export const DOMAIN_LIBRARY: Record<CareerDomain, DomainDef> = {
  SCIENCE_RESEARCH: {
    nameZh: "科学研究",
    oneLine: "以探索真相与建立理论为主，适合长期深耕与严谨验证。",
    weights: { ResearchDeepWork: 2.2, MathLogic: 1.8, TeachingMentoring: 0.6, Systems: 0.4 },
    tracks: [
      {
        name: "基础科学 / 理论研究",
        weights: { ResearchDeepWork: 2.4, MathLogic: 2.0 },
        examples: ["物理/数学/化学/理论计算", "科研机构/高校/实验室"],
      },
      {
        name: "生命科学 / 医学科研",
        weights: { ResearchDeepWork: 2.2, EmpathyCare: 0.6, Systems: 0.6 },
        examples: ["生物/药学/临床研究", "医药研发/实验室/生物统计"],
      },
      {
        name: "应用研究 / 工业研发",
        weights: { ResearchDeepWork: 1.8, Engineering: 1.2, Systems: 0.6 },
        examples: ["材料/能源/工业研究", "企业研究院/研发中心"],
      },
    ],
  },

  ENGINEERING_TECH: {
    nameZh: "工程技术",
    oneLine: "把复杂系统做出来、跑起来、规模化，适合强落地与迭代。",
    weights: { Engineering: 2.2, Systems: 1.2, MathLogic: 1.0, Innovation: 0.8 },
    tracks: [
      {
        name: "软件工程 / 架构",
        weights: { Engineering: 2.3, Systems: 1.4, MathLogic: 1.2 },
        examples: ["后端/架构/平台", "分布式/性能/安全工程"],
      },
      {
        name: "硬件/嵌入式/机器人",
        weights: { Engineering: 2.2, MathLogic: 1.3, Systems: 0.8 },
        examples: ["IoT/芯片/机器人", "工业自动化/智能硬件"],
      },
      {
        name: "基础设施 / 运维 / SRE",
        weights: { Systems: 2.0, Engineering: 1.6, Operations: 1.0 },
        examples: ["云/网络/运维/SRE", "可靠性/监控/灾备"],
      },
    ],
  },

  DATA_AI: {
    nameZh: "数据 / AI",
    oneLine: "用数据与模型建立预测与决策优势，适合抽象与验证并重。",
    weights: { ResearchDeepWork: 1.6, MathLogic: 2.0, Engineering: 1.0, Systems: 0.6 },
    tracks: [
      {
        name: "机器学习 / 算法研究",
        weights: { MathLogic: 2.2, ResearchDeepWork: 1.8 },
        examples: ["算法工程师/研究员", "推荐/搜索/视觉/LLM"],
      },
      {
        name: "数据分析 / BI / 增长分析",
        weights: { MathLogic: 1.6, Systems: 1.0, Communication: 0.8 },
        examples: ["数据分析/BI", "增长/产品数据/商业分析"],
      },
      {
        name: "数据工程 / 平台",
        weights: { Engineering: 1.8, Systems: 1.2, MathLogic: 1.2 },
        examples: ["数仓/ETL/数据平台", "实时数据/指标体系"],
      },
    ],
  },

  ART_DESIGN: {
    nameZh: "艺术 / 设计",
    oneLine: "以审美与表达为核心，把感受做成作品与体验。",
    weights: { Aesthetics: 2.2, Storytelling: 1.2, Communication: 0.8, Innovation: 0.8 },
    tracks: [
      {
        name: "视觉 / 品牌 / 平面",
        weights: { Aesthetics: 2.3, Communication: 0.8 },
        examples: ["品牌VI/视觉设计", "海报/广告/视觉系统"],
      },
      {
        name: "交互 / 产品设计",
        weights: { Aesthetics: 1.6, Systems: 1.0, Communication: 1.0 },
        examples: ["UX/UI/交互", "设计系统/用户研究"],
      },
      {
        name: "艺术创作 / 音乐影视",
        weights: { Aesthetics: 2.0, Storytelling: 1.6, PublicInfluence: 0.6 },
        examples: ["导演/编剧/摄影", "音乐制作/艺术家"],
      },
    ],
  },

  MEDIA_CONTENT: {
    nameZh: "媒体 / 内容",
    oneLine: "通过内容影响人群与传播共识，适合表达与节奏感强的人。",
    weights: { Communication: 2.0, Storytelling: 1.8, PublicInfluence: 1.0, CommunityNetwork: 0.8 },
    tracks: [
      {
        name: "内容创作 / 自媒体",
        weights: { Storytelling: 2.0, PublicInfluence: 1.2, Communication: 1.2 },
        examples: ["博主/KOL/主播", "短视频/长文/播客"],
      },
      {
        name: "市场传播 / PR",
        weights: { Communication: 2.0, CommunityNetwork: 1.0, PublicInfluence: 1.0 },
        examples: ["公关/品牌/营销", "campaign/活动策划"],
      },
      {
        name: "编辑/出版/脚本",
        weights: { Storytelling: 2.2, ResearchDeepWork: 0.8 },
        examples: ["编辑/出版", "脚本策划/策展"],
      },
    ],
  },

  BUSINESS_FINANCE: {
    nameZh: "商业 / 金融",
    oneLine: "资源与定价思维强，擅长把价值变成现金流与结构。",
    weights: { MoneyAssets: 2.0, Strategy: 1.2, Systems: 0.8, RiskFinance: 1.0 },
    tracks: [
      {
        name: "投资 / 交易 / 资产管理",
        weights: { MoneyAssets: 2.2, RiskFinance: 1.6, ResearchDeepWork: 0.8 },
        examples: ["投研/交易/基金", "资产配置/量化/风控"],
      },
      {
        name: "企业经营 / 商业化",
        weights: { MoneyAssets: 1.8, Systems: 1.2, Strategy: 1.2 },
        examples: ["商业化/增长/营收", "经营分析/GM/运营"],
      },
      {
        name: "会计/财务/审计",
        weights: { Systems: 1.8, LawCompliance: 1.0, MoneyAssets: 1.2 },
        examples: ["财务/审计/税务", "合规财务/风控"],
      },
    ],
  },

  LAW_POLICY: {
    nameZh: "法律 / 政策",
    oneLine: "规则、边界与事实链条是核心能力，适合严谨与责任导向。",
    weights: { LawCompliance: 2.2, ResearchDeepWork: 1.2, Communication: 0.8, Systems: 0.8 },
    tracks: [
      {
        name: "法律实务 / 诉讼",
        weights: { LawCompliance: 2.4, Communication: 1.0 },
        examples: ["律师/法务/诉讼", "合同/仲裁/谈判"],
      },
      {
        name: "合规 / 风险管理",
        weights: { LawCompliance: 2.0, Systems: 1.2, ResearchDeepWork: 1.0 },
        examples: ["合规/内控/风控", "金融合规/数据合规"],
      },
      {
        name: "公共政策 / 研究",
        weights: { ResearchDeepWork: 1.6, LawCompliance: 1.2, Strategy: 1.0 },
        examples: ["政策研究/智库", "政府事务/公共管理"],
      },
    ],
  },

  HEALTH_CARE: {
    nameZh: "医疗 / 健康",
    oneLine: "以人和生命为中心，需要耐心、责任与稳定训练。",
    weights: { EmpathyCare: 2.0, Systems: 1.0, ResearchDeepWork: 1.0, Operations: 0.8 },
    tracks: [
      {
        name: "临床/护理/康复",
        weights: { EmpathyCare: 2.2, Operations: 1.0, Systems: 0.8 },
        examples: ["医生/护士/康复师", "心理咨询/治疗辅助"],
      },
      {
        name: "公共健康 / 健康管理",
        weights: { Systems: 1.2, EmpathyCare: 1.6, Communication: 0.8 },
        examples: ["健康管理/公共卫生", "医院管理/健康产品"],
      },
      {
        name: "医药/器械/科研",
        weights: { ResearchDeepWork: 1.6, Systems: 0.8, EmpathyCare: 0.8 },
        examples: ["药企研发/临床", "医疗器械/注册"],
      },
    ],
  },

  EDUCATION: {
    nameZh: "教育 / 培训",
    oneLine: "把复杂讲清楚、带人进步是核心价值，适合持续输出。",
    weights: { TeachingMentoring: 2.2, Communication: 1.2, ResearchDeepWork: 0.8, EmpathyCare: 0.6 },
    tracks: [
      {
        name: "教师 / 讲师 / 教研",
        weights: { TeachingMentoring: 2.4, ResearchDeepWork: 1.0 },
        examples: ["教师/讲师/教研", "课程研发/教材"],
      },
      {
        name: "培训/咨询/辅导",
        weights: { Communication: 1.4, TeachingMentoring: 2.0 },
        examples: ["培训师/教练", "职业辅导/咨询"],
      },
      {
        name: "教育产品 / EdTech",
        weights: { TeachingMentoring: 1.4, Systems: 0.8, Engineering: 0.6 },
        examples: ["教育产品经理", "学习系统/平台"],
      },
    ],
  },

  PUBLIC_SERVICE: {
    nameZh: "公共服务 / 公益",
    oneLine: "以公共价值为目标，适合责任感强、能长期投入的人。",
    weights: { EmpathyCare: 1.2, Systems: 1.2, Leadership: 1.0, LawCompliance: 0.8 },
    tracks: [
      {
        name: "公共管理 / 社会治理",
        weights: { Systems: 1.6, Leadership: 1.2, LawCompliance: 0.8 },
        examples: ["公共管理/政府项目", "社会治理/社区服务"],
      },
      {
        name: "公益/NGO",
        weights: { EmpathyCare: 1.6, CommunityNetwork: 0.8, Communication: 0.8 },
        examples: ["公益项目/基金会", "社会创新/社区组织"],
      },
      {
        name: "国际组织 / 公共议题",
        weights: { Strategy: 1.0, ResearchDeepWork: 1.0, LawCompliance: 0.8 },
        examples: ["国际组织/公共议题", "发展研究/项目管理"],
      },
    ],
  },

  SALES_GROWTH: {
    nameZh: "销售 / 增长 / BD",
    oneLine: "用关系与表达换资源与结果，适合节奏快、抗压强的人。",
    weights: { Communication: 1.8, CommunityNetwork: 1.6, Leadership: 0.8, PublicInfluence: 1.0 },
    tracks: [
      {
        name: "BD / 合作拓展",
        weights: { CommunityNetwork: 2.0, Communication: 1.4, Leadership: 0.6 },
        examples: ["商务拓展/渠道", "生态合作/伙伴关系"],
      },
      {
        name: "增长 / 市场转化",
        weights: { Communication: 1.8, Systems: 0.6, PublicInfluence: 1.0 },
        examples: ["增长/投放/转化", "运营增长/用户增长"],
      },
      {
        name: "销售 / 客户成功",
        weights: { Communication: 1.6, EmpathyCare: 0.6, Systems: 0.6 },
        examples: ["销售/客户成功", "大客户/解决方案"],
      },
    ],
  },

  PRODUCT_STRATEGY: {
    nameZh: "产品 / 战略 / 咨询",
    oneLine: "把需求、资源与路径结构化，适合跨学科整合与决策支持。",
    weights: { Strategy: 1.8, Systems: 1.4, Communication: 1.0, ResearchDeepWork: 1.0 },
    tracks: [
      {
        name: "产品经理 / 增长产品",
        weights: { Systems: 1.4, Strategy: 1.4, Communication: 1.0 },
        examples: ["产品经理/增长产品", "平台/工具/ToB 产品"],
      },
      {
        name: "战略 / 经营分析",
        weights: { Strategy: 2.0, ResearchDeepWork: 1.2, MoneyAssets: 0.6 },
        examples: ["战略/经营分析", "公司战略/商业分析"],
      },
      {
        name: "咨询 / 解决方案",
        weights: { Communication: 1.2, Strategy: 1.6, Systems: 1.0 },
        examples: ["管理咨询/解决方案", "业务架构/流程咨询"],
      },
    ],
  },
};
