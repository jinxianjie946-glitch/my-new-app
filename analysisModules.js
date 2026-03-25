const SintechModules = (() => {
  const CHART_COLORS = {
    primary: "var(--primary)",
    primaryLight: "var(--surface-container-high)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    purple: "var(--purple)",
    grid: "rgba(0,0,0,0.03)",
    tick: "var(--on-surface-variant)"
  };

  const TAB_MODULES = {
    "global-insights": ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10"]
  };

  const INSIGHTS_CHAPTERS = [
    { id: "A", label_en: "Boundary & Demand", label_cn: "边界与需求", modules: ["m01", "m02"] },
    { id: "B", label_en: "Competition & Moat", label_cn: "竞争与护城河", modules: ["m03", "m04"] },
    { id: "C", label_en: "Economics & Simulation", label_cn: "财务与模拟", modules: ["m05", "m06"] },
    { id: "D", label_en: "Risk & Execution", label_cn: "风险与执行", modules: ["m08", "m09", "m10"] },
    { id: "E", label_en: "Analogues", label_cn: "历史类比", modules: ["m07"] }
  ];

  const DEFAULT_ACTIVE = {
    "global-insights": "m01"
  };

  const activeByTab = { ...DEFAULT_ACTIVE };
  const activeChapterByTab = { "global-insights": "A" };
  let simContext = null;
  let scenarioContext = null;
  let currentLang = "en";

  function isCn() {
    return currentLang === "cn";
  }

  function tt(en, cn) {
    return isCn() ? cn : en;
  }

  function getCategoryName(vertical) {
    const map = {
      en: {
        smartphones: "Smartphones",
        glasses: "Smart Glasses",
        wearables: "Smart Watches",
        "smart-home": "Smart Home",
        entertainment: "Entertainment",
        health: "Smart Health",
        mobility: "Smart Mobility"
      },
      cn: {
        smartphones: "智能手机",
        glasses: "智能眼镜",
        wearables: "智能手表",
        "smart-home": "智能家居",
        entertainment: "影音娱乐",
        health: "智能健康",
        mobility: "车载智能"
      }
    };
    const key = isCn() ? "cn" : "en";
    return map[key][vertical] || tt("Smart Hardware", "智能硬件");
  }

  function formatPct(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value}%`;
  }

  function toShortQuarterLabel(label) {
    const m = String(label).match(/(20\d{2})\s*Q(\d)/);
    if (!m) return label;
    return `${m[1].slice(2)}Q${m[2]}`;
  }

  function kpiLabelZh(label) {
    const map = {
      Penetration: "渗透率",
      Saturation: "饱和度",
      "Iteration Cycle": "迭代周期",
      Replacement: "换机/复购周期",
      "Price Centroid": "价格重心"
    };
    return map[label] || label;
  }

  function saturationZh(value) {
    const map = {
      Critical: "临界",
      Growth: "增长",
      Saturated: "饱和",
      Nascent: "增长"
    };
    return map[value] || value;
  }

  function getModuleData(ctx) {
    const category = getCategoryName(ctx.vertical);
    const home = ctx.verticalData?.home || null;

    const m01FromData = home
      ? (() => {
          const i18n = window.SintechI18n || null;
          const marketSizeVal = isCn() && i18n ? i18n.convertCurrency(home.marketSize) : home.marketSize;
          const aspVal = isCn() && i18n ? i18n.convertCurrency(home.asp) : home.asp;
          const marketSubVal = isCn() && i18n ? i18n.convertMarketSub(home.marketSub) : home.marketSub;
          const aspSubVal = isCn() && i18n ? i18n.convertMarketSub(home.aspSub) : home.aspSub;

          const top5Text = Array.isArray(home.top5)
            ? home.top5
                .slice(0, 5)
                .map(b => `${b.n} ${b.s}`)
                .join(" | ")
            : "";
          const quarterly = Array.isArray(home.quarterly) ? home.quarterly.slice(0, 8) : [];
          const highlightIndex = quarterly.findIndex(x => x && x.current);
          const currentIndex = highlightIndex >= 0 ? highlightIndex : Math.max(quarterly.length - 2, 0);
          const currentH = quarterly[currentIndex]?.h ?? "";
          const bands = Array.isArray(home.priceBands) ? home.priceBands : [];
          const price_distribution = bands.map(b => {
            const raw = String(isCn() && i18n ? i18n.convertPriceBandLabel(b.label || "") : b.label || "");
            const m = raw.match(/^([^(]+)\s*\((.+)\)\s*$/);
            const key = m ? m[1].trim() : raw;
            const range = m ? m[2].trim() : "";
            return {
              label: key,
              range,
              pct: b.pct,
              highlight: Boolean(b.hl)
            };
          });
          return {
            title: tt("Module 01 | Macro Context & Constraints", "模块 01｜宏观态势与物理边界"),
            hero_metrics: [
              {
                label: tt("Market Size (Revenue)", "市场规模（营收）"),
                value: marketSizeVal,
                trend: formatPct(home.marketChange),
                trend_direction: home.marketChange >= 0 ? "up" : "down",
                subtitle: marketSubVal
              },
              {
                label: tt("Average Selling Price (ASP)", "平均售价 ASP"),
                value: aspVal,
                trend: formatPct(home.aspChange),
                trend_direction: home.aspChange >= 0 ? "up" : "down",
                subtitle: aspSubVal
              },
              {
                label: tt("CR5 Concentration", "CR5 集中度"),
                value: home.concentration,
                subtitle: top5Text ? `${tt("Top5", "Top5")}: ${top5Text}` : ""
              }
            ],
            kpi_strip: Array.isArray(home.metrics)
              ? home.metrics.map(m => ({
                  label: isCn() && i18n ? i18n.convertMetricLabel(m.label) : m.label,
                  value: isCn() && i18n ? i18n.convertMetricValue(m.label, m.value) : m.value
                }))
              : [],
            shipment_chart: {
              labels: quarterly.map(q => toShortQuarterLabel(q.label)),
              data: quarterly.map(q => q.h),
              highlight_index: currentIndex
            },
            price_distribution,
            ai_insight: isCn()
              ? `“本季度出货指数${currentH}，ASP ${aspVal}。”`
              : `“Shipment index ${currentH}, ASP ${aspVal}.”`,
            analysis: isCn()
              ? `${category}在${ctx.market}的关键变量是“价格结构”而非单纯总量。建议用出货指数与 ASP 变化同步观察：总量走平但 ASP 上行，意味着结构升级仍在继续。`
              : `For ${category} in ${ctx.market}, the primary driver is price mix rather than pure volume. Track shipment index alongside ASP: flat volume with rising ASP indicates continued premiumization.`,
            ceo: isCn()
              ? "CEO 决策结论：当前阶段应以“结构升级 + 现金流安全垫”为主线，不参与无差别价格战；把资源集中在主销价位段与关键体验项，守住毛利底线。"
              : "CEO Decision: The play is mix upgrade plus cash-flow safety, not indiscriminate price wars. Focus resources on the core price band and a small set of experience differentiators to protect gross margin."
          };
        })()
      : null;

    return {
      m01: {
        ...(m01FromData || {
          title: tt("Module 01 | Macro Context & Constraints", "模块 01｜宏观态势与物理边界"),
          hero_metrics: [],
          kpi_strip: [],
          shipment_chart: { labels: [], data: [], highlight_index: 0 },
          price_distribution: [],
          ai_insight: tt("“Missing data, insight unavailable.”", "“数据缺失，无法生成洞察。”"),
          analysis: tt(`Key metrics for ${category} in ${ctx.market} are not available.`, `${category}在${ctx.market}的关键指标暂缺。`),
          ceo: tt("CEO Decision: Without verified data, do not proceed to a go/no-go. Fix data sources and definitions first.", "CEO 决策结论：缺少真实数据支撑，先补齐数据源与口径，再进入决策。")
        })
      },
      m02: {
        title: tt("Module 02 | Demand Signal Validation", "模块 02｜需求信号验证"),
        search_trends: {
          keywords: isCn()
            ? ["拍照 手机 推荐", "续航 手机", "2000元 5G 手机"]
            : ["best camera phone", "battery life phone", "5G phone under 200"],
          data: {
            k1: [57, 60, 62, 58, 61, 66, 69, 72, 70, 67, 65, 68],
            k2: [49, 51, 54, 56, 58, 60, 63, 65, 64, 62, 60, 61],
            k3: [42, 45, 47, 44, 46, 49, 55, 58, 56, 53, 51, 54]
          }
        },
        pain_points: isCn()
          ? [
              { text: "续航衰减快", hot: true },
              { text: "发热降频", hot: true },
              { text: "夜景成像弱", hot: true },
              { text: "系统更新慢", hot: false },
              { text: "售后响应慢", hot: false },
              { text: "屏幕易碎", hot: false },
              { text: "信号波动", hot: false },
              { text: "充电器兼容问题", hot: false }
            ]
          : [
              { text: "Battery degradation", hot: true },
              { text: "Overheating throttling", hot: true },
              { text: "Weak low-light camera", hot: true },
              { text: "Slow OS updates", hot: false },
              { text: "Slow after-sales", hot: false },
              { text: "Fragile display", hot: false },
              { text: "Unstable signal", hot: false },
              { text: "Charger compatibility", hot: false }
            ],
        source: tt("Review aggregation [FE] · last 6 months, 124k reviews", "评论聚合 [FE] · 近6个月 12.4万条"),
        gap: tt(
          "A gap likely exists [FE]: users want the triangle of long battery life + low heat + reliable low-light imaging. Most products only deliver two, while the third breaks down in real use.",
          "存在未被满足的需求缺口 [FE]：集中在“高续航 + 低发热 + 夜景稳定”的三角能力。现有产品通常只能满足其中两项，第三项在真实场景下明显退化。"
        ),
        ceo: tt(
          "CEO Decision: The demand gap is actionable [FE]. Our USP-to-pain-point fit is ~74%. Anchor the narrative on battery stability; treat camera and performance as proof points, not co-equal claims.",
          "CEO 决策结论：需求缺口成立 [FE]，当前产品 USP 与痛点匹配度约 74%。建议把“续航稳定性”作为唯一主叙事，把影像和性能作为证明项，而非并列卖点。"
        )
      },
      m03: {
        title: tt("Module 03 | Competitive Landscape Breakdown", "模块 03｜竞争格局深度拆解"),
        competitors: [
          {
            brand: "Xiaomi Redmi Note 14 5G",
            estimated_bom: "$121 [FE]",
            retail_price: "$189",
            gross_margin: "~21% [FE]",
            refresh_cycle: tt("10 months", "10个月"),
            channel_strategy: tt("E-com first + retail support", "电商主销 + 线下补位"),
            price_floor: "$169 [FE]",
            is_primary_threat: false
          },
          {
            brand: "Samsung Galaxy A16 5G",
            estimated_bom: "$128 [FE]",
            retail_price: "$209",
            gross_margin: "~24% [FE]",
            refresh_cycle: tt("12 months", "12个月"),
            channel_strategy: tt("Carrier bundles + retail", "运营商合约 + 零售"),
            price_floor: "$189 [FE]",
            is_primary_threat: true
          },
          {
            brand: "realme Narzo 70 Pro",
            estimated_bom: "$118 [FE]",
            retail_price: "$199",
            gross_margin: "~23% [FE]",
            refresh_cycle: tt("9 months", "9个月"),
            channel_strategy: tt("Online volume + frequent promos", "线上冲量 + 促销高频"),
            price_floor: "$179 [FE]",
            is_primary_threat: false
          },
          {
            brand: "vivo T3 5G",
            estimated_bom: "$124 [FE]",
            retail_price: "$219",
            gross_margin: "~22% [FE]",
            refresh_cycle: tt("10 months", "10个月"),
            channel_strategy: tt("Dense offline network", "线下网点密集"),
            price_floor: "$195 [FE]",
            is_primary_threat: false
          },
          {
            brand: "OPPO K12x",
            estimated_bom: "$126 [FE]",
            retail_price: "$229",
            gross_margin: "~22% [FE]",
            refresh_cycle: tt("11 months", "11个月"),
            channel_strategy: tt("Sales-assistant driven retail", "线下导购驱动"),
            price_floor: "$199 [FE]",
            is_primary_threat: false
          }
        ],
        analysis: tt(
          "The competitive floor is ~$169–$199. Leaders can further lower effective street price via channel rebates and running previous-gen models in parallel. A spec-for-spec fight will rapidly compress gross margin.",
          "竞争地板约在 $169-$199 区间，头部对手可通过渠道返利和旧机型并行把有效成交价继续压低。若以硬件堆料硬碰硬，价格战将快速侵蚀毛利。"
        ),
        ceo: tt(
          "CEO Decision: Price buffer is roughly $18–$24. Keep at least a $20 gap vs the primary threat at launch; use trade-in and installment plans instead of headline price cuts.",
          "CEO 决策结论：当前定价缓冲空间约 $18-$24。建议首发价与核心威胁机型保持至少 $20 价差，并用以旧换新和分期政策替代直接降价。"
        )
      },
      m04: {
        title: tt("Module 04 | 12-Dimension Operating Matrix", "模块 04｜十二维经营矩阵"),
        radar_scores: isCn()
          ? [
              { dim: "资本分配", score: 5.4, badge: "ROIC压线", status: "warn" },
              { dim: "护城河", score: 4.8, badge: "差异弱", status: "warn" },
              { dim: "供应链主权", score: 6.1, badge: "双供策略", status: "ok" },
              { dim: "渠道管控", score: 4.3, badge: "返利被动", status: "warn" },
              { dim: "单位经济", score: 5.2, badge: "GM偏薄", status: "warn" },
              { dim: "组织适配", score: 5.7, badge: "协同可用", status: "ok" },
              { dim: "IP/合规", score: 6.2, badge: "SEP可控", status: "ok" },
              { dim: "库存周转", score: 4.9, badge: "周转偏慢", status: "warn" },
              { dim: "品牌商誉", score: 5.8, badge: "认知稳定", status: "ok" },
              { dim: "数据闭环", score: 5.1, badge: "闭环初级", status: "warn" },
              { dim: "退出价值", score: 5.0, badge: "估值中性", status: "warn" },
              { dim: "竞争动态", score: 4.1, badge: "强对抗", status: "warn" }
            ]
          : [
              { dim: "Capital Allocation", score: 5.4, badge: "ROIC thin", status: "warn" },
              { dim: "Moat", score: 4.8, badge: "Weak diff", status: "warn" },
              { dim: "Supply Chain Sovereignty", score: 6.1, badge: "Dual-sourcing", status: "ok" },
              { dim: "Channel Control", score: 4.3, badge: "Rebate-heavy", status: "warn" },
              { dim: "Unit Economics", score: 5.2, badge: "GM thin", status: "warn" },
              { dim: "Org Fit", score: 5.7, badge: "Execution OK", status: "ok" },
              { dim: "IP/Compliance", score: 6.2, badge: "SEP manageable", status: "ok" },
              { dim: "Inventory Turn", score: 4.9, badge: "Slow-ish", status: "warn" },
              { dim: "Brand Goodwill", score: 5.8, badge: "Stable", status: "ok" },
              { dim: "Data Loop", score: 5.1, badge: "Early stage", status: "warn" },
              { dim: "Exit Value", score: 5.0, badge: "Neutral", status: "warn" },
              { dim: "Competitive Dynamics", score: 4.1, badge: "High intensity", status: "warn" }
            ],
        composite_score: 5.22,
        danger_count: 0,
        ok_count: 4,
        ceo: tt(
          "CEO Decision: Composite score 5.22 (pass, but weak). The most damaging gap is channel control under high competitive intensity; the one bright spot is executable supply-chain sovereignty.",
          "CEO 决策结论：综合评分 5.22，及格但偏弱。最致命短板是渠道管控与竞争动态联动过强，唯一亮点是供应链主权具备可执行性。"
        )
      },
      m05: {
        title: tt("Module 05 | Capital Efficiency & Stress Test", "模块 05｜资本效率与压力测试"),
        scenarios: {
          base: {
            label: tt("Base · 2.2M units", "Base · 220万台"),
            revenue: "$436M",
            revenue_detail: tt("ASP $198 × 2.2M", "ASP $198 × 220万台"),
            gross_margin: "22.1%",
            gm_detail: tt("incl. SEP 5% allocation", "含 SEP 5% 分摊"),
            roic_3yr: "12.8%",
            roic_detail: tt("vs WACC 9.6%", "vs WACC 9.6%"),
            bep_month: "M19",
            bep_detail: tt("cash injection until M19", "持续注资至 M19")
          },
          bear: {
            label: tt("Bear · 1.1M units", "Bear · 110万台"),
            revenue: "$218M",
            revenue_detail: tt("ASP $198 × 1.1M", "ASP $198 × 110万台"),
            gross_margin: "17.0%",
            gm_detail: tt("higher channel discounting", "渠道折让抬升"),
            roic_3yr: "2.4%",
            roic_detail: tt("near cost of capital", "接近资本成本"),
            bep_month: "M31",
            bep_detail: tt("material mid-term cash pressure", "中期现金压力大")
          },
          doom: {
            label: tt("Doom · 0.66M units", "Doom · 66万台"),
            revenue: "$131M",
            revenue_detail: tt("ASP $198 × 0.66M", "ASP $198 × 66万台"),
            gross_margin: "11.2%",
            gm_detail: tt("discounted clearance", "折价出清"),
            roic_3yr: "-8.6%",
            roic_detail: tt("well below WACC", "显著低于 WACC"),
            bep_month: tt("N/A", "不达成"),
            bep_detail: tt("no break-even within 36 months", "36个月内无法盈亏平衡")
          }
        },
        cashflow_curve: {
          base: [-5.2, -4.8, -4.2, -3.9, -3.5, -3.1, -2.6, -2.2, -1.6, -1.1, -0.6, -0.2, 0.3, 0.9, 1.4, 2.0, 2.4, 2.7, 3.1, 3.4, 3.8, 4.0, 4.2, 4.5, 4.7, 5.0, 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.9, 6.0, 6.1, 6.2],
          bear: [-5.8, -5.4, -5.1, -4.9, -4.7, -4.5, -4.3, -4.1, -3.9, -3.6, -3.4, -3.1, -2.8, -2.5, -2.2, -1.9, -1.6, -1.4, -1.2, -1.0, -0.8, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.3, 1.5],
          doom: [-6.2, -6.1, -6.0, -5.9, -5.9, -5.8, -5.8, -5.7, -5.7, -5.6, -5.6, -5.5, -5.5, -5.5, -5.4, -5.4, -5.4, -5.3, -5.3, -5.3, -5.2, -5.2, -5.2, -5.1, -5.1, -5.1, -5.0, -5.0, -5.0, -4.9, -4.9, -4.9, -4.8, -4.8, -4.8, -4.7]
        },
        sensitivity: isCn()
          ? {
              base: [
                { variable: "汇率", shock: "±5%", impact: "-$3.6M", survival: "ok" },
                { variable: "核心物料", shock: "+10%", impact: "-$5.1M", survival: "warn" },
                { variable: "CAC", shock: "+20%", impact: "-$2.8M", survival: "ok" },
                { variable: "RMA率", shock: "2%→5%", impact: "-$4.3M", survival: "warn" }
              ],
              bear: [
                { variable: "汇率", shock: "±5%", impact: "-$2.1M", survival: "warn" },
                { variable: "核心物料", shock: "+10%", impact: "-$3.4M", survival: "danger" },
                { variable: "CAC", shock: "+20%", impact: "-$1.9M", survival: "warn" },
                { variable: "RMA率", shock: "2%→5%", impact: "-$2.8M", survival: "danger" }
              ],
              doom: [
                { variable: "汇率", shock: "±5%", impact: "-$1.5M", survival: "danger" },
                { variable: "核心物料", shock: "+10%", impact: "-$2.6M", survival: "danger" },
                { variable: "CAC", shock: "+20%", impact: "-$1.4M", survival: "danger" },
                { variable: "RMA率", shock: "2%→5%", impact: "-$2.2M", survival: "danger" }
              ]
            }
          : {
              base: [
                { variable: "FX rate", shock: "±5%", impact: "-$3.6M", survival: "ok" },
                { variable: "Core materials", shock: "+10%", impact: "-$5.1M", survival: "warn" },
                { variable: "CAC", shock: "+20%", impact: "-$2.8M", survival: "ok" },
                { variable: "RMA rate", shock: "2%→5%", impact: "-$4.3M", survival: "warn" }
              ],
              bear: [
                { variable: "FX rate", shock: "±5%", impact: "-$2.1M", survival: "warn" },
                { variable: "Core materials", shock: "+10%", impact: "-$3.4M", survival: "danger" },
                { variable: "CAC", shock: "+20%", impact: "-$1.9M", survival: "warn" },
                { variable: "RMA rate", shock: "2%→5%", impact: "-$2.8M", survival: "danger" }
              ],
              doom: [
                { variable: "FX rate", shock: "±5%", impact: "-$1.5M", survival: "danger" },
                { variable: "Core materials", shock: "+10%", impact: "-$2.6M", survival: "danger" },
                { variable: "CAC", shock: "+20%", impact: "-$1.4M", survival: "danger" },
                { variable: "RMA rate", shock: "2%→5%", impact: "-$2.2M", survival: "danger" }
              ]
            },
        ceo: tt(
          "CEO Decision: The project is highly sensitive to volume assumptions. At 2.2M units it clears capital efficiency; at 1.1M it is only barely sustainable; at 0.66M it is not. A middle case can survive only with strict material and rebate control.",
          "CEO 决策结论：项目对销量假设高度敏感，220万台以上具备资本效率，110万台仅勉强可持续，66万台不可持续。中间状态可活，但需要严格控制物料和返利。"
        )
      },
      m06: {
        title: tt("Module 06 | Interactive Scenario Simulator", "模块 06｜交互式场景模拟器"),
        simulator_params: [
          { id: "asp", label: tt("ASP price", "ASP 售价"), min: 129, max: 329, default: 198, step: 1, unit: "$" },
          { id: "vol", label: tt("Y1 volume (10k)", "Y1 销量(万台)"), min: 30, max: 500, default: 220, step: 10, unit: tt("×10k", "万台") },
          { id: "bom", label: tt("BOM delta", "BOM 变动"), min: -15, max: 25, default: 0, step: 1, unit: "%" },
          { id: "cac", label: tt("CAC", "CAC 获客成本"), min: 6, max: 38, default: 14, step: 1, unit: "$" }
        ],
        financial_model: {
          base_bom: 121,
          channel_margin: 0.35,
          sep_rate: 0.05,
          opex_rate: 0.08
        },
        ceo: tt(
          "CEO Decision: Only scale when GM > 20% and net profit is positive. If net profit stays negative, trigger an immediate circuit breaker.",
          "CEO 决策结论：该模型只有在 GM 超过 20% 且净利转正时才应推进扩量；若净利长期为负，应立即触发熔断。"
        )
      },
      m07: {
        title: tt("Module 07 | Historical Analogues", "模块 07｜历史类比案例库"),
        analogues: isCn()
          ? [
              { brand: "Nokia · 全球", fate: "高端转型失败后份额坍塌", fate_status: "fail", description: "产品节奏慢于生态迁移，<strong>致命原因是系统与开发者脱节</strong>。相似点是品牌强、组织重。关键差异在于生态控制力。" },
              { brand: "Xiaomi · 印度", fate: "中端规模化成功", fate_status: "success", description: "通过高性价比与渠道效率实现放量，<strong>关键差异是供应链响应极快</strong>。相似点是价格带接近。" },
              { brand: "OnePlus · 全球", fate: "品牌上移成功但规模波动", fate_status: "mixed", description: "高端心智建立成功，<strong>致命波动来自渠道策略反复</strong>。相似点是同样依赖社区口碑启动。" }
            ]
          : [
              { brand: "Nokia · Global", fate: "Premium pivot failed, share collapsed", fate_status: "fail", description: "Product cadence lagged platform shift; <strong>fatal gap was OS–developer disconnect</strong>. Similarity: strong brand, heavy org. Key difference: ecosystem control." },
              { brand: "Xiaomi · India", fate: "Scaled successfully in mid-tier", fate_status: "success", description: "Volume came from value + channel efficiency; <strong>key difference was fast supply response</strong>. Similarity: same price band." },
              { brand: "OnePlus · Global", fate: "Brand upmarket succeeded, scale volatile", fate_status: "mixed", description: "Premium mindshare worked; <strong>volatility came from channel strategy flips</strong>. Similarity: community-driven launch." }
            ],
        ceo: tt(
          "CEO Decision: The common success factor is not the lowest price, but stable cadence and channel execution. Failures typically come from org/ecosystem mismatch.",
          "CEO 决策结论：成功样本共同点不是最低价，而是节奏稳定与渠道执行。失败样本主要死于组织和生态错配。"
        )
      },
      m08: {
        title: tt("Module 08 | Board Red-Team Debates", "模块 08｜董事会红队对抗"),
        debates: [
          {
            role: tt("Aggressive CFO", "激进 CFO"),
            role_type: "cfo",
            challenge: tt(
              "Your base GM is 22.1%. If volume falls to 1.1M, ROIC drops to 2.4%. Why should we keep funding this?",
              "你给的 Base 毛利 22.1%，一旦销量掉到 110 万台，ROIC 只剩 2.4%，凭什么继续投？"
            ),
            response: tt(
              "Split Year-1 capex into two gates and validate channel sell-through first. <strong>If M9 signed receipts are below 0.8M</strong>, freeze phase-2 spend. <strong>But</strong> capital efficiency in the Bear case remains weak and cannot be hand-waved away.",
              "我们会把首年资本开支分两阶段，先验证渠道周转。<strong>若 M9 未达到 80 万台签收</strong>，冻结第二阶段投放。<strong>但</strong> Bear 场景下资本效率仍然偏弱，这是无法回避的。"
            )
          },
          {
            role: tt("Hard-nosed Supply Expert", "苛刻供应链专家"),
            role_type: "supply",
            challenge: tt(
              "SoC + display are 60%+ of BOM. A 10% move in core parts hits profit immediately. Where is the hedge?",
              "SoC 和屏幕占 BOM 60% 以上，核心物料涨 10% 就冲击利润，你的对冲在哪里？"
            ),
            response: tt(
              "Execute dual-sourcing and quarterly price locks to cover 65% of demand. <strong>We can reduce the impact from -$5.1M to about -$3.4M</strong>. <strong>But</strong> under the Doom demand case, no lock can turn net loss positive.",
              "我们将执行双供切换与季度锁价，先锁定 65% 需求。<strong>物料涨价冲击可从 -$5.1M 压到约 -$3.4M</strong>。<strong>但</strong>在 Doom 需求下，任何锁价都无法扭转净亏。"
            )
          },
          {
            role: tt("Activist Investor", "激进投资者"),
            role_type: "investor",
            challenge: tt(
              "Your composite is only 5.22 and competitive dynamics 4.1. You still talk about exit value—based on what?",
              "你现在综合分只有 5.22，竞争动态 4.1，还要讲退出价值，依据是什么？"
            ),
            response: tt(
              "Exit value depends on mid-tier scale and accumulated data assets, not short-term multiple arbitrage. <strong>We anchor on 24-month retention and service attach</strong>. <strong>But</strong> if rebates get out of control, exit value collapses quickly.",
              "退出逻辑依赖中端规模和数据资产沉淀，不是短期估值套利。<strong>我们以 24 个月留存和服务渗透率作为核心价值锚</strong>。<strong>但</strong>如果渠道返利失控，退出价值会快速折损。"
            )
          }
        ],
        ceo: tt(
          "CEO Decision: After red-teaming, the project can move forward only with quantified milestones. Any risk without measurable monitoring is treated as unresolved.",
          "CEO 决策结论：红队质询后，项目可推进但必须绑定量化里程碑。凡是无法量化监控的风险，一律视作未解决。"
        )
      },
      m09: {
        title: tt("Module 09 | GTM Timeline & Execution Roadmap", "模块 09｜GTM 时间轴与执行路线图"),
        gantt_phases: [
          { label: tt("ID Design", "ID设计"), start_month: 1, end_month: 3, color: "design" },
          { label: tt("HW Development", "硬件研发"), start_month: 2, end_month: 6, color: "eng" },
          { label: tt("Compliance Testing", "认证送测"), start_month: 4, end_month: 6, color: "eng" },
          { label: tt("Pilot Build", "试产"), start_month: 6, end_month: 8, color: "mfg" },
          { label: tt("Ramp-up", "量产爬坡"), start_month: 7, end_month: 10, color: "mfg" },
          { label: tt("Channel Stocking", "渠道铺货"), start_month: 8, end_month: 11, color: "mkt" },
          { label: tt("Launch", "正式上市"), start_month: 10, end_month: 10, color: "live" },
          { label: tt("Post-launch Review", "首波复盘"), start_month: 12, end_month: 14, color: "design" }
        ],
        timeline_events: [
          { date: "M3 · 2025", title: tt("EVT freeze", "EVT 锁版"), desc: tt("Structure + mainboard frozen", "结构与主板方案冻结"), status: "normal" },
          { date: "M5 · 2025", title: tt("Compliance submission", "合规送测"), desc: tt("SAR/EMC/energy tests submitted", "SAR/EMC/能效全项提交"), status: "warn" },
          { date: "M8 · 2025", title: tt("Peak-season warm-up", "旺季窗口预热"), desc: tt("Campaign assets go live", "双11/节庆档期素材上线"), status: "normal" },
          { date: "M9 · 2025", title: tt("Competitor window", "竞品发布窗口"), desc: tt("Top rivals expected to launch", "头部对手新机预期发布"), status: "danger" },
          { date: "M10 · 2025", title: tt("Launch", "上市"), desc: tt("First wave stocking + marketing burst", "渠道首批上架与营销爆发"), status: "normal" },
          { date: "M12 · 2025", title: tt("Review", "复盘"), desc: tt("Price and inventory strategy recalibration", "价格与库存策略校准"), status: "warn" }
        ],
        burn_rate: {
          labels: Array.from({ length: 18 }, (_, i) => `M${i + 1}`),
          data: [0.7, 0.9, 1.1, 1.3, 1.5, 1.6, 1.8, 2.1, 2.4, 2.8, 2.6, 2.1, 1.8, 1.6, 1.4, 1.3, 1.2, 1.1],
          peak_month: 10
        },
        ceo: tt(
          "CEO Decision: The critical factor is milestone quality, not speed. Close compliance and channel contracts before M8, or the M10 launch becomes reactive.",
          "CEO 决策结论：执行路线关键不在速度，而在节点质量。M8 前必须完成合规闭环与渠道签约，否则 M10 上市将被动。"
        )
      },
      m10: {
        title: tt("Module 10 | CEO Final Decision", "模块 10｜CEO 终极决策"),
        verdict: {
          decision: tt("Conditional GO", "有条件通过"),
          conditions: tt("Rebate rate ≤ 11%, M9 receipts ≥ 0.8M, GM ≥ 20%", "渠道返利率≤11%，M9 累计签收≥80万台，GM 稳定≥20%")
        },
        execute_actions: [
          { title: tt("Lock dual-sourcing", "锁定双供采购"), desc: tt("Head of Supply · by M4 complete SoC/display dual-sourcing + quarterly price locks", "供应链负责人 · 截止 M4 完成 SoC/屏幕双供切换并签季度锁价") },
          { title: tt("Rebuild collection terms", "渠道回款机制重构"), desc: tt("Head of Sales · by M6 tie rebates to cash collection to shorten CCC", "销售负责人 · 截止 M6 将返利与回款周期绑定，缩短 CCC") },
          { title: tt("Quality weekly ops", "建立质量周报机制"), desc: tt("Head of Quality · by M5 establish RMA/yield weekly review, 48h incident response", "质量负责人 · 截止 M5 建立 RMA 与良率周报，异常 48h 处置") }
        ],
        circuit_breakers: [
          { title: tt("2 months receipts < 60% plan", "连续2个月签收<计划60%"), desc: tt("Demand validation failed; continued spend only amplifies inventory and cash risk.", "需求验证失败，继续投放只会放大库存与现金流风险") },
          { title: tt("2 months GM < 15%", "毛利率连续2个月<15%"), desc: tt("Unit economics break; promo-driven margin loss is hard to recover.", "单位经济失效，渠道促销侵蚀利润不可逆") },
          { title: tt("2 months RMA > 4.5%", "RMA率连续2个月>4.5%"), desc: tt("Quality issues will punch through brand and after-sales cost structure.", "质量问题将击穿品牌与售后成本结构") }
        ],
        pre_mortem: [
          { rank: 1, cause: tt("Rebates spiral, margin collapses", "渠道返利失控导致利润坍塌"), early_warning: tt("Rebate rate > 12% and inventory turn > 52 days", "返利率>12% 且库存周转>52天") },
          { rank: 2, cause: tt("Core parts inflation + volume miss", "核心物料涨价+销量不达预期双杀"), early_warning: tt("Quarterly SoC/display price increase > 8%", "SoC/屏幕采购价季度涨幅>8%") },
          { rank: 3, cause: tt("UX reputation breaks, repurchase falls", "产品体验口碑崩塌拖累复购"), early_warning: tt("Month-1 bad-review rate > 9% and return rate > 6%", "首月差评率>9% 且退货率>6%") }
        ],
        footer_stats: [
          { label: tt("SKU monitored", "SKU 监测"), value: "14,208" },
          { label: tt("Coverage", "覆盖范围"), value: tt("27 countries", "27 国") },
          { label: tt("Confidence interval", "置信区间"), value: "92.6%" }
        ],
        ceo: tt(
          "CEO Decision: With composite score 5.22, the recommendation is Conditional GO. Only scale after the three pre-conditions are met; otherwise downshift immediately.",
          "CEO 决策结论：基于综合评分 5.22，建议 Conditional GO。只有满足三条前置条件才进入放量阶段，否则立即降档执行。"
        )
      }
    };
  }

  function renderMetricHero(items) {
    return `<div class="module-grid">${items
      .map(item => {
        const trend = item.trend
          ? `<div class="module-trend ${item.trend_direction === "up" ? "up" : "down"}">${item.trend}</div>`
          : "";
        const sub = item.subtitle ? `<div class="module-sub">${item.subtitle}</div>` : "";
        return `<div class="card card-primary-ring metric-hero"><div class="module-label">${item.label}</div><div class="module-value">${item.value}</div>${trend}${sub}</div>`;
      })
      .join("")}</div>`;
  }

  function renderBarChart({ labels, data, highlight_index }) {
    const numeric = data.map(v => (typeof v === "number" ? v : Number(v) || 0));
    const max = Math.max(...numeric, 0);
    const showEvery = labels.length > 12 ? 2 : 1;
    const cols = numeric
      .map((v, i) => {
        const h = max ? Math.round((v / max) * 100) : 0;
        const isHighlight = i === highlight_index;
        const label = i % showEvery === 0 ? labels[i] : "";
        const currentTag = tt("Now", "当前");
        return `
          <div class="gi-bar-col${isHighlight ? " gi-bar-current" : ""}">
            ${isHighlight ? `<div class="gi-bar-current-tag">${currentTag}</div>` : ""}
            <div class="gi-bar${isHighlight ? " active" : ""}" style="--h:${h}%; animation: barGrow 0.9s forwards;"></div>
            <span class="gi-bar-label${isHighlight ? " gi-bar-label-active" : ""}">${label}</span>
          </div>
        `;
      })
      .join("");
    return `<div class="gi-bar-chart"><div class="gi-bar-group">${cols}</div></div>`;
  }

  function toPolylinePoints(series, w, h, padding) {
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    return series
      .map((v, i) => {
        const x = padding + (i * (w - padding * 2)) / (series.length - 1);
        const y = padding + (1 - (v - min) / span) * (h - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  function renderLineChart({ labels, series }) {
    const w = 640;
    const h = 220;
    const padding = 16;
    const points = series.map(s => toPolylinePoints(s.data, w, h, padding));
    return `
      <div class="mod-line-chart" role="img" aria-label="趋势图">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <polyline fill="none" stroke="${CHART_COLORS.primary}" stroke-width="2" points="${points[0]}"></polyline>
          <polyline fill="none" stroke="${CHART_COLORS.success}" stroke-width="2" points="${points[1]}"></polyline>
          <polyline fill="none" stroke="${CHART_COLORS.purple}" stroke-width="2" points="${points[2]}"></polyline>
        </svg>
        <div class="mod-legend">${series.map((s, i) => `<span class="mod-legend-item"><span class="mod-legend-dot dot-${i}"></span>${s.label}</span>`).join("")}</div>
      </div>
    `;
  }

  function renderSparkline(series, color) {
    const w = 640;
    const h = 140;
    const padding = 10;
    const pts = toPolylinePoints(series, w, h, padding);
    return `
      <div class="mod-spark">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"></polyline>
        </svg>
      </div>
    `;
  }

  function getNavLabel(title) {
    const m = String(title).match(/(\d{2})/);
    const num = m ? m[1] : "";
    const parts = String(title).split(/[｜|]/);
    const hint = (parts[1] || parts[0] || "").replace(/^模块\s*\d+\s*/i, "").trim().slice(0, isCn() ? 4 : 6);
    return hint ? `${num} ${hint}`.trim() : num;
  }

  function renderGiInfoCard(title, bodyHtml) {
    return `<div class="gi-price-card"><div class="gi-price-header">${title}</div>${bodyHtml}</div>`;
  }

  function renderGiChartCard(title, sub, bodyHtml) {
    const subHtml = sub ? `<p class="gi-chart-sub">${sub}</p>` : "";
    return `<div class="gi-chart-card"><div class="gi-chart-header"><div><h3 class="gi-chart-title">${title}</h3>${subHtml}</div></div>${bodyHtml}</div>`;
  }

  function renderDetails(summaryTitle, contentHtml, open = false) {
    return `<details class="mod-details"${open ? " open" : ""}><summary class="mod-details-summary"><span>${summaryTitle}</span><span class="mod-details-chev" aria-hidden="true"></span></summary><div class="mod-details-body">${contentHtml}</div></details>`;
  }

  function renderContextPath(chapterLabel, moduleLabel) {
    return `
      <div class="module-context-path" aria-label="${tt("Current location", "当前位置")}">
        <span>${tt("Industry Insights", "行业洞察")}</span>
        <span class="sep">/</span>
        <span>${chapterLabel}</span>
        <span class="sep">/</span>
        <span>${moduleLabel}</span>
      </div>
    `;
  }

  function renderModuleConclusion(content) {
    return `<div class="gi-price-card module-conclusion-card"><div class="gi-price-header">${tt("Module Conclusion", "模块结论")}</div><div class="ceo-conclusion">${content}</div></div>`;
  }

  function renderKpiStrip(items) {
    return `<div class="kpi-strip">${items.map(i => `<div class="kpi-item"><div class="module-label">${i.label}</div><div class="module-value">${i.value}</div></div>`).join("")}</div>`;
  }

  function renderPriceDist(items) {
    return `<div class="card">${items.map(i => `<div class="price-dist-item"><div class="module-row"><span>${i.label} (${i.range})</span><strong>${i.pct}%</strong></div><div class="price-dist-bar"><div class="fill${i.highlight ? " highlight" : ""}" style="width:${i.pct}%"></div></div></div>`).join("")}</div>`;
  }

  function renderModule(tabId, moduleId, data) {
    if (moduleId === "m01") {
      const metricCards = data.hero_metrics || [];
      const kpis = data.kpi_strip || [];
      const top5Text = metricCards[2]?.subtitle?.replace(/^Top5:\s*/i, "") || "";
      const top5List = top5Text
        ? top5Text.split("|").map(s => s.trim()).filter(Boolean)
        : [];
      const priceDist = data.price_distribution || [];
      return `
        <div class="gi-kpi-grid">
          <div class="gi-kpi-card gi-kpi-revenue">
            <div class="gi-kpi-top">
              <span class="gi-kpi-label">${metricCards[0]?.label || tt("Market Size (Revenue)", "市场规模（营收）")}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="9" width="7" height="12" rx="1"/></svg>
            </div>
            <div class="gi-kpi-value-row">
              <span class="gi-kpi-big">${metricCards[0]?.value || "--"}</span>
              <span class="gi-kpi-change ${metricCards[0]?.trend_direction === "down" ? "down" : "up"}">${metricCards[0]?.trend || ""}</span>
            </div>
            <div class="gi-kpi-sub">${metricCards[0]?.subtitle || ""}</div>
          </div>
          <div class="gi-kpi-card gi-kpi-asp">
            <div class="gi-kpi-top">
              <span class="gi-kpi-label">${metricCards[1]?.label || tt("Average Selling Price (ASP)", "平均售价 ASP")}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="3" stroke="#93C5FD" stroke-width="1.5"/><path d="M5 8h6M8 5v6" stroke="#93C5FD" stroke-width="1.5"/></svg>
            </div>
            <div class="gi-kpi-value-row">
              <span class="gi-kpi-big">${metricCards[1]?.value || "--"}</span>
              <span class="gi-kpi-change ${metricCards[1]?.trend_direction === "down" ? "down" : "up"}">${metricCards[1]?.trend || ""}</span>
            </div>
            <div class="gi-kpi-sub">${metricCards[1]?.subtitle || ""}</div>
          </div>
          <div class="gi-kpi-card gi-kpi-share">
            <div class="gi-kpi-label" style="opacity:0.85">${tt("Top 5 Market Share", "Top 5 市场份额")}</div>
            <div class="gi-share-body">
              <div class="gi-share-list">
                ${top5List.map(item => {
                  const parts = item.split(/\s+/);
                  const share = parts.pop() || "";
                  const name = parts.join(" ");
                  return `<div class="gi-share-item"><span class="gi-dot"></span><span>${name}</span><strong>${share}</strong></div>`;
                }).join("")}
              </div>
              <div class="gi-share-big">
                <span class="gi-share-pct">${metricCards[2]?.value || "--"}</span>
                <span class="gi-share-tag">CR5</span>
              </div>
            </div>
          </div>
        </div>

        <div class="gi-metric-row">
          ${kpis.map(k => `<div class="gi-metric-card"><div class="gi-metric-label">${k.label}</div><div class="gi-metric-value">${k.value}</div></div>`).join("")}
        </div>

        <div class="gi-chart-row">
          <div class="gi-chart-card">
            <div class="gi-chart-header">
              <div>
                <h3 class="gi-chart-title">${tt("Shipment Index", "出货指数")}</h3>
                <p class="gi-chart-sub">${tt("Last 8 quarters", "最近 8 个季度")}</p>
              </div>
            </div>
            ${renderBarChart(data.shipment_chart)}
          </div>
          <div class="gi-right-col">
            <div class="gi-price-card">
              <div class="gi-price-header">${tt("Price Band Distribution", "价格带分布")}</div>
              ${priceDist.map(p => `<div class="gi-price-item${p.highlight ? " gi-price-highlight" : ""}"><div class="gi-price-row"><span>${p.label} (${p.range})</span><strong>${p.pct}%</strong></div><div class="gi-price-bar"><div class="gi-price-fill${p.highlight ? " highlight" : ""}" style="width:${p.pct}%"></div></div></div>`).join("")}
            </div>
            <div class="gi-ai-card"><div class="gi-ai-label">${tt("AI INSIGHT", "AI 智能洞察")}</div><p>${data.ai_insight}</p></div>
          </div>
        </div>

        <div class="gi-price-card">
          <div class="gi-price-header">${tt("Key Takeaways", "分析要点")}</div>
          <div class="module-text">${data.analysis}</div>
        </div>
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m02") {
      return `
        ${renderGiChartCard(tt("Search Demand Trends", "搜索需求趋势"), tt("Last 12 months (index 0-100)", "近 12 个月（指数 0-100）"), `<div class="chart-wrap">${renderLineChart({
          labels: ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"],
          series: [
            { label: data.search_trends.keywords[0], data: data.search_trends.data.k1 },
            { label: data.search_trends.keywords[1], data: data.search_trends.data.k2 },
            { label: data.search_trends.keywords[2], data: data.search_trends.data.k3 }
          ]
        })}</div>`)}
        ${renderGiInfoCard(tt("Pain Points from Reviews", "竞品评论痛点"), `<div class="module-label">${data.source}</div><div class="keyword-list">${data.pain_points.map(p => `<span class="keyword-tag${p.hot ? " hot" : ""}">${p.text}</span>`).join("")}</div>`)}
        ${renderGiInfoCard(tt("Demand Gap Summary", "需求缺口判断"), `<div class="module-text">${data.gap}</div>`)}
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m03") {
      const primary = data.competitors.find(c => c.is_primary_threat) || data.competitors[0];
      const listHtml = `<div class="competitor-grid">${data.competitors.map(c => `<div class="gi-kpi-card comp-card${c.is_primary_threat ? " primary-threat" : ""}"><div class="gi-chart-title">${c.brand}</div><div class="module-text compact">BOM: ${c.estimated_bom}</div><div class="module-text compact">${tt("Retail", "售价")}: ${c.retail_price}</div><div class="module-text compact">${tt("Gross Margin", "毛利")}: ${c.gross_margin}</div><div class="module-text compact">${tt("Refresh", "迭代")}: ${c.refresh_cycle}</div><div class="module-text compact">${tt("Channel", "渠道")}: ${c.channel_strategy}</div><div class="module-text compact">${tt("Price Floor", "价格地板")}: ${c.price_floor}</div></div>`).join("")}</div>`;
      return `
        ${renderGiInfoCard(tt("Primary Threat", "核心威胁机型"), `<div class="gi-kpi-card comp-card primary-threat"><div class="gi-chart-title">${primary.brand}</div><div class="module-text compact">BOM: ${primary.estimated_bom}</div><div class="module-text compact">${tt("Retail", "售价")}: ${primary.retail_price}</div><div class="module-text compact">${tt("Gross Margin", "毛利")}: ${primary.gross_margin}</div><div class="module-text compact">${tt("Refresh", "迭代")}: ${primary.refresh_cycle}</div><div class="module-text compact">${tt("Channel", "渠道")}: ${primary.channel_strategy}</div><div class="module-text compact">${tt("Price Floor", "价格地板")}: ${primary.price_floor}</div></div>`)}
        ${renderDetails(tt("Show all competitors", "展开全部竞品"), listHtml, false)}
        ${renderGiInfoCard(tt("Competitive Floor Analysis", "竞争地板分析"), `<div class="module-text">${data.analysis}</div>`)}
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m04") {
      return `
        ${renderGiInfoCard(tt("12-Dimension Scores", "十二维评分"), `${data.radar_scores.map(r => `<div class="dim-row"><span>${r.dim}</span><strong>${r.score.toFixed(1)}</strong><span class="badge-${r.status}">${r.badge}</span></div>`).join("")}`)}
        <div class="module-row summary-row"><span>${tt("Composite", "综合评分")} ${data.composite_score.toFixed(2)}</span><span>${tt("Danger", "红区")} ${data.danger_count}</span><span>${tt("OK", "绿区")} ${data.ok_count}</span></div>
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m05") {
      return `
        <div class="scenario-bar">${["base", "bear", "doom"].map(k => `<button class="scenario-btn${k === "base" ? " active" : ""}" data-scenario="${k}">${data.scenarios[k].label}</button>`).join("")}</div>
        <div id="scenario-metrics" class="gi-price-card"></div>
        ${renderDetails(
          tt("Show cashflow & sensitivity", "展开现金流与敏感度"),
          `${renderGiChartCard(tt("36-Month Cumulative Cashflow", "36 个月累计现金流"), "", `<div class="chart-wrap" id="cashflow-wrap"></div>`)}
           <div id="sensitivity-table" class="gi-price-card"></div>`,
          false
        )}
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m06") {
      return `
        <div class="gi-price-card">
          ${data.simulator_params.map(p => `<div class="sim-row"><label>${p.label}: <strong id="sim-${p.id}-value">${p.default}${p.unit}</strong></label><input type="range" id="sim-${p.id}" min="${p.min}" max="${p.max}" value="${p.default}" step="${p.step}"></div>`).join("")}
          <div class="module-grid sim-output">
            <div class="gi-kpi-card"><div class="module-label">${tt("Revenue", "收入")}</div><div id="sim-out-revenue" class="module-value">-</div></div>
            <div class="gi-kpi-card"><div class="module-label">${tt("GM", "毛利率")}</div><div id="sim-out-gm" class="module-value">-</div></div>
            <div class="gi-kpi-card"><div class="module-label">${tt("Net Profit", "净利润")}</div><div id="sim-out-profit" class="module-value">-</div></div>
            <div class="gi-kpi-card"><div class="module-label">${tt("Survival", "生存性")}</div><div id="sim-out-survival" class="module-value">-</div></div>
          </div>
          <div id="sim-insight" class="gi-ai-card"><div class="gi-ai-label">${tt("INSIGHT", "洞察")}</div><p></p></div>
        </div>
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m07") {
      return `
        ${renderDetails(
          tt("Show analogue cases", "展开类比案例"),
          `<div class="analogue-grid">${data.analogues.map(a => `<div class="gi-kpi-card analogue-card fate-${a.fate_status}"><div class="gi-chart-title">${a.brand}</div><div class="module-label">${a.fate}</div><div class="module-text compact">${a.description}</div></div>`).join("")}</div>`,
          true
        )}
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m08") {
      return `
        ${data.debates.map(d => renderDetails(
          `${d.role} · ${tt("Challenge", "质询")}`,
          `<div class="gi-price-card debate-card ${d.role_type}"><div class="module-text"><strong>${tt("Challenge:", "质询：")}</strong>${d.challenge}</div><div class="module-text"><strong>${tt("Response:", "回应：")}</strong>${d.response}</div></div>`,
          false
        )).join("")}
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    if (moduleId === "m09") {
      return `
        ${renderGiInfoCard(tt("Gantt Phases", "甘特图阶段"), `${data.gantt_phases.map(g => `<div class="gantt-row"><span>${g.label}</span><div class="gantt-track"><div class="gantt-bar ${g.color}" style="left:${((g.start_month - 1) / 14) * 100}%; width:${((g.end_month - g.start_month + 1) / 14) * 100}%"></div></div></div>`).join("")}`)}
        ${renderGiInfoCard(tt("Key Timeline Events", "关键节点"), `<div class="timeline">${data.timeline_events.map(t => `<div class="timeline-item ${t.status}"><div class="module-label">${t.date}</div><div class="gi-chart-title">${t.title}</div><div class="module-text compact">${t.desc}</div></div>`).join("")}</div>`)}
        ${renderGiChartCard(tt("18-Month Burn Rate", "18 个月 Burn Rate"), "", `<div class="chart-wrap">${renderBarChart({ labels: data.burn_rate.labels, data: data.burn_rate.data, highlight_index: data.burn_rate.peak_month - 1 })}</div>`)}
        ${renderModuleConclusion(data.ceo)}
      `;
    }
    return `
      <div class="decision-panel">
        <div class="decision-header">${data.verdict.decision}</div>
        <div class="decision-body">${data.verdict.conditions}</div>
      </div>
      ${renderDetails(
        tt("Show execution actions & breakers", "展开执行动作与熔断"),
        `<div class="module-grid">
           <div class="gi-price-card">${data.execute_actions.map((a, i) => `<div class="action-item"><span class="num-exec">${i + 1}</span><div><div class="gi-chart-title">${a.title}</div><div class="module-text compact">${a.desc}</div></div></div>`).join("")}</div>
           <div class="gi-price-card">${data.circuit_breakers.map((a, i) => `<div class="action-item"><span class="num-kill">${i + 1}</span><div><div class="gi-chart-title">${a.title}</div><div class="module-text compact">${a.desc}</div></div></div>`).join("")}</div>
         </div>`,
        false
      )}
      ${renderDetails(
        tt("Show pre-mortem", "展开预判死因"),
        `<div class="gi-price-card">${data.pre_mortem.map(p => `<div class="premort-item"><span class="premort-rank">#${p.rank}</span><div><div class="gi-chart-title">${p.cause}</div><div class="module-text compact">${p.early_warning}</div></div></div>`).join("")}</div>
         <div class="kpi-strip">${data.footer_stats.map(f => `<div class="kpi-item"><div class="module-label">${f.label}</div><div class="module-value">${f.value}</div></div>`).join("")}</div>`,
        false
      )}
      ${renderModuleConclusion(data.ceo)}
    `;
  }

  function renderScenarioContent(data, key) {
    const s = data.scenarios[key];
    const metrics = document.getElementById("scenario-metrics");
    if (metrics) {
      metrics.innerHTML = `
        <div class="module-grid">
          <div><div class="module-label">${tt("Revenue", "收入")}</div><div class="module-value">${s.revenue}</div><div class="module-sub">${s.revenue_detail}</div></div>
          <div><div class="module-label">${tt("Gross Margin", "毛利率")}</div><div class="module-value">${s.gross_margin}</div><div class="module-sub">${s.gm_detail}</div></div>
          <div><div class="module-label">${tt("ROIC (3Y)", "ROIC(3年)")}</div><div class="module-value">${s.roic_3yr}</div><div class="module-sub">${s.roic_detail}</div></div>
          <div><div class="module-label">${tt("BEP", "盈亏平衡")}</div><div class="module-value">${s.bep_month}</div><div class="module-sub">${s.bep_detail}</div></div>
        </div>
      `;
    }
    const sens = document.getElementById("sensitivity-table");
    if (sens) {
      const survivalTextMap = isCn()
        ? { ok: "正常", warn: "警告", danger: "危险" }
        : { ok: "ok", warn: "warn", danger: "danger" };
      sens.innerHTML = `<table class="sens-table"><thead><tr><th>${tt("Variable", "变量")}</th><th>${tt("Shock", "冲击")}</th><th>${tt("Impact", "影响")}</th><th>${tt("Survival", "生存性")}</th></tr></thead><tbody>${data.sensitivity[key].map(r => `<tr><td>${r.variable}</td><td>${r.shock}</td><td>${r.impact}</td><td class="surv-${r.survival}">${survivalTextMap[r.survival] || r.survival}</td></tr>`).join("")}</tbody></table>`;
    }
    const wrap = document.getElementById("cashflow-wrap");
    if (wrap) {
      wrap.innerHTML = renderSparkline(data.cashflow_curve[key], CHART_COLORS.primary);
    }
  }

  function switchScenario(key) {
    if (!scenarioContext?.data) return;
    renderScenarioContent(scenarioContext.data, key);
    document.querySelectorAll(".scenario-btn[data-scenario]").forEach(btn => btn.classList.toggle("active", btn.dataset.scenario === key));
  }

  function runSimulator() {
    if (!simContext) return;
    const asp = Number(document.getElementById("sim-asp").value);
    const vol = Number(document.getElementById("sim-vol").value);
    const bomDelta = Number(document.getElementById("sim-bom").value);
    const cac = Number(document.getElementById("sim-cac").value);
    document.getElementById("sim-asp-value").textContent = `$${asp}`;
    document.getElementById("sim-vol-value").textContent = isCn() ? `${vol}万台` : `${vol}×10k`;
    document.getElementById("sim-bom-value").textContent = `${bomDelta}%`;
    document.getElementById("sim-cac-value").textContent = `$${cac}`;

    const bom = simContext.base_bom * (1 + bomDelta / 100);
    const netASP = asp * (1 - simContext.channel_margin);
    const sepCost = asp * simContext.sep_rate;
    const gm = ((netASP - bom - sepCost) / netASP) * 100;
    const revenue = (asp * vol * 10000) / 1e6;
    const totalCAC = (cac * vol * 10000) / 1e6;
    const opex = revenue * simContext.opex_rate;
    const netProfit = revenue * (gm / 100) - totalCAC - opex;

    const survivalKey = netProfit < 0 ? "fatal" : gm < 15 ? "critical" : gm < 20 || netProfit < 3 ? "marginal" : "viable";
    const survivalLabelMap = isCn()
      ? { fatal: "致命", critical: "临界", marginal: "边缘", viable: "可行" }
      : { fatal: "fatal", critical: "critical", marginal: "marginal", viable: "viable" };
    const insight = survivalKey === "fatal"
      ? tt("Net profit is negative; not survivable.", "当前组合现金流为负，不具备持续经营条件。")
      : survivalKey === "critical"
        ? tt("Gross margin buffer is too thin; optimize BOM and channel take-rate immediately.", "毛利安全垫不足，需立即优化 BOM 与渠道扣点。")
        : survivalKey === "marginal"
          ? tt("Operationally possible but fragile; validate with controlled volume first.", "项目可运行但抗风险弱，建议先控量验证。")
          : tt("Model enters viable zone; consider accelerating channel expansion.", "模型进入可持续区间，可考虑加速渠道扩张。");

    document.getElementById("sim-out-revenue").textContent = `$${revenue.toFixed(1)}M`;
    document.getElementById("sim-out-gm").textContent = `${gm.toFixed(1)}%`;
    document.getElementById("sim-out-profit").textContent = `$${netProfit.toFixed(1)}M`;
    document.getElementById("sim-out-survival").textContent = survivalLabelMap[survivalKey];
    const insightBox = document.getElementById("sim-insight");
    const insightText = insightBox?.querySelector("p");
    if (insightText) insightText.textContent = insight;
  }

  function bindModuleEvents(moduleId, moduleData) {
    if (moduleId === "m05") {
      scenarioContext = { data: moduleData };
      renderScenarioContent(moduleData, "base");
      document.querySelectorAll(".scenario-btn[data-scenario]").forEach(btn => btn.addEventListener("click", () => switchScenario(btn.dataset.scenario)));
    }
    if (moduleId === "m06") {
      simContext = moduleData.financial_model;
      ["asp", "vol", "bom", "cac"].forEach(id => document.getElementById(`sim-${id}`)?.addEventListener("input", runSimulator));
      runSimulator();
    }
  }

  let currentMatrixTab = "macro";

  function openDeepDive(moduleId, moduleData) {
    const drawer = document.getElementById("deep-dive-drawer");
    const titleEl = document.getElementById("drawer-title");
    const bodyEl = document.getElementById("drawer-body");
    
    if (!drawer || !titleEl || !bodyEl) return;
    
    titleEl.textContent = moduleData.title || tt("Deep Dive", "深度洞察");
    bodyEl.innerHTML = renderModule("global-insights", moduleId, moduleData);
    
    bindModuleEvents(moduleId, moduleData);
    drawer.classList.add("open");
  }

  function closeDeepDive() {
    const drawer = document.getElementById("deep-dive-drawer");
    if (drawer) drawer.classList.remove("open");
  }

  // Bind close event once
  document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("drawer-close");
    if (closeBtn) closeBtn.addEventListener("click", closeDeepDive);
  });

  function renderExecutiveSummary(ctx) {
    const home = ctx.verticalData?.home;
    if (!home) return;

    const takeawayEl = document.getElementById("exec-takeaway-text");
    if (takeawayEl) {
      takeawayEl.textContent = isCn() 
        ? "大盘总量趋于见顶，利润增长的核心在于产品结构升级（ASP上升）与严格的渠道返利管控。" 
        : "Volume growth is flattening; profitability now relies strictly on mix upgrade (ASP growth) and tight rebate control.";
    }

    const takeawayLabel = document.querySelector(".exec-takeaway-label");
    if (takeawayLabel) {
      takeawayLabel.textContent = isCn() ? "核心摘要" : "Executive Summary";
    }

    const grid = document.getElementById("vital-metrics-grid");
    if (grid) {
      const i18n = window.SintechI18n;
      const mSize = (isCn() && i18n) ? i18n.convertCurrency(home.marketSize) : home.marketSize;
      const asp = (isCn() && i18n) ? i18n.convertCurrency(home.asp) : home.asp;
      
      const upIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
      const downIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>';

      grid.innerHTML = `
        <div class="gi-kpi-card gi-kpi-revenue">
          <div class="gi-kpi-top">
            <span class="gi-kpi-label">${tt("Market Size", "市场规模（营收）")}</span>
          </div>
          <div class="gi-kpi-value-row">
            <span class="gi-kpi-big">${mSize}</span>
            <span class="gi-kpi-change ${home.marketChange >= 0 ? "up" : "down"}">${home.marketChange >= 0 ? upIcon : downIcon} ${Math.abs(home.marketChange)}%</span>
          </div>
        </div>
        <div class="gi-kpi-card gi-kpi-asp">
          <div class="gi-kpi-top">
            <span class="gi-kpi-label">${tt("ASP", "平均售价 ASP")}</span>
          </div>
          <div class="gi-kpi-value-row">
            <span class="gi-kpi-big">${asp}</span>
            <span class="gi-kpi-change ${home.aspChange >= 0 ? "up" : "down"}">${home.aspChange >= 0 ? upIcon : downIcon} ${Math.abs(home.aspChange)}%</span>
          </div>
        </div>
        <div class="gi-kpi-card gi-kpi-share">
          <div class="gi-kpi-label" style="opacity:0.85">${tt("Top 5 Concentration", "Top 5 集中度")}</div>
          <div class="gi-share-body" style="align-items:center;">
            <div class="gi-share-big">
              <span class="gi-share-pct">${home.concentration}</span>
              <span class="gi-share-tag">CR5</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  function renderMatrixContent(tab, data) {
    function renderMatrixCard({ title, badge, bodyHtml, actionsHtml = "", full = false, primary = false }) {
      return `
        <section class="matrix-card${full ? " matrix-card-full" : ""}${primary ? " matrix-card-primary" : ""}">
          <div class="matrix-card-title">
            <span>${title}</span>
            <span class="gi-badge">${badge}</span>
          </div>
          <div class="module-workspace matrix-module-body">${bodyHtml}</div>
          ${actionsHtml ? `<div class="matrix-actions">${actionsHtml}</div>` : ""}
        </section>
      `;
    }

    function deepDiveBtn(moduleId, label = null) {
      const text = label || tt("View Deep Dive", "查看深度溯源");
      return `<button class="btn-deep-dive" data-module="${moduleId}">${text}</button>`;
    }

    function renderM01Preview(m) {
      const metricCards = m.hero_metrics || [];
      const kpis = m.kpi_strip || [];
      const top5Text = metricCards[2]?.subtitle?.replace(/^Top5:\s*/i, "") || "";
      const top5List = top5Text ? top5Text.split("|").map(s => s.trim()).filter(Boolean) : [];
      const priceDist = m.price_distribution || [];
      const currentH = m.shipment_chart?.data?.[m.shipment_chart?.highlight_index ?? 0] ?? "";
      const i18n = window.SintechI18n || null;
      const aspRaw = metricCards[1]?.value || "";
      const aspVal = isCn() && i18n ? i18n.convertCurrency(String(aspRaw)) : aspRaw;
      const aiInsight = isCn()
        ? `“本季度出货指数${currentH}，均价 ${aspVal}。”`
        : `“Shipment index ${currentH}, ASP ${aspVal}.”`;
      return `
        <div class="gi-kpi-grid">
          <div class="gi-kpi-card gi-kpi-revenue">
            <div class="gi-kpi-top">
              <span class="gi-kpi-label">${metricCards[0]?.label || tt("Market Size (Revenue)", "市场规模（营收）")}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="9" width="7" height="12" rx="1"/></svg>
            </div>
            <div class="gi-kpi-value-row">
              <span class="gi-kpi-big">${metricCards[0]?.value || "--"}</span>
              <span class="gi-kpi-change ${metricCards[0]?.trend_direction === "down" ? "down" : "up"}">${metricCards[0]?.trend || ""}</span>
            </div>
            <div class="gi-kpi-sub">${metricCards[0]?.subtitle || ""}</div>
          </div>
          <div class="gi-kpi-card gi-kpi-asp">
            <div class="gi-kpi-top">
              <span class="gi-kpi-label">${metricCards[1]?.label || tt("Average Selling Price (ASP)", "平均售价 ASP")}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="3" stroke="#93C5FD" stroke-width="1.5"/><path d="M5 8h6M8 5v6" stroke="#93C5FD" stroke-width="1.5"/></svg>
            </div>
            <div class="gi-kpi-value-row">
              <span class="gi-kpi-big">${metricCards[1]?.value || "--"}</span>
              <span class="gi-kpi-change ${metricCards[1]?.trend_direction === "down" ? "down" : "up"}">${metricCards[1]?.trend || ""}</span>
            </div>
            <div class="gi-kpi-sub">${metricCards[1]?.subtitle || ""}</div>
          </div>
          <div class="gi-kpi-card gi-kpi-share">
            <div class="gi-kpi-label" style="opacity:0.85">${tt("Top 5 Market Share", "Top 5 市场份额")}</div>
            <div class="gi-share-body">
              <div class="gi-share-list">
                ${top5List.map(item => {
                  const parts = item.split(/\s+/);
                  const share = parts.pop() || "";
                  const name = parts.join(" ");
                  return `<div class="gi-share-item"><span class="gi-dot"></span><span>${name}</span><strong>${share}</strong></div>`;
                }).join("")}
              </div>
              <div class="gi-share-big">
                <span class="gi-share-pct">${metricCards[2]?.value || "--"}</span>
                <span class="gi-share-tag">CR5</span>
              </div>
            </div>
          </div>
        </div>
        <div class="gi-metric-row matrix-metric-row">
          ${kpis.map(k => `<div class="gi-metric-card"><div class="gi-metric-label">${k.label}</div><div class="gi-metric-value">${k.value}</div></div>`).join("")}
        </div>
        <div class="gi-chart-row">
          <div class="gi-chart-card">
            <div class="gi-chart-header">
              <div>
                <h3 class="gi-chart-title">${tt("Shipment Index", "出货指数")}</h3>
                <p class="gi-chart-sub">${tt("Last 8 quarters", "最近 8 个季度")}</p>
              </div>
            </div>
            ${renderBarChart(m.shipment_chart)}
          </div>
          <div class="gi-right-col">
            <div class="gi-price-card">
              <div class="gi-price-header">${tt("Price Band Distribution", "价格带分布")}</div>
              ${priceDist.map(p => `<div class="gi-price-item${p.highlight ? " gi-price-highlight" : ""}"><div class="gi-price-row"><span>${p.label} (${p.range})</span><strong>${p.pct}%</strong></div><div class="gi-price-bar"><div class="gi-price-fill${p.highlight ? " highlight" : ""}" style="width:${p.pct}%"></div></div></div>`).join("")}
            </div>
            <div class="gi-ai-card"><div class="gi-ai-label">${tt("AI INSIGHT", "AI 智能洞察")}</div><p>${aiInsight}</p></div>
          </div>
        </div>
        <div class="gi-price-card">
          <div class="gi-price-header">${tt("Key Takeaways", "分析要点")}</div>
          <div class="module-text">${m.analysis}</div>
        </div>
        ${renderModuleConclusion(m.ceo)}
      `;
    }

    function renderM05Preview(m) {
      const base = m.scenarios?.base;
      const bear = m.scenarios?.bear;
      const doom = m.scenarios?.doom;
      const survivalTextMap = isCn()
        ? { ok: "正常", warn: "警告", danger: "危险" }
        : { ok: "ok", warn: "warn", danger: "danger" };
      const sensRows = (m.sensitivity?.base || []).map(r => `<tr><td>${r.variable}</td><td>${r.shock}</td><td>${r.impact}</td><td class="surv-${r.survival}">${survivalTextMap[r.survival] || r.survival}</td></tr>`).join("");
      return `
        <div class="gi-price-card">
          <div class="gi-price-header">${tt("Scenario Summary", "三种情景摘要")}</div>
          <div class="matrix-scenario-grid">
            <div class="matrix-scenario-col">
              <div class="module-label">${base?.label || "Base"}</div>
              <div class="module-text compact">${tt("Revenue", "收入")}: <strong>${base?.revenue || "-"}</strong></div>
              <div class="module-text compact">${tt("Gross Margin", "毛利率")}: <strong>${base?.gross_margin || "-"}</strong></div>
              <div class="module-text compact">ROIC(3Y): <strong>${base?.roic_3yr || "-"}</strong></div>
              <div class="module-text compact">${tt("BEP", "盈亏平衡")}: <strong>${base?.bep_month || "-"}</strong></div>
            </div>
            <div class="matrix-scenario-col">
              <div class="module-label">${bear?.label || "Bear"}</div>
              <div class="module-text compact">${tt("Revenue", "收入")}: <strong>${bear?.revenue || "-"}</strong></div>
              <div class="module-text compact">${tt("Gross Margin", "毛利率")}: <strong>${bear?.gross_margin || "-"}</strong></div>
              <div class="module-text compact">ROIC(3Y): <strong>${bear?.roic_3yr || "-"}</strong></div>
              <div class="module-text compact">${tt("BEP", "盈亏平衡")}: <strong>${bear?.bep_month || "-"}</strong></div>
            </div>
            <div class="matrix-scenario-col">
              <div class="module-label">${doom?.label || "Doom"}</div>
              <div class="module-text compact">${tt("Revenue", "收入")}: <strong>${doom?.revenue || "-"}</strong></div>
              <div class="module-text compact">${tt("Gross Margin", "毛利率")}: <strong>${doom?.gross_margin || "-"}</strong></div>
              <div class="module-text compact">ROIC(3Y): <strong>${doom?.roic_3yr || "-"}</strong></div>
              <div class="module-text compact">${tt("BEP", "盈亏平衡")}: <strong>${doom?.bep_month || "-"}</strong></div>
            </div>
          </div>
        </div>
        ${renderGiChartCard(tt("36-Month Cashflow (Base)", "36个月现金流（Base）"), "", `<div class="chart-wrap">${renderSparkline((m.cashflow_curve?.base || []).slice(0, 36), CHART_COLORS.primary)}</div>`)}
        <div class="gi-price-card">
          <div class="gi-price-header">${tt("Sensitivity (Base)", "敏感度（Base）")}</div>
          <table class="sens-table">
            <thead><tr><th>${tt("Variable", "变量")}</th><th>${tt("Shock", "冲击")}</th><th>${tt("Impact", "影响")}</th><th>${tt("Survival", "生存性")}</th></tr></thead>
            <tbody>${sensRows}</tbody>
          </table>
        </div>
        ${renderModuleConclusion(m.ceo)}
      `;
    }

    function renderM06Preview(m) {
      const params = Array.isArray(m.simulator_params) ? m.simulator_params : [];
      const getDefault = (id, fallback) => params.find(p => p.id === id)?.default ?? fallback;
      const asp = Number(getDefault("asp", 198));
      const vol = Number(getDefault("vol", 220));
      const bomDelta = Number(getDefault("bom", 0));
      const cac = Number(getDefault("cac", 14));
      const fm = m.financial_model || { base_bom: 121, channel_margin: 0.35, sep_rate: 0.05, opex_rate: 0.08 };
      const bom = fm.base_bom * (1 + bomDelta / 100);
      const netASP = asp * (1 - fm.channel_margin);
      const sepCost = asp * fm.sep_rate;
      const gm = ((netASP - bom - sepCost) / netASP) * 100;
      const revenue = (asp * vol * 10000) / 1e6;
      const totalCAC = (cac * vol * 10000) / 1e6;
      const opex = revenue * fm.opex_rate;
      const netProfit = revenue * (gm / 100) - totalCAC - opex;
      const survivalKey = netProfit < 0 ? "fatal" : gm < 15 ? "critical" : gm < 20 || netProfit < 3 ? "marginal" : "viable";
      const survivalLabelMap = isCn()
        ? { fatal: "致命", critical: "临界", marginal: "边缘", viable: "可行" }
        : { fatal: "fatal", critical: "critical", marginal: "marginal", viable: "viable" };
      const i18n = window.SintechI18n || null;
      const cc = (s) => (isCn() && i18n ? i18n.convertCurrency(s) : s);
      const revText = cc(`$${revenue.toFixed(1)}M`);
      const profitText = cc(`$${netProfit.toFixed(1)}M`);
      const aspText = cc(`$${asp}`);
      const cacText = cc(`$${cac}`);
      return `
        <div class="kpi-strip matrix-kpi-strip">
          <div class="kpi-item"><div class="module-label">${tt("Revenue", "收入")}</div><div class="module-value">${revText}</div></div>
          <div class="kpi-item"><div class="module-label">${tt("GM", "毛利率")}</div><div class="module-value">${gm.toFixed(1)}%</div></div>
          <div class="kpi-item"><div class="module-label">${tt("Net Profit", "净利润")}</div><div class="module-value">${profitText}</div></div>
          <div class="kpi-item"><div class="module-label">${tt("Survival", "生存性")}</div><div class="module-value">${survivalLabelMap[survivalKey]}</div></div>
        </div>
        <div class="gi-price-card">
          <div class="gi-price-header">${tt("Default Inputs", "默认输入")}</div>
          <div class="matrix-inputs">
            <div class="module-text compact">${tt("ASP", "ASP")}： <strong>${aspText}</strong></div>
            <div class="module-text compact">${tt("Y1 Volume", "Y1 销量")}: <strong>${isCn() ? `${vol}万台` : `${vol}×10k`}</strong></div>
            <div class="module-text compact">BOM: <strong>${bomDelta}%</strong></div>
            <div class="module-text compact">CAC: <strong>${cacText}</strong></div>
          </div>
        </div>
        ${renderModuleConclusion(m.ceo)}
      `;
    }

    let html = '<div class="matrix-grid">';
    if (tab === "macro") {
      html += renderMatrixCard({
        title: tt("Macro Context & Constraints", "宏观态势与物理边界"),
        badge: "M01",
        bodyHtml: renderM01Preview(data.m01),
        actionsHtml: deepDiveBtn("m01"),
        full: true
      });
      html += renderMatrixCard({
        title: tt("Demand Signal Validation", "需求信号验证"),
        badge: "M02",
        bodyHtml: renderModule("global-insights", "m02", data.m02),
        actionsHtml: deepDiveBtn("m02"),
        full: true
      });
    } else if (tab === "competition") {
      html += renderMatrixCard({
        title: tt("Competitive Landscape Breakdown", "竞争格局深度拆解"),
        badge: "M03",
        bodyHtml: renderModule("global-insights", "m03", data.m03),
        actionsHtml: deepDiveBtn("m03"),
        full: true
      });
      html += renderMatrixCard({
        title: tt("12-Dimension Operating Matrix", "十二维经营矩阵"),
        badge: "M04",
        bodyHtml: renderModule("global-insights", "m04", data.m04),
        actionsHtml: deepDiveBtn("m04")
      });
      html += renderMatrixCard({
        title: tt("Historical Analogues", "历史类比案例库"),
        badge: "M07",
        bodyHtml: renderModule("global-insights", "m07", data.m07),
        actionsHtml: deepDiveBtn("m07")
      });
    } else if (tab === "risk") {
      html += renderMatrixCard({
        title: tt("Capital Efficiency & Stress Test", "资本效率与压力测试"),
        badge: "M05",
        bodyHtml: renderM05Preview(data.m05),
        actionsHtml: deepDiveBtn("m05"),
        full: true
      });
      html += renderMatrixCard({
        title: tt("Interactive Scenario Simulator", "交互式场景模拟器"),
        badge: "M06",
        bodyHtml: renderM06Preview(data.m06),
        actionsHtml: deepDiveBtn("m06")
      });
      html += renderMatrixCard({
        title: tt("Board Red-Team Debates", "董事会红队对抗"),
        badge: "M08",
        bodyHtml: renderModule("global-insights", "m08", data.m08),
        actionsHtml: deepDiveBtn("m08")
      });
      html += renderMatrixCard({
        title: tt("GTM Timeline & Execution Roadmap", "GTM 时间轴与执行路线图"),
        badge: "M09",
        bodyHtml: renderModule("global-insights", "m09", data.m09),
        actionsHtml: deepDiveBtn("m09"),
        full: true
      });
      html += renderMatrixCard({
        title: tt("CEO Final Decision", "CEO 终极决策"),
        badge: "M10",
        bodyHtml: renderModule("global-insights", "m10", data.m10),
        actionsHtml: deepDiveBtn("m10"),
        full: true,
        primary: true
      });
    }
    html += "</div>";
    
    const container = document.getElementById("matrix-content");
    if (container) {
      container.innerHTML = html;
      
      // Bind deep dive buttons
      container.querySelectorAll(".btn-deep-dive").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const mId = e.currentTarget.dataset.module;
          openDeepDive(mId, data[mId]);
        });
      });
    }
  }

  function render({ panel, tabId, vertical, verticalData, market, priceSegment, dataQuarter, lang }) {
    currentLang = lang === "cn" ? "cn" : "en";
    
    // Only render for global-insights in Matrix mode
    if (tabId !== "global-insights") return;
    
    const data = getModuleData({ vertical, verticalData, market, priceSegment, dataQuarter, lang });
    
    // 1. Render Executive Summary (Level 1)
    renderExecutiveSummary({ verticalData });
    
    // 2. Render Active Matrix Tab (Level 2)
    renderMatrixContent(currentMatrixTab, data);
    
    // 3. Bind Matrix Tab Clicks
    const tabs = document.querySelectorAll(".matrix-tab-btn");
    tabs.forEach(t => {
      const key = t.dataset.matrix;
      if (key === "macro") t.textContent = tt("Macro & Market", "宏观与市场面");
      if (key === "competition") t.textContent = tt("Competitive Landscape", "竞争与格局面");
      if (key === "risk") t.textContent = tt("Risks & Opportunities", "风险与破局点");
      
      // Clean up old listeners by cloning
      const newT = t.cloneNode(true);
      t.parentNode.replaceChild(newT, t);
      
      newT.addEventListener("click", (e) => {
        const matrixKey = e.currentTarget.dataset.matrix;
        currentMatrixTab = matrixKey;
        
        document.querySelectorAll(".matrix-tab-btn").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.matrix === matrixKey);
        });
        
        renderMatrixContent(matrixKey, data);
      });
    });
  }

  window.switchScenario = switchScenario;
  window.runSimulator = runSimulator;

  return {
    render
  };
})();

window.SintechModules = SintechModules;
