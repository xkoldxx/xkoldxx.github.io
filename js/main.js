/**
 * Northern Edge IT Consulting Website
 * Main JavaScript for Northern Edge IT Consulting
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu functionality
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuLinks = document.querySelectorAll('.mobile-nav a');
  
  function openMobileMenu() {
    mobileMenu.classList.add('active');
    document.body.classList.add('menu-open');
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    mobileMenuClose.focus(); // Move focus to close button for accessibility
    
    // Trap focus inside mobile menu for accessibility
    document.addEventListener('keydown', trapFocus);
  }
  
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.focus(); // Return focus to toggle button
    
    // Remove focus trap
    document.removeEventListener('keydown', trapFocus);
  }
  
  // Function to trap focus inside mobile menu
  function trapFocus(e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
      return;
    }
    
    if (e.key !== 'Tab') return;
    
    const focusableElements = mobileMenu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If shift+tab on first element, move to last element
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // If tab on last element, move to first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      openMobileMenu();
    });
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', function(e) {
      e.preventDefault();
      closeMobileMenu();
    });
  }
  
  // Close mobile menu when clicking on a link
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function() {
      closeMobileMenu();
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (mobileMenu.classList.contains('active') && 
        !mobileMenu.contains(e.target) && 
        e.target !== mobileMenuToggle && 
        !mobileMenuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Close menu when clicking outside
  mobileMenu.addEventListener('click', function(e) {
    if (e.target === mobileMenu) {
      closeMobileMenu();
    }
  });
  
  // Close menu with ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
  
  // Testimonial slider
  const testimonials = document.querySelectorAll('.testimonial');
  const prevButton = document.getElementById('testimonial-prev');
  const nextButton = document.getElementById('testimonial-next');
  let currentTestimonial = 0;
  
  function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
      if (i === index) {
        testimonial.classList.remove('hidden');
        testimonial.setAttribute('aria-hidden', 'false');
      } else {
        testimonial.classList.add('hidden');
        testimonial.setAttribute('aria-hidden', 'true');
      }
    });
    
    // Update ARIA labels for better accessibility
    const totalTestimonials = testimonials.length;
    prevButton.setAttribute('aria-label', `Previous testimonial (${index} of ${totalTestimonials})`);
    nextButton.setAttribute('aria-label', `Next testimonial (${index + 2 > totalTestimonials ? 1 : index + 2} of ${totalTestimonials})`);
  }
  
  if (testimonials.length > 0) {
    showTestimonial(currentTestimonial);
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', function() {
      currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
      showTestimonial(currentTestimonial);
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(currentTestimonial);
    });
  }
  
  // Add keyboard navigation for testimonials
  document.addEventListener('keydown', function(e) {
    if (document.activeElement === prevButton || document.activeElement === nextButton) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevButton.click();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextButton.click();
      }
    }
  });
  
  // Add lazy loading to images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
  
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
      }, 100);
    }
  }
  
  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form fields
      const nameField = document.getElementById('name');
      const emailField = document.getElementById('email');
      const messageField = document.getElementById('message');
      
      // Get form values
      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();
      
      // Reset previous error states
      const formFields = [nameField, emailField, messageField];
      formFields.forEach(field => {
        field.classList.remove('error');
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) errorElement.remove();
      });
      
      // Validate form
      let isValid = true;
      
      // Validate name
      if (!name) {
        showFieldError(nameField, 'Please enter your name');
        isValid = false;
      }
      
      // Validate email
      if (!email) {
        showFieldError(emailField, 'Please enter your email');
        isValid = false;
      } else if (!isValidEmail(email)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
      }
      
      // Validate message
      if (!message) {
        showFieldError(messageField, 'Please enter your message');
        isValid = false;
      }
      
      if (!isValid) return;
      
      // For GitHub Pages (which doesn't support server-side processing),
      // we'll use Formspree.io for form submission
      const formData = new FormData(contactForm);
      
      // Show loading state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      // Send form data to Formspree
      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        // Reset form
        contactForm.reset();
        
        // Show success message
        if (formMessage) {
          formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
          formMessage.className = 'form-message success';
          formMessage.setAttribute('role', 'alert');
          formMessage.setAttribute('aria-live', 'polite');
          formMessage.classList.add('success');
          contactForm.reset();
        }
      })
    });
  }
});
