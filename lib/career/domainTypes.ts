// src/lib/career/domainTypes.ts

export type CareerTag =
  | "ResearchDeepWork"    // 研究/深度洞察
  | "MathLogic"           // 数理逻辑/抽象能力
  | "Engineering"         // 工程/实现/构建
  | "Systems"             // 系统/流程/管理
  | "Communication"       // 表达/传播
  | "Storytelling"        // 叙事/内容/创作
  | "Aesthetics"          // 审美/艺术
  | "EmpathyCare"         // 共情/照护/疗愈
  | "Leadership"          // 领导/决策
  | "PublicInfluence"     // 公众影响力
  | "CommunityNetwork"    // 社群/网络
  | "MoneyAssets"         // 金钱/资产/定价
  | "RiskFinance"         // 风险金融/杠杆
  | "LawCompliance"       // 合规/规则/边界
  | "TeachingMentoring"   // 教学/辅导
  | "Operations"          // 运营/执行
  | "Innovation"          // 创新/非典型路径
  | "Strategy"            // ✅ 战略/宏观/框架

export type CareerDomain =
  | "SCIENCE_RESEARCH"      // 科学研究
  | "ENGINEERING_TECH"      // 工程技术
  | "DATA_AI"               // 数据/AI
  | "ART_DESIGN"            // 艺术设计
  | "MEDIA_CONTENT"         // 媒体内容
  | "BUSINESS_FINANCE"      // 商业金融
  | "LAW_POLICY"            // 法律政策
  | "HEALTH_CARE"           // 医疗健康
  | "EDUCATION"             // 教育培训
  | "PUBLIC_SERVICE"        // 公共服务/公益
  | "SALES_GROWTH"          // 销售增长/BD
  | "PRODUCT_STRATEGY";     // 产品/战略/咨询

export type DomainScore = {
  domain: CareerDomain;
  score: number;
  reasons: string[];     // 可解释 hits
  tracks: Array<{ name: string; score: number; reasons: string[] }>; // 细分方向
};

export type DomainResult = {
  tagVector: Record<CareerTag, number>;
  domainScores: DomainScore[];
  topDomains: DomainScore[];  // top 3
};
