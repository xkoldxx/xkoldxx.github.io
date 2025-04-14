/**
 * Northern Edge IT Consulting Website
 * Main JavaScript for Northern Edge IT Consulting
 */

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing site components...');
  // Initialize all components
  initMobileMenu();
  initContactForm();
  initLazyLoading();
  initSmoothScrolling();
  
  // Log for debugging
  console.log('Site initialization complete');
});

/**
 * Mobile Menu Functionality
 * Handles toggle, accessibility and animations
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuBtn = document.getElementById('close-mobile-menu');

  if (!menuToggle || !mobileMenu) {
    console.error('Mobile menu elements not found');
    return;
  }
  
  // Setup initial state
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  
  // Toggle menu visibility
  const openMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.remove('translate-x-full');
    mobileMenu.classList.add('translate-x-0');
    document.body.style.overflow = 'hidden';
  };
  
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.add('translate-x-full');
    mobileMenu.classList.remove('translate-x-0');
    document.body.style.overflow = '';
  };
  
  // Event listeners
  menuToggle.addEventListener('click', openMenu);
  
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', closeMenu);
  }

  // Close menu when clicking links
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Close menu with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.getAttribute('aria-hidden') === 'false') {
      closeMenu();
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu.getAttribute('aria-hidden') === 'false' && 
        !mobileMenu.contains(e.target) && 
        e.target !== menuToggle) {
      closeMenu();
    }
  }, { capture: true });
}

/**
 * Testimonial Slider
 * Accessible, touch-enabled slider with keyboard support
 */
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  
  const track = slider.querySelector('.testimonial-track');
  const slides = Array.from(slider.querySelectorAll('.testimonial-slide'));
  const prevBtn = slider.querySelector('.testimonial-prev');
  const nextBtn = slider.querySelector('.testimonial-next');
  
  if (!track || slides.length === 0) return;
  
  let currentIndex = 0;
  const slideCount = slides.length;
  
  // Update slider position and ARIA attributes
  const updateSlider = () => {
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    
    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.setAttribute('aria-hidden', !isActive);
      slide.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    
    // Update button ARIA labels
    if (prevBtn && nextBtn) {
      prevBtn.setAttribute('aria-label', `Previous testimonial (${currentIndex + 1} of ${slideCount})`);
      nextBtn.setAttribute('aria-label', `Next testimonial (${currentIndex + 1} of ${slideCount})`);
    }
  };
  
  // Navigation controls
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
  
  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});
  
  const handleSwipe = () => {
    const threshold = 50;
    if (touchStartX - touchEndX > threshold) {
      // Swipe left
      currentIndex = (currentIndex + 1) % slideCount;
    } else if (touchEndX - touchStartX > threshold) {
      // Swipe right
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    }
    updateSlider();
  };
  
  // Keyboard navigation
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateSlider();
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % slideCount;
      updateSlider();
    }
  });
  
  // Initialize
  updateSlider();
}

/**
 * Contact Form Validation
 * Client-side validation with accessibility features
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
  
  // Validation functions
  const validators = {
    name: (value) => value.trim().length > 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: (value) => value.trim().length > 10
  };
  
  // Show error message
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
  
  // Validate single field
  const validateField = (field) => {
    const isValid = validators[field](formFields[field].value);
    showError(field, !isValid);
    return isValid;
  };
  
  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    
    Object.keys(formFields).forEach(field => {
      if (formFields[field] && validators[field]) {
        const fieldValid = validateField(field);
        isValid = isValid && fieldValid;
      }
    });
    
    return isValid;
  };
  
  // Handle form submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide previous success/error messages
    formSuccess?.classList.add('hidden');
    formError?.classList.add('hidden');
    
    if (validateForm()) {
      // Show loading spinner
      if (spinner) spinner.classList.remove('hidden');
      if (submitButton) submitButton.disabled = true;
      
      // Simulate form submission (replace with actual API call)
      setTimeout(() => {
        // Hide spinner
        if (spinner) spinner.classList.add('hidden');
        if (submitButton) submitButton.disabled = false;
        
        // Show success message
        formSuccess?.classList.remove('hidden');
        formSuccess?.focus(); // Focus for screen readers
        
        // Reset form
        contactForm.reset();
      }, 1500);
    }
  });
  
  // Live validation on blur
  Object.keys(formFields).forEach(field => {
    if (formFields[field] && validators[field]) {
      formFields[field].addEventListener('blur', () => {
        validateField(field);
      });
      
      formFields[field].addEventListener('input', () => {
        if (formFields[field].getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
    }
  });
}
  
  // Initialize contact form
  initContactForm();
  
/**
 * Image Lazy Loading
 * Performance optimization for images
 */
