import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  createProjectPageContext,
  loadProjectPageScript,
} from './helpers/project-page-context.js';

describe('project page mobile navigation', () => {
  it('builds the sections toggle, panel, and overlay on init', () => {
    const { document, getToggle, getPanel, getOverlay, getInner } = createProjectPageContext();

    expect(getInner().dataset.mobileNavInit).toBe('true');
    expect(getToggle()).not.toBeNull();
    expect(getPanel()).not.toBeNull();
    expect(getOverlay()).not.toBeNull();
    expect(document.querySelector('.sidebar-sections-toggle-label')?.textContent).toBe('Sections');
    expect(getPanel().querySelectorAll('.sidebar-group')).toHaveLength(1);
    expect(
      Array.from(getInner().children).some((child) => child.classList.contains('sidebar-group'))
    ).toBe(false);
  });

  it('keeps the back arrow visible in the mobile nav markup', () => {
    const { document } = createProjectPageContext();

    expect(document.querySelector('.sidebar-home:not(.sidebar-next) .arrow-left')).not.toBeNull();
  });

  it('moves next project above the footer on mobile', () => {
    const { window, getBottom, getColumn, getFooter } = createProjectPageContext({ mobile: true });

    expect(getBottom().classList.contains('sidebar-bottom--page-end')).toBe(true);
    expect(getColumn().contains(getBottom())).toBe(true);
    expect(
      getFooter().compareDocumentPosition(getBottom()) & window.Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();
  });

  it('restores next project to the sidebar on desktop', () => {
    const ctx = createProjectPageContext({ mobile: true });
    ctx.setMobile(false);

    expect(ctx.getBottom().classList.contains('sidebar-bottom--page-end')).toBe(false);
    expect(ctx.getInner().contains(ctx.getBottom())).toBe(true);
  });

  it('opens and closes the sections menu from the toggle', () => {
    const { document, sidebar, getToggle, getOverlay } = createProjectPageContext();

    getToggle().click();

    expect(sidebar.classList.contains('is-sections-open')).toBe(true);
    expect(getToggle().getAttribute('aria-expanded')).toBe('true');
    expect(getOverlay().hidden).toBe(false);
    expect(document.body.classList.contains('project-sections-open')).toBe(true);

    getToggle().click();

    expect(sidebar.classList.contains('is-sections-open')).toBe(false);
    expect(getToggle().getAttribute('aria-expanded')).toBe('false');
    expect(getOverlay().hidden).toBe(true);
    expect(document.body.classList.contains('project-sections-open')).toBe(false);
  });

  it('sets the mobile nav offset when the sections menu opens', () => {
    const { document, getToggle } = createProjectPageContext();

    getToggle().click();

    expect(document.documentElement.style.getPropertyValue('--project-mobile-nav-offset')).toBe('56px');
  });

  it('closes the sections menu when the overlay is clicked', () => {
    const { sidebar, getToggle, getOverlay } = createProjectPageContext();

    getToggle().click();
    getOverlay().click();

    expect(sidebar.classList.contains('is-sections-open')).toBe(false);
    expect(getOverlay().hidden).toBe(true);
  });

  it('closes the sections menu when Escape is pressed', () => {
    const { window, sidebar, getToggle, getOverlay } = createProjectPageContext();

    getToggle().click();
    window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));

    expect(sidebar.classList.contains('is-sections-open')).toBe(false);
    expect(getOverlay().hidden).toBe(true);
  });

  it('closes the sections menu after a section link is selected', () => {
    const { sidebar, getToggle, getPanel } = createProjectPageContext();

    getToggle().click();
    getPanel().querySelector('a[href="#solution"]').click();

    expect(sidebar.classList.contains('is-sections-open')).toBe(false);
  });

  it('closes the sections menu when the viewport switches to desktop', () => {
    const ctx = createProjectPageContext({ mobile: true });

    ctx.getToggle().click();
    ctx.setMobile(false);

    expect(ctx.sidebar.classList.contains('is-sections-open')).toBe(false);
    expect(ctx.getOverlay().hidden).toBe(true);
    expect(ctx.document.body.classList.contains('project-sections-open')).toBe(false);
  });

  it('does not initialize when the project sidebar is missing section groups', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><head></head><body>
        <aside class="project-sidebar">
          <div class="project-sidebar-inner">
            <a class="sidebar-home subtitle" href="/"><span>Home</span></a>
          </div>
        </aside>
      </body></html>`,
      { url: 'http://localhost/project.html', runScripts: 'dangerously' }
    );

    loadProjectPageScript(dom.window);

    expect(dom.window.document.querySelector('.sidebar-sections-toggle')).toBeNull();
    expect(dom.window.document.querySelector('.sidebar-sections-overlay')).toBeNull();
  });
});
