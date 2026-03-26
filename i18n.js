/**
 * Sintech — i18n (Internationalization)
 * Supports EN (English) and CN (中文) with currency/unit conversion.
 * Data-driven structure: Business data is injected from external data source.
 */

const SintechI18n = (() => {
  // ==============================
  // State & Data Source
  // ==============================
  let currentLang = "en";
  const USD_TO_CNY = 7.25;
  let externalData = null; // Injected during init

  function init(data) {
    externalData = data;
  }

  // ==============================
  // UI Strings (Static Labels)
  // ==============================
  const UI_STRINGS = {
    en: {
      brandName: "Sintech",
      tabInsights: "Industry Insights",
      tabHome: "Industry Insights",
      tabIndustry: "Industry Analysis",
      tabConsumer: "Consumer Insights",
      tabDashboard: "Dashboard",
      sidebarLabel: "Intelligence Verticals",
      homeTitlePrefix: "Industry Insights: ",
      marketSizeLabel: "Market Size (Revenue)",
      aspLabel: "Average Selling Price",
      top3Label: "Top 5 Market Share",
      concentration: "CONCENTRATION",
      chartTitle: "Global Shipment Growth Trends",
      chartSub: "2021 – 2025 | Core retailer activation data",
      quarterly: "Quarterly",
      yearly: "Yearly",
      priceBandTitle: "Price Band Distribution",
      deepPriceBtn: "Deep Price Analysis",
      aiLabel: "AI Intelligence",
      current: "Current",
      penetration: "Penetration",
      saturation: "Saturation",
      iterationCycle: "Iteration Cycle",
      replacement: "Replacement",
      priceCentroid: "Price Centroid",
      critical: "Critical",
      nascent: "Nascent",
      growing: "Growing",
      moderate: "Moderate",
      industryTitlePrefix: "Industry Analysis: ",
      industryTitleHighlight: "Category Breakdown",
      industrySub: "Six core categories make up the smart hardware market, with smartphones leading at 38% share.",
      totalCategories: "Total Categories",
      catTracked: "Core product verticals tracked",
      marketScale: "Market Scale (2025)",
      topCatShare: "Top Category Share",
      topTag: "TOP 5",
      consumerTitlePrefix: "Consumer Insights: ",
      consumerTitleHighlight: "User Profile",
      consumerSub: "In-depth understanding of smart hardware users' age distribution, decision logic, and consumption behavior.",
      activeUsers: "Active Users",
      activeUsersSub: "Smart device monthly active users",
      repurchaseRate: "Repurchase Rate",
      repurchaseSub: "Cross-category retention improving",
      coreDemographic: "Core Demographic",
      factorsTitle: "Purchase Decision Factors",
      segmentsTitle: "Consumer Segments",
      channelsTitle: "Channel Distribution",
      dashTitlePrefix: "Dashboard: ",
      dashTitleHighlight: "Industry Trends",
      dashSub: "Over the next four years, smart hardware will deepen along three axes: AI, connectivity, and health.",
      dashBadge: "Forecast: 2025–2028",
      aiOnDevice: "AI On-Device",
      wholeHomeIoT: "Whole-Home IoT",
      healthPrecision: "Health Precision",
      spatialComputing: "Spatial Computing",
      trend2025Title: "On-Device AI Inference Goes Mainstream",
      trend2025Desc: "NPU chip performance surges, enabling LLMs to run locally on wearables and home devices, transforming interaction experiences.",
      trend2026Title: "Whole-Home Ecosystem Matures",
      trend2026Desc: "Matter protocol accelerates cross-brand interoperability, pushing leading manufacturers to open APIs as consumers demand ecosystem completeness.",
      trend2027Title: "Health Monitoring Precision Leap",
      trend2027Desc: "Medical-grade sensors for continuous glucose and non-invasive blood pressure reach commercial maturity, deeply integrating smart hardware with healthcare.",
      trend2028Title: "Spatial Computing Devices Scale Up",
      trend2028Desc: "AR glasses break below 30g weight with all-day battery life, officially launching the consumer spatial computing market.",
      dashAi: "On-device AI is the biggest variable in 2025. Vendors with proprietary chips gain a 12–18 month first-mover advantage. Health monitoring will outpace the wearables mainstream by 2027.",
      skuMonitored: "SKU Monitored",
      coverage: "Coverage",
      regions: "124 Regions",
      confidenceInterval: "Confidence Interval",
      copyright: "© 2025 Sintech.",
      proAccess: "Professional Data Access.",
      catTrackedFooter: "Categories Tracked",
      productsMonitored: "Products Monitored",
      dataSources: "Data Sources",
      surveySample: "Survey Sample",
      citiesCovered: "Cities Covered",
      confidence: "Confidence",
      forecastHorizon: "Forecast Horizon",
      years4: "4 Years",
      analystReports: "Analyst Reports",
      accuracy: "Accuracy (Back-test)",
      mo: "Mo",
      sharePercent: "市场占比",
      macroTab: "Macro",
      competitionTab: "Competition",
      demandTab: "Demand Trends",
      marketCommentary: "Market Commentary",
      marketSummary: "Market Summary",
      strategicRec: "Strategic Recommendation",
      hypeCycleStage: "Industry Hype Cycle Position",
      coreMarketData: "Core Market Data",
      priceSegmentPlayers: "Price Segment Players & Cost Structure",
      coreModelTeardown: "Core Model Deep Dive",
      competitorComparison: "Competitor Comparison Table",
      asymmetricAdvantages: "Asymmetric Competitive Advantages",
      supplyChain: "Supply Chain Key Components",
      inventoryTurnover: "Inventory Turnover",
      painPointsByGroup: "Pain Points by User Group",
      searchTrends: "Keyword Search Trends",
      reviewCollection: "Review Pain Point Collection",
      colBom: "BOM",
      colRetail: "Retail",
      colGrossMargin: "GM",
      colLaunch: "Launch",
      colCycle: "Cycle",
      colChannel: "Channel",
      colFloor: "Floor",
      colSellingPoints: "Selling Points",
      colTargetAudience: "Target Audience",
      colComponent: "Component",
      colTier1: "Tier-1 Suppliers",
      colTier2: "Tier-2 Suppliers",
      colMaturity: "Maturity",
      colPriceTrend: "Price Trend",
      colGeoRisk: "Geopolitical Risk",
      colTurnoverDays: "Turnover Days",
      colDepreciation: "Depreciation Risk",
    },
    cn: {
      brandName: "Sintech",
      tabInsights: "行业洞察",
      tabHome: "行业洞察",
      tabIndustry: "行业分析",
      tabConsumer: "消费者洞察",
      tabDashboard: "趋势看板",
      sidebarLabel: "行业垂类",
      homeTitlePrefix: "行业洞察：",
      marketSizeLabel: "市场规模（营收）",
      aspLabel: "平均售价",
      top3Label: "Top 5 市场份额",
      concentration: "集中度",
      chartTitle: "全球出货量增长趋势",
      chartSub: "2021 – 2025 | 核心零售商激活数据",
      quarterly: "季度",
      yearly: "年度",
      priceBandTitle: "价格带分布",
      deepPriceBtn: "深度价格分析",
      aiLabel: "AI 智能洞察",
      current: "当前",
      penetration: "渗透率",
      saturation: "饱和度",
      iterationCycle: "迭代周期",
      replacement: "换机周期",
      priceCentroid: "价格重心",
      critical: "临界",
      nascent: "萌芽期",
      growing: "增长中",
      moderate: "适中",
      industryTitlePrefix: "行业分析：",
      industryTitleHighlight: "品类拆解",
      industrySub: "六大核心品类构成智能硬件市场主体，智能手机以 38% 占比领跑全场。",
      totalCategories: "品类总数",
      catTracked: "核心品类垂直领域追踪",
      marketScale: "市场规模（2025）",
      topCatShare: "Top 品类份额",
      topTag: "TOP 5",
      consumerTitlePrefix: "消费者洞察：",
      consumerTitleHighlight: "用户画像",
      consumerSub: "深入了解智能硬件用户的年龄构成、决策逻辑与消费行为模式。",
      activeUsers: "活跃用户",
      activeUsersSub: "智能设备月活跃用户",
      repurchaseRate: "复购率",
      repurchaseSub: "跨品类留存率持续改善",
      coreDemographic: "核心人群",
      factorsTitle: "购买决策因素",
      segmentsTitle: "消费者分层",
      channelsTitle: "渠道分布",
      dashTitlePrefix: "趋势看板：",
      dashTitleHighlight: "行业趋势",
      dashSub: "未来四年，智能硬件将在 AI、互联与健康三条主轴上持续深化演进。",
      dashBadge: "预测：2025–2028",
      aiOnDevice: "端侧 AI",
      wholeHomeIoT: "全屋互联",
      healthPrecision: "健康精准",
      spatialComputing: "空间计算",
      trend2025Title: "AI 端侧推理普及",
      trend2025Desc: "NPU 芯片性能大幅提升，大语言模型开始本地化运行于穿戴及家居设备，交互体验质变。",
      trend2026Title: "全屋互联生态成熟",
      trend2026Desc: "Matter 协议加速跨品牌互联，消费者对生态完整性的要求推动头部厂商开放 API。",
      trend2027Title: "健康监测精度跃升",
      trend2027Desc: "连续血糖、无创血压等医疗级传感器商业化落地，智能硬件与大健康深度融合。",
      trend2028Title: "空间计算设备规模化",
      trend2028Desc: "AR 眼镜重量突破 30g 以下，续航达全天候，消费级空间计算市场正式启动。",
      dashAi: "端侧 AI 是 2025 年最大变量。拥有自研芯片的厂商将在差异化体验上获得 12–18 个月的先发优势。健康监测赛道的增速将在 2027 年超越穿戴主赛道。",
      skuMonitored: "SKU 监测",
      coverage: "覆盖范围",
      regions: "124 个地区",
      confidenceInterval: "置信区间",
      copyright: "© 2025 Sintech.",
      proAccess: "专业数据服务。",
      catTrackedFooter: "追踪品类",
      productsMonitored: "监测产品",
      dataSources: "数据来源",
      surveySample: "调研样本",
      citiesCovered: "覆盖城市",
      confidence: "置信度",
      forecastHorizon: "预测周期",
      years4: "4 年",
      analystReports: "分析师报告",
      accuracy: "准确率（回测）",
      mo: "月",
      sharePercent: "市场占比",
      macroTab: "宏观面",
      competitionTab: "竞争面",
      demandTab: "需求趋势",
      marketCommentary: "市场评述",
      marketSummary: "行业概况",
      strategicRec: "应对措施建议",
      hypeCycleStage: "行业周期定位",
      coreMarketData: "核心市场数据",
      priceSegmentPlayers: "价位段核心玩家与成本结构",
      coreModelTeardown: "当季核心机型深度拆解",
      competitorComparison: "竞品对比表",
      asymmetricAdvantages: "非对称竞争优势",
      supplyChain: "供应链关键元器件",
      inventoryTurnover: "库存周转",
      painPointsByGroup: "用户痛点分类",
      searchTrends: "关键词搜索趋势",
      reviewCollection: "用户评论痛点集合",
      colBom: "BOM",
      colRetail: "零售价",
      colGrossMargin: "毛利率",
      colLaunch: "上市",
      colCycle: "迭代",
      colChannel: "渠道",
      colFloor: "地板价",
      colSellingPoints: "核心卖点",
      colTargetAudience: "目标人群",
      colComponent: "元器件",
      colTier1: "一级供应商",
      colTier2: "二级供应商",
      colMaturity: "成熟度",
      colPriceTrend: "价格趋势",
      colGeoRisk: "地缘风险",
      colTurnoverDays: "周转天数",
      colDepreciation: "跌价风险",
    }
  };

  // ==============================
  // Utilities & Data Resolvers
  // ==============================
  function t(key) {
    return UI_STRINGS[currentLang][key] || UI_STRINGS["en"][key] || key;
  }

  function setLang(lang) {
    if (UI_STRINGS[lang]) {
      currentLang = lang;
      return true;
    }
    return false;
  }

  function getLang() { return currentLang; }

  function getVertName(key) {
    if (!externalData) return key;
    const lang = currentLang === "cn" ? "cn" : "en";
    const map = {
      en: { smartphones: "Smartphones", glasses: "Smart Glasses", wearables: "Smart Watches", "smart-home": "Smart Home", entertainment: "Entertainment", health: "Smart Health", mobility: "Smart Mobility" },
      cn: { smartphones: "智能手机", glasses: "智能眼镜", wearables: "智能手表", "smart-home": "智能家居", entertainment: "影音娱乐", health: "智能健康", mobility: "车载智能" }
    };
    return map[lang][key] || key;
  }

  function getIndustryCats(key) {
    if (!externalData) return [];
    return externalData.INDUSTRY_CATS[currentLang][key] || [];
  }

  function getConsumerI18n(key) {
    if (!externalData) return null;
    return externalData.CONSUMER_I18N[currentLang][key] || null;
  }

  function getHomeAi(key) {
    if (!externalData) return "";
    return externalData.HOME_AI[currentLang][key] || "";
  }

  // ==============================
  // Unit & Currency Conversion
  // ==============================
  function convertCurrency(usdStr) {
    if (currentLang === "en") return usdStr;
    const match = usdStr.match(/^\$?([\d,.]+)(B|M|K)?$/i);
    if (!match) {
      const rangeMatch = usdStr.match(/^\$?([\d,.]+)[-–]([\d,.]+)$/);
      if (rangeMatch) {
        const lo = Math.round(parseFloat(rangeMatch[1].replace(/,/g, "")) * USD_TO_CNY);
        const hi = Math.round(parseFloat(rangeMatch[2].replace(/,/g, "")) * USD_TO_CNY);
        return `¥${lo.toLocaleString()}-${hi.toLocaleString()}`;
      }
      const threshMatch = usdStr.match(/^([<>])?\$?([\d,.]+)$/);
      if (threshMatch) {
        const val = Math.round(parseFloat(threshMatch[2].replace(/,/g, "")) * USD_TO_CNY);
        return `${threshMatch[1] || ""}¥${val.toLocaleString()}`;
      }
      return usdStr;
    }
    const num = parseFloat(match[1].replace(/,/g, ""));
    const suffix = (match[2] || "").toUpperCase();
    let cnyVal;
    if (suffix === "B") {
      cnyVal = num * USD_TO_CNY * 10;
      if (cnyVal >= 10000) return `¥${(cnyVal / 10000).toFixed(1)}万亿`;
      return `¥${cnyVal.toFixed(0)}亿`;
    } else if (suffix === "M") {
      cnyVal = num * USD_TO_CNY;
      return `¥${cnyVal.toFixed(1)}M`;
    } else {
      cnyVal = Math.round(num * USD_TO_CNY);
      return `¥${cnyVal.toLocaleString()}`;
    }
  }

  function convertPriceBandLabel(label) {
    if (currentLang === "en") return label;
    const tierMap = { "Entry": "入门", "Mid": "中端", "Premium": "高端", "Ultra": "旗舰", "Medical": "医疗级" };
    return label.replace(/^(\w+)/, (_, tier) => tierMap[tier] || tier)
      .replace(/\$[\d,]+/g, m => convertCurrency(m));
  }

  function convertMetricValue(label, value) {
    if (currentLang === "en") return value;
    const statusMap = { "Critical": "临界", "Nascent": "萌芽期", "Growing": "增长中", "Moderate": "适中", "Early": "早期" };
    if (statusMap[value]) return statusMap[value];
    if (value.endsWith(" Mo")) return value.replace(" Mo", " 个月");
    if (value.startsWith("$")) return convertCurrency(value);
    return value;
  }

  function convertMetricLabel(label) {
    if (currentLang === "en") return label;
    const map = { "Penetration": "渗透率", "Saturation": "饱和度", "Iteration Cycle": "迭代周期", "Replacement": "换机周期", "Price Centroid": "价格重心" };
    return map[label] || label;
  }

  function convertUsers(cnVal) {
    if (currentLang === "cn") return cnVal;
    const match = cnVal.match(/([\d.]+)亿/);
    if (match) {
      const num = parseFloat(match[1]);
      if (num >= 10) return `${(num / 10).toFixed(1)}B`;
      return `${(num * 100).toFixed(0)}M`;
    }
    return cnVal;
  }

  function convertMarketSub(enSub) {
    if (currentLang === "en") return enSub;
    const translations = {
      "1.26B units shipped | Slight recovery YoY": "12.6 亿台出货 | 同比温和复苏",
      "Q4 2025 ASP crossed $400 for first time": "2025 Q4 均价首次突破 ¥2,900",
      "14.3M units | Hyper-growth continues": "1,430 万台 | 超高速增长持续",
      "AI-powered models commanding premium": "AI 驱动型号占据高端市场",
      "Smartwatch $57.2B | Total wearables market": "智能手表 ¥4,150 亿 | 穿戴总市场",
      "Apple Watch ASP $429 | Xiaomi $142": "Apple Watch 均价 ¥3,110 | 小米 ¥1,030",
      "Projected $180B+ in 2026 | CAGR 9.5%": "2026 年预计超 ¥1.3 万亿 | CAGR 9.5%",
      "Price competition intensifying | Volume up": "价格竞争加剧 | 出货量上升",
      "Digital health total | CAGR 11.7%": "数字健康总市场 | CAGR 11.7%",
      "Medical-grade sensors raising ASP steadily": "医疗级传感器推动均价稳步上升",
      "Connected vehicles | CAGR 12.6%": "智能网联汽车 | CAGR 12.6%",
      "ADAS + HUD modules driving ASP growth": "ADAS + HUD 模块推动均价增长",
    };
    return translations[enSub] || enSub;
  }

  return {
    init, t, setLang, getLang,
    getVertName, getIndustryCats, getConsumerI18n, getHomeAi,
    convertCurrency, convertPriceBandLabel, convertMetricValue,
    convertMetricLabel, convertUsers, convertMarketSub
  };
})();

window.SintechI18n = SintechI18n;
