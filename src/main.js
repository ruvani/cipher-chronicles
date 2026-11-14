import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import './style.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = Boolean(SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('YOUR-PROJECT'));
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const starter = [
  {chapter:'01 · OPENING NOTES', title:'Welcome, curious mind.', lead:'Every secret has a story. Every message leaves a trace.', body_html:'<p>Welcome to <em>Cipher Chronicles</em> — a journal dedicated to exploring the ideas, technologies and people that help keep information secure.</p><p>From ancient substitution ciphers to the algorithms protecting today’s digital conversations, this is a journey through the science of secrecy, trust and privacy.</p><blockquote>“Unlocking knowledge, one cipher at a time.”</blockquote>', status:'published'},
  {chapter:'02 · FOUNDATIONS', title:'What is information security?', lead:'Protecting information is about more than hiding a message.', body_html:'<p>Information security is the practice of protecting information and the systems that store, process and transmit it from unauthorised access, use, disclosure, disruption, modification or destruction.</p><h3>The CIA triad</h3><ul><li><strong>Confidentiality:</strong> information is accessible only to authorised people.</li><li><strong>Integrity:</strong> information remains accurate and is changed only in authorised ways.</li><li><strong>Availability:</strong> information and services are accessible when needed.</li></ul><aside>Think about it: which part of the CIA triad is affected if a record is secretly altered?</aside>', status:'published'},
  {chapter:'03 · CLASSICAL CIPHERS', title:'A first encounter with ciphers', lead:'Before computers, people already needed ways to protect messages.', body_html:'<p>A <strong>cipher</strong> transforms readable information (plaintext) into ciphertext and, with the correct key, back again.</p><h3>The Caesar cipher</h3><p>A Caesar cipher shifts each letter by a fixed number of positions. With a shift of three, HELLO becomes KHOOR.</p><aside>The Caesar cipher is useful for learning, but it is not secure by modern standards. Its tiny key space makes brute-force guessing easy.</aside>', status:'published'},
  {chapter:'04 · MODERN CRYPTOGRAPHY', title:'From shared secrets to public keys', lead:'Modern cryptography supports secure communication at global scale.', body_html:'<h3>Symmetric-key cryptography</h3><p>The sender and receiver use the same secret key (or keys that are straightforward to derive from one another). AES is a widely used example.</p><h3>Asymmetric-key cryptography</h3><p>A mathematically related public and private key pair is used. The public key can be shared; the private key must be protected. RSA and elliptic-curve cryptography are familiar examples.</p>', status:'published'},
  {chapter:'05 · PROTOCOLS', title:'The trust behind HTTPS', lead:'A secure connection is a conversation with carefully checked credentials.', body_html:'<p>Transport Layer Security (TLS) helps protect data sent between applications. HTTPS is HTTP carried over TLS.</p><ul><li><strong>Confidentiality</strong> through encryption.</li><li><strong>Integrity</strong> through authenticated protection of transmitted data.</li><li><strong>Authentication</strong>, commonly through digital certificates.</li></ul><p>The details depend on the TLS version and negotiated cipher suite.</p>', status:'published'},
  {chapter:'06 · THE NEXT FRONTIER', title:'Preparing for a quantum future', lead:'Cryptography evolves as computing capabilities change.', body_html:'<p>Large-scale, fault-tolerant quantum computers would threaten some widely used public-key cryptographic systems.</p><h3>Post-quantum cryptography</h3><p>Post-quantum cryptography develops classical algorithms designed to resist attacks from both classical and quantum computers. Examples include ML-KEM for key encapsulation and ML-DSA for digital signatures.</p><blockquote>The future of security is not a single algorithm. It is the ability to adapt.</blockquote>', status:'published'}
];

let pages = [];
let index = -1;
let isAdmin = false;
let currentUser = null;
let editingId = null;
let editMode = false;

const app = document.querySelector('#app');

const escapeHTML = (s = '') =>
  String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

const safeBody = html =>
  DOMPurify.sanitize(html || '<p></p>', { USE_PROFILES: { html: true } });

