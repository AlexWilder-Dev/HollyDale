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

  /* ---------- Time helpers ---------- */

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

    $$('[data-status-wrap]').forEach((el) => {
      el.classList.toggle('is-open', status.open);
      el.classList.toggle('is-closed', !status.open);
    });
    $$('[data-status]').forEach((el) => { el.textContent = status.text; });

    $$('.hours tr[data-day]').forEach((row) => {
      const isToday = Number(row.dataset.day) === now.day;
      row.classList.toggle('is-today', isToday);
      if (isToday) row.setAttribute('aria-current', 'date');
      else row.removeAttribute('aria-current');
    });

    const dateInput = $('#hire-date');
    if (dateInput) dateInput.min = now.isoDate;

    return now;
  }

  updateStatus();
  setInterval(updateStatus, 30 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateStatus();
  });

  /* ---------- Header + navigation ---------- */

  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');

  function setNav(open) {
    document.documentElement.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    $('.nav-toggle__label', toggle).textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1000px)').addEventListener('change', (e) => {
      if (e.matches) setNav(false);
    });
  }

  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Photo slots: show a photo once its file exists ---------- */

  $$('.slot img').forEach((img) => {
    const slot = img.closest('.slot');
    const show = () => { if (img.naturalWidth > 0) slot.classList.add('has-photo'); };
    if (img.complete) show();
    else img.addEventListener('load', show, { once: true });
  });

  /* ---------- Menu (data/menu.json) ---------- */

  const menuList = $('[data-menu]');
  const menuNote = $('[data-menu-note]');

  function formatPrice(price) {
    if (typeof price !== 'number') return '£–';
    return `£${price % 1 ? price.toFixed(2) : price}`;
  }

  function renderMenu(data) {
    const items = Array.isArray(data.items) ? data.items : [];
    if (data.note && menuNote) menuNote.textContent = data.note;
    menuList.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'menu-item';

      const row = document.createElement('div');
      row.className = 'menu-item__row';
      const name = document.createElement('h4');
      name.className = 'menu-item__name';
      name.textContent = item.name;
      const dots = document.createElement('span');
      dots.className = 'menu-item__dots';
      dots.setAttribute('aria-hidden', 'true');
      const price = document.createElement('span');
      price.className = 'menu-item__price';
      price.textContent = formatPrice(item.price);
      if (typeof item.price !== 'number') price.setAttribute('aria-label', 'Price to be confirmed');
      row.append(name, dots, price);

      const desc = document.createElement('p');
      desc.className = 'menu-item__desc';
      if (item.description) desc.append(document.createTextNode(item.description));
      if (item.placeholder) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = 'Placeholder';
        desc.append(tag);
      }

      li.append(row, desc);
      menuList.append(li);
    });
  }

  if (menuList) {
    fetch('data/menu.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(renderMenu)
      .catch(() => {
        menuList.innerHTML = '<li class="menu__loading">The menu couldn’t load here. Preview the site through a local web server to see it.</li>';
      });
  }

  /* ---------- Private hire form (front end only) ---------- */

  const form = $('#hire-form');
  const success = $('#hire-success');

  function setError(input, show) {
    const field = input.closest('.field');
    const msg = $(`#${input.id}-err`);
    field.classList.toggle('is-invalid', show);
    if (msg) msg.hidden = !show;
    if (show) input.setAttribute('aria-describedby', msg.id);
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
      [guests, Number.isInteger(Number(guests.value)) && Number(guests.value) >= 1 && guests.value !== '']
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

  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));

    const links = new Map($$('.site-nav a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = links.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }
})();
