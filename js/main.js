/**
 * Northern Edge IT Consulting Website
 * Main JavaScript for Northern Edge IT Consulting
 */

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing site components...');
  // Initialize all components
  initMobileMenu();
  initContactForm();
  initLazyLoading();
  initSmoothScrolling();
  initTestimonialSlider();

  // Check if returning from a form submission
  if (sessionStorage.getItem('formSubmitted') === 'true') {
    sessionStorage.removeItem('formSubmitted');
    const formSuccess = document.getElementById('form-success');
    if (formSuccess) {
      formSuccess.classList.remove('hidden');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formSuccess.focus(); // For screen readers
    }
  }
  
  console.log('Site initialization complete');
});

/**
 * Mobile Menu Functionality
 * Handles toggle, accessibility, and animations
 */
function initMobileMenu() {
  console.log('Initializing mobile menu...');
  const menuToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuBtn = document.getElementById('close-mobile-menu');

  if (!menuToggle || !mobileMenu) {
    console.error('Mobile menu elements not found');
    return;
  }

  function closeMenu() {
    mobileMenu.classList.add('translate-x-full');
    mobileMenu.classList.remove('translate-x-0');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  function toggleMenu() {
    console.log('Mobile menu toggle clicked');
    if (mobileMenu.classList.contains('translate-x-full')) {
      mobileMenu.classList.remove('translate-x-full');
      mobileMenu.classList.add('translate-x-0');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      closeMenu();
    }
  }

  menuToggle.onclick = toggleMenu;
  if (closeMenuBtn) {
    closeMenuBtn.onclick = closeMenu;
  }
  const menuLinks = mobileMenu.querySelectorAll('a');
  for (let i = 0; i < menuLinks.length; i++) {
    menuLinks[i].onclick = closeMenu;
  }
  document.addEventListener('click', (e) => {
    if (mobileMenu.getAttribute('aria-hidden') === 'false' && 
        !mobileMenu.contains(e.target) && 
        e.target !== menuToggle) {
      console.log('Clicked outside menu, closing');
      closeMenu();
    }
  });
  mobileMenu.classList.add('translate-x-full'); 
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  console.log('Mobile menu initialization complete');
}

/**
 * Testimonial Slider
 * Accessible, touch-enabled slider with keyboard support
 */
function initTestimonialSlider() {
  const slider = document.getElementById('testimonial-slider');
  if (!slider) return;
  
  const track = slider.querySelector('.testimonial-track');
  const slides = Array.from(slider.querySelectorAll('.testimonial-slide'));
  const prevBtn = slider.querySelector('.testimonial-prev');
  const nextBtn = slider.querySelector('.testimonial-next');
  
  if (!track || slides.length === 0) return;
  
  let currentIndex = 0;
  const slideCount = slides.length;
  
  const updateSlider = () => {
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.setAttribute('aria-hidden', !isActive);
      slide.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    if (prevBtn && nextBtn) {
      prevBtn.setAttribute('aria-label', `Previous testimonial (${currentIndex + 1} of ${slideCount})`);
      nextBtn.setAttribute('aria-label', `Next testimonial (${currentIndex + 1} of ${slideCount})`);
    }
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateSlider();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slideCount;
      updateSlider();
    });
  }

  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 50;
    if (touchStartX - touchEndX > threshold) {
      currentIndex = (currentIndex + 1) % slideCount;
    } else if (touchEndX - touchStartX > threshold) {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    }
    updateSlider();
  }, {passive: true});
  
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateSlider();
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % slideCount;
      updateSlider();
    }
  });
  
  updateSlider();
}

/**
 * Contact Form Validation & Submission
 * Client-side validation with enhanced email validation and submission via jQuery AJAX.
 */
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
  const spinner = submitButton?.querySelector('.spinner');

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

  // Handle form submission using jQuery AJAX
  $(contactForm).submit(function(e) {
    e.preventDefault();
    
    // Hide previous messages
    if (formSuccess) formSuccess.classList.add('hidden');
    if (formError) formError.classList.add('hidden');
    
    // First, ensure the email is valid
    if (!validators.email(formFields.email.value)) {
      showError('email', true);
      formFields.email.focus();
      formFields.email.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
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
      return false;
    }
    
    // Show loading spinner
    if (spinner) spinner.classList.remove('hidden');
    if (submitButton) submitButton.disabled = true;
    
    const action = $(this).attr('action');
    
    $.ajax({
      type: 'POST',
      url: action,
      crossDomain: true,
      data: new FormData(this),
      dataType: 'json',
      processData: false,
      contentType: false,
      headers: { 'Accept': 'application/json' }
    }).done(function() {
      if (spinner) spinner.classList.add('hidden');
      if (submitButton) submitButton.disabled = false;
      
      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formSuccess.focus();
        contactForm.reset();
      }
    }).fail(function() {
      if (spinner) spinner.classList.add('hidden');
      if (submitButton) submitButton.disabled = false;
      
      if (formError) {
        formError.classList.remove('hidden');
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formError.focus();
      }
    });
    
    return false;
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

/**
 * Image Lazy Loading
 * Performance optimization for images
 */
function initLazyLoading() {
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    img.setAttribute('loading', 'lazy');
  });
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  }
}

/**
 * Smooth Scrolling
 * Enhances navigation experience with URL hash updates
 */
function initSmoothScrolling() {
  // Handle anchor link clicks
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (!targetElement.hasAttribute('tabindex')) {
            targetElement.setAttribute('tabindex', '-1');
          }
          targetElement.focus({ preventScroll: true });
          history.pushState(null, null, targetId);
        }, 500);
      }
    });
  });
  
  // Update URL hash when scrolling to different sections
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    const observerOptions = {
      root: null, // viewport is the root
      rootMargin: '0px',
      threshold: 0.3 // trigger when 30% of the section is visible
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = `#${entry.target.id}`;
          // Only update if we'd be changing the hash
          if (window.location.hash !== currentId) {
            history.replaceState(null, null, currentId);
            
            // Update active state in navigation
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === currentId);
            });
          }
        }
      });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
      observer.observe(section);
    });
  }
}
