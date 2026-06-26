import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const projectPageScript = readFileSync(path.join(rootDir, 'project-page.js'), 'utf8');

function loadSimilarProjects(url) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body>
      <main class="project-main">
        <div class="container">
          <section class="project-section" id="reflection">Reflection</section>
        </div>
      </main>
    </body></html>`,
    {
      url,
      pretendToBeVisual: true,
      runScripts: 'dangerously',
    }
  );

  const { window } = dom;
  const script = window.document.createElement('script');
  script.textContent = projectPageScript;
  window.document.body.appendChild(script);
  script.remove();

  return window.document;
}

describe('initSimilarProjects', () => {
  it('renders three similar project cards on a project page', () => {
    const document = loadSimilarProjects('http://localhost/projects/furever-diamond.html');
    const section = document.querySelector('.similar-projects-section');

    expect(section).not.toBeNull();
    expect(section.querySelector('h2')?.textContent).toBe('Check out similar projects!');
    expect(section.querySelectorAll('.similar-project-card')).toHaveLength(3);
    expect(section.querySelector('.similar-project-card')?.getAttribute('href')).toBe(
      'bonded-diamond.html'
    );
    expect(section.querySelector('.similar-project-title')?.textContent).toBe(
      'Advertising a luxury diamond jewelry brand'
    );
  });

  it('resolves project links relative to the current page location', () => {
    const projectsDocument = loadSimilarProjects('http://localhost/projects/furever-diamond.html');
    const rootDocument = loadSimilarProjects('http://localhost/project.html');

    const projectHrefs = Array.from(
      projectsDocument.querySelectorAll('.similar-project-card')
    ).map((card) => card.getAttribute('href'));
    const rootHrefs = Array.from(rootDocument.querySelectorAll('.similar-project-card')).map(
      (card) => card.getAttribute('href')
    );

    expect(projectHrefs).toContain('bonded-diamond.html');
    expect(rootHrefs.some((href) => href.includes('projects/'))).toBe(true);
  });

  it('does not include the current project in the recommendations', () => {
    const document = loadSimilarProjects('http://localhost/projects/bonded-diamond.html');
    const titles = Array.from(document.querySelectorAll('.similar-project-title')).map(
      (title) => title.textContent
    );

    expect(titles).not.toContain('Advertising a luxury diamond jewelry brand');
    expect(titles).toHaveLength(3);
  });
});
