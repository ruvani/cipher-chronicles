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
    if (editMode) return;

    const r = e.currentTarget.getBoundingClientRect();

    if (e.clientX > r.left + r.width * 0.78) turn(1);
    else if (e.clientX < r.left + r.width * 0.22) turn(-1);
  });

  document.addEventListener('keydown', e => {
    if (
      location.hash === '#admin' ||
      ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
    ) return;

    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
}

function pageMarkup(p, number) {
  if (!p) {
    return `<div class="page-inner endpaper">
      <span class="eyebrow">THE JOURNEY CONTINUES</span>
      <h2>To be continued…</h2>
      <p>Every discovery begins with a question.</p>
      <span class="folio">✦</span>
    </div>`;
  }

  return `<div class="page-inner">
    <div class="chapter-label">${escapeHTML(p.chapter)}</div>
    <h2>${escapeHTML(p.title)}</h2>
    <div class="short-rule"></div>
    ${p.lead ? `<p class="lead">${escapeHTML(p.lead)}</p>` : ''}
    <div class="article-body">${safeBody(p.body_html)}</div>
    <div class="folio">${String(number).padStart(2, '0')}</div>
  </div>`;
}

function spreadMarkup(spreadIndex) {
  if (spreadIndex < 0) {
    return `<div class="flip-page flip-left"></div>
      <div class="flip-page flip-right">${coverHTML()}</div>`;
  }

  const leftPage = pages[spreadIndex * 2];
  const rightPage = pages[spreadIndex * 2 + 1];

  return `<div class="flip-page flip-left">
      ${leftPage ? pageMarkup(leftPage, spreadIndex * 2 + 1) : ''}
    </div>
    <div class="flip-page flip-right">
      ${rightPage ? pageMarkup(rightPage, spreadIndex * 2 + 2) : pageMarkup(null)}
    </div>`;
}

function draw() {
  const left = index < 0 ? null : pages[index * 2];
  const right = index < 0 ? null : pages[index * 2 + 1];

  document.querySelector('#leftPaper').innerHTML =
    index < 0 ? '' : pageMarkup(left, index * 2 + 1);

  document.querySelector('#rightPaper').innerHTML =
    index < 0 ? coverHTML() : pageMarkup(right, index * 2 + 2);

  const count = Math.max(1, Math.ceil(pages.length / 2));

  document.querySelector('#pageCounter').textContent =
    index < 0 ? 'THE COVER' : `SPREAD ${index + 1} / ${count}`;

  document.querySelector('#prev').disabled = index < 0;
  document.querySelector('#next').disabled = index >= count - 1;

  const btns = pages
    .filter((_, i) => i % 2 === 0)
    .map((p, i) =>
      `<button data-spread="${i}">${escapeHTML(
        (p.chapter || `Chapter ${i + 1}`).split('·')[0].trim()
      )}</button>`
    )
    .join('');

  document.querySelector('#chapterButtons').innerHTML = btns;

  document.querySelectorAll('#chapterButtons button').forEach(b => {
    b.onclick = () => {
      index = Number(b.dataset.spread);
      draw();
    };
  });
}

/* Page-turn animation: animate the complete two-page spread */

let flipping = false;

function turn(dir) {
  if (flipping) return;

  const maxSpread = Math.max(0, Math.ceil(pages.length / 2) - 1);
  const target = Math.max(-1, Math.min(maxSpread, index + dir));

  if (target === index) return;

  const sheet = document.querySelector('#turnSheet');
  const front = document.querySelector('#turnFront');
  const back = document.querySelector('#turnBack');

  if (!sheet || !front || !back) return;

  flipping = true;

  const book = document.querySelector('#book');
  const openingCover = index === -1 && dir > 0;
  book.classList.add('is-turning');

  // The front cover is a single right-hand leaf, not a complete two-page spread.
  // Turn only that leaf so it does not appear again on the reverse of a full spread.
  if (openingCover) {
    sheet.classList.add('cover-opening');
    front.innerHTML = `<div class="flip-page flip-right cover-leaf">${coverHTML()}</div>`;
    back.innerHTML = `<div class="flip-page flip-left cover-reveal">${pages[0] ? pageMarkup(pages[0], 1) : ''}</div>`;
  } else {
    sheet.classList.remove('cover-opening');
    front.innerHTML = spreadMarkup(index);
    back.innerHTML = spreadMarkup(target);
  }

  sheet.classList.remove('is-flipping', 'turned-forward', 'turned-backward');
  sheet.style.transform = 'rotateY(0deg)';
  sheet.classList.add('is-flipping');

  // Force the browser to apply the initial state before starting the flip.
  void sheet.offsetWidth;

  requestAnimationFrame(() => {
    sheet.classList.add(dir > 0 ? 'turned-forward' : 'turned-backward');
  });

  const finishFlip = () => {
    sheet.classList.remove('is-flipping', 'turned-forward', 'turned-backward', 'cover-opening');
    sheet.style.transform = 'rotateY(0deg)';
    book.classList.remove('is-turning');
    index = target;
    draw();
    flipping = false;
  };

  window.setTimeout(finishFlip, 900);
}

/* Load published notebook pages */

async function loadPublicPages() {
  if (!configured) {
    pages = starter;
    return;
  }

  const { data, error } = await supabase
    .from('notebook_pages')
    .select('id,chapter,title,lead,body_html,sort_order')
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
          <h3>${escapeHTML(p.title)}</h3>
          <small>${escapeHTML(p.chapter)}</small>
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

  target.innerHTML = `<div class="editor-card">
    <h3>${p.id ? 'Edit page' : 'Create a page'}</h3>

    <form id="pageForm">
      <label>Chapter / section
        <input name="chapter" required value="${escapeHTML(p.chapter || 'NEW CHAPTER')}">
      </label>

      <label>Page title
        <input name="title" required value="${escapeHTML(p.title || '')}">
      </label>

      <label>Introductory line
        <input name="lead" value="${escapeHTML(p.lead || '')}">
      </label>

      <label>Article content
        <textarea name="body_html" rows="12">${escapeHTML(
          p.body_html || '<p>Write your article here…</p>'
        )}</textarea>
      </label>

      <p class="editor-help">
        Content accepts basic HTML such as &lt;p&gt;, &lt;h3&gt;,
        &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; and &lt;blockquote&gt;.
      </p>

      <label>Publication status
        <select name="status">
          <option value="draft" ${p.status !== 'published' ? 'selected' : ''}>
            Draft — private
          </option>
          <option value="published" ${p.status === 'published' ? 'selected' : ''}>
            Published — visible to visitors
          </option>
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

  document.querySelector('#cancelEdit').onclick = () => {
    target.innerHTML = '';
  };

  document.querySelector('#pageForm').onsubmit = async e => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const payload = {
      chapter: fd.get('chapter'),
      title: fd.get('title'),
      lead: fd.get('lead'),
      body_html: DOMPurify.sanitize(fd.get('body_html'), {
        USE_PROFILES: { html: true }
      }),
      status: fd.get('status'),
      updated_at: new Date().toISOString(),
      sort_order: p.sort_order ?? Date.now()
    };

    const result = p.id
      ? await supabase.from('notebook_pages').update(payload).eq('id', p.id)
      : await supabase.from('notebook_pages').insert(payload);

    document.querySelector('#editorMessage').textContent =
      result.error ? result.error.message : 'Saved successfully.';

    if (!result.error) {
      setTimeout(showDashboard, 500);
    }
  };

  if (p.id) {
    document.querySelector('#deletePage').onclick = async () => {
      if (confirm('Delete this page permanently?')) {
        const { error } = await supabase
          .from('notebook_pages')
          .delete()
          .eq('id', p.id);

        if (error) {
          alert(error.message);
        } else {
          showDashboard();
        }
      }
    };
  }
}

/* Application routing */

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
