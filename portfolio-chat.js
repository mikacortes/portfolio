import { matchQuestion, pickSuggestions } from './portfolio-chat-matcher.js';

class PortfolioChat extends HTMLElement {
  constructor() {
    super();
    this.faqData = null;
    this.isOpen = false;
    this.messages = [];
    this.previousFocus = null;
    this.sessionSeenIntentIds = new Set();
  }

  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    this.dataset.rendered = 'true';
    this.renderShell();
    this.initHeroVisibility();
    this.loadFaqData();
  }

  getAssetBase() {
    const script = document.querySelector('script[src*="portfolio-chat.js"]');
    if (!script) return './';
    return script.getAttribute('src').replace(/portfolio-chat\.js.*$/, '');
  }

  async loadFaqData() {
    try {
      const response = await fetch(`${this.getAssetBase()}faq-data.json`);
      if (!response.ok) throw new Error('Failed to load FAQ data');
      this.faqData = await response.json();
      await this.respondWithBotMessage(this.faqData.greeting, 320);
      this.renderSuggestions({ diversify: true });
    } catch {
      await this.respondWithBotMessage(
        "Sorry, I couldn't load my answers right now. Please try again later or use the About page.",
        280
      );
    }
  }

  renderShell() {
    const iconBase = this.getAssetBase();

    this.innerHTML = `
      <div class="portfolio-chat">
        <button
          type="button"
          class="portfolio-chat__backdrop"
          aria-label="Close chat"
          hidden
        ></button>

        <button
          type="button"
          class="portfolio-chat__toggle"
          aria-expanded="false"
          aria-controls="portfolio-chat-panel"
          aria-label="Ask me a question"
        >
          <span class="portfolio-chat__toggle-icon" aria-hidden="true">✦</span>
          <span class="portfolio-chat__toggle-label">Ask me</span>
        </button>

        <section
          id="portfolio-chat-panel"
          class="portfolio-chat__panel"
          role="dialog"
          aria-label="Ask me a question"
          aria-modal="true"
          hidden
        >
          <header class="portfolio-chat__header">
            <div>
              <p class="portfolio-chat__brand">Mini Monica</p>
              <p class="portfolio-chat__subtitle">beta</p>
            </div>
            <button
              type="button"
              class="portfolio-chat__close"
              aria-label="Close chat"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div class="portfolio-chat__messages">
            <div class="portfolio-chat__message-list" aria-live="polite" aria-relevant="additions"></div>
            <div class="portfolio-chat__suggestions" aria-label="Suggested questions"></div>
          </div>

          <form class="portfolio-chat__form">
            <label class="portfolio-chat__input-label" for="portfolio-chat-input">Your question</label>
            <div class="portfolio-chat__input-row">
              <input
                id="portfolio-chat-input"
                class="portfolio-chat__input"
                type="text"
                name="question"
                autocomplete="off"
                placeholder="Ask me a question..."
                maxlength="240"
              />
              <button type="submit" class="portfolio-chat__send" aria-label="Send message">
                <img
                  class="portfolio-chat__send-icon"
                  src="${iconBase}assets/icons/Arrow up.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </form>
        </section>
      </div>
    `;

    this.root = this.querySelector('.portfolio-chat');
    this.toggle = this.querySelector('.portfolio-chat__toggle');
    this.backdrop = this.querySelector('.portfolio-chat__backdrop');
    this.panel = this.querySelector('.portfolio-chat__panel');
    this.closeButton = this.querySelector('.portfolio-chat__close');
    this.messagesEl = this.querySelector('.portfolio-chat__message-list');
    this.suggestionsEl = this.querySelector('.portfolio-chat__suggestions');
    this.form = this.querySelector('.portfolio-chat__form');
    this.input = this.querySelector('.portfolio-chat__input');

    this.toggle.addEventListener('click', () => this.setOpen(!this.isOpen));
    this.backdrop.addEventListener('click', () => this.setOpen(false));
    this.closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.setOpen(false);
    });
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit();
    });

    this.panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.setOpen(false);
      }

      if (event.key === 'Tab' && this.isOpen) {
        this.trapFocus(event);
      }
    });
  }

  playToggleEntrance() {
    if (!this.toggle || this.isOpen || this.root?.classList.contains('is-hero-zone')) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    this.toggle.classList.remove('is-entering');
    void this.toggle.offsetWidth;
    this.toggle.classList.add('is-entering');
    this.toggle.addEventListener(
      'animationend',
      () => {
        this.toggle.classList.remove('is-entering');
      },
      { once: true }
    );
  }

  initHeroVisibility() {
    const hero = document.querySelector('.hero');
    if (!hero || !('IntersectionObserver' in window)) {
      requestAnimationFrame(() => this.playToggleEntrance());
      return;
    }

    this.heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasInHero = this.root?.classList.contains('is-hero-zone');
          const inHero = entry.isIntersecting;
          this.root?.classList.toggle('is-hero-zone', inHero);

          if (wasInHero && !inHero) {
            this.playToggleEntrance();
          }
        });
      },
      { threshold: 0.12 }
    );

    this.heroObserver.observe(hero);
  }

  setOpen(open) {
    this.isOpen = open;

    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        '--portfolio-chat-scrollbar-width',
        `${Math.max(0, scrollbarWidth)}px`
      );
    } else {
      document.documentElement.style.removeProperty('--portfolio-chat-scrollbar-width');
    }

    this.toggle.setAttribute('aria-expanded', String(open));
    this.toggle.hidden = open;
    this.panel.hidden = !open;
    this.backdrop.hidden = !open;
    this.root?.classList.toggle('is-open', open);
    document.body.classList.toggle('portfolio-chat-open', open);

    if (open) {
      this.previousFocus = document.activeElement;
      window.setTimeout(() => this.input?.focus(), 180);
      return;
    }

    this.toggle.focus();
    this.previousFocus = null;
    this.playToggleEntrance();
  }

  trapFocus(event) {
    const focusable = this.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const items = Array.from(focusable).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  setBotMessageContent(element, html) {
    element.innerHTML = html;
    element.querySelectorAll('a').forEach((link) => {
      if (link.getAttribute('href')?.startsWith('mailto:')) return;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }

  scrollToBottom() {
    if (!this.messagesEl) return;

    const scroll = () => {
      const lastRow = this.messagesEl.lastElementChild;
      if (lastRow) {
        lastRow.scrollIntoView({ block: 'end' });
        return;
      }

      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    };

    requestAnimationFrame(() => {
      scroll();
      requestAnimationFrame(scroll);
    });
  }

  addMessage(text, role) {
    this.messages.push({ text, role });

    const row = document.createElement('div');
    row.className = `portfolio-chat__message-row portfolio-chat__message-row--${role}`;

    if (role === 'bot') {
      const avatar = document.createElement('span');
      avatar.className = 'portfolio-chat__avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = '✦';
      row.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = `portfolio-chat__message portfolio-chat__message--${role}`;
    if (role === 'bot') {
      this.setBotMessageContent(bubble, text);
    } else {
      bubble.textContent = text;
    }
    row.appendChild(bubble);
    this.messagesEl.appendChild(row);
    this.scrollToBottom();
  }

  addUserMessage(text) {
    this.addMessage(text, 'user');
  }

  addBotMessage(text) {
    this.addMessage(text, 'bot');
  }

  showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'portfolio-chat__message-row portfolio-chat__message-row--bot';
    row.dataset.typing = 'true';

    const avatar = document.createElement('span');
    avatar.className = 'portfolio-chat__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = '✦';

    const bubble = document.createElement('div');
    bubble.className = 'portfolio-chat__message portfolio-chat__message--bot';
    bubble.setAttribute('aria-label', 'Assistant is typing');

    const typing = document.createElement('span');
    typing.className = 'portfolio-chat__typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<span></span><span></span><span></span>';
    bubble.appendChild(typing);

    row.appendChild(avatar);
    row.appendChild(bubble);
    this.messagesEl.appendChild(row);
    this.scrollToBottom();
    return row;
  }

  removeTypingIndicator(row) {
    row?.remove();
  }

  respondWithBotMessage(text, delay = 420) {
    const typingRow = this.showTypingIndicator();

    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.removeTypingIndicator(typingRow);
        this.addBotMessage(text);
        resolve();
      }, delay);
    });
  }

  renderSuggestions(pickOptions = {}) {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.innerHTML = '';

    if (!this.faqData) return;

    const result = pickSuggestions(this.faqData.intents, 3, {
      excludeIds: this.sessionSeenIntentIds,
      ...pickOptions,
    });

    result.intentIds.forEach((intentId) => {
      this.sessionSeenIntentIds.add(intentId);
    });

    result.labels.forEach((label) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'portfolio-chat__chip';
      button.textContent = label;
      button.addEventListener('click', () => {
        this.handleQuestion(label);
      });
      this.suggestionsEl.appendChild(button);
    });

    this.scrollToBottom();
  }

  handleSubmit() {
    const value = this.input.value.trim();
    if (!value) return;
    this.input.value = '';
    this.handleQuestion(value);
  }

  async handleQuestion(question) {
    if (!this.faqData) {
      await this.respondWithBotMessage("I'm still loading. Please try again in a moment.", 280);
      return;
    }

    this.addUserMessage(question);
    const result = matchQuestion(question, this.faqData);

    if (result.type === 'answer') {
      this.sessionSeenIntentIds.add(result.intentId);
      await this.respondWithBotMessage(result.answer);
      this.renderSuggestions({ preferIntentId: result.intentId });
      return;
    }

    await this.respondWithBotMessage(result.message);
    this.renderSuggestions({ relatedToInput: question });
  }
}

if (!customElements.get('portfolio-chat')) {
  customElements.define('portfolio-chat', PortfolioChat);
}
