/* ==========================================================
   APEX DETAILING: script.js
   Modules are initialised at the bottom. Each one looks for its
   own data-attribute hooks, so the HTML stays free of inline JS.
   ========================================================== */
(() => {
  'use strict';

  // PLACEHOLDER: replace with the real business number (international format, digits only).
  const WHATSAPP_NUMBER = '27000000000';

  const $  = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const whatsappLink = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  /* ---------- Header: scroll state + mobile nav ---------- */
  function initHeader() {
    const header = $('[data-header]');
    const toggle = $('[data-nav-toggle]');
    const nav = $('[data-nav]');
    if (!header || !toggle || !nav) return;

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) setOpen(false); });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => observer.observe(el));
  }

  /* ---------- Services: expand/collapse + preselect in form ---------- */
  function initServices() {
    $$('[data-service-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const service = button.closest('.service');
        const open = !service.classList.contains('is-open');
        service.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
      });
    });

    const select = $('#f-service');
    $$('[data-book]').forEach(link => {
      link.addEventListener('click', () => { if (select) select.value = link.dataset.book; });
    });
  }

  /* ---------- Gallery: filters ---------- */
  function initGallery() {
    const gallery = $('[data-gallery]');
    if (!gallery) return;
    const items = $$('.gallery__item', gallery);
    const filters = $$('[data-filter]');

    filters.forEach(button => button.addEventListener('click', () => {
      const value = button.dataset.filter;
      filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      items.forEach(item => { item.hidden = !(value === 'all' || item.dataset.category === value); });
      gallery.classList.toggle('is-filtered', value !== 'all');
    }));

    initLightbox(gallery, items);
  }

  /* ---------- Gallery: lightbox ---------- */
  function initLightbox(gallery, items) {
    const dialog = $('[data-lightbox]');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const art = $('[data-lb-art]', dialog);
    const caption = $('[data-lb-caption]', dialog);
    const count = $('[data-lb-count]', dialog);
    let list = [];
    let current = 0;

    const show = index => {
      current = (index + list.length) % list.length;
      const item = list[current];
      art.className = `placeholder placeholder--tone-${item.dataset.tone}`;
      caption.textContent = item.dataset.title;
      count.textContent = `${current + 1} / ${list.length}`;
    };

    items.forEach(item => item.addEventListener('click', () => {
      list = items.filter(i => !i.hidden);
      show(list.indexOf(item));
      dialog.showModal();
    }));

    $('[data-lb-prev]', dialog).addEventListener('click', () => show(current - 1));
    $('[data-lb-next]', dialog).addEventListener('click', () => show(current + 1));
    $('[data-lb-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Before / after slider ---------- */
  function initCompare() {
    const compare = $('[data-compare]');
    const handle = $('[data-compare-handle]');
    if (!compare || !handle) return;
    let dragging = false;

    const setPosition = percent => {
      const value = Math.min(100, Math.max(0, percent));
      compare.style.setProperty('--pos', `${value}%`);
      handle.setAttribute('aria-valuenow', String(Math.round(value)));
    };
    const fromPointer = e => {
      const rect = compare.getBoundingClientRect();
      setPosition(((e.clientX - rect.left) / rect.width) * 100);
    };

    compare.addEventListener('pointerdown', e => { dragging = true; compare.setPointerCapture(e.pointerId); fromPointer(e); });
    compare.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type =>
      compare.addEventListener(type, () => { dragging = false; }));

    handle.addEventListener('keydown', e => {
      const value = Number(handle.getAttribute('aria-valuenow'));
      const keys = { ArrowLeft: value - 5, ArrowDown: value - 5, ArrowRight: value + 5, ArrowUp: value + 5, Home: 0, End: 100 };
      if (e.key in keys) { e.preventDefault(); setPosition(keys[e.key]); }
    });
  }

  /* ---------- Booking form: validation + WhatsApp message ---------- */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const result = $('[data-form-result]', form);
    const sendLink = $('[data-wa-send]', form);

    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    form.elements.date.min = today;

    const rules = {
      name:    v => v.trim().length >= 2 || 'Please enter your name.',
      phone:   v => /^\+?[\d\s()-]{9,16}$/.test(v.trim()) || 'Enter a valid contact number.',
      vehicle: v => v.trim().length >= 2 || 'Tell us the make and model.',
      service: v => !!v || 'Choose a service.',
      date:    v => !v ? 'Pick a preferred date.' : (v >= today || 'Choose today or a future date.')
    };

    const validate = name => {
      const field = form.elements[name];
      const outcome = rules[name](field.value);
      const valid = outcome === true;
      field.setAttribute('aria-invalid', String(!valid));
      document.getElementById(`error-${name}`).textContent = valid ? '' : outcome;
      return valid;
    };
    Object.keys(rules).forEach(name => form.elements[name].addEventListener('blur', () => validate(name)));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const failed = Object.keys(rules).filter(name => !validate(name));
      if (failed.length) {
        form.elements[failed[0]].focus();
        result.hidden = true;
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      const message = [
        "Hi Apex Detailing, I'd like to request a booking.",
        `Name: ${data.name.trim()}`,
        `Contact: ${data.phone.trim()}`,
        `Vehicle: ${data.vehicle.trim()}`,
        `Service: ${data.service}`,
        `Preferred date: ${data.date}`,
        data.notes.trim() ? `Notes: ${data.notes.trim()}` : ''
      ].filter(Boolean).join('\n');

      sendLink.href = whatsappLink(message);
      result.hidden = false;
      sendLink.focus();
    });
  }

  /* ---------- Testimonials carousel ---------- */
  function initReviews() {
    const root = $('[data-reviews]');
    if (!root) return;
    const slides = $$('.review', root);
    const counter = $('[data-review-count]', root);
    let index = 0;

    const show = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.hidden = i !== index; });
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };
    $('[data-review-prev]', root).addEventListener('click', () => show(index - 1));
    $('[data-review-next]', root).addEventListener('click', () => show(index + 1));
    show(0);
  }

  /* ---------- FAQ: one open at a time ---------- */
  function initFaq() {
    const items = $$('[data-faq] details');
    items.forEach(item => item.addEventListener('toggle', () => {
      if (item.open) items.forEach(other => { if (other !== item) other.open = false; });
    }));
  }

  /* ---------- Floating WhatsApp button ---------- */
  function initFloat() {
    const button = $('[data-wa-float]');
    if (button) button.href = whatsappLink('Hi Apex Detailing, I have a question.');
  }

  initHeader();
  initReveal();
  initServices();
  initGallery();
  initCompare();
  initForm();
  initReviews();
  initFaq();
  initFloat();
})();