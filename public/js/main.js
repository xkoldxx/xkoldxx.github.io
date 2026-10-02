document.addEventListener('DOMContentLoaded', initContactForm);

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
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

  // Validation functions using stricter email validation
  const validators = {
    name: (value) => value.trim().length > 0,
    email: (value) => {
      // Enhanced email regex - only valid emails pass
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value);
    },
    message: (value) => value.trim().length > 10
  };

  const showError = (field, show) => {
    if (errorMessages[field]) {
      errorMessages[field].classList.toggle('hidden', !show);
      if (show) {
        formFields[field].setAttribute('aria-invalid', 'true');
        formFields[field].classList.add('border-red-500');
      } else {
        formFields[field].removeAttribute('aria-invalid');
        formFields[field].classList.remove('border-red-500');
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
        isValid = isValid && validateField(field);
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

    // First, ensure the email is valid
    if (!validators.email(formFields.email.value)) {
      showError('email', true);
      formFields.email.focus();
      formFields.email.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      const firstInvalidField = Object.keys(formFields).find(
        field => formFields[field] && formFields[field].getAttribute('aria-invalid') === 'true'
      );
      if (firstInvalidField && formFields[firstInvalidField]) {
        formFields[firstInvalidField].focus();
        formFields[firstInvalidField].scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
          formSuccess.focus();
          contactForm.reset();
        }
      } else {
        if (formError) {
          formError.classList.remove('hidden');
          formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          formError.focus();
        }
      }
    } catch (error) {
      if (submitButton) submitButton.disabled = false;
      window.turnstile?.reset();

      if (formError) {
        formError.classList.remove('hidden');
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formError.focus();
      }
    }
  });
  
  // Live validation on blur and input
  Object.keys(formFields).forEach(field => {
    if (formFields[field] && validators[field]) {
      formFields[field].addEventListener('blur', () => validateField(field));
      
      if (field === 'email') {
        formFields[field].addEventListener('input', () => validateField(field));
      } else {
        formFields[field].addEventListener('input', () => {
          if (formFields[field].getAttribute('aria-invalid') === 'true') {
            validateField(field);
          }
        });
      }
    }
  });
}
