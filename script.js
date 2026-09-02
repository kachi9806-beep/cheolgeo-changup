// 철거창업소 랜딩 — 상담 모달 (메일 접수 + 전화 연결)
(function () {
  "use strict";

  var OWNER_TEL = "01036509807"; // 대표님 전화 (010-3650-9807)
  var LEAD_EMAIL = "kachi9806@gmail.com"; // 상담 신청 수신 메일
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + LEAD_EMAIL;

  var modal = document.getElementById("modal");
  var form = document.getElementById("leadForm");
  var done = document.getElementById("leadDone");
  var nameInput = document.getElementById("name");
  var phoneInput = document.getElementById("phone");
  var errBox = document.getElementById("formErr");
  var applyBtn = document.getElementById("applyBtn");
  var callBtn = document.getElementById("callBtn");
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    resetForm();
    setTimeout(function () { nameInput.focus(); }, 60);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function resetForm() {
    form.hidden = false;
    done.hidden = true;
    hideError();
    applyBtn.disabled = false;
    applyBtn.textContent = "상담 신청하기";
  }

  function showError(msg) { errBox.textContent = msg; errBox.hidden = false; }
  function hideError() { errBox.hidden = true; }

  function formatPhone(v) {
    var d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + "-" + d.slice(3);
    return d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7);
  }

  function isValidPhone(v) {
    return /^01[016789]\d{7,8}$/.test(v.replace(/\D/g, ""));
  }

  function saveLocal(name, phone) {
    try {
      var leads = JSON.parse(localStorage.getItem("cheolgeo_leads") || "[]");
      leads.push({ name: name, phone: phone, at: new Date().toISOString() });
      localStorage.setItem("cheolgeo_leads", JSON.stringify(leads));
    } catch (_) { /* 저장 실패는 무시 */ }
  }

  // 모달 열기 / 닫기
  Array.prototype.forEach.call(document.querySelectorAll("[data-open-modal]"),
    function (btn) { btn.addEventListener("click", openModal); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-close-modal]"),
    function (el) { el.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  phoneInput.addEventListener("input", function () {
    phoneInput.value = formatPhone(phoneInput.value);
    hideError();
  });
  nameInput.addEventListener("input", hideError);

  // 전화 상담 바로하기: 담당자 전화로 즉시 연결
  callBtn.addEventListener("click", function () {
    window.location.href = "tel:" + OWNER_TEL;
  });

  // ---------- 스크롤 리빌 애니메이션 ----------
  (function scrollReveal() {
    var page = document.querySelector(".page");
    if (!page) return;

    // 리빌 대상: 섹션 텍스트/이미지/버튼 (단독) + 리스트(자식 스태거)
    var singles = page.querySelectorAll(
      ".logo, .hero__eyebrow, .hero__title, .hero__sub, .hero__hl, .hero__art, .cta, .cta__note," +
      " .kicker, .h2, .sub, .hl, .bubble, .quote, .closing, .chevron," +
      " .tools, .emph, .final__hl, .phone, .final__tel, .foot p"
    );
    var i;
    for (i = 0; i < singles.length; i++) singles[i].classList.add("reveal");

    // 리스트: 자식마다 단계 지연
    var groups = page.querySelectorAll(".qcards, .ccards, .steps, .flow");
    for (i = 0; i < groups.length; i++) {
      var kids = groups[i].children, j;
      for (j = 0; j < kids.length; j++) {
        kids[j].classList.add("reveal");
        kids[j].style.transitionDelay = (j * 90) + "ms";
      }
    }

    var targets = page.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      for (i = 0; i < targets.length; i++) targets[i].classList.add("in");
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    for (i = 0; i < targets.length; i++) io.observe(targets[i]);
  })();

  // ---------- 플로팅 CTA ----------
  (function floatingCTA() {
    var fab = document.getElementById("fab");
    var hero = document.querySelector(".hero");
    var finalSec = document.querySelector(".final");
    if (!fab || !hero || !finalSec) return;

    // IntersectionObserver 미지원: 스크롤 위치로 폴백
    if (!("IntersectionObserver" in window)) {
      window.addEventListener("scroll", function () {
        var y = window.pageYOffset, vh = window.innerHeight;
        var bottom = document.body.scrollHeight - (y + vh);
        fab.classList.toggle("show", y > vh * 0.8 && bottom > 220);
      }, { passive: true });
      return;
    }

    var pastTop = false;   // 히어로를 지나쳤는가 (맨 위 벗어남)
    var nearBottom = false; // 마무리 섹션에 닿았는가 (맨 아래)
    function update() { fab.classList.toggle("show", pastTop && !nearBottom); }

    new IntersectionObserver(function (e) {
      pastTop = !e[0].isIntersecting;
      update();
    }, { threshold: 0 }).observe(hero);

    new IntersectionObserver(function (e) {
      nearBottom = e[0].isIntersecting;
      update();
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" }).observe(finalSec);
  })();

  // 상담 신청하기: 이름/연락처를 담당자 메일로 접수
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim();

    if (!name) { showError("성함을 입력해주세요."); nameInput.focus(); return; }
    if (!isValidPhone(phone)) { showError("올바른 휴대폰 번호를 입력해주세요."); phoneInput.focus(); return; }

    hideError();
    applyBtn.disabled = true;
    applyBtn.textContent = "신청 중...";
    saveLocal(name, phone);

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        이름: name,
        연락처: phone,
        _subject: "[철거창업소] 상담 신청 - " + name,
        _template: "table"
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && (data.success === "true" || data.success === true)) {
          form.hidden = true;
          done.hidden = false;
        } else {
          throw new Error("submit failed");
        }
      })
      .catch(function () {
        applyBtn.disabled = false;
        applyBtn.textContent = "상담 신청하기";
        showError("접수 중 오류가 발생했습니다. 전화 상담 바로하기로 연결해주세요.");
      });
  });
})();
