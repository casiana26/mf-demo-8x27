/* =========================================================
   MAISON FLEUR — SCRIPT
   1. Header scroll state
   2. Mobile navigation
   3. Close mobile nav on link click / outside click
   4. Scroll reveal animations
   5. Gallery lightbox
   6. Review submission (manual moderation by email)
   7. Footer year
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. HEADER SCROLL STATE ---------- */
  var header = document.getElementById('site-header');

  function updateHeaderState() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ---------- 2. MOBILE NAVIGATION ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function openMenu() {
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Închide meniul');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Deschide meniul');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navMenu.classList.contains('is-open');
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  /* ---------- 3. CLOSE MOBILE NAV ON LINK CLICK ---------- */
  var navLinkEls = navMenu.querySelectorAll('a');
  navLinkEls.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* ---------- 4. SCROLL REVEAL ANIMATIONS ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 5. GALLERY LIGHTBOX ---------- */
  var galleryItems = document.querySelectorAll('.gallery-item');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastFocusedEl = null;

  function openLightbox(fullSrc, altText) {
    lastFocusedEl = document.activeElement;
    lightboxImg.src = fullSrc;
    lightboxImg.alt = altText || 'Imagine din galeria Maison Fleur';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocusedEl) { lastFocusedEl.focus(); }
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var fullSrc = item.getAttribute('data-full');
      var imgEl = item.querySelector('img');
      var altText = imgEl ? imgEl.getAttribute('alt') : '';
      openLightbox(fullSrc, altText);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) { closeLightbox(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });

  /* ---------- 7. FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

});


/* =========================================================
   AUTO-MODERATED REVIEWS V3
   IMPORTANT:
   After deploying google-apps-script/Code.gs as a Web App,
   paste its /exec URL below.
   ========================================================= */

var REVIEW_API_URL = 'https://script.google.com/macros/s/AKfycbyv_TdTJoPdmkdd00lKKB4-gMGveT379uPcipHY5HinV2vqokw6ml4-GJO239kHWZfgCg/exec';

