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
  const moduleContext = {
    market: "全球",
    priceSegment: "$100-200",
    dataQuarter: "2025 Q3"
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

    getEls(".tab-btn").forEach(btn => {
      const tabId = btn.dataset.tab;
      const key = tabId === "global-insights"
        ? "tabHome"
        : tabId === "consumer-profile"
          ? "tabConsumer"
          : tabId === "trends"
            ? "tabDashboard"
            : null;
      if (key) btn.textContent = SintechI18n.t(key);
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
    }

    const consumer = document.getElementById("consumer-profile");
    if (consumer) {
      const title = consumer.querySelector(".gi-title");
      const subtitles = consumer.querySelectorAll(".gi-subtitle");
      const cardTitle = consumer.querySelector(".gi-price-header span");
      if (title) title.textContent = SintechI18n.getLang() === "en" ? "Consumer Insights" : "消费者洞察";
      const consumerText = SintechI18n.getLang() === "en"
        ? "This section is reserved for future consumer research modules."
        : "该模块预留用于后续消费者研究内容。";
      subtitles.forEach(el => { el.textContent = consumerText; });
      if (cardTitle) cardTitle.textContent = SintechI18n.getLang() === "en" ? "Coming Soon" : "敬请期待";
    }

    const trends = document.getElementById("trends");
    if (trends) {
      const title = trends.querySelector(".gi-title");
      const subtitles = trends.querySelectorAll(".gi-subtitle");
      const cardTitle = trends.querySelector(".gi-price-header span");
      if (title) title.textContent = SintechI18n.getLang() === "en" ? "Dashboard" : "趋势看板";
      const trendsText = SintechI18n.getLang() === "en"
        ? "This section is reserved for future trend and execution dashboards."
        : "该模块预留用于后续趋势与经营看板内容。";
      subtitles.forEach(el => { el.textContent = trendsText; });
      if (cardTitle) cardTitle.textContent = SintechI18n.getLang() === "en" ? "Coming Soon" : "敬请期待";
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

    const activePanel = document.getElementById(state.activeTab);
    if (activePanel) {
      if (state.activeTab === "global-insights") {
        const titleEl = activePanel.querySelector(".gi-title");
        if (titleEl) {
          titleEl.textContent = SintechI18n.t("homeTitlePrefix");
          const highlight = document.createElement("span");
          highlight.className = "gi-highlight";
          highlight.textContent = SintechI18n.getVertName(state.currentVertical);
          titleEl.appendChild(highlight);
        }
      }

      activePanel.querySelectorAll("[data-animated]").forEach(el => delete el.dataset.animated);
      animatePanel(activePanel);
      
      if (window.SintechModules) {
        if (state.activeTab === "global-insights") {
          window.SintechModules.render({
            panel: activePanel,
            tabId: state.activeTab,
            vertical: state.currentVertical,
            verticalData: state.data?.VERTICALS?.[state.currentVertical] || null,
            market: moduleContext.market,
            priceSegment: moduleContext.priceSegment,
            dataQuarter: moduleContext.dataQuarter,
            lang: SintechI18n.getLang()
          });
        }
      }
    }
    updateStaticText();
  }

  // ==============================
  // Animations
  // ==============================
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
