/**
 * 智能硬件行业及消费者分析 - 交互逻辑
 */

// ==============================
// 页面滚动高亮导航
// ==============================
function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".site-header nav a");

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("active"));
          const active = document.querySelector(
            `.site-header nav a[href="#${entry.target.id}"]`
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((sec) => observer.observe(sec));
}

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
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = eased * target;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initStatAnimation() {
  const statNumbers = document.querySelectorAll(".stat-number");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const text = el.textContent.trim();

        // 解析数字和单位后缀
        const match = text.match(/^([\d,.]+)(.*)$/);
        if (!match) return;

        const numStr = match[1].replace(/,/g, "");
        const suffix = match[2];
        const num = parseFloat(numStr);

        if (!isNaN(num)) animateNumber(el, num, suffix);
        observer.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

// ==============================
// 图表柱子入场动画
// ==============================
function initBarAnimation() {
  const bars = document.querySelectorAll(".bar");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "barGrow .8s ease forwards";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  // 注入关键帧（只注入一次）
  if (!document.getElementById("bar-keyframes")) {
    const style = document.createElement("style");
    style.id = "bar-keyframes";
    style.textContent = `
      .bar { transform: scaleY(0); transform-origin: bottom; }
      @keyframes barGrow {
        from { transform: scaleY(0); }
        to   { transform: scaleY(1); }
      }
    `;
    document.head.appendChild(style);
  }

  bars.forEach((bar) => observer.observe(bar));
}

// ==============================
// 进度条动画（品类 & 因素）
// ==============================
function initProgressAnimation() {
  const fills = document.querySelectorAll(".progress, .factor-fill");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.style.getPropertyValue("--w") ||
            getComputedStyle(entry.target).getPropertyValue("--w");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  // 初始化宽度为 0，等触发后再恢复
  fills.forEach((el) => {
    const targetW = getComputedStyle(el).getPropertyValue("--w").trim();
    el.dataset.targetW = targetW;
    el.style.width = "0";
    observer.observe(el);
  });

  // 修正：动画触发时恢复
  const observer2 = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.transition = "width .8s ease";
          el.style.width = el.dataset.targetW;
          observer2.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  fills.forEach((el) => observer2.observe(el));
}

// ==============================
// 卡片点击 tooltip（品类卡片）
// ==============================
function initCategoryInteraction() {
  document.querySelectorAll(".category-card").forEach((card) => {
    card.setAttribute("title", "点击查看详情（演示）");
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const name = card.querySelector("h3").textContent;
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
    toast.style.cssText = `
      position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
      background: #1e293b; color: #fff; padding: 10px 24px;
      border-radius: 24px; font-size: .875rem; z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,.2);
      transition: opacity .3s;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = "1";

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2400);
}

// ==============================
// 回到顶部按钮
// ==============================
function initBackToTop() {
  const btn = document.createElement("button");
  btn.id = "back-to-top";
  btn.textContent = "↑";
  btn.title = "回到顶部";
  btn.style.cssText = `
    position: fixed; bottom: 80px; right: 28px;
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #fff; border: none; cursor: pointer;
    font-size: 1.1rem; line-height: 1;
    box-shadow: 0 4px 12px rgba(0,0,0,.15);
    opacity: 0; transition: opacity .3s;
    z-index: 999;
  `;
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    btn.style.opacity = window.scrollY > 300 ? "1" : "0";
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==============================
// 初始化
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  initNavHighlight();
  initStatAnimation();
  initBarAnimation();
  initProgressAnimation();
  initCategoryInteraction();
  initBackToTop();
});
