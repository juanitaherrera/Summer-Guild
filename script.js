// DOM Elements
const header = document.querySelector('.header');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav a');
const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

// Draggable circles functionality for multiple elements
const draggableElements = document.querySelectorAll('.draggable-bg');
let isDragging = false;
let currentDraggedElement = null;
let hasBeenDragged = new Set();
let startX, startY;
let currentX = 0, currentY = 0;
let velocityX = 0, velocityY = 0;
let lastX = 0, lastY = 0;
let animationId = null;

// Initialize draggable functionality for all elements
draggableElements.forEach(element => {
  element.addEventListener('mousedown', (e) => {
    isDragging = true;
    currentDraggedElement = element;
    hasBeenDragged.add(element);
    element.classList.add('dragging');
    element.classList.remove('smooth-levitate'); // Remove smooth levitation when starting to drag
    
    // Cancel any ongoing animation
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    // Get current position relative to the container
    const container = document.querySelector('.circles-container');
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate current position relative to container
    currentX = elementRect.left - containerRect.left;
    currentY = elementRect.top - containerRect.top;
    
    // Calculate mouse offset from element
    startX = e.clientX - elementRect.left;
    startY = e.clientY - elementRect.top;
    lastX = e.clientX;
    lastY = e.clientY;
    
    e.preventDefault();
  });

  // Prevent context menu on right click
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
});

document.addEventListener('mouseup', () => {
  if (isDragging && currentDraggedElement) {
    isDragging = false;
    currentDraggedElement.classList.remove('dragging');
    
    // If the element has been dragged, permanently stop levitation
    if (hasBeenDragged.has(currentDraggedElement)) {
      currentDraggedElement.classList.add('no-levitate');
    }
    
    // Start gentle floating animation
    animateToStop();
    currentDraggedElement = null;
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging || !currentDraggedElement) return;
  e.preventDefault();

  // Calculate velocity for smooth deceleration
  velocityX = e.clientX - lastX;
  velocityY = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  // Get container position for relative positioning
  const container = document.querySelector('.circles-container');
  const containerRect = container.getBoundingClientRect();
  
  // Calculate new position relative to container
  currentX = e.clientX - containerRect.left - startX;
  currentY = e.clientY - containerRect.top - startY;

  // Apply smooth movement
  currentDraggedElement.style.left = `${currentX}px`;
  currentDraggedElement.style.top = `${currentY}px`;
});

function animateToStop() {
  const friction = 0.97; // Smoother friction to prevent glitching
  const element = currentDraggedElement; // Store reference before it becomes null
  
  function animate() {
    if (Math.abs(velocityX) < 0.005 && Math.abs(velocityY) < 0.005) {
      // Animation complete - immediately resume original levitation for ALL circles
      if (element) {
        element.classList.remove('no-levitate');
      }
      return; // Stop animation when velocity is very low
    }
    
    velocityX *= friction;
    velocityY *= friction;
    
    currentX += velocityX;
    currentY += velocityY;
    
    if (element) {
      element.style.left = `${currentX}px`;
      element.style.top = `${currentY}px`;
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  animate();
}

// Header Scroll Effect - Smoother transitions
function handleScroll() {
    const scrollPosition = window.scrollY;
    
    // Add/remove header background on scroll with smoother transition
    if (scrollPosition > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
        header.style.backdropFilter = 'blur(15px)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
        header.style.backdropFilter = 'blur(10px)';
    }
}

// Smooth Scrolling for Navigation
function setupSmoothScrolling() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Active Navigation Link Highlighting
function updateActiveNavLink() {
    const scrollPosition = window.scrollY + header.offsetHeight + 100;
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const navLink = navLinks[index];
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

// Intersection Observer for Animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Video Player Enhancements
function setupVideoPlayers() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Pause other videos when one starts playing
        video.addEventListener('play', () => {
            videos.forEach(otherVideo => {
                if (otherVideo !== video && !otherVideo.paused) {
                    otherVideo.pause();
                }
            });
        });
        
        // Add loading state
        video.addEventListener('loadstart', () => {
            const container = video.closest('.video-container');
            if (container) {
                container.classList.add('loading');
            }
        });
        
        video.addEventListener('canplay', () => {
            const container = video.closest('.video-container');
            if (container) {
                container.classList.remove('loading');
            }
        });
        
        // Error handling
        video.addEventListener('error', () => {
            const container = video.closest('.video-container');
            if (container) {
                container.innerHTML = '<div class="video-error">Video temporarily unavailable</div>';
            }
        });
    });
}

// Statistics Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasPercent = text.includes('%');
    const target = parseInt(text.replace(/[+%]/g, ''));
    
    if (isNaN(target)) return;
    
    const duration = 2000; // 2 seconds
    const stepTime = 50; // Update every 50ms
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
            clearInterval(timer);
        } else {
            const displayValue = Math.floor(current);
            element.textContent = displayValue + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
        }
    }, stepTime);
}

// Instructor and Student Card Interactions
function setupCardInteractions() {
    const instructorCards = document.querySelectorAll('.instructor-card');
    const reviewCards = document.querySelectorAll('.review-card');
    
    // Add hover effects for instructor cards
    instructorCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const avatar = card.querySelector('.avatar-gif');
            if (avatar) {
                avatar.style.transform = 'scale(1.1)';
                avatar.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const avatar = card.querySelector('.avatar-gif');
            if (avatar) {
                avatar.style.transform = 'scale(1)';
            }
        });
    });
    
    // Add subtle interactions for review cards
    reviewCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const avatar = card.querySelector('.avatar-image');
            if (avatar) {
                avatar.style.transform = 'scale(1.05)';
                avatar.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const avatar = card.querySelector('.avatar-image');
            if (avatar) {
                avatar.style.transform = 'scale(1)';
            }
        });
    });
}

