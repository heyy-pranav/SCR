// ============================================
// Custom Cursor with Zero Latency
// ============================================
let cursor;
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let isHovering = false;
let isCursorInitialized = false;

// Initialize cursor after DOM is loaded
function initCursor() {
    cursor = document.getElementById('customCursor');
    
    if (!cursor) {
        console.warn('Custom cursor element not found');
        return;
    }
    
    // Set initial cursor position and visibility
    cursor.style.opacity = '0';
    cursor.style.left = '-100px';
    cursor.style.top = '-100px';
    
    // Handle image load error
    const cursorImg = cursor.querySelector('img');
    if (cursorImg) {
        cursorImg.addEventListener('error', () => {
            console.warn('Custom cursor image failed to load');
            // Fallback: show a simple div if image fails
            cursor.innerHTML = '<div style="width:100%;height:100%;background:var(--sage-green);border-radius:50%;"></div>';
        });
    }
    
    // Hide default cursor on body and all elements
    document.body.style.cursor = 'none';
    
    // Apply cursor: none to all elements via CSS
    const style = document.createElement('style');
    style.textContent = `
        *, *::before, *::after {
            cursor: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Update mouse position
    const handleMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Show cursor on first mouse move
        if (!isCursorInitialized) {
            cursor.style.opacity = '1';
            isCursorInitialized = true;
        }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Also listen for mouse move on window for better coverage
    window.addEventListener('mousemove', handleMouseMove);
    
    // Smooth cursor movement with requestAnimationFrame for zero perceived latency
    function updateCursor() {
        if (!cursor) return;
        
        cursorX = mouseX;
        cursorY = mouseY;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        // Scale cursor on hover over interactive elements
        const scale = isHovering ? 1.5 : 1;
        cursor.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        requestAnimationFrame(updateCursor);
    }
    
    // Start cursor animation
    updateCursor();
    
    // Show/hide cursor on mouse enter/leave document
    document.addEventListener('mouseenter', () => {
        if (cursor) cursor.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        if (cursor) cursor.style.opacity = '0';
    });
    
    // Cursor hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .gallery-item, .tree-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
        });
        el.addEventListener('mouseleave', () => {
            isHovering = false;
        });
    });
}

// Initialize cursor when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
} else {
    // DOM is already loaded
    initCursor();
}

// ============================================
// Navigation Glassmorphism on Scroll
// ============================================
const nav = document.querySelector('nav');
const header = document.querySelector('header');

function handleNavScroll() {
    if (!nav || !header) return;
    
    const headerHeight = header.offsetHeight;
    const scrollY = window.pageYOffset;
    
    // Add glassmorphism effect when scrolled past header
    if (scrollY > headerHeight - 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

// Listen for scroll events
window.addEventListener('scroll', handleNavScroll);
// Also check on load in case page is already scrolled
window.addEventListener('load', handleNavScroll);

// ============================================
// Scroll to Top Button
// ============================================
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    // Remove focus after click to prevent hover state persistence
    scrollToTopBtn.blur();
});

// ============================================
// Active Navigation Highlighting
// ============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

function highlightActiveSection() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.style.background = '';
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.style.background = 'var(--teal)';
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);

// ============================================
// Smooth Scrolling for Navigation Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for sticky nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        // Remove focus after click to prevent hover state persistence
        this.blur();
    });
});

// ============================================
// Intersection Observer for Scroll Animations
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .outcome-card, .tree-item, .gallery-item, .photo-entry').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// Gallery Lightbox
// ============================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item img');

galleryItems.forEach((img, index) => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.closest('.gallery-item').querySelector('.gallery-caption').textContent;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
    }
});

// ============================================
// Enhanced Form Validation
// ============================================
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

// Real-time validation
nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('blur', validateEmail);
messageInput.addEventListener('blur', validateMessage);

function validateName() {
    const name = nameInput.value.trim();
    if (name.length < 2) {
        showError(nameInput, 'Name must be at least 2 characters long');
        return false;
    }
    clearError(nameInput);
    return true;
}

function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(emailInput, 'Please enter a valid email address');
        return false;
    }
    clearError(emailInput);
    return true;
}

function validateMessage() {
    const message = messageInput.value.trim();
    if (message.length < 10) {
        showError(messageInput, 'Message must be at least 10 characters long');
        return false;
    }
    clearError(messageInput);
    return true;
}

function showError(input, message) {
    clearError(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#d32f2f';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    input.style.borderColor = '#d32f2f';
}

function clearError(input) {
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    input.style.borderColor = '';
}

// Form submission with loading state
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) {
        return;
    }

    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual API call)
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showFormMessage('success', 'Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    } catch (error) {
        showFormMessage('error', 'Something went wrong. Please try again later.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

function showFormMessage(type, message) {
    const existingMessage = contactForm.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message';
    messageDiv.style.padding = '1rem';
    messageDiv.style.marginTop = '1rem';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.fontWeight = '600';
    
    if (type === 'success') {
        messageDiv.style.background = '#4caf50';
        messageDiv.style.color = 'white';
    } else {
        messageDiv.style.background = '#f44336';
        messageDiv.style.color = 'white';
    }
    
    messageDiv.textContent = message;
    contactForm.appendChild(messageDiv);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// ============================================
// Counter Animation for Statistics
// ============================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Observe statistics section for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Example: If you add statistics numbers, animate them here
            // const statNumbers = entry.target.querySelectorAll('.stat-number');
            // statNumbers.forEach(stat => {
            //     const target = parseInt(stat.dataset.target);
            //     animateCounter(stat, target);
            // });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// ============================================
// Lazy Loading for Images
// ============================================
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// ============================================
// Mobile Menu Toggle (if needed for smaller screens)
// ============================================
// Add hamburger menu for mobile if navigation gets too long
if (window.innerWidth <= 768) {
    const nav = document.querySelector('nav ul');
    nav.style.display = 'flex';
}

// ============================================
// Keyboard Navigation Enhancement
// ============================================
document.addEventListener('keydown', (e) => {
    // Navigate sections with arrow keys when focus is on nav
    if (document.activeElement.tagName === 'A' && document.activeElement.closest('nav')) {
        const navLinksArray = Array.from(navLinks);
        const currentIndex = navLinksArray.indexOf(document.activeElement);
        
        if (e.key === 'ArrowDown' && currentIndex < navLinksArray.length - 1) {
            e.preventDefault();
            navLinksArray[currentIndex + 1].focus();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            e.preventDefault();
            navLinksArray[currentIndex - 1].focus();
        }
    }
});

// ============================================
// Performance: Debounce scroll events
// ============================================
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

// Apply debounce to scroll-heavy functions
const debouncedHighlight = debounce(highlightActiveSection, 10);
window.addEventListener('scroll', debouncedHighlight);

// ============================================
// Theme Toggle Functionality
// ============================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle?.querySelector('.theme-toggle-icon');

// Get saved theme or default to light
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icon
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Initialize theme on load
function initTheme() {
    const savedTheme = getTheme();
    setTheme(savedTheme);
}

// Event listener for theme toggle
if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        toggleTheme();
        // Remove focus after click to prevent hover state persistence
        e.target.blur();
    });
}

// ============================================
// Initialize on DOM Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Set initial active section
    highlightActiveSection();
    
    // Add loading animation completion
    document.body.style.opacity = '1';
});

