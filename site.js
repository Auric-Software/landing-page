// Launch-list signups are sent by Web3Forms (https://web3forms.com), a serverless
// form relay, which emails each address to founders@auricsoftware.com. The access
// key only permits sending to that inbox, so it is safe to publish.
const SIGNUP_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = 'c90b54b9-d4a7-44f7-b218-37c6108e16ed';
const FALLBACK_EMAIL = 'founders@auricsoftware.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Give up on a stalled request so the form never stays stuck.
const SIGNUP_TIMEOUT_MS = 30000;
const SLOW_NOTICE_MS = 6000;

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const header = document.querySelector('.site-header');
if (header) {
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

// One-time entrance reveals. Without IntersectionObserver, everything shows at once.
const revealed = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealed.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index, 4) * 70}ms`;
    observer.observe(element);
  });
} else {
  revealed.forEach(element => element.classList.add('is-visible'));
}

// Demo video: respect reduced motion and give viewers a pause control.
const video = document.querySelector('.demo-video');
const toggle = document.querySelector('[data-video-toggle]');
if (video && toggle) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => {
    toggle.textContent = video.paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-pressed', String(video.paused));
  };
  if (reducedMotion.matches) {
    video.removeAttribute('autoplay');
    video.pause();
  }
  toggle.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
}

function setStatus(form, state, message) {
  const status = form.querySelector('.signup-status');
  status.dataset.state = state;
  status.textContent = message;
}

async function submitSignup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const honey = form.querySelector('input[name="_honey"]');
  const email = input.value.trim();

  if (!EMAIL_PATTERN.test(email)) {
    form.classList.add('is-invalid');
    setStatus(form, 'error', 'Please enter a valid email address.');
    input.focus();
    return;
  }
  form.classList.remove('is-invalid');

  // Bots fill hidden fields; pretend success without sending anything.
  if (honey && honey.value) {
    form.classList.add('is-done');
    setStatus(form, 'success', 'You’re on the list. Thanks!');
    return;
  }

  button.disabled = true;
  const label = button.textContent;
  button.textContent = 'Joining…';
  setStatus(form, 'pending', '');

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), SIGNUP_TIMEOUT_MS);
  const slowTimer = setTimeout(() => setStatus(form, 'pending', 'Still working, this can take a few seconds…'), SLOW_NOTICE_MS);

  try {
    const response = await fetch(SIGNUP_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'New Prism launch list signup',
        from_name: 'Prism launch list',
        email,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) {
      throw new Error(result.message || `Request failed (${response.status})`);
    }
    form.classList.add('is-done');
    setStatus(form, 'success', 'You’re on the list. We’ll be in touch before launch.');
    form.reset();
  } catch (error) {
    console.error('Signup failed:', error);
    const message = error.name === 'AbortError'
      ? `We couldn’t confirm your signup. Please try again later, or email ${FALLBACK_EMAIL}.`
      : `Something went wrong. Please try again, or email ${FALLBACK_EMAIL}.`;
    setStatus(form, 'error', message);
  } finally {
    clearTimeout(abortTimer);
    clearTimeout(slowTimer);
    button.disabled = false;
    button.textContent = label;
  }
}

document.querySelectorAll('[data-signup]').forEach(form => {
  form.addEventListener('submit', submitSignup);
  form.querySelector('input[type="email"]').addEventListener('input', () => {
    if (form.classList.contains('is-invalid')) {
      form.classList.remove('is-invalid');
      setStatus(form, '', '');
    }
  });
});