// Lazy Loading for Images and Videos
function setupLazyLoading() {
    const lazyElements = document.querySelectorAll('img[data-src], video[data-src]');
    
    if (lazyElements.length === 0) return;
    
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.dataset.src) {
                    element.src = element.dataset.src;
                    element.removeAttribute('data-src');
                }
                
                lazyObserver.unobserve(element);
            }
        });
    }, { rootMargin: '50px' });
    
    lazyElements.forEach(element => {
        lazyObserver.observe(element);
    });
}

// Button Click Handlers - Fixed to prevent stretching
function setupButtonHandlers() {
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Prevent default behavior that might cause stretching
            e.preventDefault();
            
            // Add ripple effect
            createRipple(e, button);
            
            // Handle specific button actions
            const buttonText = button.textContent.toLowerCase();
            if (buttonText.includes('explore')) {
                scrollToSection('#classes');
            } else if (buttonText.includes('get notified')) {
                handleNotificationSignup(button);
            } else if (buttonText.includes('learn more')) {
                handleLearnMore();
            }
        });
        
        // Prevent button stretching on various events
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        button.addEventListener('focus', (e) => {
            e.target.style.outline = 'none';
        });
    });
}

function createRipple(event, button) {
    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        const headerHeight = header.offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function handleNotificationSignup(button) {
    const originalText = button.textContent;
    const originalWidth = button.offsetWidth;
    
    // Prevent button from changing size
    button.style.width = originalWidth + 'px';
    button.style.pointerEvents = 'none';
    
    button.textContent = 'Signing up...';
    
    setTimeout(() => {
        button.textContent = 'Thank you!';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.width = '';
            button.style.pointerEvents = '';
        }, 2000);
    }, 1500);
}

function handleLearnMore() {
    // Scroll to overview section
    scrollToSection('#overview');
}

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler with smoother transitions
const debouncedScrollHandler = debounce(() => {
    handleScroll();
    updateActiveNavLink();
}, 10);

// Add smooth background color transitions
function setupSmoothBackgroundTransitions() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                document.body.className = `viewing-${sectionId}`;
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-20% 0px -20% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Enhanced error handling for images
function setupImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', (e) => {
            // Create a placeholder div with the same dimensions
            const placeholder = document.createElement('div');
            placeholder.style.width = img.width || '100px';
            placeholder.style.height = img.height || '100px';
            placeholder.style.backgroundColor = '#f5f7fe';
            placeholder.style.borderRadius = img.classList.contains('avatar-image') || img.classList.contains('avatar-gif') ? '50%' : '10px';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.color = '#6154E0';
            placeholder.style.fontSize = '0.8rem';
            placeholder.style.border = '2px solid #6154E0';
            placeholder.textContent = 'Image';
            
            // Replace the broken image with placeholder
            img.parentNode.replaceChild(placeholder, img);
        });
    });
}

// Enhanced button interactions
function enhanceButtonInteractions() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    buttons.forEach(button => {
        // Prevent text selection
        button.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
        
        // Enhanced focus handling
        button.addEventListener('focus', () => {
            button.style.outline = '3px solid rgba(97, 84, 224, 0.3)';
            button.style.outlineOffset = '2px';
        });
        
        button.addEventListener('blur', () => {
            button.style.outline = 'none';
            button.style.outlineOffset = '0';
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScrolling();
    setupIntersectionObserver();
    setupVideoPlayers();
    animateCounters();
    setupCardInteractions();
    setupLazyLoading();
    setupButtonHandlers();
    setupSmoothBackgroundTransitions();
    setupImageErrorHandling();
    enhanceButtonInteractions();
    
    // Add scroll event listener
    window.addEventListener('scroll', debouncedScrollHandler);
    
    // Add resize event listener for responsive adjustments
    window.addEventListener('resize', debounce(() => {
        // Handle any resize-specific logic here
        const circles = document.querySelectorAll('.draggable-bg');
        circles.forEach(circle => {
            // Reset positions on resize if needed
            if (window.innerWidth < 768) {
                circle.style.transform = 'scale(0.8)';
            } else {
                circle.style.transform = '';
            }
        });
    }, 250));
    
    // Add classes for initial animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause all videos when page is not visible
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                video.dataset.wasPlaying = 'true';
            }
        });
    } else {
        // Resume videos that were playing before
        const videos = document.querySelectorAll('video[data-was-playing="true"]');
        videos.forEach(video => {
            video.play().catch(() => {
                // Handle autoplay restrictions
                console.log('Autoplay prevented for video');
            });
            delete video.dataset.wasPlaying;
        });
    }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // Could implement error reporting here
});

// Prevent common issues with button interactions
document.addEventListener('keydown', (e) => {
    // Prevent space/enter from affecting button layout
    if ((e.code === 'Space' || e.code === 'Enter') && e.target.classList.contains('btn-primary')) {
        e.preventDefault();
        e.target.click();
    }
});

// Export functions for potential external use
window.FloereGuildSite = {
    scrollToSection,
    animateCounter,
    createRipple
};