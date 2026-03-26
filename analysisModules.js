/**
 * Sintech — Analysis Modules
 * Three-tab matrix: Macro / Competition / Demand Trends
 * Data-driven from verticalData.{home, macro, competition, demand}
 */

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

  let currentLang = "en";
  let currentMatrixTab = "macro";

  // ==============================
  // Utilities
  // ==============================
  function isCn() { return currentLang === "cn"; }
  function tt(en, cn) { return isCn() ? cn : en; }

  function getCategoryName(vertical) {
    const map = {
      en: { smartphones: "Smartphones", glasses: "Smart Glasses", wearables: "Smart Watches", "smart-home": "Smart Home", entertainment: "Entertainment", health: "Smart Health", mobility: "Smart Mobility" },
      cn: { smartphones: "智能手机", glasses: "智能眼镜", wearables: "智能手表", "smart-home": "智能家居", entertainment: "影音娱乐", health: "智能健康", mobility: "车载智能" }
    };
    return map[isCn() ? "cn" : "en"][vertical] || tt("Smart Hardware", "智能硬件");
  }

  function formatPct(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "";
    return `${value >= 0 ? "+" : ""}${value}%`;
  }

  function toShortQuarterLabel(label) {
    const m = String(label).match(/(20\d{2})\s*Q(\d)/);
    return m ? `${m[1].slice(2)}Q${m[2]}` : label;
  }

  // ==============================
  // Render Helpers
  // ==============================
  function renderBarChart({ labels, data, highlight_index }) {
    const numeric = data.map(v => (typeof v === "number" ? v : Number(v) || 0));
    const max = Math.max(...numeric, 0);
    const showEvery = labels.length > 12 ? 2 : 1;
    const cols = numeric.map((v, i) => {
      const h = max ? Math.round((v / max) * 100) : 0;
      const isHighlight = i === highlight_index;
      const label = i % showEvery === 0 ? labels[i] : "";
      return `
        <div class="gi-bar-col${isHighlight ? " gi-bar-current" : ""}">
          ${isHighlight ? `<div class="gi-bar-current-tag">${tt("Now", "当前")}</div>` : ""}
          <div class="gi-bar${isHighlight ? " active" : ""}" style="--h:${h}%; animation: barGrow 0.9s forwards;"></div>
          <span class="gi-bar-label${isHighlight ? " gi-bar-label-active" : ""}">${label}</span>
        </div>
      `;
    }).join("");
    return `<div class="gi-bar-chart"><div class="gi-bar-group">${cols}</div></div>`;
  }

  function toPolylinePoints(series, w, h, padding) {
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    return series.map((v, i) => {
      const x = padding + (i * (w - padding * 2)) / (series.length - 1);
      const y = padding + (1 - (v - min) / span) * (h - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  function renderLineChart({ labels, series }) {
    const w = 640, h = 220, padding = 16;
    const colors = [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.purple];
    const points = series.map(s => toPolylinePoints(s.data, w, h, padding));
    return `
      <div class="mod-line-chart" role="img" aria-label="趋势图">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          ${points.map((pts, i) => `<polyline fill="none" stroke="${colors[i] || CHART_COLORS.primary}" stroke-width="2" points="${pts}"></polyline>`).join("")}
        </svg>
        <div class="mod-legend">${series.map((s, i) => `<span class="mod-legend-item"><span class="mod-legend-dot dot-${i}"></span>${s.label}</span>`).join("")}</div>
      </div>
    `;
  }

  function renderSparkline(series, color) {
    if (!series || series.length === 0) return "";
    const w = 640, h = 140, padding = 10;
    const pts = toPolylinePoints(series, w, h, padding);
    return `
      <div class="mod-spark">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"></polyline>
        </svg>
      </div>
    `;
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

  function renderModuleConclusion(content) {
    return `<div class="gi-price-card module-conclusion-card"><div class="gi-price-header">${tt("Key Takeaway", "核心结论")}</div><div class="ceo-conclusion">${content}</div></div>`;
  }

  function renderMatrixCard({ title, badge, bodyHtml, actionsHtml = "", full = false, primary = false }) {
    return `
      <section class="matrix-card${full ? " matrix-card-full" : ""}${primary ? " matrix-card-primary" : ""}">
        <div class="matrix-card-title">
          <span>${title}</span>
          ${badge ? `<span class="gi-badge">${badge}</span>` : ""}
        </div>
        <div class="module-workspace matrix-module-body">${bodyHtml}</div>
        ${actionsHtml ? `<div class="matrix-actions">${actionsHtml}</div>` : ""}
      </section>
    `;
  }

  // ==============================
  // Data Layer
  // ==============================
  function getModuleData({ verticalData }) {
    return {
      home: verticalData?.home || {},
      macro: verticalData?.macro || {},
      competition: verticalData?.competition || {},
      demand: verticalData?.demand || {}
    };
  }

  // ==============================
  // Core Data Card (used in Macro tab)
  // ==============================
  function renderCoreDataCard(home) {
    const i18n = window.SintechI18n || null;
    const marketSizeVal = isCn() && i18n ? i18n.convertCurrency(home.marketSize || "") : (home.marketSize || "--");
    const aspVal = isCn() && i18n ? i18n.convertCurrency(home.asp || "") : (home.asp || "--");
    const marketSubVal = isCn() && i18n ? i18n.convertMarketSub(home.marketSub || "") : (home.marketSub || "");
    const aspSubVal = isCn() && i18n ? i18n.convertMarketSub(home.aspSub || "") : (home.aspSub || "");
    const top5Text = Array.isArray(home.top5) ? home.top5.slice(0, 5).map(b => `${b.n} ${b.s}`).join(" | ") : "";
    const top5List = top5Text ? top5Text.split("|").map(s => s.trim()).filter(Boolean) : [];
    const quarterly = Array.isArray(home.quarterly) ? home.quarterly.slice(0, 8) : [];
    const highlightIdx = quarterly.findIndex(x => x && x.current);
    const currentIndex = highlightIdx >= 0 ? highlightIdx : Math.max(quarterly.length - 2, 0);
    const currentH = quarterly[currentIndex]?.h ?? "";
    const bands = Array.isArray(home.priceBands) ? home.priceBands : [];
    const priceDist = bands.map(b => {
      const raw = String(isCn() && i18n ? i18n.convertPriceBandLabel(b.label || "") : b.label || "");
      const m = raw.match(/^([^(]+)\s*\((.+)\)\s*$/);
      return { label: m ? m[1].trim() : raw, range: m ? m[2].trim() : "", pct: b.pct, highlight: Boolean(b.hl) };
    });
    const kpis = Array.isArray(home.metrics)
      ? home.metrics.map(m => ({
          label: isCn() && i18n ? i18n.convertMetricLabel(m.label) : m.label,
          value: isCn() && i18n ? i18n.convertMetricValue(m.label, m.value) : m.value
        }))
      : [];
    const aiInsight = isCn()
      ? `"本季度出货指数${currentH}，均价 ${aspVal}。"`
      : `"Shipment index ${currentH}, ASP ${aspVal}."`;

    return `
      <div class="gi-kpi-grid">
        <div class="gi-kpi-card gi-kpi-revenue">
          <div class="gi-kpi-top">
            <span class="gi-kpi-label">${tt("Market Size (Revenue)", "市场规模（营收）")}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="9" width="7" height="12" rx="1"/></svg>
          </div>
          <div class="gi-kpi-value-row">
            <span class="gi-kpi-big">${marketSizeVal}</span>
            <span class="gi-kpi-change ${home.marketChange >= 0 ? "up" : "down"}">${formatPct(home.marketChange)}</span>
          </div>
          <div class="gi-kpi-sub">${marketSubVal}</div>
        </div>
        <div class="gi-kpi-card gi-kpi-asp">
          <div class="gi-kpi-top">
            <span class="gi-kpi-label">${tt("Average Selling Price (ASP)", "平均售价 ASP")}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="3" stroke="#93C5FD" stroke-width="1.5"/><path d="M5 8h6M8 5v6" stroke="#93C5FD" stroke-width="1.5"/></svg>
          </div>
          <div class="gi-kpi-value-row">
            <span class="gi-kpi-big">${aspVal}</span>
            <span class="gi-kpi-change ${home.aspChange >= 0 ? "up" : "down"}">${formatPct(home.aspChange)}</span>
          </div>
          <div class="gi-kpi-sub">${aspSubVal}</div>
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
              <span class="gi-share-pct">${home.concentration || "--"}</span>
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
          ${renderBarChart({ labels: quarterly.map(q => toShortQuarterLabel(q.label)), data: quarterly.map(q => q.h), highlight_index: currentIndex })}
        </div>
        <div class="gi-right-col">
          <div class="gi-price-card">
            <div class="gi-price-header">${tt("Price Band Distribution", "价格带分布")}</div>
            ${priceDist.map(p => `<div class="gi-price-item${p.highlight ? " gi-price-highlight" : ""}"><div class="gi-price-row"><span>${p.label} (${p.range})</span><strong>${p.pct}%</strong></div><div class="gi-price-bar"><div class="gi-price-fill${p.highlight ? " highlight" : ""}" style="width:${p.pct}%"></div></div></div>`).join("")}
          </div>
          <div class="gi-ai-card"><div class="gi-ai-label">${tt("AI INSIGHT", "AI 智能洞察")}</div><p>${aiInsight}</p></div>
        </div>
      </div>
    `;
  }

  // ==============================
  // Level 1: Executive Summary
  // ==============================
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
          <div class="gi-kpi-top"><span class="gi-kpi-label">${tt("Market Size", "市场规模（营收）")}</span></div>
          <div class="gi-kpi-value-row">
            <span class="gi-kpi-big">${mSize}</span>
            <span class="gi-kpi-change ${home.marketChange >= 0 ? "up" : "down"}">${home.marketChange >= 0 ? upIcon : downIcon} ${Math.abs(home.marketChange)}%</span>
          </div>
        </div>
        <div class="gi-kpi-card gi-kpi-asp">
          <div class="gi-kpi-top"><span class="gi-kpi-label">${tt("ASP", "平均售价 ASP")}</span></div>
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

  // ==============================
  // Tab Renderers
  // ==============================

  function renderMacroTab(data) {
    const { home, macro } = data;
    const lang = isCn() ? "cn" : "en";
    let html = "";

    // Card 1: Market Commentary (full)
    const marketSummary = macro.marketSummary?.[lang] || "";
    const strategicRec = macro.strategicRecommendation?.[lang] || "";
    if (marketSummary || strategicRec) {
      html += renderMatrixCard({
        title: tt("Market Commentary", "市场评述"),
        badge: tt("Analysis", "分析"),
        full: true,
        bodyHtml: `
          <div class="gi-price-card" style="margin-bottom:10px">
            <div class="gi-price-header">${tt("Market Summary", "行业概况")}</div>
            <div class="module-text">${marketSummary}</div>
          </div>
          <div class="gi-ai-card">
            <div class="gi-ai-label">${tt("STRATEGIC RECOMMENDATION", "应对措施建议")}</div>
            <p>${strategicRec}</p>
          </div>
        `
      });
    }

    // Card 2: Hype Cycle Stage
    const hype = macro.hypeCycleStage || {};
    const hypeLabel = hype.label?.[lang] || "";
    const hypeDesc = hype.description?.[lang] || "";
    const hypeStage = hype.stage || "growing";
    const stageBadgeMap = {
      price_capture: tt("Price Capture Phase", "价格获取期"),
      marginalization: tt("Marginalization Phase", "边缘化阶段"),
      growing: tt("Rapid Adoption Phase", "快速采纳期"),
      mature: tt("Mature Phase", "成熟期"),
      nascent: tt("Nascent Phase", "萌芽期"),
      early_adopters: tt("Early Adopter Phase", "早期采用期")
    };
    if (hypeLabel) {
      html += renderMatrixCard({
        title: tt("Industry Hype Cycle Position", "行业周期定位"),
        badge: "2025 Q3",
        bodyHtml: `
          <div class="hype-cycle-indicator hype-${hypeStage}">
            <div class="hype-stage-label">${hypeLabel}</div>
            <div class="hype-stage-badge">${stageBadgeMap[hypeStage] || hypeStage}</div>
            <div class="module-text" style="margin-top:8px">${hypeDesc}</div>
          </div>
        `
      });
    }

    // Card 3: Core Data (full)
    html += renderMatrixCard({
      title: tt("Core Market Data", "核心市场数据"),
      badge: tt("Scale · ASP · TOP5 · Metrics · Shipments", "规模 · ASP · TOP5 · 指标 · 出货"),
      full: true,
      bodyHtml: renderCoreDataCard(home)
    });

    return html;
  }

  function renderCompetitionTab(data) {
    const { competition } = data;
    const lang = isCn() ? "cn" : "en";
    let html = "";

    // Card 1: Price Segment Players (full)
    const segments = competition.priceSegmentPlayers || [];
    if (segments.length > 0) {
      html += renderMatrixCard({
        title: tt("Price Segment Players & Cost Structure", "价位段核心玩家与成本结构"),
        badge: tt("Market Structure", "市场结构"),
        full: true,
        bodyHtml: `
          <div class="segment-grid">
            ${segments.map(seg => `
              <div class="gi-kpi-card">
                <div class="gi-chart-title">${seg.band?.[lang] || ""}</div>
                ${(seg.players || []).map(p => `<div class="gi-share-item"><span class="gi-dot"></span><span>${p.brand}</span><strong>${p.share}</strong></div>`).join("")}
                <div style="margin-top:8px;border-top:1px solid var(--outline-variant);padding-top:8px">
                  <div class="module-text compact">BOM: <strong>${seg.costStructure?.avgBom || "-"}</strong></div>
                  <div class="module-text compact">${tt("Retail", "零售价")}: <strong>${seg.costStructure?.avgRetailPrice || "-"}</strong></div>
                  <div class="module-text compact">GM: <strong>${seg.costStructure?.avgGrossMargin || "-"}</strong></div>
                </div>
              </div>
            `).join("")}
          </div>
        `
      });
    }

    // Card 2: Core Model Teardown (full)
    const td = competition.coreModelTeardown || {};
    if (td.model) {
      html += renderMatrixCard({
        title: tt("Core Model Deep Dive", "当季核心机型深度拆解"),
        badge: td.model,
        full: true,
        bodyHtml: `
          <div class="gi-kpi-grid" style="margin-bottom:12px">
            <div class="gi-kpi-card gi-kpi-revenue">
              <div class="gi-kpi-label">BOM</div>
              <div class="gi-kpi-big">${td.bom || "--"}</div>
            </div>
            <div class="gi-kpi-card gi-kpi-asp">
              <div class="gi-kpi-label">${tt("Retail Price", "零售价")}</div>
              <div class="gi-kpi-big">${td.retailPrice || "--"}</div>
            </div>
            <div class="gi-kpi-card gi-kpi-share">
              <div class="gi-kpi-label">${tt("Gross Margin", "毛利率")}</div>
              <div class="gi-kpi-big">${td.grossMargin || "--"}</div>
            </div>
          </div>
          <div class="dim-row-list">
            <div class="dim-row"><span>${tt("Iteration Cycle", "迭代周期")}</span><strong>${td.iterationCycle?.[lang] || "--"}</strong></div>
            <div class="dim-row"><span>${tt("Sales Channels", "销售渠道")}</span><strong>${td.salesChannels?.[lang] || "--"}</strong></div>
            <div class="dim-row"><span>${tt("Price Floor", "价格地板")}</span><strong>${td.priceFloor || "--"}</strong></div>
            <div class="dim-row"><span>${tt("Launch Date", "上市时间")}</span><strong>${td.launchDate || "--"}</strong></div>
            <div class="dim-row"><span>${tt("Target Audience", "目标人群")}</span><strong>${td.targetAudience?.[lang] || "--"}</strong></div>
            <div class="dim-row"><span>${tt("Reach Audience", "辐射人群")}</span><strong>${td.radiationAudience?.[lang] || "--"}</strong></div>
          </div>
          ${(td.sellingPoints?.[lang] || []).length > 0 ? `
            <div class="gi-price-card" style="margin-top:10px">
              <div class="gi-price-header">${tt("Key Selling Points", "核心卖点")}</div>
              ${(td.sellingPoints[lang]).map((pt, i) => `<div class="pain-point-item"><span class="pain-rank">${i + 1}</span><span>${pt}</span></div>`).join("")}
            </div>
          ` : ""}
        `
      });
    }

    // Card 3: Competitor Comparison Table (full)
    const comps = competition.competitorComparison || [];
    if (comps.length > 0) {
      html += renderMatrixCard({
        title: tt("Competitor Comparison Table", "竞品对比表"),
        badge: `${comps.length} ${tt("Models", "款机型")}`,
        full: true,
        bodyHtml: `
          <div class="table-scroll-wrapper">
            <table class="sens-table comp-table">
              <thead>
                <tr>
                  <th>${tt("Model / Brand", "机型 / 品牌")}</th>
                  <th>BOM</th>
                  <th>${tt("Retail", "零售价")}</th>
                  <th>GM</th>
                  <th>${tt("Launch", "上市")}</th>
                  <th>${tt("Cycle", "迭代")}</th>
                  <th>${tt("Channel", "渠道")}</th>
                  <th>${tt("Floor", "地板价")}</th>
                  <th>${tt("Selling Points", "核心卖点")}</th>
                  <th>${tt("Target Audience", "目标人群")}</th>
                </tr>
              </thead>
              <tbody>
                ${comps.map(c => `
                  <tr>
                    <td><strong>${c.model}</strong><br><span style="opacity:0.7;font-size:11px">${c.brand}</span></td>
                    <td>${c.bom || "--"}</td>
                    <td>${c.retailPrice || "--"}</td>
                    <td>${c.grossMargin || "--"}</td>
                    <td>${c.launchDate || "--"}</td>
                    <td>${c.iterationCycle?.[lang] || "--"}</td>
                    <td>${c.salesChannels?.[lang] || "--"}</td>
                    <td>${c.priceFloor || "--"}</td>
                    <td>${(c.sellingPoints?.[lang] || []).map(pt => `<span class="keyword-tag">${pt}</span>`).join(" ")}</td>
                    <td>${c.targetAudience?.[lang] || "--"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `
      });
    }

    // Card 4: Asymmetric Advantages
    const advs = competition.asymmetricAdvantages || [];
    if (advs.length > 0) {
      html += renderMatrixCard({
        title: tt("Asymmetric Competitive Advantages", "非对称竞争优势"),
        badge: tt("By Manufacturer", "按厂商"),
        bodyHtml: `
          <div class="module-grid">
            ${advs.map(a => `
              <div class="gi-price-card">
                <div class="gi-price-header">${a.manufacturer}</div>
                ${(a.advantages?.[lang] || []).map((adv, i) => `<div class="pain-point-item"><span class="pain-rank">${i + 1}</span><span>${adv}</span></div>`).join("")}
              </div>
            `).join("")}
          </div>
        `
      });
    }

    // Card 5: Supply Chain Components (full)
    const supply = competition.supplyChainComponents || [];
    if (supply.length > 0) {
      html += renderMatrixCard({
        title: tt("Supply Chain Key Components", "供应链关键元器件"),
        badge: tt("Tier-1 · Tier-2 · Risk", "一级 · 二级 · 风险"),
        full: true,
        bodyHtml: `
          <div class="table-scroll-wrapper">
            <table class="sens-table">
              <thead>
                <tr>
                  <th>${tt("Component", "元器件")}</th>
                  <th>${tt("Tier-1 Suppliers", "一级供应商")}</th>
                  <th>${tt("Tier-2 Suppliers", "二级供应商")}</th>
                  <th>${tt("Maturity", "成熟度")}</th>
                  <th>${tt("Price Trend", "价格趋势")}</th>
                  <th>${tt("Geopolitical Risk", "地缘风险")}</th>
                </tr>
              </thead>
              <tbody>
                ${supply.map(s => `
                  <tr>
                    <td><strong>${s.component?.[lang] || ""}</strong></td>
                    <td>${(s.tier1 || []).join(", ")}</td>
                    <td>${(s.tier2 || []).join(", ")}</td>
                    <td>${s.maturity?.[lang] || "--"}</td>
                    <td>${s.priceTrend?.[lang] || "--"}</td>
                    <td>${s.geopoliticalRisk?.[lang] || "--"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `
      });
    }

    // Card 6: Inventory Turnover
    const inventory = competition.inventoryTurnover || [];
    if (inventory.length > 0) {
      html += renderMatrixCard({
        title: tt("Inventory Turnover", "库存周转"),
        badge: tt("TOP Players · SKU Decay", "TOP玩家 · SKU衰减"),
        bodyHtml: `
          <div class="module-grid">
            ${inventory.map(inv => `
              <div class="gi-price-card">
                <div class="gi-price-header">${inv.brand}</div>
                <div class="dim-row"><span>${tt("Turnover Days", "周转天数")}</span><strong>${inv.turnoverDays} ${tt("days", "天")}</strong></div>
                <div class="dim-row" style="align-items:flex-start"><span>${tt("Depreciation Risk", "跌价风险")}</span><strong style="font-size:12px;text-align:right">${inv.depreciationRisk?.[lang] || "--"}</strong></div>
                <div class="decay-spark-wrap" style="margin-top:8px">
                  ${renderSparkline(inv.skuDecayCurve || [], CHART_COLORS.warning)}
                </div>
                <div class="module-text compact" style="text-align:center;opacity:0.6;margin-top:4px">${tt("SKU Value Decay (12M)", "SKU价值衰减 (12个月)")}</div>
              </div>
            `).join("")}
          </div>
        `
      });
    }

    return html;
  }

  function renderDemandTab(data) {
    const { demand } = data;
    const lang = isCn() ? "cn" : "en";
    let html = "";

    // Card 1: Pain Points by Demographic (full, with tab switching)
    const demographics = demand.painPointsByDemographic || [];
    if (demographics.length > 0) {
      const tabBtns = demographics.map((g, i) =>
        `<button class="scenario-btn demo-tab-btn${i === 0 ? " active" : ""}" data-demo-idx="${i}">${g.group?.[lang] || ""} <span class="demo-price-tag">${g.priceRange?.[lang] || ""}</span></button>`
      ).join("");

      const painPanels = demographics.map((g, i) => `
        <div class="demo-panel" data-demo-panel="${i}" style="${i !== 0 ? "display:none" : ""}">
          ${(g.painPoints || []).map(p => `
            <div class="pain-point-item">
              <span class="pain-rank">${p.rank}</span>
              <span>${p[lang] || p.en || ""}</span>
            </div>
          `).join("")}
        </div>
      `).join("");

      html += renderMatrixCard({
        title: tt("Pain Points by User Group", "用户痛点分类"),
        badge: `${demographics.length} ${tt("Groups", "人群组")}`,
        full: true,
        bodyHtml: `
          <div class="demographic-tabs" id="demo-tabs">${tabBtns}</div>
          <div id="demo-panels" style="margin-top:12px">${painPanels}</div>
        `
      });
    }

    // Card 2: Keyword Search Trends (full)
    const kst = demand.keywordSearchTrends || {};
    if (kst.months && kst.data) {
      const keywords = kst.keywords || [];
      const months = kst.months || [];
      const series = [
        { label: keywords[0]?.[lang] || "k1", data: kst.data.k1 || [] },
        { label: keywords[1]?.[lang] || "k2", data: kst.data.k2 || [] },
        { label: keywords[2]?.[lang] || "k3", data: kst.data.k3 || [] }
      ].filter(s => s.data.length > 0);

      const rpt = kst.reviewPainTrends;
      const painSeries = (rpt && Array.isArray(rpt.categories) && Array.isArray(rpt.series))
        ? rpt.categories.map((cat, i) => ({ label: cat[lang] || "", data: rpt.series[i] || [] })).filter(s => s.data.length > 0)
        : [];

      html += renderMatrixCard({
        title: tt("Keyword Search Trends", "关键词搜索趋势"),
        badge: `${months[0]} – ${months[months.length - 1]}`,
        full: true,
        bodyHtml: `
          ${renderGiChartCard(
            tt("Search Volume Index", "搜索量指数"),
            `${tt("Last", "最近")} ${months.length} ${tt("months", "个月")}`,
            `<div class="chart-wrap">${renderLineChart({ labels: months, series })}</div>`
          )}
          ${painSeries.length > 0 ? renderGiChartCard(
            tt("Review Pain Point Trends", "评论痛点趋势"),
            tt("Monthly mention volume", "月度提及量"),
            `<div class="chart-wrap">${renderLineChart({ labels: months, series: painSeries })}</div>`
          ) : ""}
        `
      });
    }

    // Card 3: Review Pain Point Collection (full, with month switching)
    const rpc = demand.reviewPainPointCollection || {};
    const monthlyData = rpc.monthlyTop10 || [];
    if (monthlyData.length > 0) {
      const monthBtns = monthlyData.map((m, i) =>
        `<button class="scenario-btn month-tab-btn${i === 0 ? " active" : ""}" data-month-idx="${i}">${m.month}</button>`
      ).join("");

      const monthPanels = monthlyData.map((m, i) => `
        <div class="month-panel" data-month-panel="${i}" style="${i !== 0 ? "display:none" : ""}">
          ${(m.painPoints || []).map(p => `
            <div class="pain-point-item" style="margin-bottom:10px;align-items:flex-start">
              <span class="pain-rank">${p.rank}</span>
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
                  <strong>${p.topic?.[lang] || ""}</strong>
                  <span class="keyword-tag">${(p.count || 0).toLocaleString()} ${tt("mentions", "条")}</span>
                </div>
                <div class="verbatim-quote">${p.verbatim?.[lang] || ""}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `).join("");

      html += renderMatrixCard({
        title: tt("Review Pain Point Collection", "用户评论痛点集合"),
        badge: `${rpc.totalReviews || "--"} ${tt("Reviews", "条评论")}`,
        full: true,
        bodyHtml: `
          <div class="demographic-tabs" id="month-tabs">${monthBtns}</div>
          <div id="month-panels" style="margin-top:12px">${monthPanels}</div>
        `
      });
    }

    return html;
  }

  // ==============================
  // Matrix Content Orchestrator
  // ==============================
  function renderMatrixContent(tab, data) {
    const container = document.getElementById("matrix-content");
    if (!container) return;

    let html = '<div class="matrix-grid">';
    if (tab === "macro") html += renderMacroTab(data);
    else if (tab === "competition") html += renderCompetitionTab(data);
    else if (tab === "demand") html += renderDemandTab(data);
    html += "</div>";

    container.innerHTML = html;

    // Bind demographic tab interactions
    container.querySelectorAll(".demo-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.demoIdx;
        container.querySelectorAll(".demo-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.demoIdx === idx));
        container.querySelectorAll("[data-demo-panel]").forEach(p => {
          p.style.display = p.dataset.demoPanel === idx ? "" : "none";
        });
      });
    });

    // Bind month tab interactions
    container.querySelectorAll(".month-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.monthIdx;
        container.querySelectorAll(".month-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.monthIdx === idx));
        container.querySelectorAll("[data-month-panel]").forEach(p => {
          p.style.display = p.dataset.monthPanel === idx ? "" : "none";
        });
      });
    });
  }

  // Bind drawer close button once
  document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("drawer-close");
    if (closeBtn) closeBtn.addEventListener("click", () => {
      const drawer = document.getElementById("deep-dive-drawer");
      if (drawer) drawer.classList.remove("open");
    });
  });

  // ==============================
  // Main Render Entry Point
  // ==============================
  function render({ panel, tabId, vertical, verticalData, market, priceSegment, dataQuarter, lang }) {
    currentLang = lang === "cn" ? "cn" : "en";
    if (tabId !== "global-insights") return;

    const data = getModuleData({ verticalData });

    // 1. Executive Summary (Level 1)
    renderExecutiveSummary({ verticalData });

    // 2. Active Matrix Tab (Level 2)
    renderMatrixContent(currentMatrixTab, data);

    // 3. Matrix Tab Clicks
    const tabs = document.querySelectorAll(".matrix-tab-btn");
    tabs.forEach(t => {
      const key = t.dataset.matrix;
      if (key === "macro") t.textContent = tt("Macro", "宏观面");
      if (key === "competition") t.textContent = tt("Competition", "竞争面");
      if (key === "demand") t.textContent = tt("Demand Trends", "需求趋势");

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

  return { render };
})();

window.SintechModules = SintechModules;
