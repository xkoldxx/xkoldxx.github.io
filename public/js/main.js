document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.nav-mobile');
  if (menu) {
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.open = false; }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    window.addEventListener('scroll', () => { if (menu.open) menu.open = false; }, { passive: true });
  }
  initContactForm();
  initToc();
});

function initToc() {
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  const targets = links.map(a => document.getElementById(a.hash.slice(1)));
  if (!links.length || targets.includes(null)) return;
  const update = () => {
    let i = 0;
    targets.forEach((t, n) => { if (t.getBoundingClientRect().top < 120) i = n; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) i = targets.length - 1;
    links.forEach((a, n) => n === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const need = document.getElementById('need');
  const wanted = new URLSearchParams(location.search).get('need');
  const preset = wanted && need && [...need.options].find(o => o.dataset.key === wanted);
  if (preset) need.value = preset.value;
  
  const formFields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    message: document.getElementById('message')
  };
  
  const errorMessages = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    message: document.getElementById('message-error')
  };
  
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formErrorText = formError ? formError.innerHTML : '';

  // Validation functions using stricter email validation
  const validators = {
    name: (value) => value.trim().length > 0,
    email: (value) => {
      // Enhanced email regex - only valid emails pass
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value);
    },
    message: (value) => value.trim().length <= 5000
  };

  const scrollBehavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  const showError = (field, show) => {
    if (errorMessages[field]) {
      errorMessages[field].classList.toggle('hidden', !show);
      if (show) {
        formFields[field].setAttribute('aria-invalid', 'true');
      } else {
        formFields[field].removeAttribute('aria-invalid');
      }
    }
  };

  const validateField = (field) => {
    const isValid = validators[field](formFields[field].value);
    showError(field, !isValid);
    return isValid;
  };

  const validateForm = () => {
    let isValid = true;
    Object.keys(formFields).forEach(field => {
      if (formFields[field] && validators[field]) {
        const ok = validateField(field);
        isValid = isValid && ok;
      }
    });
    return isValid;
  };

  // Handle form submission using Fetch API
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Hide previous messages
    if (formSuccess) formSuccess.classList.add('hidden');
    if (formError) formError.classList.add('hidden');

    // Validate all fields
    if (!validateForm()) {
      const firstInvalidField = Object.keys(formFields).find(
        field => formFields[field] && formFields[field].getAttribute('aria-invalid') === 'true'
      );
      if (firstInvalidField && formFields[firstInvalidField]) {
        formFields[firstInvalidField].focus();
        formFields[firstInvalidField].scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
      }
      return;
    }

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: {
          'Accept': 'application/json'
        }
      });

      if (submitButton) submitButton.disabled = false;
      window.turnstile?.reset();

      if (response.ok) {
        if (formSuccess) {
          formSuccess.classList.remove('hidden');
          formSuccess.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
          formSuccess.focus();
          contactForm.reset();
        }
      } else {
        if (formError) {
          formError.innerHTML = response.status === 403 ? 'Please complete the verification above and try again.' : formErrorText;
          formError.classList.remove('hidden');
          formError.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
          formError.focus();
        }
      }
    } catch (error) {
      if (submitButton) submitButton.disabled = false;
      window.turnstile?.reset();

      if (formError) {
        formError.innerHTML = formErrorText;
        formError.classList.remove('hidden');
        formError.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
        formError.focus();
      }
    }
  });
  
  // Live validation on blur and input
  Object.keys(formFields).forEach(field => {
    if (formFields[field] && validators[field]) {
      formFields[field].addEventListener('blur', () => validateField(field));
      formFields[field].addEventListener('input', () => {
        if (formFields[field].getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
    }
  });
}
