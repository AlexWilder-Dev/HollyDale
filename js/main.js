(() => {
  'use strict';

  /* Opening hours, London time. Day index: 0 = Sunday … 6 = Saturday.
     Times are minutes after midnight; null means closed all day. */
  const HOURS = {
    0: { open: 12 * 60, close: 22 * 60 },
    1: null,
    2: { open: 15 * 60, close: 23 * 60 },
    3: { open: 15 * 60, close: 23 * 60 },
    4: { open: 15 * 60, close: 23 * 60 },
    5: { open: 12 * 60, close: 23 * 60 },
    6: { open: 12 * 60, close: 23 * 60 }
  };
  const TIME_ZONE = 'Europe/London';
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------- Opening hours + live status ---------- */

  function londonNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (type) => (parts.find((p) => p.type === type) || {}).value;
    return {
      day: DAY_INDEX[get('weekday')],
      minutes: Number(get('hour')) * 60 + Number(get('minute')),
      isoDate: `${get('year')}-${get('month')}-${get('day')}`
    };
  }

  function formatTime(mins) {
    const h24 = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const h12 = h24 % 12 || 12;
    const suffix = h24 < 12 ? 'am' : 'pm';
    return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
  }

  function getStatus(now) {
    const today = HOURS[now.day];
    if (today && now.minutes >= today.open && now.minutes < today.close) {
      return { open: true, text: `Open now · until ${formatTime(today.close)}` };
    }
    if (today && now.minutes < today.open) {
      return { open: false, text: `Opens today at ${formatTime(today.open)}` };
    }
    for (let offset = 1; offset <= 7; offset += 1) {
      const day = (now.day + offset) % 7;
      const hours = HOURS[day];
      if (hours) {
        const when = offset === 1 ? 'tomorrow' : DAY_NAMES[day];
        return { open: false, text: `Opens ${when} at ${formatTime(hours.open)}` };
      }
    }
    return { open: false, text: 'Closed' };
  }

  function updateStatus() {
    const now = londonNow();
    const status = getStatus(now);
    $$('[data-status-wrap]').forEach((node) => {
      node.classList.toggle('is-open', status.open);
      node.classList.toggle('is-closed', !status.open);
    });
    $$('[data-status]').forEach((node) => { node.textContent = status.text; });
    $$('.hours tr[data-day]').forEach((row) => {
      const isToday = Number(row.dataset.day) === now.day;
      row.classList.toggle('is-today', isToday);
      if (isToday) row.setAttribute('aria-current', 'date');
      else row.removeAttribute('aria-current');
    });
    const dateInput = $('#hire-date');
    if (dateInput) dateInput.min = now.isoDate;
  }

  updateStatus();
  setInterval(updateStatus, 30 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateStatus(); });

  /* ---------- Navigation ---------- */

  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');

  function setNav(open) {
    document.documentElement.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    $('.nav-toggle__label', toggle).textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1120px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });
  }

  /* ---------- Data loading ---------- */

  function loadJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`${path}: ${res.status}`);
      return res.json();
    });
  }

  const offline = 'This part loads from the data folder. Preview the site through a local web server to see it.';

  /* Menu (data/menu.json) */

  function formatPrice(price) {
    if (typeof price !== 'number') return '£–';
    return `£${price % 1 ? price.toFixed(2) : price}`;
  }

  const menuBody = $('[data-menu]');
  if (menuBody) {
    loadJSON('data/menu.json').then((data) => {
      menuBody.textContent = '';
      (data.sections || []).forEach((section) => {
        const wrap = el('section', 'menu-section');
        wrap.append(el('h4', 'menu-section__name', section.name));
        const list = el('ul', 'menu-list');
        (section.items || []).forEach((item) => {
          const li = el('li', `menu-item${item.star ? ' menu-item--star' : ''}`);
          const row = el('div', 'menu-item__row');
          const price = el('span', 'menu-item__price', formatPrice(item.price));
          if (typeof item.price !== 'number') price.setAttribute('aria-label', 'Price to be confirmed');
          row.append(el('span', 'menu-item__name', item.name), price);
          li.append(row);
          if (item.description || (item.tags && item.tags.length)) {
            const desc = el('p', 'menu-item__desc', item.description || '');
            if (item.tags && item.tags.length) {
              const tags = el('span', 'menu-item__tags');
              item.tags.forEach((t) => tags.append(el('span', 'menu-tag', t)));
              desc.append(tags);
            }
            li.append(desc);
          }
          list.append(li);
        });
        wrap.append(list);
        menuBody.append(wrap);
      });
      const note = $('[data-menu-note]');
      if (note && data.note) note.textContent = data.note;
    }).catch(() => {
      menuBody.textContent = '';
      menuBody.append(el('p', 'menu-card__loading', offline));
    });
  }

  /* Goings on (data/goings-on.json) */

  const TILTS = ['-1.6deg', '1.2deg', '-0.6deg', '1.8deg', '-1.1deg', '0.7deg', '-1.9deg', '1.4deg'];
  const notices = $('[data-goings]');
  if (notices) {
    loadJSON('data/goings-on.json').then((data) => {
      notices.textContent = '';
      (data.items || []).forEach((item, i) => {
        const li = el('li', `notice notice--${item.colour || 'paper'} reveal`);
        li.style.setProperty('--tilt', TILTS[i % TILTS.length]);
        li.append(
          el('p', 'notice__when', item.when),
          el('h3', 'notice__title', item.title),
          el('p', 'notice__detail', item.detail)
        );
        notices.append(li);
        observeReveal(li);
      });
    }).catch(() => {
      notices.textContent = '';
      const li = el('li', 'notice notice--paper');
      li.append(el('p', 'notice__detail', offline));
      notices.append(li);
    });
  }

  /* Word on the road (data/reviews.json) */

  const quotes = $('[data-quotes]');
  if (quotes) {
    loadJSON('data/reviews.json').then((data) => {
      if (data.google) {
        const { rating, count } = data.google;
        const score = $('[data-rating-score]');
        const stars = $('[data-rating-stars]');
        const total = $('[data-rating-count]');
        if (score) score.textContent = rating.toFixed(1);
        if (stars) {
          stars.style.setProperty('--rating', rating);
          stars.setAttribute('aria-label', `${rating.toFixed(1)} out of 5 stars`);
        }
        if (total) total.textContent = count;
      }
      quotes.textContent = '';
      (data.quotes || []).forEach((q) => {
        const fig = el('figure', 'clipping reveal');
        const bq = el('blockquote');
        bq.append(el('p', null, q.text));
        const cap = el('figcaption');
        if (q.url) {
          const a = el('a', null, q.source);
          a.href = q.url;
          a.target = '_blank';
          a.rel = 'noopener';
          cap.append(a);
        } else {
          cap.textContent = q.source;
        }
        fig.append(bq, cap);
        quotes.append(fig);
        observeReveal(fig);
      });
    }).catch(() => {
      quotes.textContent = '';
    });
  }

  /* ---------- Party enquiry (front end only) ---------- */

  const form = $('#hire-form');
  const success = $('#hire-success');

  function setError(input, show) {
    const field = input.closest('.field');
    const msg = $(`#${input.id}-err`);
    field.classList.toggle('is-invalid', show);
    if (msg) msg.hidden = !show;
    if (show && msg) input.setAttribute('aria-describedby', msg.id);
    else input.removeAttribute('aria-describedby');
    input.setAttribute('aria-invalid', String(show));
  }

  function validate() {
    const name = $('#hire-name');
    const date = $('#hire-date');
    const guests = $('#hire-guests');
    const today = londonNow().isoDate;
    const checks = [
      [name, name.value.trim().length > 0],
      [date, Boolean(date.value) && date.value >= today],
      [guests, guests.value !== '' && Number.isInteger(Number(guests.value)) && Number(guests.value) >= 1]
    ];
    let firstBad = null;
    checks.forEach(([input, ok]) => {
      setError(input, !ok);
      if (!ok && !firstBad) firstBad = input;
    });
    return firstBad;
  }

  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstBad = validate();
      if (firstBad) {
        firstBad.focus();
        return;
      }
      const data = new FormData(form);
      const first = String(data.get('name')).trim().split(/\s+/)[0];
      const date = new Date(`${data.get('date')}T12:00:00`);
      const dateText = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const guests = Number(data.get('guests'));
      $('[data-success-title]', success).textContent = `Thanks, ${first}.`;
      $('[data-success-detail]', success).textContent =
        `We've got your enquiry for ${dateText}, ${guests} ${guests === 1 ? 'guest' : 'guests'}. The team will be in touch to talk it through.`;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    form.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if (field && field.classList.contains('is-invalid')) setError(e.target, false);
    });

    $('[data-success-reset]', success).addEventListener('click', () => {
      form.reset();
      success.hidden = true;
      form.hidden = false;
      $('#hire-name').focus();
    });
  }

  /* ---------- Reveal on scroll + current section in nav ---------- */

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })
    : null;

  function observeReveal(node) {
    if (io) io.observe(node);
    else node.classList.add('is-in');
  }

  $$('.story__text, .story__richard, .inside__head, .photo, .food__intro, .menu-card, .garden__card, .cork__intro, .polaroid, .chalkboard--wall, .slip-wrap, .history__head, .register, .history__then, .word__head, .find__grid > div')
    .forEach((node) => {
      node.classList.add('reveal');
      observeReveal(node);
    });

  if (io) {
    const links = new Map($$('.site-nav a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = links.get(entry.target.id);
        if (link && entry.isIntersecting) {
          links.forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }
})();