// Remove the built-in interactive digital-signature diagram marker.
// Article text and separately embedded GIF animations remain untouched.
function renderVisualMarkers(html) {
  return html.replace(/<div\b(?=[^>]*data-visual=[\"']digital-signature[\"'])[^>]*>\s*<\/div>/gi, '');
}

function digitalSignatureVisualHTML() {
  return `<section class="visual-explainer" data-visual-widget="digital-signature" aria-label="Animated digital signature process">
    <div class="visual-heading"><span>INTERACTIVE VISUAL</span><h3>How a Digital Signature Works</h3></div>
    <svg class="signature-flow" viewBox="0 0 680 250" role="img" aria-label="Alice's message is hashed, signed with her private key, sent to Bob and verified with her public key">
      <defs><marker id="sigArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#987344"/></marker></defs>
      <path class="flow-line" d="M112 88 H210 M278 88 H376 M444 88 H542" marker-end="url(#sigArrow)"/>
      <g class="flow-node node-alice"><rect x="12" y="42" width="100" height="92" rx="10"/><circle cx="62" cy="68" r="13"/><path d="M38 112 Q62 78 86 112"/><text x="62" y="153">Alice</text></g>
      <g class="flow-node node-hash"><rect x="210" y="42" width="68" height="92" rx="10"/><text x="244" y="81" class="node-icon">#</text><text x="244" y="153">SHA-256</text></g>
      <g class="flow-node node-sign"><rect x="376" y="42" width="68" height="92" rx="10"/><path d="M398 84 l22 -22 12 12 -22 22 -14 4z"/><text x="410" y="153">Sign</text></g>
      <g class="flow-node node-bob"><rect x="542" y="42" width="126" height="92" rx="10"/><circle cx="605" cy="68" r="13"/><path d="M580 112 Q605 78 630 112"/><text x="605" y="153">Bob verifies</text></g>
      <circle class="traveller traveller-one" r="7" cy="88"><animateMotion dur="5s" repeatCount="indefinite" path="M112 88 H542"/></circle>
      <circle class="traveller traveller-two" r="4" cy="88"><animateMotion dur="5s" begin=".6s" repeatCount="indefinite" path="M112 88 H542"/></circle>
      <text class="flow-caption" x="340" y="207" text-anchor="middle">Message → Hash → Private-key signature → Public-key verification</text>
    </svg>
    <div class="visual-step" aria-live="polite"><strong data-visual-step-title>1. Create the message</strong><span data-visual-step-text>Alice prepares the message she wants to send to Bob.</span></div>
    <div class="visual-controls"><button type="button" data-visual-prev disabled>← Previous</button><button type="button" class="visual-play" data-visual-play>Pause animation</button><button type="button" data-visual-next>Next step →</button><button type="button" data-visual-replay>Replay</button></div>
  </section>`;
}

function wireVisualExplainers() {
  const steps = [
    ['1. Create the message', 'Alice prepares the original message. The message itself is not encrypted by the digital-signature operation.'],
    ['2. Calculate the hash', 'SHA-256 computes a fixed-length digest from the message. A changed message produces a different digest.'],
    ['3. Sign with the private key', 'Alice uses her private signing key to create a digital signature for the message.'],
    ['4. Send the message and signature', 'Alice sends Bob the original message, the signature and a trusted copy of her public key.'],
    ['5. Verify with the public key', 'Bob uses Alice’s public key to verify the signature against the received message.']
  ];
  document.querySelectorAll('[data-visual-widget="digital-signature"]').forEach(widget => {
    if (widget.dataset.wired) return;
    widget.dataset.wired = 'true';
    let current = 0, timer = null, playing = true;
    const title = widget.querySelector('[data-visual-step-title]');
    const text = widget.querySelector('[data-visual-step-text]');
    const prev = widget.querySelector('[data-visual-prev]');
    const next = widget.querySelector('[data-visual-next]');
    const play = widget.querySelector('[data-visual-play]');
    const render = () => {
      title.textContent = steps[current][0]; text.textContent = steps[current][1];
      prev.disabled = current === 0; next.disabled = current === steps.length - 1;
      widget.dataset.step = String(current + 1);
    };
    const stop = () => { if (timer) clearInterval(timer); timer = null; playing = false; play.textContent = 'Play animation'; widget.classList.add('paused'); };
    const start = () => { if (timer) clearInterval(timer); playing = true; play.textContent = 'Pause animation'; widget.classList.remove('paused'); timer = setInterval(() => { if (current < steps.length - 1) { current++; render(); } else stop(); }, 3600); };
    prev.addEventListener('click', () => { stop(); current = Math.max(0, current - 1); render(); });
    next.addEventListener('click', () => { stop(); current = Math.min(steps.length - 1, current + 1); render(); });
    play.addEventListener('click', () => playing ? stop() : start());
    widget.querySelector('[data-visual-replay]').addEventListener('click', () => { current = 0; render(); start(); });
    render(); start();
  });
}

const coverHTML = () => `<div class="cover-content">
  <div class="cover-top">
    <span class="eyebrow">A FIELD JOURNAL OF DIGITAL SECRETS</span>
    <div class="gold-line"></div>
    <div class="seal">⌘</div>
  </div>
  <div class="cover-middle">
    <div class="ornament">✧ &nbsp; ❖ &nbsp; ✧</div>
    <h1>CIPHER<br>CHRONICLES</h1>
    <div class="gold-line"></div>
    <p class="cover-subtitle">A JOURNEY INTO THE WORLD OF<br>INFORMATION SECURITY</p>
    <div class="ornament">— ✦ —</div>
    <p class="motto">“Unlocking knowledge, one cipher at a time.”</p>
  </div>
  <div class="cover-bottom">
    <div class="gold-line"></div>
    <span class="eyebrow">VOLUME I</span>
    <span class="edition">THE FOUNDATIONS OF INFORMATION SECURITY</span>
  </div>
</div>`;

function shell() {
  app.innerHTML = `<header class="site-header">
    <div class="eyebrow">A FIELD JOURNAL OF DIGITAL SECRETS</div>
    <a class="wordmark" href="#">CIPHER CHRONICLES</a>
    <p class="tagline">A journey into the world of information security</p>
  </header>
  <main>
    <div id="publicView">
      <div class="navline">
        <button id="prev" class="quiet">← Previous</button>
        <span id="pageCounter">COVER</span>
        <button id="next" class="quiet">Next →</button>
      </div>
      <section class="book-stage">
        <div class="book" id="book">
          <article class="paper left-paper" id="leftPaper"></article>
          <article class="paper right-paper" id="rightPaper"></article>
          <div class="turn-sheet" id="turnSheet">
            <div class="turn-face front" id="turnFront"></div>
            <div class="turn-face back" id="turnBack"></div>
          </div>
        </div>
      </section>
      <p class="turn-hint">TURN THE PAGES · USE THE ARROWS OR CLICK THE OUTER PAGE EDGE</p>
      <nav class="chapter-index">
        <h2>✦ EXPLORE THE CHRONICLES ✦</h2>
        <div id="chapterButtons"></div>
      </nav>
    </div>
    <section id="adminView" hidden></section>
  </main>
  <footer>CIPHER CHRONICLES · UNLOCKING KNOWLEDGE, ONE CIPHER AT A TIME</footer>`;

  document.querySelector('#prev').onclick = () => turn(-1);
  document.querySelector('#next').onclick = () => turn(1);

  document.querySelector('#book').addEventListener('click', e => {
    if (editMode || e.target.closest('a, button, input, textarea, select')) return;

    const r = e.currentTarget.getBoundingClientRect();

    if (e.clientX > r.left + r.width * 0.78) turn(1);
    else if (e.clientX < r.left + r.width * 0.22) turn(-1);
  });

  // Mobile horizontal swipe navigation. Vertical movement remains available for scrolling.
  const bookSurface = document.querySelector('#book');
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeTarget = null;

  bookSurface.addEventListener('touchstart', e => {
    if (!mobileBook() || editMode || e.touches.length !== 1) {
      swipeTarget = null;
      return;
    }
    if (e.target.closest('a, button, input, textarea, select, [data-no-page-swipe]')) {
      swipeTarget = null;
      return;
    }
    swipeTarget = e.target;
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }, { passive: true });

  bookSurface.addEventListener('touchend', e => {
    if (!mobileBook() || swipeTarget === null || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    swipeTarget = null;

    // Require a deliberate horizontal gesture; ignore taps and vertical scrolling.
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    turn(dx < 0 ? 1 : -1);
  }, { passive: true });

  bookSurface.addEventListener('touchcancel', () => { swipeTarget = null; }, { passive: true });

  document.addEventListener('keydown', e => {
    if (
      location.hash === '#admin' ||
      ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
    ) return;

    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
}

function getBookPages() {
  const contentPages = pages.filter(p => p.page_type !== 'blank' && p.title);
  const chapters = [];
  const seen = new Set();

  contentPages.forEach(p => {
    const label = (p.chapter || p.title || 'Untitled chapter').trim();
    if (!seen.has(label)) {
      seen.add(label);
      const originalIndex = pages.indexOf(p);
      chapters.push({
        label,
        title: (p.title || '').trim(),
        pageNumber: originalIndex + 3,
        pageIndex: originalIndex + 2,
        spread: Math.floor((originalIndex + 2) / 2)
      });
    }
  });

  // Reserve the first left-hand page as a blank verso so the contents
  // appears on the first right-hand page, like a printed book.
  if (!chapters.length) return [...pages];
  return [
    { page_type: 'blank', _system: true },
    { page_type: 'toc', chapters, _system: true },
    ...pages
  ];
}

function pageMarkup(p, number) {
  if (p && p.page_type === 'toc') {
    return `<div class="page-inner toc-page">
      <div class="chapter-label">CIPHER CHRONICLES</div>
      <h2>Contents</h2>
      <div class="short-rule"></div>
      <div class="toc-entries">${p.chapters.map((c, i) => `<button class="toc-entry" data-toc-spread="${c.spread}" data-toc-page-index="${c.pageIndex}"><span class="toc-number">${String(i + 1).padStart(2, '0')}</span><span class="toc-name">${escapeHTML(c.label)}</span><span class="toc-title">${escapeHTML(c.title || '')}</span><span class="toc-dots"></span><span class="toc-page-number">${String(c.pageNumber).padStart(2, '0')}</span></button>`).join('')}</div>
      <div class="folio">${String(number).padStart(2, '0')}</div>
    </div>`;
  }
  if (p && p.page_type === 'blank') {
    return '<div class="page-inner blank-page" aria-label="Blank page"></div>';
  }
  if (!p) {
    return `<div class="page-inner endpaper">
      <span class="eyebrow">THE JOURNEY CONTINUES</span>
      <h2>To be continued…</h2>
      <p>Every discovery begins with a question.</p>
      <span class="folio">✦</span>
    </div>`;
  }

  return `<div class="page-inner">
    ${p.page_type === 'continuation' ? '' : `<div class="chapter-label">${escapeHTML(p.chapter || '')}</div>`}
    ${p.title && String(p.title).trim() && String(p.title).toLowerCase() !== 'null' ? `<h2>${escapeHTML(p.title)}</h2><div class="short-rule"></div>` : ''}
    ${p.lead ? `<p class="lead">${escapeHTML(p.lead)}</p>` : ''}
    <div class="article-body">${renderVisualMarkers(safeBody(p.body_html))}</div>
    <div class="folio">${String(number).padStart(2, '0')}</div>
  </div>`;
}

function spreadMarkup(spreadIndex) {
  if (spreadIndex < 0) {
    return `<div class="flip-page flip-left"></div>
      <div class="flip-page flip-right">${coverHTML()}</div>`;
  }

  const bookPages = getBookPages();
  const leftPage = bookPages[spreadIndex * 2];
  const rightPage = bookPages[spreadIndex * 2 + 1];

  return `<div class="flip-page flip-left">
      ${leftPage ? pageMarkup(leftPage, spreadIndex * 2 + 1) : ''}
    </div>
    <div class="flip-page flip-right">
      ${rightPage ? pageMarkup(rightPage, spreadIndex * 2 + 2) : pageMarkup(null)}
    </div>`;
}

let lastMobileMode = window.matchMedia('(max-width: 700px)').matches;

function draw() {
  const bookPages = getBookPages();
  const mobile = mobileBook();
  if (mobile !== lastMobileMode) {
    if (index >= 0) index = mobile ? index * 2 : Math.floor(index / 2);
    lastMobileMode = mobile;
  }

  if (mobile) {
    const current = index < 0 ? null : bookPages[index];
    document.querySelector('#leftPaper').innerHTML = '';
    document.querySelector('#rightPaper').innerHTML =
      index < 0 ? coverHTML() : pageMarkup(current, index + 1);
    document.querySelector('#pageCounter').textContent =
      index < 0 ? 'THE COVER' : `PAGE ${index + 1} / ${bookPages.length}`;
    document.querySelector('#prev').disabled = index < 0;
    document.querySelector('#next').disabled = index >= bookPages.length - 1;
  } else {
    const left = index < 0 ? null : bookPages[index * 2];
    const right = index < 0 ? null : bookPages[index * 2 + 1];
    document.querySelector('#leftPaper').innerHTML =
      index < 0 ? '' : pageMarkup(left, index * 2 + 1);
    document.querySelector('#rightPaper').innerHTML =
      index < 0 ? coverHTML() : pageMarkup(right, index * 2 + 2);
    const count = Math.max(1, Math.ceil(bookPages.length / 2));
    document.querySelector('#pageCounter').textContent =
      index < 0 ? 'THE COVER' : `SPREAD ${index + 1} / ${count}`;
    document.querySelector('#prev').disabled = index < 0;
    document.querySelector('#next').disabled = index >= count - 1;
  }

  const btns = pages.map((p, i) => ({ p, i }))
    .filter(({ p }) => p.page_type !== 'blank' && p.page_type !== 'continuation' && p.title)
    .map(({ p, i }) => {
      const spread = Math.floor((i + 2) / 2);
      const pageIndex = i + 2;
      return `<button data-spread="${spread}" data-page-index="${pageIndex}">${escapeHTML(p.chapter || p.title || `Page ${i + 1}`)}</button>`;
    }).join('');

  document.querySelector('#chapterButtons').innerHTML = btns;
  document.querySelectorAll('#chapterButtons button').forEach(b => {
    b.onclick = () => {
      index = mobileBook() ? Number(b.dataset.pageIndex) : Number(b.dataset.spread);
      draw();
    };
  });

  document.querySelectorAll('[data-toc-spread]').forEach(b => {
    b.onclick = () => {
      index = mobileBook() ? Number(b.dataset.tocPageIndex) : Number(b.dataset.tocSpread);
      draw();
      document.querySelector('.book-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
  });
  wireVisualExplainers();
}

/* Page-turn animation: animate the complete two-page spread */

let flipping = false;
const mobileBook = () => window.matchMedia('(max-width: 700px)').matches;

function turn(dir) {
  if (flipping) return;
  const bookPages = getBookPages();
  const sheet = document.querySelector('#turnSheet');
  const front = document.querySelector('#turnFront');
  const back = document.querySelector('#turnBack');
  const book = document.querySelector('#book');
  if (!sheet || !front || !back) return;

  // On narrow screens, turn one physical page at a time so no left-hand pages are skipped.
  if (mobileBook()) {
    const target = Math.max(-1, Math.min(bookPages.length - 1, index + dir));
    if (target === index) return;
    flipping = true;
    book.classList.add('is-turning');
    front.innerHTML = index < 0
      ? `<div class="flip-page flip-right cover-leaf">${coverHTML()}</div>`
      : `<div class="flip-page flip-right">${pageMarkup(bookPages[index], index + 1)}</div>`;
    back.innerHTML = target < 0
      ? `<div class="flip-page flip-right cover-leaf">${coverHTML()}</div>`
      : `<div class="flip-page flip-right">${pageMarkup(bookPages[target], target + 1)}</div>`;
    sheet.classList.remove('cover-opening', 'is-flipping', 'turned-forward', 'turned-backward');
    sheet.style.transform = 'rotateY(0deg)';
    sheet.classList.add('is-flipping');
    void sheet.offsetWidth;
    requestAnimationFrame(() => sheet.classList.add(dir > 0 ? 'turned-forward' : 'turned-backward'));
    window.setTimeout(() => {
      sheet.classList.remove('is-flipping', 'turned-forward', 'turned-backward');
      sheet.style.transform = 'rotateY(0deg)';
      book.classList.remove('is-turning');
      index = target;
      draw();
      flipping = false;
    }, 900);
    return;
  }

  const maxSpread = Math.max(0, Math.ceil(bookPages.length / 2) - 1);
  const target = Math.max(-1, Math.min(maxSpread, index + dir));
  if (target === index) return;
  flipping = true;
  const openingCover = index === -1 && dir > 0;
  book.classList.add('is-turning');

  if (openingCover) {
    // Desktop cover: keep the static paper hidden while the single cover leaf
    // turns. The inside of that leaf reveals the Contents page; draw() then
    // renders the normal blank-left / Contents-right spread after the turn.
    sheet.classList.add('cover-opening');
    front.innerHTML = `<div class="flip-page flip-right cover-leaf">${coverHTML()}</div>`;
    back.innerHTML = `<div class="flip-page flip-right cover-reveal">${pageMarkup(bookPages[1], 2)}</div>`;
  } else {
    sheet.classList.remove('cover-opening');
    front.innerHTML = spreadMarkup(index);
    back.innerHTML = spreadMarkup(target);
  }
  sheet.classList.remove('is-flipping', 'turned-forward', 'turned-backward');
  sheet.style.transform = 'rotateY(0deg)';
  sheet.classList.add('is-flipping');
  void sheet.offsetWidth;
  requestAnimationFrame(() => sheet.classList.add(dir > 0 ? 'turned-forward' : 'turned-backward'));
  window.setTimeout(() => {
    sheet.classList.remove('is-flipping', 'turned-forward', 'turned-backward', 'cover-opening');
    sheet.style.transform = 'rotateY(0deg)';
    book.classList.remove('is-turning', 'is-cover-opening');
    index = target;
    draw();
    flipping = false;
  }, 900);
}

/* Load published notebook pages */

async function loadPublicPages() {
  if (!configured) {
    pages = starter;
    return;
  }

  const { data, error } = await supabase
    .from('notebook_pages')
    .select('id,page_type,chapter,title,lead,body_html,sort_order')
    .eq('status', 'published')
    .order('sort_order');

  if (error) {
    console.error(error);
    pages = starter;
    return;
  }

  pages = data?.length ? data : starter;
}

/* Check administrator session */

async function checkSession() {
  if (!configured) return;

  const { data } = await supabase.auth.getSession();

  currentUser = data.session?.user || null;

  if (currentUser) {
    const { data: membership } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    isAdmin = !!membership;
  }
}

/* Administrator login */

function showLogin() {
  document.querySelector('#publicView').hidden = true;

  const view = document.querySelector('#adminView');
  view.hidden = false;

  view.innerHTML = `<div class="admin-card">
    <div class="eyebrow">PRIVATE AUTHOR WORKSPACE</div>
    <h2>Administrator sign in</h2>
    <p class="admin-intro">Sign in to write, edit and publish notebook pages.</p>

    <form id="loginForm">
      <label>Email address
        <input name="email" type="email" required autocomplete="username">
      </label>

      <label>Password
        <input name="password" type="password" required autocomplete="current-password">
      </label>

      <button class="gold-button" type="submit">Sign in</button>
    </form>

    <p class="form-message" id="loginMessage"></p>
    <a href="#" id="backPublic">← Return to the public notebook</a>
  </div>`;

  document.querySelector('#backPublic').onclick = e => {
    e.preventDefault();
    location.hash = '';
  };

  document.querySelector('#loginForm').onsubmit = async e => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get('email'),
      password: fd.get('password')
    });

    document.querySelector('#loginMessage').textContent =
      error ? error.message : 'Signed in. Loading your workspace…';

    if (!error) {
      await checkSession();

      if (isAdmin) {
        showDashboard();
      } else {
        document.querySelector('#loginMessage').textContent =
          'This account is not authorised as a notebook administrator.';
      }
    }
  };
}

/* Administrator dashboard */

async function showDashboard() {
  document.querySelector('#publicView').hidden = true;

  const view = document.querySelector('#adminView');
  view.hidden = false;

  const { data, error } = await supabase
    .from('notebook_pages')
    .select('*')
    .order('sort_order');

  if (error) {
    view.innerHTML = `<p class="error">${escapeHTML(error.message)}</p>`;
    return;
  }

  view.innerHTML = `<div class="admin-heading">
    <div>
      <div class="eyebrow">PRIVATE AUTHOR WORKSPACE</div>
      <h2>Notebook desk</h2>
      <p>Manage drafts and published chapters.</p>
    </div>

    <div class="admin-actions">
      <button id="newPage" class="gold-button">＋ New page</button>
      <button id="logout" class="quiet">Sign out</button>
    </div>
  </div>

  <div class="admin-list">
    ${(data || []).map(p => `
      <article class="admin-row">
        <div>
          <span class="status-tag ${p.status}">${p.status}</span>
          <h3>${p.page_type === 'blank' ? 'Blank page' : escapeHTML(p.title || 'Untitled page')}</h3>
          <small>${p.page_type === 'blank' ? 'No chapter content' : p.page_type === 'continuation' ? `Continuation · ${escapeHTML(p.chapter || 'Chapter not assigned')}` : escapeHTML(p.chapter || '')}</small>
        </div>
        <button data-edit="${p.id}" class="quiet">Edit</button>
      </article>
    `).join('') || '<p>No pages yet. Create your first page.</p>'}
  </div>

  <div id="editor"></div>`;

  document.querySelector('#logout').onclick = async () => {
    await supabase.auth.signOut();
    isAdmin = false;
    location.hash = '';
  };

  document.querySelector('#newPage').onclick = () => editorForm();

  document.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => editorForm(data.find(p => p.id === b.dataset.edit));
  });
}

/* Create and edit notebook pages */

function editorForm(p = {}) {
  const target = document.querySelector('#editor');
  const pageType = p.page_type || 'content';
  const isBlank = pageType === 'blank';
  const isContinuation = pageType === 'continuation';

  target.innerHTML = `<div class="editor-card">
    <h3>${p.id ? 'Edit page' : 'Create a page'}</h3>

    <form id="pageForm">
      <label>Page type
        <select name="page_type" id="pageType">
          <option value="content" ${pageType === 'content' ? 'selected' : ''}>Chapter page</option>
          <option value="continuation" ${isContinuation ? 'selected' : ''}>Continuation page (same chapter)</option>
          <option value="blank" ${isBlank ? 'selected' : ''}>Blank page</option>
        </select>
      </label>

      <div id="contentFields" ${isBlank ? 'hidden' : ''}>
        <div id="chapterField" ${isContinuation ? 'hidden' : ''}>
          <label>Chapter / section
            <input name="chapter" value="${escapeHTML(p.chapter || '')}" placeholder="e.g. CHAPTER 01 · FOUNDATIONS">
          </label>
        </div>

        <p id="continuationHelp" class="editor-help" ${isContinuation ? '' : 'hidden'}>
          This page will automatically continue the chapter of the nearest preceding content page. No chapter heading will be printed again.
        </p>

        <label>Page title
          <input name="title" value="${escapeHTML(p.title || '')}" placeholder="Enter the page title">
        </label>

        <label>Introductory line
          <input name="lead" value="${escapeHTML(p.lead || '')}">
        </label>

        <label>Article content
          <textarea name="body_html" rows="12">${escapeHTML(p.body_html || '<p>Write your article here…</p>')}</textarea>
        </label>

        <p class="editor-help">
          Content accepts basic HTML such as &lt;p&gt;, &lt;h3&gt;,
          &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; and &lt;blockquote&gt;.
        </p>
      </div>

      <label>Publication status
        <select name="status">
          <option value="draft" ${p.status !== 'published' ? 'selected' : ''}>Draft — private</option>
          <option value="published" ${p.status === 'published' ? 'selected' : ''}>Published — visible to visitors</option>
        </select>
      </label>

      <div class="admin-actions">
        <button class="gold-button" type="submit">Save page</button>
        <button type="button" class="quiet" id="cancelEdit">Cancel</button>
        ${p.id ? '<button type="button" class="danger" id="deletePage">Delete</button>' : ''}
      </div>

      <p id="editorMessage" class="form-message"></p>
    </form>
  </div>`;

  const syncPageTypeFields = type => {
    document.querySelector('#contentFields').hidden = type === 'blank';
    document.querySelector('#chapterField').hidden = type === 'continuation';
    document.querySelector('#continuationHelp').hidden = type !== 'continuation';
  };
  document.querySelector('#pageType').onchange = e => syncPageTypeFields(e.target.value);

  document.querySelector('#cancelEdit').onclick = () => { target.innerHTML = ''; };

  document.querySelector('#pageForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get('page_type');
    const sortOrder = p.sort_order ?? Date.now();
    let chapter = type === 'blank' ? null : (fd.get('chapter') || null);

    if (type === 'continuation') {
      // For a new continuation, inherit the chapter from the closest earlier
      // non-blank page. For edits, retain the chapter already assigned.
      chapter = p.chapter || null;
      if (!chapter) {
        const { data: earlierPages, error: lookupError } = await supabase
          .from('notebook_pages')
          .select('page_type,chapter,sort_order')
          .lt('sort_order', sortOrder)
          .order('sort_order', { ascending: false })
          .limit(100);
        if (lookupError) {
          document.querySelector('#editorMessage').textContent = lookupError.message;
          return;
        }
        chapter = (earlierPages || []).find(row => row.page_type !== 'blank' && row.chapter)?.chapter || null;
      }
      if (!chapter) {
        document.querySelector('#editorMessage').textContent = 'There is no earlier chapter to continue. Create a Chapter page first.';
        return;
      }
    }

    const payload = {
      page_type: type,
      chapter,
      title: type === 'blank' ? null : (type === 'continuation' ? (fd.get('title') || '') : (fd.get('title') || null)),
      lead: type === 'blank' ? '' : (fd.get('lead') || ''),
      body_html: type === 'blank' ? '' : DOMPurify.sanitize(fd.get('body_html') || '', { USE_PROFILES: { html: true } }).replace(/<div\b(?=[^>]*data-visual=["']digital-signature["'])[^>]*>\s*<\/div>/gi, ''),
      status: fd.get('status'),
      updated_at: new Date().toISOString(),
      sort_order: sortOrder
    };

    const result = p.id
      ? await supabase.from('notebook_pages').update(payload).eq('id', p.id)
      : await supabase.from('notebook_pages').insert(payload);

    document.querySelector('#editorMessage').textContent = result.error ? result.error.message : 'Saved successfully.';
    if (!result.error) setTimeout(showDashboard, 500);
  };

  if (p.id) {
    document.querySelector('#deletePage').onclick = async () => {
      if (!confirm('Delete this page permanently?')) return;
      const result = await supabase.from('notebook_pages').delete().eq('id', p.id);
      if (result.error) document.querySelector('#editorMessage').textContent = result.error.message;
      else showDashboard();
    };
  }
}

async function route() {
  if (location.hash === '#admin') {
    if (!configured) {
      document.querySelector('#publicView').hidden = true;

      const v = document.querySelector('#adminView');
      v.hidden = false;

      v.innerHTML = `<div class="admin-card">
        <h2>Setup required</h2>
        <p>Connect this site to your Supabase project first. Follow the setup guide in README.md.</p>
      </div>`;

      return;
    }

    await checkSession();

    if (isAdmin) {
      await showDashboard();
    } else {
      showLogin();
    }
  } else {
    document.querySelector('#adminView').hidden = true;
    document.querySelector('#publicView').hidden = false;

    await loadPublicPages();

    index = -1;
    draw();
  }
}

shell();
route();
window.addEventListener('hashchange', route);
window.addEventListener('resize', () => {
  if (location.hash !== '#admin') draw();
});
