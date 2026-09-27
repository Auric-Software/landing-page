// Launch-list signups are sent by FormSubmit (https://formsubmit.co), a serverless
// form relay, which emails each address to the founders. The alias maps to
// founders@auricsoftware.com and keeps the address out of the source.
const SIGNUP_ENDPOINT = 'https://formsubmit.co/ajax/5aff395fa8232b363ac005b42d2659e2';
const FALLBACK_EMAIL = 'founders@auricsoftware.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


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

  try {
    const response = await fetch(SIGNUP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email,
        _subject: 'New Prism launch list signup',
        _template: 'table',
        _captcha: 'false',
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || String(result.success) !== 'true') {
      throw new Error(result.message || `Request failed (${response.status})`);
    }
    form.classList.add('is-done');
    setStatus(form, 'success', 'You’re on the list. We’ll be in touch before launch.');
    form.reset();
  } catch (error) {
    console.error('Signup failed:', error);
    setStatus(form, 'error', `Something went wrong. Please try again, or email ${FALLBACK_EMAIL}.`);
  } finally {
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
