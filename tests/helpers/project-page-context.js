import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const rootDir = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const projectPageScript = readFileSync(path.join(rootDir, 'project-page.js'), 'utf8');

export const PROJECT_PAGE_FIXTURE = `
  <div class="project-layout">
    <aside class="project-sidebar" aria-label="Project page navigation">
      <div class="project-sidebar-inner">
        <a class="sidebar-home subtitle" href="/">
          <span class="arrow-left" aria-hidden="true"><img src="/arrow-left.svg" alt="" /></span>
          <span>Home</span>
        </a>
        <div class="sidebar-group">
          <div class="sidebar-heading subtitle">Overview</div>
          <nav class="sidebar-links" aria-label="Overview sections">
            <a href="#overview">Overview</a>
            <a href="#solution">Solution</a>
          </nav>
        </div>
        <div class="sidebar-bottom">
          <a class="sidebar-home sidebar-next subtitle" href="/projects/next.html">
            <span>NEXT PROJECT</span>
            <span class="arrow-right" aria-hidden="true"><img src="/arrow-right.svg" alt="" /></span>
          </a>
        </div>
      </div>
    </aside>
    <div class="project-column">
      <main class="project-main">
        <section class="project-section" id="overview">Overview content</section>
        <section class="project-section" id="solution">Solution content</section>
      </main>
      <footer class="project-footer-minimal">Footer</footer>
    </div>
  </div>
`;

function mockSidebarMetrics(sidebar, height = 56) {
  sidebar.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 400,
    bottom: height,
    width: 400,
    height,
    toJSON: () => ({}),
  });
}

export function loadProjectPageScript(window) {
  const { document } = window;
  const script = document.createElement('script');
  script.textContent = projectPageScript;
  document.body.appendChild(script);
  script.remove();
}

export function createProjectPageContext({ mobile = true } = {}) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body>${PROJECT_PAGE_FIXTURE}</body></html>`,
    {
      url: 'http://localhost/project.html',
      pretendToBeVisual: true,
      runScripts: 'dangerously',
    }
  );

  const { window } = dom;
  const { document } = window;
  const mediaState = { mobile };
  const changeListeners = [];

  window.matchMedia = (query) => {
    const isProjectMobileQuery = query.includes('max-width: 980px');

    return {
      media: query,
      get matches() {
        if (isProjectMobileQuery) {
          return mediaState.mobile;
        }

        return false;
      },
      addEventListener(_type, callback) {
        if (isProjectMobileQuery) {
          changeListeners.push(callback);
        }
      },
      removeEventListener() {},
      addListener(callback) {
        if (isProjectMobileQuery) {
          changeListeners.push(callback);
        }
      },
      removeListener() {},
      dispatchEvent: () => true,
    };
  };

  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 0;
  };

  loadProjectPageScript(window);

  const sidebar = document.querySelector('.project-sidebar');
  if (sidebar) {
    mockSidebarMetrics(sidebar);
  }

  function setMobile(matches) {
    mediaState.mobile = matches;
    changeListeners.forEach((callback) => {
      callback({ matches });
    });
  }

  return {
    window,
    document,
    dom,
    sidebar,
    setMobile,
    getToggle: () => document.querySelector('.sidebar-sections-toggle'),
    getPanel: () => document.querySelector('.sidebar-sections-panel'),
    getOverlay: () => document.querySelector('.sidebar-sections-overlay'),
    getBottom: () => document.querySelector('.sidebar-bottom'),
    getColumn: () => document.querySelector('.project-column'),
    getFooter: () => document.querySelector('.project-footer-minimal'),
    getInner: () => document.querySelector('.project-sidebar-inner'),
  };
}
