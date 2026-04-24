/* ============================================================
   app.js — Navigation, sidebar, content loading, theme
   ============================================================ */

(function () {

  /* ---- State ---- */
  let currentChapter = null;

  /* ---- DOM refs ---- */
  const tocContainer   = document.getElementById('tocContainer');
  const chapterContent = document.getElementById('chapterContent');
  const sidebarToggle  = document.getElementById('sidebarToggle');
  const sidebar        = document.getElementById('sidebar');
  const overlay        = document.getElementById('sidebarOverlay');
  const themeToggle    = document.getElementById('themeToggle');
  const themeIcon      = document.getElementById('themeIcon');
  const startBtn       = document.getElementById('startBtn');

  /* ============================================================
     Theme
     ============================================================ */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? 'Light' : 'Dark';
    localStorage.setItem('rustlms-theme', theme);
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* Restore saved theme */
  const savedTheme = localStorage.getItem('rustlms-theme') || 'dark';
  applyTheme(savedTheme);

  /* ============================================================
     Sidebar toggle (mobile)
     ============================================================ */
  sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth > 768) {
      /* Desktop: slide sidebar in/out and shift content */
      const contentEl = document.getElementById('contentArea');
      sidebar.classList.toggle('desktop-collapsed');
      contentEl.classList.toggle('sidebar-collapsed');
    } else {
      /* Mobile: overlay behaviour */
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    }
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  /* ============================================================
     Build sidebar TOC
     ============================================================ */
  function buildSidebar() {
    tocContainer.innerHTML = '';

    TOC.forEach(module => {
      const group = document.createElement('div');
      group.className = 'module-group' + (module.available ? '' : ' locked');

      /* Open the module that contains the active chapter, or default to module 1 */
      const hasActiveChapter = module.chapters.some(ch => ch.id === currentChapter);
      if (hasActiveChapter || (!currentChapter && module.id === 1)) {
        group.classList.add('open');
      }

      const subtitle = module.subtitle ? ` <span style="font-weight:400;opacity:0.7">${module.subtitle}</span>` : '';
      group.innerHTML = `
        <div class="module-header">
          <span class="module-title">Module ${module.id}: ${module.title}${subtitle}</span>
          <span class="module-arrow">&#9658;</span>
        </div>
        <div class="chapter-list">
          ${module.chapters.map(ch => `
            <div
              class="chapter-item${ch.available ? '' : ' locked'}${ch.id === currentChapter ? ' active' : ''}"
              data-id="${ch.id}"
              data-available="${ch.available}"
            >
              <span class="chapter-num">${ch.num}</span>
              <span class="chapter-title-text">${ch.title}</span>
            </div>
          `).join('')}
        </div>
      `;

      /* Module accordion toggle — works for all modules, locked or not */
      const header = group.querySelector('.module-header');
      header.addEventListener('click', () => {
        group.classList.toggle('open');
      });

      /* Chapter click */
      group.querySelectorAll('.chapter-item[data-available="true"]').forEach(item => {
        item.addEventListener('click', () => {
          loadChapter(item.dataset.id);
          /* Close sidebar on mobile after selection */
          sidebar.classList.remove('open');
          overlay.classList.remove('show');
        });
      });

      tocContainer.appendChild(group);
    });
  }

  /* ============================================================
     Load a chapter
     ============================================================ */
  function loadChapter(chId) {
    const data = CHAPTERS_CONTENT[chId];
    if (!data) return;

    currentChapter = chId;
    sessionStorage.setItem('rustlms-chapter', chId);

    /* Build prev/next */
    const idx  = CHAPTER_ORDER.indexOf(chId);
    const prev = idx > 0 ? CHAPTER_ORDER[idx - 1] : null;
    const next = idx < CHAPTER_ORDER.length - 1 ? CHAPTER_ORDER[idx + 1] : null;

    const prevData = prev ? CHAPTERS_CONTENT[prev] : null;
    const nextData = next ? CHAPTERS_CONTENT[next] : null;

    const prevBtn = prevData
      ? `<button class="chapter-nav-btn" data-nav="${prev}">
           <span>&#8592;</span>
           <span><span class="nav-label">Previous</span><span class="nav-title">Ch${prevData.chNum}: ${prevData.title}</span></span>
         </button>`
      : `<button class="chapter-nav-btn invisible" aria-hidden="true"></button>`;

    const nextBtn = nextData
      ? `<button class="chapter-nav-btn" data-nav="${next}">
           <span><span class="nav-label">Next</span><span class="nav-title">Ch${nextData.chNum}: ${nextData.title}</span></span>
           <span>&#8594;</span>
         </button>`
      : `<button class="chapter-nav-btn invisible" aria-hidden="true"></button>`;

    /* Render content */
    chapterContent.innerHTML = `
      ${data.html}
      <nav class="chapter-nav" aria-label="Chapter navigation">
        ${prevBtn}
        ${nextBtn}
      </nav>
      <div id="quizContainer"></div>
    `;

    /* Render quiz */
    const quizContainer = document.getElementById('quizContainer');
    if (quizContainer) {
      Quiz.render(chId, quizContainer);
    }

    /* Syntax highlight all code blocks */
    if (typeof Prism !== 'undefined') {
      Prism.highlightAllUnder(chapterContent);
    }

    /* Scroll to top */
    window.scrollTo({ top: 0, behavior: 'smooth' });

    /* Update active state in sidebar */
    updateActiveSidebar(chId);

    /* Expand the module that owns this chapter */
    expandModuleForChapter(chId);

    /* Attach prev/next nav buttons */
    chapterContent.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => loadChapter(btn.dataset.nav));
    });
  }

  /* ============================================================
     Sidebar helpers
     ============================================================ */
  function updateActiveSidebar(chId) {
    document.querySelectorAll('.chapter-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === chId);
    });
  }

  function expandModuleForChapter(chId) {
    document.querySelectorAll('.chapter-item').forEach(item => {
      if (item.dataset.id === chId) {
        const group = item.closest('.module-group');
        if (group) group.classList.add('open');
      }
    });
  }

  /* ============================================================
     Landing page "Start Module 1" button
     ============================================================ */
  if (startBtn) {
    startBtn.addEventListener('click', () => loadChapter('ch01'));
  }

  /* ============================================================
     Init
     ============================================================ */
  buildSidebar();

  /* Restore last visited chapter from session */
  const lastChapter = sessionStorage.getItem('rustlms-chapter');
  if (lastChapter && CHAPTERS_CONTENT[lastChapter]) {
    loadChapter(lastChapter);
  }

})();
