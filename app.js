/**
 * Sintech — Core Application Logic
 * Modularized architecture with DOM caching, performance optimizations, and security fixes.
 * Robust structure with separation of concerns: Logic (JS) and Data (JSON).
 */

const SintechApp = (() => {
  // ==============================
  // App State & Data Layer
  // ==============================
  const state = {
    currentVertical: "smartphones",
    currentTimeView: "quarterly",
    activeTab: "global-insights",
    domCache: new Map(),
    data: null // Will hold the fetched data from data.json
  };

  const SAFE_ICON_PATHS = {
    smartphones: "<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"3\"/><circle cx=\"12\" cy=\"18\" r=\"1\"/>",
    glasses: "<circle cx=\"6\" cy=\"15\" r=\"4\"/><circle cx=\"18\" cy=\"15\" r=\"4\"/><path d=\"M10 15h4\"/><path d=\"M2 15h0\"/><path d=\"M22 15h0\"/>",
    wearables: "<circle cx=\"12\" cy=\"12\" r=\"7\"/><path d=\"M12 1v3\"/><path d=\"M12 20v3\"/>",
    "smart-home": "<path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/>",
    entertainment: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M7 20h10\"/>",
    health: "<path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/>",
    mobility: "<rect x=\"1\" y=\"3\" width=\"15\" height=\"13\" rx=\"2\"/><path d=\"M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1\"/><circle cx=\"5.5\" cy=\"18.5\" r=\"2.5\"/><circle cx=\"18.5\" cy=\"18.5\" r=\"2.5\"/><path d=\"M8 18.5h8\"/>"
  };

  // ==============================
  // Fetch Engine (Simulated Backend API)
  // ==============================
  async function loadData() {
    try {
      const response = await fetch("data.json");
      if (!response.ok) throw new Error("Network response was not ok");
      state.data = await response.json();
      console.log("Sintech Data loaded successfully");
      return true;
    } catch (error) {
      console.error("Failed to load Sintech data:", error);
      showToast("System error: Failed to fetch market data.");
      return false;
    }
  }

  // ==============================
  // DOM Cache Helper
  // ==============================
  function getEl(selector, parent = document) {
    const key = parent === document ? selector : `${parent.id || parent.className}-${selector}`;
    if (!state.domCache.has(key)) {
      const el = parent.querySelector(selector);
      if (el) state.domCache.set(key, el); // 只缓存已存在的元素，避免缓存 null
      return el;
    }
    return state.domCache.get(key);
  }

  function getEls(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  // ==============================
  // Language Logic
  // ==============================
  function switchLanguage(lang) {
    if (!SintechI18n.setLang(lang)) return;

    document.documentElement.lang = lang === "cn" ? "zh-CN" : "en";
    const brandName = SintechI18n.t("brandName");
    document.title = lang === "cn" ? `${brandName} — 智能硬件行业分析` : `${brandName} — Smart Hardware Analytics`;

    getEls(".lang-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.lang === lang);
      b.setAttribute("aria-pressed", b.dataset.lang === lang);
    });

    const tabKeys = ["tabHome", "tabIndustry", "tabConsumer", "tabDashboard"];
    getEls(".tab-btn").forEach((btn, i) => {
      if (tabKeys[i]) btn.textContent = SintechI18n.t(tabKeys[i]);
    });

    injectSidebars();
    updateActivePanel();
    updateStaticText();
  }

  function updateStaticText() {
    getEls(".gi-footer-copy").forEach(fc => {
      const spans = fc.querySelectorAll("span");
      if (spans[0]) spans[0].textContent = SintechI18n.t("copyright");
      if (spans[spans[1] ? 1 : 0]) spans[spans[1] ? 1 : 0].textContent = SintechI18n.t("proAccess");
    });

    const home = document.getElementById("global-insights");
    if (home) {
      const subtitle = home.querySelector(".gi-subtitle");
      if (subtitle) subtitle.textContent = SintechI18n.getLang() === "en"
        ? "Real-time monitoring of global hardware market dynamics, integrating multi-dimensional data models to provide deep industry growth path analysis."
        : "实时监控全球硬件市场动态，融合多维数据模型，提供深度行业增长路径分析。";

      const kpiLabels = home.querySelectorAll(".gi-kpi-label");
      if (kpiLabels[0]) kpiLabels[0].textContent = SintechI18n.t("marketSizeLabel");
      if (kpiLabels[1]) kpiLabels[1].textContent = SintechI18n.t("aspLabel");
      if (kpiLabels[2]) kpiLabels[2].textContent = SintechI18n.t("top3Label");

      const chartTitle = home.querySelector(".gi-chart-title");
      if (chartTitle) chartTitle.textContent = SintechI18n.t("chartTitle");
      const chartSub = home.querySelector(".gi-chart-sub");
      if (chartSub) chartSub.textContent = SintechI18n.t("chartSub");

      const toggleBtns = home.querySelectorAll(".gi-toggle-btn");
      if (toggleBtns[0]) toggleBtns[0].textContent = SintechI18n.t("quarterly");
      if (toggleBtns[1]) toggleBtns[1].textContent = SintechI18n.t("yearly");

      const priceHeader = home.querySelector(".gi-price-header span");
      if (priceHeader) priceHeader.textContent = SintechI18n.t("priceBandTitle");
      const deepBtn = home.querySelector(".gi-deep-btn");
      if (deepBtn) deepBtn.textContent = SintechI18n.t("deepPriceBtn");

      home.querySelectorAll(".gi-ai-label").forEach(el => el.textContent = SintechI18n.t("aiLabel"));

      const footerLabels = home.querySelectorAll(".gi-footer-label");
      if (footerLabels[0]) footerLabels[0].textContent = SintechI18n.t("skuMonitored");
      if (footerLabels[1]) footerLabels[1].textContent = SintechI18n.t("coverage");
      if (footerLabels[2]) footerLabels[2].textContent = SintechI18n.t("confidenceInterval");
    }
  }

  // ==============================
  // Sidebar logic
  // ==============================
  function injectSidebars() {
    if (!state.data) return;
    const sidebarLabel = SintechI18n.t("sidebarLabel");
    const VERTICALS = state.data.VERTICALS;

    getEls(".gi-sidebar").forEach(sb => {
      while (sb.firstChild) sb.removeChild(sb.firstChild);

      const labelDiv = document.createElement("div");
      labelDiv.className = "gi-sidebar-label";
      labelDiv.textContent = sidebarLabel;
      sb.appendChild(labelDiv);

      Object.keys(VERTICALS).forEach(key => {
        const name = SintechI18n.getVertName(key);
        const btn = document.createElement("button");
        btn.className = `gi-vert-btn${key === state.currentVertical ? ' active' : ''}`;
        btn.dataset.vert = key;
        btn.setAttribute("aria-selected", key === state.currentVertical);
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SAFE_ICON_PATHS[key] || SAFE_ICON_PATHS.smartphones}</svg>`;
        btn.appendChild(document.createTextNode(` ${name}`));

        btn.addEventListener("click", () => {
          state.currentVertical = key;
          getEls(".gi-vert-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.vert === key);
            b.setAttribute("aria-selected", b.dataset.vert === key);
          });
          updateActivePanel();
        });
        sb.appendChild(btn);
      });
    });
  }

  // ==============================
  // Chart Helpers
  // ==============================
  function buildDonutSVG(segments, labels) {
    const r = 45, c = 2 * Math.PI * r;
    let offset = 0;
    const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

    const svgNamespace = "http://www.w3.org/2000/svg";
    const container = document.createElement("div");
    container.className = "gi-donut-chart";

    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("width", "120");
    svg.setAttribute("height", "120");

    const ring = document.createElementNS(svgNamespace, "circle");
    ring.setAttribute("class", "donut-ring");
    ring.setAttribute("cx", "60");
    ring.setAttribute("cy", "60");
    ring.setAttribute("r", r);
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "var(--surface-container-low)");
    ring.setAttribute("stroke-width", "16");
    svg.appendChild(ring);

    segments.forEach((pct, i) => {
      const dash = (pct / 100) * c;
      const circle = document.createElementNS(svgNamespace, "circle");
      circle.setAttribute("cx", "60");
      circle.setAttribute("cy", "60");
      circle.setAttribute("r", r);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", colors[i]);
      circle.setAttribute("stroke-width", "16");
      circle.setAttribute("stroke-dasharray", `${dash} ${c - dash}`);
      circle.setAttribute("stroke-dashoffset", -offset);
      circle.setAttribute("transform", "rotate(-90 60 60)");
      svg.appendChild(circle);
      offset += dash;
    });

    container.appendChild(svg);

    const legend = document.createElement("div");
    legend.className = "gi-donut-legend";
    segments.forEach((pct, i) => {
      const item = document.createElement("span");
      item.className = "gi-legend-item";
      const dot = document.createElement("span");
      dot.className = "gi-legend-dot";
      dot.style.background = colors[i];
      item.appendChild(dot);
      item.appendChild(document.createTextNode(`${labels[i]} ${pct}%`));
      legend.appendChild(item);
    });
    container.appendChild(legend);

    return container;
  }

  // ==============================
  // Panel Updates
  // ==============================
  function updateActivePanel() {
    if (!state.data) return;
    const v = state.data.VERTICALS[state.currentVertical];
    if (!v) return;
    if (state.activeTab === "global-insights") {
      updateHomePanel(v);
    } else if (state.activeTab === "categories") {
      updateIndustryPanel(v);
    } else if (state.activeTab === "consumer-profile") {
      updateConsumerPanel(v);
    } else if (state.activeTab === "trends") {
      updateDashboardPanel();
    }

    const activePanel = document.getElementById(state.activeTab);
    if (activePanel) {
      activePanel.querySelectorAll("[data-animated]").forEach(el => delete el.dataset.animated);
      animatePanel(activePanel);
    }
  }

  function updateHomePanel(v) {
    const d = v.home;
    if (!d) return;
    const panel = document.getElementById("global-insights");
    if (!panel) return;

    const titleEl = panel.querySelector(".gi-title");
    titleEl.textContent = SintechI18n.t("homeTitlePrefix");
    const highlight = document.createElement("span");
    highlight.className = "gi-highlight";
    highlight.textContent = SintechI18n.getVertName(state.currentVertical);
    titleEl.appendChild(highlight);

    const kpiBig = panel.querySelectorAll(".gi-kpi-big");
    animateNumber(kpiBig[0], SintechI18n.convertCurrency(d.marketSize));
    animateNumber(kpiBig[1], SintechI18n.convertCurrency(d.asp));

    const kpiChanges = panel.querySelectorAll(".gi-kpi-change");
    updateKpiChange(kpiChanges[0], d.marketChange);
    updateKpiChange(kpiChanges[1], d.aspChange);

    const kpiSubs = panel.querySelectorAll(".gi-kpi-sub");
    kpiSubs[0].textContent = SintechI18n.convertMarketSub(d.marketSub);
    kpiSubs[1].textContent = SintechI18n.convertMarketSub(d.aspSub);

    const shareList = panel.querySelector(".gi-share-list");
    while (shareList.firstChild) shareList.removeChild(shareList.firstChild);
    d.top5.forEach(item => {
      const div = document.createElement("div");
      div.className = "gi-share-item";
      const dot = document.createElement("span");
      dot.className = "gi-dot";
      div.appendChild(dot);
      div.appendChild(document.createTextNode(` ${item.n} (${item.s})`));
      shareList.appendChild(div);
    });

    panel.querySelector(".gi-share-pct").textContent = d.concentration;
    panel.querySelector(".gi-share-tag").textContent = SintechI18n.t("concentration");

    const metricCards = panel.querySelectorAll(".gi-metric-card");
    d.metrics.forEach((m, i) => {
      if (!metricCards[i]) return;
      metricCards[i].querySelector(".gi-metric-label").textContent = SintechI18n.convertMetricLabel(m.label);
      const valEl = metricCards[i].querySelector(".gi-metric-value");
      valEl.className = `gi-metric-value ${m.color}`;
      valEl.textContent = SintechI18n.convertMetricValue(m.label, m.value);
    });

    updateBarChart(panel, d);

    const priceItems = panel.querySelectorAll(".gi-price-item");
    d.priceBands.forEach((b, i) => {
      if (!priceItems[i]) return;
      const row = priceItems[i].querySelector(".gi-price-row");
      row.querySelector("span").textContent = SintechI18n.convertPriceBandLabel(b.label);
      row.querySelector("strong").textContent = b.pct + "%";
      const fill = priceItems[i].querySelector(".gi-price-fill");
      fill.style.setProperty("--w", b.pct + "%");
      fill.className = `gi-price-fill${b.hl ? " highlight" : ""}`;
      priceItems[i].className = `gi-price-item${b.hl ? " gi-price-highlight" : ""}`;
    });

    const aiCardP = panel.querySelector(".gi-ai-card p");
    if (aiCardP) aiCardP.textContent = `"${SintechI18n.getHomeAi(state.currentVertical)}"`;
  }

  function updateKpiChange(el, value) {
    el.className = `gi-kpi-change ${value >= 0 ? "up" : "down"}`;
    const arrowUp = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>';
    const arrowDown = '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>';
    el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">${value >= 0 ? arrowUp : arrowDown}</svg> ${Math.abs(value)}%`;
  }

  function updateBarChart(panel, d) {
    const bars = d[state.currentTimeView] || d.quarterly;
    const group = panel.querySelector(".gi-bar-group");
    if (!group) return;

    while (group.firstChild) group.removeChild(group.firstChild);

    const labels = buildBarLabels(bars, state.currentTimeView);

    bars.forEach((b, i) => {
      const col = document.createElement("div");
      col.className = `gi-bar-col${b.current ? " gi-bar-current" : ""}`;

      if (b.current) {
        const tag = document.createElement("span");
        tag.className = "gi-bar-current-tag";
        tag.textContent = SintechI18n.t("current");
        col.appendChild(tag);
      }

      const bar = document.createElement("div");
      bar.className = `gi-bar${b.current ? " active" : ""}`;
      bar.style.setProperty("--h", `${b.h}%`);

      const label = document.createElement("span");
      const labelText = labels[i] || b.label || "";
      label.className = `gi-bar-label gi-bar-label-inside${b.current ? " gi-bar-label-active" : ""}`;
      label.textContent = labelText;
      bar.appendChild(label);

      col.appendChild(bar);
      group.appendChild(col);
    });
  }

  function buildBarLabels(bars, view) {
    const labels = bars.map(b => b.label || "");
    const startIndex = labels.findIndex(l => l && l.trim().length > 0);
    if (startIndex === -1) return labels;

    const startLabel = labels[startIndex].trim();
    if (view === "quarterly") {
      const match = startLabel.match(/(\d{4})\s*Q([1-4])/i);
      if (!match) return labels;
      const startYear = parseInt(match[1], 10);
      const startQuarter = parseInt(match[2], 10);
      return labels.map((l, idx) => {
        if (l && l.trim().length > 0) return l;
        const offset = idx - startIndex;
        const totalQuarter = startQuarter - 1 + offset;
        const year = startYear + Math.floor(totalQuarter / 4);
        const quarter = (totalQuarter % 4) + 1;
        return `${year} Q${quarter}`;
      });
    }

    if (view === "yearly") {
      const yearMatch = startLabel.match(/(\d{4})/);
      if (!yearMatch) return labels;
      const startYear = parseInt(yearMatch[1], 10);
      return labels.map((l, idx) => {
        if (l && l.trim().length > 0) return l;
        return `${startYear + (idx - startIndex)}`;
      });
    }

    return labels;
  }

  function updateIndustryPanel(v) {
    const panel = document.getElementById("categories");
    if (!panel) return;
    const d = v.industry;
    if (!d) return;
    const cats = panel.querySelectorAll(".gi-cat-card");
    const catNames = SintechI18n.getIndustryCats(state.currentVertical);

    const titleEl = panel.querySelector(".gi-title");
    titleEl.textContent = SintechI18n.t("industryTitlePrefix");
    const highlight = document.createElement("span");
    highlight.className = "gi-highlight";
    highlight.textContent = SintechI18n.t("industryTitleHighlight");
    titleEl.appendChild(highlight);

    const subtitle = panel.querySelector(".gi-subtitle");
    if (subtitle) subtitle.textContent = SintechI18n.t("industrySub");

    const kpiLabels = panel.querySelectorAll(".gi-kpi-label");
    const kpiBig = panel.querySelectorAll(".gi-kpi-big");
    const kpiSubs = panel.querySelectorAll(".gi-kpi-sub");
    const kpiChange = panel.querySelectorAll(".gi-kpi-change");

    if (kpiLabels[0]) kpiLabels[0].textContent = SintechI18n.t("totalCategories");
    if (kpiBig[0]) kpiBig[0].textContent = catNames.length;
    if (kpiSubs[0]) kpiSubs[0].textContent = SintechI18n.t("catTracked");

    if (kpiLabels[1]) kpiLabels[1].textContent = SintechI18n.t("marketScale");
    if (kpiBig[1]) animateNumber(kpiBig[1], SintechI18n.convertCurrency(v.home.marketSize));
    if (kpiChange[0]) updateKpiChange(kpiChange[0], v.home.marketChange);
    if (kpiSubs[1]) kpiSubs[1].textContent = SintechI18n.convertMarketSub(v.home.marketSub);

    if (kpiLabels[2]) kpiLabels[2].textContent = SintechI18n.t("topCatShare");

    const footerLabels = panel.querySelectorAll(".gi-footer-label");
    const footerNums = panel.querySelectorAll(".gi-footer-num");
    if (footerLabels[0]) footerLabels[0].textContent = SintechI18n.t("catTrackedFooter");
    if (footerNums[0]) footerNums[0].textContent = catNames.length;
    if (footerLabels[1]) footerLabels[1].textContent = SintechI18n.t("productsMonitored");
    if (footerLabels[2]) footerLabels[2].textContent = SintechI18n.t("dataSources");

    catNames.forEach((name, i) => {
      if (!cats[i]) return;
      cats[i].querySelector("h3").textContent = name;
      const shareLabel = SintechI18n.getLang() === "en" ? "Market Share" : "市场占比";
      const shareEl = cats[i].querySelector(".gi-cat-share");
      shareEl.textContent = `${shareLabel} `;
      const strong = document.createElement("strong");
      strong.textContent = `${d.shares[i]}%`;
      shareEl.appendChild(strong);

      const fill = cats[i].querySelector(".gi-price-fill");
      if (fill) fill.style.setProperty("--w", (d.shares[i] / Math.max(...d.shares) * 100) + "%");
    });

    const shareList = panel.querySelector(".gi-share-list");
    if (shareList) {
      while (shareList.firstChild) shareList.removeChild(shareList.firstChild);
      catNames.slice(0, 5).forEach((c, i) => {
        const item = document.createElement("div");
        item.className = "gi-share-item";
        const dot = document.createElement("span");
        dot.className = "gi-dot";
        item.appendChild(dot);
        item.appendChild(document.createTextNode(` ${c} (${d.shares[i]}%)`));
        shareList.appendChild(item);
      });
    }

    const pctEl = panel.querySelector(".gi-share-pct");
    if (pctEl) pctEl.textContent = d.shares.slice(0, 5).reduce((a, b) => a + b, 0) + "%";
    const tagEl = panel.querySelector(".gi-share-tag");
    if (tagEl) tagEl.textContent = SintechI18n.t("topTag");
  }

  function updateConsumerPanel(v) {
    const panel = document.getElementById("consumer-profile");
    if (!panel) return;
    const d = v.consumer;
    if (!d) return;
    const ci = SintechI18n.getConsumerI18n(state.currentVertical);
    if (!ci) return;

    const subtitle = panel.querySelector(".gi-subtitle");
    if (subtitle) subtitle.textContent = SintechI18n.t("consumerSub");

    const kpiLabels = panel.querySelectorAll(".gi-kpi-label");
    if (kpiLabels[0]) kpiLabels[0].textContent = SintechI18n.t("activeUsers");
    if (kpiLabels[1]) kpiLabels[1].textContent = SintechI18n.t("repurchaseRate");
    if (kpiLabels[2]) kpiLabels[2].textContent = SintechI18n.t("coreDemographic");

    const kpiSubs = panel.querySelectorAll(".gi-kpi-sub");
    if (kpiSubs[0]) kpiSubs[0].textContent = SintechI18n.t("activeUsersSub");
    if (kpiSubs[1]) kpiSubs[1].textContent = SintechI18n.t("repurchaseSub");

    panel.querySelector(".gi-title").textContent = SintechI18n.t("consumerTitlePrefix");
    const highlight = document.createElement("span");
    highlight.className = "gi-highlight";
    highlight.textContent = SintechI18n.t("consumerTitleHighlight");
    panel.querySelector(".gi-title").appendChild(highlight);

    const kpiBig = panel.querySelectorAll(".gi-kpi-big");
    if (kpiBig[0]) animateNumber(kpiBig[0], SintechI18n.convertUsers(d.users));
    if (kpiBig[1]) animateNumber(kpiBig[1], d.repurchase);

    const kpiChanges = panel.querySelectorAll(".gi-kpi-change");
    if (kpiChanges[0]) updateKpiChange(kpiChanges[0], d.usersChange);
    if (kpiChanges[1]) updateKpiChange(kpiChanges[1], d.repurchaseChange);

    const shareList = panel.querySelector(".gi-share-list");
    if (shareList) {
      while (shareList.firstChild) shareList.removeChild(shareList.firstChild);
      ci.demo.forEach(item => {
        const div = document.createElement("div");
        div.className = "gi-share-item";
        const dot = document.createElement("span");
        dot.className = "gi-dot";
        div.appendChild(dot);
        div.appendChild(document.createTextNode(` ${item.n} (${item.s})`));
        shareList.appendChild(div);
      });
    }

    const pctEl = panel.querySelector(".gi-share-pct");
    if (pctEl) pctEl.textContent = ci.demo.reduce((sum, d) => sum + parseInt(d.s), 0) + "%";
    const tagEl = panel.querySelector(".gi-share-tag");
    if (tagEl) tagEl.textContent = ci.demoTag;

    const donutContainer = panel.querySelector(".gi-donut-container");
    if (donutContainer) {
      while (donutContainer.firstChild) donutContainer.removeChild(donutContainer.firstChild);
      donutContainer.appendChild(buildDonutSVG(d.donut, ci.donutLabels));
    }

    const factorItems = panel.querySelectorAll(".gi-factor-item");
    ci.factors.forEach((f, i) => {
      if (!factorItems[i]) return;
      factorItems[i].querySelector(".gi-factor-name").textContent = f.n;
      factorItems[i].querySelector(".gi-factor-val").textContent = f.v + "%";
      const fill = factorItems[i].querySelector(".gi-price-fill");
      if (fill) {
        fill.style.setProperty("--w", f.v + "%");
        fill.className = `gi-price-fill${f.v >= 70 ? " highlight" : ""}`;
      }
    });

    const segCards = panel.querySelectorAll(".gi-segment-card");
    ci.segments.forEach((s, i) => {
      if (!segCards[i]) return;
      const tag = segCards[i].querySelector(".gi-seg-tag");
      tag.textContent = s.tag;
      tag.className = `gi-seg-tag ${s.cls}`;
      segCards[i].querySelector("p").textContent = s.desc;
    });

    const chanItems = panel.querySelectorAll(".gi-channel-item");
    ci.channels.forEach((ch, i) => {
      if (!chanItems[i]) return;
      chanItems[i].querySelector("strong").textContent = ch.v;
      chanItems[i].querySelector("span").textContent = ch.n;
    });

    const aiCardP = panel.querySelector(".gi-ai-card p");
    if (aiCardP) aiCardP.textContent = `"${ci.ai}"`;

    const chartTitle = panel.querySelector(".gi-chart-title");
    if (chartTitle) chartTitle.textContent = SintechI18n.t("factorsTitle");

    const priceHeaders = panel.querySelectorAll(".gi-price-header span");
    if (priceHeaders[0]) priceHeaders[0].textContent = SintechI18n.t("segmentsTitle");
    if (priceHeaders[1]) priceHeaders[1].textContent = SintechI18n.t("channelsTitle");

    const footerLabels = panel.querySelectorAll(".gi-footer-label");
    if (footerLabels[0]) footerLabels[0].textContent = SintechI18n.t("surveySample");
    if (footerLabels[1]) footerLabels[1].textContent = SintechI18n.t("citiesCovered");
    if (footerLabels[2]) footerLabels[2].textContent = SintechI18n.t("confidence");
  }

  function updateDashboardPanel() {
    const panel = document.getElementById("trends");
    if (!panel) return;

    const titleEl = panel.querySelector(".gi-title");
    titleEl.textContent = SintechI18n.t("dashTitlePrefix");
    const highlight = document.createElement("span");
    highlight.className = "gi-highlight";
    highlight.textContent = SintechI18n.t("dashTitleHighlight");
    titleEl.appendChild(highlight);

    const subtitle = panel.querySelector(".gi-subtitle");
    if (subtitle) subtitle.textContent = SintechI18n.t("dashSub");

    const metricKeys = ["aiOnDevice", "wholeHomeIoT", "healthPrecision", "spatialComputing"];
    const metricCards = panel.querySelectorAll(".gi-metric-card");
    metricKeys.forEach((key, i) => {
      if (metricCards[i]) metricCards[i].querySelector(".gi-metric-label").textContent = SintechI18n.t(key);
    });

    const trendKeys = [
      { title: "trend2025Title", desc: "trend2025Desc" },
      { title: "trend2026Title", desc: "trend2026Desc" },
      { title: "trend2027Title", desc: "trend2027Desc" },
      { title: "trend2028Title", desc: "trend2028Desc" },
    ];
    const trendCards = panel.querySelectorAll(".gi-trend-card");
    trendKeys.forEach((keys, i) => {
      if (!trendCards[i]) return;
      const h3 = trendCards[i].querySelector("h3");
      const p = trendCards[i].querySelector("p");
      if (h3) h3.textContent = SintechI18n.t(keys.title);
      if (p) p.textContent = SintechI18n.t(keys.desc);
    });

    const footerLabels = panel.querySelectorAll(".gi-footer-label");
    if (footerLabels[0]) footerLabels[0].textContent = SintechI18n.t("forecastHorizon");
    if (footerLabels[1]) footerLabels[1].textContent = SintechI18n.t("analystReports");
    if (footerLabels[2]) footerLabels[2].textContent = SintechI18n.t("accuracy");

    const footerNums = panel.querySelectorAll(".gi-footer-num");
    if (footerNums[0]) footerNums[0].textContent = SintechI18n.t("years4");
  }

  // ==============================
  // Animations
  // ==============================
  function animateNumber(el, targetText) {
    if (!el) return;
    const match = targetText.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match) { el.textContent = targetText; return; }
    const prefix = match[1], numStr = match[2], suffix = match[3];
    const target = parseFloat(numStr.replace(/,/g, ""));
    if (isNaN(target)) { el.textContent = targetText; return; }
    const hasComma = numStr.includes(",");
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    const duration = 800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      let current = (eased * target).toFixed(decimals);
      if (hasComma) current = Number(current).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = targetText;
    }
    requestAnimationFrame(step);
  }

  function animatePanel(panel) {
    panel.querySelectorAll(".gi-bar:not([data-animated])").forEach(bar => {
      bar.dataset.animated = "1";
      bar.style.animation = "none";
      bar.offsetHeight;
      bar.style.animation = "barGrow .8s ease forwards";
    });
    panel.querySelectorAll(".gi-price-fill:not([data-animated])").forEach(el => {
      el.dataset.animated = "1";
      const targetW = getComputedStyle(el).getPropertyValue("--w").trim();
      if (!targetW) return;
      el.style.transition = "none";
      el.style.width = "0";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = "width .9s ease";
          el.style.width = targetW;
        });
      });
    });
  }

  // ==============================
  // Interaction Init
  // ==============================
  async function init() {
    const overlay = document.getElementById("loading-overlay");
    const success = await loadData();
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => { overlay.style.display = "none"; }, 300);
    }
    if (!success) return;

    SintechI18n.init(state.data);

    getEls(".lang-btn").forEach(btn => {
      btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
    });

    const tabBtns = getEls(".tab-btn");
    const panels = getEls(".tab-panel");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        state.activeTab = tabId;
        tabBtns.forEach(b => {
          const isActive = b.dataset.tab === tabId;
          b.classList.toggle("active", isActive);
          b.setAttribute("aria-selected", isActive);
        });
        panels.forEach(p => p.classList.toggle("active", p.id === tabId));
        window.scrollTo({ top: 0, behavior: "smooth" });
        updateActivePanel();
      });
    });

    getEls(".gi-toggle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const toggle = btn.closest(".gi-toggle");
        toggle.querySelectorAll(".gi-toggle-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.currentTimeView = btn.dataset.view;
        const panel = btn.closest(".tab-panel");
        updateBarChart(panel, state.data.VERTICALS[state.currentVertical].home);
        panel.querySelectorAll(".gi-bar").forEach(b => delete b.dataset.animated);
        animatePanel(panel);
      });
    });

    document.addEventListener("click", (e) => {
      const catCard = e.target.closest(".gi-cat-card");
      if (catCard) {
        const name = catCard.querySelector("h3")?.textContent || "";
        const share = catCard.querySelector(".gi-cat-share strong")?.textContent || "";
        const label = SintechI18n.getLang() === "en" ? "Market Share" : "市场占比";
        showToast(`${name} — ${label} ${share}`);
      }

      const deepBtn = e.target.closest(".gi-deep-btn");
      if (deepBtn) {
        const v = state.data.VERTICALS[state.currentVertical];
        const bands = v.home.priceBands;
        const prefix = SintechI18n.getLang() === "en" ? "Price Analysis:" : "价格分析：";
        const detail = bands.map(b => `${SintechI18n.convertPriceBandLabel(b.label)}: ${b.pct}%`).join("  ·  ");
        showToast(`${prefix} ${detail}`);
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const catCard = e.target.closest?.(".gi-cat-card");
      if (!catCard) return;
      e.preventDefault();
      const name = catCard.querySelector("h3")?.textContent || "";
      const share = catCard.querySelector(".gi-cat-share strong")?.textContent || "";
      const label = SintechI18n.getLang() === "en" ? "Market Share" : "市场占比";
      showToast(`${name} — ${label} ${share}`);
    });

    switchLanguage("en");
  }

  function showToast(msg) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    toast.style.visibility = "visible";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.visibility = "hidden";
    }, 2800);
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", SintechApp.init);