function initLazyLoading() {
  // Native lazy loading for modern browsers
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    img.setAttribute('loading', 'lazy');
  });
  
  // Intersection Observer for older browsers
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
    
    // Apply to images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}
  
  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Scroll to element
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Set focus to the target element for accessibility
        // Add tabindex if the element is not focusable
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        
        // Wait for scroll to complete before focusing
        setTimeout(() => {
          targetElement.focus({
            preventScroll: true // Prevent additional scrolling
          });
        }, 500);
        
        // Update URL hash for bookmarking
        history.pushState(null, null, targetId);
      }
    });
  });
  
  // Handle initial hash in URL
  if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement) {
      // Wait for page to fully load before scrolling
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        targetElement.focus({
          preventScroll: true
        });
      }, 500);
      
      // Update URL hash for bookmarking
      history.pushState(null, null, targetId);
    }
  }
}

// Testimonial slider functionality
function initTestimonialSlider() {
  const slider = document.getElementById('testimonial-slider');
  if (!slider) return;
  
  const slides = slider.querySelectorAll('.testimonial-slide');
  const slideCount = slides.length;
  let currentIndex = 0;
  
  // Touch event handling
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});
  
  const handleSwipe = () => {
    const threshold = 50;
    if (touchStartX - touchEndX > threshold) {
      // Swipe left
      currentIndex = Math.min(currentIndex + 1, slideCount - 1);
    } else if (touchEndX - touchStartX > threshold) {
      // Swipe right
      currentIndex = Math.max(currentIndex - 1, 0);
    }
    updateSlider();
  };
  
  // Update slider
  const updateSlider = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentIndex);
    });
  };
  
  // Initialize
  updateSlider();
}

// Form validation functionality
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
  
  // Validation functions
  const validators = {
    name: (value) => value.trim().length > 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: (value) => value.trim().length > 10
  };
  
  // Show error message
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
  
  // Validate single field
  const validateField = (field) => {
    const isValid = validators[field](formFields[field].value);
    showError(field, !isValid);
    return isValid;
  };
  
  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    
    Object.keys(formFields).forEach(field => {
      if (formFields[field] && validators[field]) {
        const fieldValid = validateField(field);
        isValid = isValid && fieldValid;
      }
    });
    
    return isValid;
  };
  
  // Handle form submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide previous success/error messages
    formSuccess?.classList.add('hidden');
    formError?.classList.add('hidden');
    
    if (validateForm()) {
      // Show loading spinner
      if (spinner) spinner.classList.remove('hidden');
      if (submitButton) submitButton.disabled = true;
      
      // Simulate form submission (replace with actual API call)
      setTimeout(() => {
        // Hide spinner
        if (spinner) spinner.classList.add('hidden');
        if (submitButton) submitButton.disabled = false;
        
        // Show success message
        formSuccess?.classList.remove('hidden');
        
        // Reset form
        contactForm.reset();
      }, 1500);
    }
  });
  
  // Live validation on blur
  Object.keys(formFields).forEach(field => {
    if (formFields[field] && validators[field]) {
      formFields[field].addEventListener('blur', () => {
        validateField(field);
      });
      
      formFields[field].addEventListener('input', () => {
        if (formFields[field].getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
    }
  });
}
/**
 * Smooth Scrolling
 * Enhances navigation experience
 */
function initSmoothScrolling() {
  // Handle anchor links
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Scroll smoothly
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Set focus for accessibility
        setTimeout(() => {
          // Set focus to the target element
          if (!targetElement.hasAttribute('tabindex')) {
            targetElement.setAttribute('tabindex', '-1');
          }
          targetElement.focus({
            preventScroll: true
          });
          
          // Update URL hash without scrolling
          history.pushState(null, null, targetId);
        }, 500);
      }
    });
  });
}
