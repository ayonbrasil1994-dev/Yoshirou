// ===== 開いたときは常にページの一番上から表示 =====
// ただし blog.html などから「index.html#gallery」のようなリンクで来たときは、そのセクションへ移動させる
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
const navEntry = performance.getEntriesByType ? performance.getEntriesByType("navigation")[0] : null;
const hashTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
const linkedToSection = navEntry && navEntry.type === "navigate" && hashTarget;
if (!linkedToSection) {
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);
}

// ===== テーマ切り替え（ダーク / ライト） =====
const root = document.documentElement;
const themeBtn = document.querySelector(".theme-toggle");

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch { return null; }
}
function saveTheme(theme) {
  try { localStorage.setItem("theme", theme); } catch { /* 保存できなくても動作は続ける */ }
}

root.setAttribute("data-theme", getSavedTheme() || "dark");
themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  saveTheme(next);
});

// ===== スマホ用メニュー =====
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");

function closeNav() {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

// ===== タイピング風アニメーション（トップページのみ） =====
const typingEl = document.querySelector(".typing");
if (typingEl) {
  const words = JSON.parse(typingEl.dataset.words);
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    typingEl.textContent = word.slice(0, charIndex);

    let delay = deleting ? 60 : 120;
    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = 1600;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 400;
    }
    setTimeout(type, delay);
  }
  type();
}

// ===== スクロールで要素をふわっと表示 =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== スクロールに応じたヘッダー / トップへ戻るボタン =====
const header = document.querySelector(".header");
const toTop = document.querySelector(".to-top");
function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
  toTop.classList.toggle("is-shown", window.scrollY > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ===== ギャラリーの拡大表示（ライトボックス・トップページのみ） =====
const lightbox = document.querySelector(".lightbox");
if (lightbox) {
  const items = [...document.querySelectorAll(".gallery__item img")];
  const lbImg = lightbox.querySelector(".lightbox__img");
  const lbCount = lightbox.querySelector(".lightbox__count");
  let current = 0;
  let lastFocus = null;

  function show(index) {
    current = (index + items.length) % items.length;
    lbImg.src = items[current].src;
    lbImg.alt = items[current].alt;
    lbCount.textContent = `${current + 1} / ${items.length}`;
  }
  function openLightbox(index) {
    lastFocus = document.activeElement;
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox__close").focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  items.forEach((img, i) => img.parentElement.addEventListener("click", () => openLightbox(i)));
  lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // スマホのスワイプで前後の写真へ
  let touchX = null;
  lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
}

// ===== フッターの年 =====
document.getElementById("year").textContent = new Date().getFullYear();
