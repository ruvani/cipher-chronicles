
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
function renderVisualMarkers(html) {
  return html.replace(/<div\b(?=[^>]*data-visual=["']digital-signature["'])[^>]*>\s*<\/div>/gi, '');
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

  // Mobile horizontal swipe navigation.
  // Vertical movement remains available for scrolling.
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

    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

    turn(dx < 0 ? 1 : -1);
  }, { passive: true });

  bookSurface.addEventListener('touchcancel', () => {
    swipeTarget = null;
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (
      location.hash === '#admin' ||
      ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
    ) return;

    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
}

function mobileBook() {
  return window.matchMedia('(max-width: 700px)').matches;
}

function getBookPages() {
  const contentPages = pages.filter(p =>
    p.page_type !== 'blank' &&
    p.page_type !== 'continuation' &&
    p.title
  );

  const chapters = [];
  const seen = new Set();

  contentPages.forEach(p => {
    const label = (p.chapter || p.title || 'Untitled chapter').trim();

    if (!seen.has(label)) {
      seen.add(label);
      const originalIndex = pages.indexOf(p);

      chapters.push({
        label,
        title: p.title || label,
        pageNumber: originalIndex + 3,
        pageIndex: originalIndex + 2,
        spread: Math.floor((originalIndex + 2) / 2)
      });
    }
  });

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
      <ol class="toc-list">
        ${p.chapters.map(ch => `
          <li>
            <button type="button" data-toc-page-index="${ch.pageIndex}">
              <span>${escapeHTML(ch.label)}</span>
              <span>${String(ch.pageNumber).padStart(2, '0')}</span>
            </button>
          </li>
        `).join('')}
      </ol>
      <div class="folio">${String(number).padStart(2, '0')}</div>
    </div>`;
  }

  if (p && p.page_type === 'blank') {
    return `<div class="page-inner blank-page"></div>`;
  }

  if (!p) {
    return `<div class="page-inner blank-page"></div>`;
  }

  const isContinuation = p.page_type === 'continuation';

  const heading = p.title && String(p.title).trim() &&
    String(p.title).toLowerCase() !== 'null'
      ? `<h2>${escapeHTML(p.title)}</h2><div class="short-rule"></div>`
      : '';

  return `<div class="page-inner">
    ${!isContinuation && p.chapter ? `<div class="chapter-label">${escapeHTML(p.chapter)}</div>` : ''}
    ${heading}
    ${p.lead ? `<p class="lead">${escapeHTML(p.lead)}</p>` : ''}
    <div class="page-body">${renderVisualMarkers(safeBody(p.body_html))}</div>
    <div class="folio">${String(number).padStart(2, '0')}</div>
  </div>`;
}

function draw() {
  const bookPages = getBookPages();
  const left = document.querySelector('#leftPaper');
  const right = document.querySelector('#rightPaper');
  const counter = document.querySelector('#pageCounter');
  const prev = document.querySelector('#prev');
  const next = document.querySelector('#next');
  const chapterButtons = document.querySelector('#chapterButtons');

  if (!left || !right) return;

  if (index < 0) {
    left.innerHTML = '';
    right.innerHTML = coverHTML();
    counter.textContent = 'THE COVER';
    prev.disabled = true;
    next.disabled = false;
  } else if (mobileBook()) {
    left.innerHTML = '';
    right.innerHTML = pageMarkup(bookPages[index], index + 1);
    counter.textContent = `PAGE ${index + 1} / ${bookPages.length}`;
    prev.disabled = index <= -1;
    next.disabled = index >= bookPages.length - 1;
  } else {
    const leftIndex = index * 2;
    const rightIndex = leftIndex + 1;

    left.innerHTML = pageMarkup(bookPages[leftIndex], leftIndex + 1);
    right.innerHTML = pageMarkup(bookPages[rightIndex], rightIndex + 1);

    counter.textContent = `SPREAD ${index + 1} / ${Math.ceil(bookPages.length / 2)}`;
    prev.disabled = index <= 0;
    next.disabled = rightIndex >= bookPages.length - 1;
  }

  chapterButtons.innerHTML = bookPages
    .filter(p => p.page_type !== 'blank' && p.page_type !== 'continuation' && p.title)
    .map(p => {
      const pageIndex = bookPages.indexOf(p);
      const spread = Math.floor(pageIndex / 2);

      return `<button type="button"
        data-page-index="${pageIndex}"
        data-spread="${spread}">
        ${escapeHTML(p.chapter || p.title)}
      </button>`;
    }).join('');

  document.querySelectorAll('[data-toc-page-index]').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const target = Number(button.dataset.tocPageIndex);

      if (mobileBook()) {
        index = target;
      } else {
        index = Math.floor(target / 2);
      }

      draw();
    });
  });

  chapterButtons.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      if (mobileBook()) {
        index = Number(button.dataset.pageIndex);
      } else {
        index = Number(button.dataset.spread);
      }

      draw();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

let lastMobileMode = mobileBook();

window.addEventListener('resize', () => {
  const currentMode = mobileBook();

  if (currentMode !== lastMobileMode) {
    if (currentMode) {
      index = index < 0 ? -1 : index * 2;
    } else {
      index = index < 0 ? -1 : Math.floor(index / 2);
    }

    lastMobileMode = currentMode;
    draw();
  }
});

function turn(dir) {
  if (editMode) return;

  const bookPages = getBookPages();

  if (mobileBook()) {
    const nextIndex = index < 0
      ? 0
      : index + dir;

    if (nextIndex < -1 || nextIndex >= bookPages.length) return;

    const sheet = document.querySelector('#turnSheet');
    const front = document.querySelector('#turnFront');
    const back = document.querySelector('#turnBack');

    if (!sheet || !front || !back) return;

    if (dir > 0) {
      front.innerHTML = index < 0 ? coverHTML() : pageMarkup(bookPages[index], index + 1);
      back.innerHTML = pageMarkup(bookPages[nextIndex], nextIndex + 1);
    } else {
      front.innerHTML = pageMarkup(bookPages[index], index + 1);
      back.innerHTML = index <= 0 ? coverHTML() : pageMarkup(bookPages[nextIndex], nextIndex + 1);
    }

    sheet.className = 'turn-sheet';
    sheet.classList.add(dir > 0 ? 'turn-next' : 'turn-prev');

    draw();
    return;
  }

  const nextIndex = index < 0
    ? 0
    : index + dir;

  if (nextIndex < -1 || nextIndex >= Math.ceil(bookPages.length / 2)) return;

  const sheet = document.querySelector('#turnSheet');
  const front = document.querySelector('#turnFront');
  const back = document.querySelector('#turnBack');

  if (!sheet || !front || !back) return;

  const leftIndex = index < 0 ? 0 : index * 2;
  const rightIndex = leftIndex + 1;

  if (dir > 0) {
    front.innerHTML = index < 0
      ? coverHTML()
      : pageMarkup(bookPages[rightIndex], rightIndex + 1);

    back.innerHTML = pageMarkup(bookPages[leftIndex], leftIndex + 1);
  } else {
    front.innerHTML = pageMarkup(bookPages[leftIndex], leftIndex + 1);
    back.innerHTML = index <= 0
      ? coverHTML()
      : pageMarkup(bookPages[rightIndex], rightIndex + 1);
  }

  sheet.className = 'turn-sheet';
  sheet.classList.add(dir > 0 ? 'turn-next' : 'turn-prev');

  draw();
}

async function loadPages() {
  if (!configured) {
    pages = starter;
    index = -1;
    draw();
    return;
  }

  const { data, error } = await supabase
    .from('notebook_pages')
    .select('id,page_type,chapter,title,lead,body_html,sort_order,status')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Could not load pages:', error);
    pages = starter;
  } else {
    pages = data || [];
  }

  index = -1;
  draw();
}

function showAdmin() {
  location.hash = 'admin';
}

async function loadAdmin() {
  if (!configured) {
    alert('Supabase is not configured.');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    app.querySelector('#adminView').innerHTML = `
      <div class="admin-panel">
        <h2>Administrator sign in</h2>
        <form id="loginForm">
          <label>Email<input type="email" name="email" required></label>
          <label>Password<input type="password" name="password" required></label>
          <button type="submit">Sign in</button>
        </form>
        <p id="loginMessage"></p>
      </div>`;

    document.querySelector('#loginForm').onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);

      const { error } = await supabase.auth.signInWithPassword({
        email: fd.get('email'),
        password: fd.get('password')
      });

      document.querySelector('#loginMessage').textContent =
        error ? error.message : 'Signed in. Loading admin…';

      if (!error) loadAdmin();
    };

    return;
  }

  currentUser = user;
  isAdmin = true;

  const { data: membership, error: membershipError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    app.querySelector('#adminView').innerHTML = `
      <div class="admin-panel">
        <h2>Admin access required</h2>
        <p>This account is not registered as a notebook administrator.</p>
        <button id="signOut">Sign out</button>
      </div>`;

    document.querySelector('#signOut').onclick = async () => {
      await supabase.auth.signOut();
      location.hash = '';
    };

    return;
  }

  const { data: allPages, error } = await supabase
    .from('notebook_pages')
    .select('id,page_type,chapter,title,lead,body_html,sort_order,status')
    .order('sort_order', { ascending: true });

  if (error) {
    alert(error.message);
    return;
  }

  pages = allPages || [];

  const admin = app.querySelector('#adminView');
  admin.hidden = false;
  app.querySelector('#publicView').hidden = true;

  admin.innerHTML = `
    <div class="admin-panel">
      <div class="admin-heading">
        <div>
          <div class="eyebrow">CIPHER CHRONICLES</div>
          <h2>Notebook administration</h2>
        </div>
        <button id="signOut">Sign out</button>
      </div>

      <div class="admin-actions">
        <button id="newPage">+ New page</button>
      </div>

      <div id="pageEditor"></div>

      <h3>Existing pages</h3>
      <div class="admin-page-list">
        ${pages.map(p => `
          <article class="admin-page-row">
            <div>
              <h3>${p.page_type === 'blank' ? 'Blank page' : escapeHTML(p.title || 'Untitled page')}</h3>
              <small>${p.page_type === 'blank' ? 'No chapter content' : p.page_type === 'continuation' ? `Continuation · ${escapeHTML(p.chapter || 'Chapter not assigned')}` : escapeHTML(p.chapter || '')}</small>
              <span class="status">${escapeHTML(p.status)}</span>
            </div>
            <div class="row-actions">
              <button data-edit="${p.id}">Edit</button>
              <button data-delete="${p.id}" class="danger">Delete</button>
            </div>
          </article>
        `).join('')}
      </div>
    </div>`;

  document.querySelector('#signOut').onclick = async () => {
    await supabase.auth.signOut();
    location.hash = '';
  };

  document.querySelector('#newPage').onclick = () => editorForm(null);

  admin.querySelectorAll('[data-edit]').forEach(button => {
    button.onclick = () => {
      const page = pages.find(p => p.id === button.dataset.edit);
      editorForm(page);
    };
  });

  admin.querySelectorAll('[data-delete]').forEach(button => {
    button.onclick = async () => {
      if (!confirm('Delete this page permanently?')) return;

      const { error } = await supabase
        .from('notebook_pages')
        .delete()
        .eq('id', button.dataset.delete);

      if (error) alert(error.message);
      else loadAdmin();
    };
  });
}

function editorForm(p) {
  editingId = p?.id || null;

  const pageType = p?.page_type || 'content';
  const isContinuation = pageType === 'continuation';

  document.querySelector('#pageEditor').innerHTML = `
    <form id="editorForm" class="editor-form">
      <h3>${p ? 'Edit page' : 'Create a page'}</h3>

      <label>Page type
        <select name="page_type" id="pageType">
          <option value="content" ${pageType === 'content' ? 'selected' : ''}>Chapter page</option>
          <option value="continuation" ${isContinuation ? 'selected' : ''}>Continuation page (same chapter)</option>
          <option value="blank" ${pageType === 'blank' ? 'selected' : ''}>Blank page</option>
        </select>
      </label>

      <div id="chapterField" ${isContinuation || pageType === 'blank' ? 'hidden' : ''}>
        <label>Chapter name
          <input name="chapter" value="${escapeHTML(p?.chapter || '')}" placeholder="e.g. Chapter 04 · Digital Signatures">
        </label>
      </div>

      <div id="continuationHelp" class="editor-help" ${isContinuation ? '' : 'hidden'}>
        This page will automatically continue the nearest preceding chapter.
      </div>

      <div id="titleField" ${pageType === 'blank' ? 'hidden' : ''}>
        <label>Page title (optional for continuation pages)
          <input name="title" value="${escapeHTML(p?.title || '')}" placeholder="Enter a page title">
        </label>
      </div>

      <div id="contentFields" ${pageType === 'blank' ? 'hidden' : ''}>
        <label>Short introduction
          <textarea name="lead" rows="2">${escapeHTML(p?.lead || '')}</textarea>
        </label>

        <label>Page content (HTML supported)
          <textarea name="body_html" rows="12">${escapeHTML(p?.body_html || '<p>Start writing here…</p>')}</textarea>
        </label>
      </div>

      <label>Publication status
        <select name="status">
          <option value="draft" ${p?.status === 'draft' ? 'selected' : ''}>Draft</option>
          <option value="published" ${p?.status === 'published' || !p ? 'selected' : ''}>Published</option>
        </select>
      </label>

      <div class="editor-actions">
        <button type="submit">Save page</button>
        <button type="button" id="cancelEdit" class="quiet">Cancel</button>
      </div>

      <p id="editorMessage"></p>
    </form>`;

  const typeSelect = document.querySelector('#pageType');

  typeSelect.addEventListener('change', () => {
    const type = typeSelect.value;
    document.querySelector('#chapterField').hidden =
      type === 'continuation' || type === 'blank';
    document.querySelector('#continuationHelp').hidden =
      type !== 'continuation';
    document.querySelector('#titleField').hidden = type === 'blank';
    document.querySelector('#contentFields').hidden = type === 'blank';
  });

  document.querySelector('#cancelEdit').onclick = () => {
    document.querySelector('#pageEditor').innerHTML = '';
  };

  document.querySelector('#editorForm').onsubmit = async e => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const type = fd.get('page_type');

    let chapter = fd.get('chapter') || null;

    if (type === 'continuation') {
      // Inherit chapter from the closest preceding page.
      const { data: earlierPages, error: earlierError } = await supabase
        .from('notebook_pages')
        .select('page_type,chapter,sort_order')
        .lt('sort_order', p?.sort_order ?? 999999)
        .order('sort_order', { ascending: false });

      if (earlierError) {
        document.querySelector('#editorMessage').textContent = earlierError.message;
        return;
      }

      chapter = (earlierPages || [])
        .find(row => row.page_type !== 'blank' && row.chapter)?.chapter || null;

      if (!chapter) {
        document.querySelector('#editorMessage').textContent =
          'Create a chapter page before adding a continuation page.';
        return;
      }
    }

    const payload = {
      page_type: type,
      chapter: type === 'blank' ? 'PERSONAL NOTES' : chapter,
      title: type === 'blank'
        ? 'Untitled page'
        : type === 'continuation'
          ? (fd.get('title') || '')
          : (fd.get('title') || 'Untitled page'),
      lead: type === 'blank' ? '' : (fd.get('lead') || ''),
      body_html: type === 'blank' ? '' : (fd.get('body_html') || ''),
      status: fd.get('status'),
      updated_at: new Date().toISOString()
    };

    let result;

    if (editingId) {
      result = await supabase
        .from('notebook_pages')
        .update(payload)
        .eq('id', editingId);
    } else {
      const { data: lastPage } = await supabase
        .from('notebook_pages')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      payload.sort_order = (lastPage?.sort_order ?? 0) + 10;

      result = await supabase
        .from('notebook_pages')
        .insert(payload);
    }

    if (result.error) {
      document.querySelector('#editorMessage').textContent = result.error.message;
      return;
    }

    document.querySelector('#editorMessage').textContent = 'Page saved successfully.';
    await loadAdmin();
  };
}

async function route() {
  if (location.hash === '#admin') {
    await loadAdmin();
  } else {
    const admin = app.querySelector('#adminView');
    const publicView = app.querySelector('#publicView');

    if (admin) admin.hidden = true;
    if (publicView) publicView.hidden = false;

    await loadPages();
  }
}

shell();
route();

window.addEventListener('hashchange', route);
