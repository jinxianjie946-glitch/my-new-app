/**
 * 智能硬件行业及消费者分析 - 交互逻辑
 */

// ==============================
// 数字滚动动画
// ==============================
function animateNumber(el, target, suffix = "", duration = 1200) {
  const start = performance.now();
  const isFloat = String(target).includes(".");
  const decimals = isFloat ? String(target).split(".")[1].length : 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ==============================
// 面板内动画（Tab 切换时触发）
// ==============================
function animatePanel(panel) {
  // 数字
  panel.querySelectorAll(".stat-number:not([data-animated])").forEach((el) => {
    el.dataset.animated = "1";
    const text = el.textContent.trim();
    const match = text.match(/^([\d,.]+)(.*)$/);
    if (!match) return;
    const num = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2];
    if (!isNaN(num)) animateNumber(el, num, suffix);
  });

  // 柱状图
  if (!document.getElementById("bar-keyframes")) {
    const style = document.createElement("style");
    style.id = "bar-keyframes";
    style.textContent = `@keyframes barGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }`;
    document.head.appendChild(style);
  }
  panel.querySelectorAll(".bar:not([data-animated])").forEach((bar) => {
    bar.dataset.animated = "1";
    bar.style.animation = "barGrow .8s ease forwards";
  });

  // 进度条（双 rAF 确保 width:0 先被渲染）
  panel.querySelectorAll(".progress:not([data-animated]), .factor-fill:not([data-animated])").forEach((el) => {
    el.dataset.animated = "1";
    const targetW = getComputedStyle(el).getPropertyValue("--w").trim();
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
// Tab 切换
// ==============================
function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels  = document.querySelectorAll(".tab-panel");

  function activate(tabId) {
    panels.forEach((p) => p.classList.remove("active"));
    buttons.forEach((b) => b.classList.remove("active"));

    const panel = document.getElementById(tabId);
    const btn   = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (!panel || !btn) return;

    panel.classList.add("active");
    btn.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 动画在淡入开始后触发
    requestAnimationFrame(() => animatePanel(panel));
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.tab));
  });

  // 默认激活第一个 Tab
  if (buttons[0]) activate(buttons[0].dataset.tab);
}

// ==============================
// 品类卡片点击 Toast
// ==============================
function initCategoryInteraction() {
  document.querySelectorAll(".category-card").forEach((card) => {
    card.setAttribute("title", "点击查看详情（演示）");
    card.addEventListener("click", () => {
      const name  = card.querySelector("h3").textContent;
      const share = card.querySelector(".category-share strong").textContent;
      showToast(`${name}：市场占比 ${share}`);
    });
  });
}

// ==============================
// Toast 提示
// ==============================
function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2400);
}

// ==============================
// 初始化
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initCategoryInteraction();
});