(function setupAutoReviews(){
  var reviewForm = document.getElementById('reviewForm');
  var reviewFormNote = document.getElementById('reviewFormNote');
  var ratingInput = document.getElementById('ratingValue');
  var ratingButtons = Array.from(document.querySelectorAll('.rating-star-btn'));
  var reviewsToggle = document.getElementById('reviewsToggle');
  var allReviewsPanel = document.getElementById('allReviewsPanel');
  var allReviewsGrid = document.getElementById('allReviewsGrid');
  var loadedReviews = false;

  function endpointConfigured(){
    return REVIEW_API_URL &&
      !REVIEW_API_URL.includes('PASTE_GOOGLE_APPS_SCRIPT') &&
      /^https:\/\/script\.google\.com\//.test(REVIEW_API_URL);
  }

  function paintRating(value, preview){
    ratingButtons.forEach(function(btn){
      var n = Number(btn.getAttribute('data-rating'));
      btn.classList.toggle(preview ? 'is-preview' : 'is-active', n <= value);
      if (!preview) {
        btn.setAttribute('aria-pressed', n === value ? 'true' : 'false');
      }
    });
  }

  ratingButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var value = Number(btn.getAttribute('data-rating'));
      ratingInput.value = String(value);
      paintRating(value, false);
    });

    btn.addEventListener('mouseenter', function(){
      paintRating(Number(btn.getAttribute('data-rating')), true);
    });

    btn.addEventListener('mouseleave', function(){
      ratingButtons.forEach(function(b){ b.classList.remove('is-preview'); });
    });

    btn.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        var next = Math.min(5, Number(ratingInput.value || 0) + 1);
        ratingInput.value = String(next);
        paintRating(next, false);
        ratingButtons[next - 1].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        var prev = Math.max(1, Number(ratingInput.value || 1) - 1);
        ratingInput.value = String(prev);
        paintRating(prev, false);
        ratingButtons[prev - 1].focus();
      }
    });
  });

  if (reviewForm) {
    reviewForm.addEventListener('submit', function(e){
      var name = document.getElementById('reviewName').value.trim();
      var message = document.getElementById('reviewMessage').value.trim();
      var rating = Number(ratingInput.value);

      if (!name || !message || !rating) {
        e.preventDefault();
        reviewFormNote.style.color = '#b5493d';
        reviewFormNote.textContent = 'Te rugăm să alegi numărul de stele și să completezi numele și recenzia.';
        return;
      }

      if (!endpointConfigured()) {
        e.preventDefault();
        reviewFormNote.style.color = '#b5493d';
        reviewFormNote.textContent = 'Sistemul de recenzii este pregătit, dar trebuie conectat o singură dată la Google Apps Script. Vezi SETUP_RECENZII.txt.';
        return;
      }

      reviewForm.action = REVIEW_API_URL;
      reviewFormNote.style.color = '';
      reviewFormNote.textContent = 'Recenzia se trimite pentru verificare…';

      // Native POST to hidden iframe avoids cross-origin issues.
      setTimeout(function(){
        reviewForm.reset();
        ratingInput.value = '';
        paintRating(0, false);
        reviewFormNote.textContent = 'Mulțumim! Recenzia a fost trimisă proprietarului pentru verificare.';
      }, 700);
    });
  }

  window.MaisonFleurReviewsCallback = function(payload){
    loadedReviews = true;
    if (!allReviewsGrid) return;

    if (!payload || payload.ok === false) {
      allReviewsGrid.innerHTML = '<p class="reviews-error">Recenziile nu au putut fi încărcate momentan.</p>';
      return;
    }

    var reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
    if (!reviews.length) {
      allReviewsGrid.innerHTML = '<p class="reviews-empty">Nu există încă recenzii suplimentare publicate.</p>';
      return;
    }

    allReviewsGrid.innerHTML = '';
    reviews.forEach(function(review){
      var card = document.createElement('blockquote');
      card.className = 'testimonial-card review-card-dynamic';

      var stars = document.createElement('div');
      stars.className = 'testimonial-stars';
      stars.setAttribute('aria-label', review.rating + ' din 5 stele');
      stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

      var text = document.createElement('p');
      text.textContent = '„' + review.message + '”';

      var cite = document.createElement('cite');
      cite.textContent = review.name;

      card.appendChild(stars);
      card.appendChild(text);
      card.appendChild(cite);
      allReviewsGrid.appendChild(card);
    });
  };

  function loadApprovedReviews(){
    if (loadedReviews || !allReviewsGrid) return;

    if (!endpointConfigured()) {
      allReviewsGrid.innerHTML = '<p class="reviews-empty">Demo: conectează Google Apps Script pentru ca recenziile aprobate să apară automat aici.</p>';
      loadedReviews = true;
      return;
    }

    allReviewsGrid.innerHTML = '<p class="reviews-loading">Se încarcă recenziile…</p>';
    var script = document.createElement('script');
    script.src = REVIEW_API_URL + '?action=list&callback=MaisonFleurReviewsCallback&_=' + Date.now();
    script.async = true;
    script.onerror = function(){
      allReviewsGrid.innerHTML = '<p class="reviews-error">Recenziile nu au putut fi încărcate momentan.</p>';
    };
    document.body.appendChild(script);
  }

  if (reviewsToggle && allReviewsPanel) {
    reviewsToggle.addEventListener('click', function(){
      var opening = allReviewsPanel.hidden;
      allReviewsPanel.hidden = !opening;
      reviewsToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
      reviewsToggle.textContent = opening ? 'Ascunde recenziile' : 'Vezi toate recenziile';
      if (opening) {
        loadApprovedReviews();
        setTimeout(function(){
          allReviewsPanel.scrollIntoView({behavior:'smooth', block:'nearest'});
        }, 80);
      }
    });
  }
})();

