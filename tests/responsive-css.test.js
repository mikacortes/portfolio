import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function readStylesheet(filename) {
  return readFileSync(path.join(rootDir, filename), 'utf8');
}

function getMediaBlocks(css, breakpoint) {
  const query = `@media (max-width: ${breakpoint}px)`;
  const blocks = [];
  let searchFrom = 0;

  while (searchFrom < css.length) {
    const start = css.indexOf(query, searchFrom);
    if (start === -1) {
      break;
    }

    let depth = 0;
    let started = false;

    for (let index = start; index < css.length; index += 1) {
      const char = css[index];

      if (char === '{') {
        depth += 1;
        started = true;
      } else if (char === '}') {
        depth -= 1;
        if (started && depth === 0) {
          blocks.push(css.slice(start, index + 1));
          searchFrom = index + 1;
          break;
        }
      }
    }

    if (!started) {
      break;
    }
  }

  expect(blocks.length).toBeGreaterThan(0);
  return blocks.join('\n');
}

describe('responsive CSS rules', () => {
  const projectPageCss = readStylesheet('project-page.css');
  const stylesCss = readStylesheet('styles.css');
  const mobileProjectCss = getMediaBlocks(projectPageCss, 980);
  const smallProjectCss = getMediaBlocks(projectPageCss, 640);
  const mobileSharedCss = getMediaBlocks(stylesCss, 980);
  const smallSharedCss = getMediaBlocks(stylesCss, 640);

  it('reduces project column padding at tablet and phone breakpoints', () => {
    expect(mobileProjectCss).toContain('--project-column-padding-left: clamp(18px, 4vw + 10px, 48px)');
    expect(mobileProjectCss).toContain('--project-column-padding-right: clamp(18px, 4vw + 10px, 48px)');
    expect(smallProjectCss).toContain('--project-column-padding-left: clamp(14px, 3vw + 8px, 24px)');
    expect(smallProjectCss).toContain('--project-column-padding-right: clamp(14px, 3vw + 8px, 24px)');
  });

  it('uses a sticky mobile nav bar with left/right actions', () => {
    expect(mobileProjectCss).toContain('position: sticky');
    expect(mobileProjectCss).toContain('grid-template-areas: "home toggle"');
    expect(mobileProjectCss).toMatch(/\.sidebar-sections-toggle[\s\S]*justify-self: end/);
    expect(mobileProjectCss).not.toMatch(
      /\.project-sidebar-inner > \.sidebar-home:not\(\.sidebar-next\) \.arrow-left[\s\S]*display: none/
    );
  });

  it('styles the sections dropdown as a full-width overlay panel', () => {
    expect(mobileProjectCss).toContain('.sidebar-sections-overlay');
    expect(mobileProjectCss).toMatch(/\.sidebar-sections-panel[\s\S]*position: fixed/);
    expect(mobileProjectCss).toMatch(/\.sidebar-sections-panel[\s\S]*left: 0/);
    expect(mobileProjectCss).toMatch(/\.sidebar-sections-panel[\s\S]*right: 0/);
    expect(mobileProjectCss).toContain('body.project-sections-open');
    expect(mobileProjectCss).toContain('overflow: hidden');
  });

  it('moves next project styling to the bottom of the page on mobile', () => {
    expect(mobileProjectCss).toContain('.sidebar-bottom--page-end');
    expect(mobileProjectCss).toMatch(/\.sidebar-bottom--page-end \.sidebar-next \.arrow-right[\s\S]*display: none/);
  });

  it('scales project headings down at tablet and phone breakpoints', () => {
    expect(mobileSharedCss).toMatch(/\.project-main h2[\s\S]*font-size: 28px/);
    expect(smallSharedCss).toMatch(/\.project-main h2[\s\S]*font-size: 24px/);
  });

  it('keeps similar project cards in a three-column row at all breakpoints', () => {
    const gridRuleBlocks =
      projectPageCss.match(/\.project-main \.similar-projects-grid\s*\{[^}]+\}/g) ?? [];

    expect(gridRuleBlocks.length).toBeGreaterThan(0);
    expect(
      gridRuleBlocks.some((block) =>
        block.includes('grid-template-columns: repeat(3, minmax(0, 1fr))')
      )
    ).toBe(true);
    expect(
      gridRuleBlocks.every(
        (block) =>
          !block.includes('grid-template-columns: 1fr') &&
          !block.includes('grid-template-columns: repeat(2,')
      )
    ).toBe(true);
  });

  it('collapses shared layout grids for about and project pages at 980px', () => {
    expect(mobileSharedCss).toMatch(/\.about-grid[\s\S]*grid-template-columns: 1fr/);
    expect(mobileSharedCss).toMatch(/\.stats-grid[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(mobileSharedCss).toMatch(/\.project-hero[\s\S]*grid-template-columns: 1fr/);
    expect(mobileSharedCss).toMatch(/\.project-meta[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(mobileSharedCss).toMatch(/\.featured-grid[\s\S]*grid-template-rows: none/);
  });

  it('collapses shared stats and gallery layouts to one column at 640px', () => {
    expect(smallSharedCss).toMatch(/\.stats-grid[\s\S]*grid-template-columns: 1fr/);
    expect(smallSharedCss).toMatch(/\.featured-grid[\s\S]*grid-template-columns: 1fr/);
    expect(smallSharedCss).toMatch(/\.archive-gallery[\s\S]*column-count: 2/);
  });

  it('includes viewport meta tags on primary HTML pages', () => {
    const pages = [
      'index.html',
      'gd.html',
      'about.html',
      'play.html',
      'archive-gd.html',
      'project.html',
      'projects/scriptchain-health-gd.html',
    ];

    pages.forEach((page) => {
      const html = readFileSync(path.join(rootDir, page), 'utf8');
      expect(html).toContain('name="viewport"');
      expect(html).toContain('width=device-width, initial-scale=1.0');
    });
  });
});
