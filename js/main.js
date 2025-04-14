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
  
  // Check if returning from a form submission
  if (sessionStorage.getItem('formSubmitted') === 'true') {
    // Clear the flag
    sessionStorage.removeItem('formSubmitted');
    
    // Show success message
    const formSuccess = document.getElementById('form-success');
    if (formSuccess) {
      formSuccess.classList.remove('hidden');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formSuccess.focus(); // For screen readers
    }
  }
  
  // Log for debugging
  console.log('Site initialization complete');
});

/**
 * Mobile Menu Functionality
 * Handles toggle, accessibility and animations
 */
function initMobileMenu() {
  console.log('Initializing mobile menu with simplified approach...');
  
  // Direct DOM element selection
  const menuToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuBtn = document.getElementById('close-mobile-menu');
  
  // Verify elements exist
  if (!menuToggle || !mobileMenu) {
    console.error('Mobile menu elements not found');
    return;
  }
  
  // Function to close menu (used in multiple places)
  function closeMenu() {
    mobileMenu.classList.add('translate-x-full');
    mobileMenu.classList.remove('translate-x-0');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  // Simplified toggle function
  function toggleMenu() {
    console.log('Mobile menu toggle clicked');
    if (mobileMenu.classList.contains('translate-x-full')) {
      // Open menu
      mobileMenu.classList.remove('translate-x-full');
      mobileMenu.classList.add('translate-x-0');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      // Close menu
      closeMenu();
    }
  }
  
  // Direct onclick handler for maximum mobile compatibility
  menuToggle.onclick = toggleMenu;
  
  // Close button handler
  if (closeMenuBtn) {
    closeMenuBtn.onclick = closeMenu;
  }
  
  // Handle mobile links
  const menuLinks = mobileMenu.querySelectorAll('a');
  for (let i = 0; i < menuLinks.length; i++) {
    menuLinks[i].onclick = closeMenu;
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu.getAttribute('aria-hidden') === 'false' && 
        !mobileMenu.contains(e.target) && 
        e.target !== menuToggle) {
      console.log('Clicked outside menu, closing');
      closeMenu();
    }
  });
  
  // Set initial state
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
    if (formSuccess) formSuccess.classList.add('hidden');
    if (formError) formError.classList.add('hidden');
    
    if (validateForm()) {
      try {
        // Show loading spinner
        if (spinner) spinner.classList.remove('hidden');
        if (submitButton) submitButton.disabled = true;
        
        // Get form data
        const name = formFields.name.value.trim();
        const email = formFields.email.value.trim();
        const subject = document.getElementById('subject')?.value.trim() || 'Contact Form Submission';
        const message = formFields.message.value.trim();
        
        // Create formatted email body
        const body = `Name: ${name}\n\nEmail: ${email}\n\nMessage:\n${message}`;
        
        // Create mailto link
        const mailtoLink = `mailto:info@neit.tech?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open the email client
        window.location.href = mailtoLink;
        
        // Hide spinner after a short delay to show the user something happened
        setTimeout(() => {
          if (spinner) spinner.classList.add('hidden');
          if (submitButton) submitButton.disabled = false;
          
          // Show success message
          if (formSuccess) {
            formSuccess.classList.remove('hidden');
            formSuccess.focus(); // Focus for screen readers
          }
          
          // Reset form
          contactForm.reset();
        }, 1000);
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Hide spinner
        if (spinner) spinner.classList.add('hidden');
        if (submitButton) submitButton.disabled = false;
        
        // Show error message
        if (formError) {
          formError.classList.remove('hidden');
          formError.focus();
        }
      }
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
        
        // Don't modify the URL to prevent potential redirect issues
      }
    });
  });
  
  // Initial hash handling removed to prevent redirects
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
  
  // Handle form submission with GetForm
  contactForm.addEventListener('submit', (e) => {
    // Only prevent default if validation fails
    
    // Hide previous success/error messages
    if (formSuccess) formSuccess.classList.add('hidden');
    if (formError) formError.classList.add('hidden');
    
    // Validate form before submission
    if (!validateForm()) {
      e.preventDefault();
      return false;
    }
    
    // Show loading spinner during form submission
    if (spinner) spinner.classList.remove('hidden');
    if (submitButton) submitButton.disabled = true;
    
    // Add honeypot field to prevent spam (GetForm supports this)
    if (!document.getElementById('_gotcha')) {
      const honeypot = document.createElement('input');
      honeypot.type = 'hidden';
      honeypot.name = '_gotcha';
      honeypot.id = '_gotcha';
      honeypot.style.display = 'none';
      contactForm.appendChild(honeypot);
    }
    
    // Add redirect back to the same page after submission
    if (!document.getElementById('_next')) {
      const redirect = document.createElement('input');
      redirect.type = 'hidden';
      redirect.name = '_next';
      redirect.id = '_next';
      redirect.value = window.location.href;
      contactForm.appendChild(redirect);
    }
    
    // Add email destination to ensure form goes to the right address
    if (!document.getElementById('_email')) {
      const emailField = document.createElement('input');
      emailField.type = 'hidden';
      emailField.name = '_email';
      emailField.id = '_email';
      emailField.value = 'info@northernedgeit.com';
      contactForm.appendChild(emailField);
    }
    
    // The form will be submitted to GetForm
    // We'll monitor the form submission to provide feedback
    const formSubmitTime = Date.now();
    
    // Store submission time in session storage
    sessionStorage.setItem('formSubmitTime', formSubmitTime);
    sessionStorage.setItem('formSubmitted', 'true');
    
    // Let the form submit to GetForm
    return true;
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
