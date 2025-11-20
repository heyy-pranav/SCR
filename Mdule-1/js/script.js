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
    // Check if device supports fine pointer (mouse) and is desktop size
    const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
    
    if (isMobile) {
        // Don't initialize custom cursor on mobile/touch devices
        return;
    }
    
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
    
    // Hide default cursor on body and all elements (desktop only)
    document.body.style.cursor = 'none';
    
    // Apply cursor: none to all elements via CSS (desktop only)
    const style = document.createElement('style');
    style.textContent = `
        @media (min-width: 769px) and (pointer: fine) {
            *, *::before, *::after {
                cursor: none !important;
            }
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

// Re-check on window resize to handle orientation changes
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        const cursorElement = document.getElementById('customCursor');
        
        if (isMobile && cursorElement) {
            // Hide cursor on mobile
            cursorElement.style.display = 'none';
            // Restore default cursor
            document.body.style.cursor = '';
        } else if (!isMobile && cursorElement && !isCursorInitialized) {
            // Re-initialize cursor if window becomes desktop size
            initCursor();
        }
    }, 250);
});

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
// Hamburger Menu Toggle
// ============================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Ensure menu is hidden on page load
if (navMenu) {
    navMenu.classList.remove('active');
}
if (hamburger) {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
}

function toggleMobileMenu() {
    if (!hamburger || !navMenu) return;
    
    const isActive = navMenu.classList.contains('active');
    
    if (isActive) {
        // Close menu
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    } else {
        // Open menu
        navMenu.classList.add('active');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
}

// Toggle menu on hamburger click - use both click and touchstart for better mobile support
if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
        hamburger.blur();
    });
    
    // Also add touchstart for better mobile responsiveness
    hamburger.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
}

// Close menu when clicking on a nav link
if (navMenu) {
    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            toggleMobileMenu();
        }
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && hamburger && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && !e.target.closest('.hamburger')) {
            toggleMobileMenu();
        }
    }
});

// Close menu on window resize if it becomes desktop size
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});

// Ensure menu is closed on page load
document.addEventListener('DOMContentLoaded', () => {
    if (navMenu) {
        navMenu.classList.remove('active');
    }
    if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
});

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
// Download Report Functionality - Word Document
// ============================================
function downloadReport() {
    const downloadBtn = document.getElementById('downloadReport');
    if (!downloadBtn) return;
    
    // Show loading state
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Downloading Report...';
    downloadBtn.disabled = true;
    
    // Fetch and download the existing Word document
    const fileName = 'JIT Green Sunday Event Report (4).docx';
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found. Please ensure "' + fileName + '" exists in the same directory.');
            }
            return response.blob();
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'JIT_Green_Sunday_Event_Report_2025.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Reset button state
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
            downloadBtn.blur();
        })
        .catch(error => {
            console.error('Error downloading report:', error);
            alert('Error downloading report. Please ensure the file exists in the same directory.');
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        });
}

// Old function kept for reference - can be removed
function downloadReportOld() {
    const downloadBtn = document.getElementById('downloadReport');
    if (!downloadBtn) return;
    
    // Show loading state
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Generating Report...';
    downloadBtn.disabled = true;
    
    try {
        // Create HTML content for Word document with website styling
        const htmlContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word">
    <meta name="Originator" content="Microsoft Word">
    <title>JIT Green Sunday - Event Report 2025</title>
    <style>
        @page {
            size: 8.5in 11in;
            margin: 1in 1in 1in 1in;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #2C3E3E;
            font-size: 11pt;
        }
        h1 {
            color: #2C5F7C;
            font-size: 2.5rem;
            margin: 2rem 0 1rem 0;
            page-break-after: avoid;
        }
        h2 {
            color: #4A9B9B;
            font-size: 1.8rem;
            margin: 1.5rem 0 1rem 0;
            page-break-after: avoid;
        }
        h3 {
            color: #5A8A6F;
            font-size: 1.4rem;
            margin: 1.25rem 0 0.75rem 0;
            page-break-after: avoid;
        }
        h4 {
            color: #5A8A6F;
            font-size: 1.2rem;
            margin: 1rem 0 0.5rem 0;
        }
        p {
            margin: 0.75rem 0;
            text-align: justify;
        }
        ul, ol {
            margin: 0.75rem 0 0.75rem 2rem;
        }
        li {
            margin: 0.5rem 0;
        }
        .cover-page {
            text-align: center;
            padding: 3rem 0;
            page-break-after: always;
        }
        .cover-page h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
        }
        .cover-subtitle {
            color: #4A9B9B;
            font-size: 2rem;
            font-weight: 600;
            margin: 1rem 0;
        }
        .cover-date {
            color: #5A8A6F;
            font-size: 1.5rem;
            margin: 2rem 0;
        }
        .cover-desc {
            font-size: 1.2rem;
            margin: 2rem auto;
            max-width: 600px;
        }
        .highlight-box {
            background: linear-gradient(135deg, #7FB3A8 0%, #4A9B9B 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
            page-break-inside: avoid;
        }
        .highlight-box h3 {
            color: white;
        }
        .highlight-box p {
            color: white;
        }
        .quote {
            font-style: italic;
            color: #4A9B9B;
            border-left: 4px solid #2C5F7C;
            padding-left: 1.5rem;
            margin: 1.5rem 0;
            page-break-inside: avoid;
        }
        .page-break {
            page-break-before: always;
        }
        .footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 2px solid #7FB3A8;
            text-align: center;
            color: #4A9B9B;
            font-size: 9pt;
        }
        strong {
            font-weight: 600;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <h1 style="color: #2C5F7C;">JIT Green Sunday</h1>
        <div class="cover-subtitle">Social Connect & Responsibility</div>
        <div class="cover-date">Event Report 2025</div>
        <div class="cover-desc">A Comprehensive Report on Environmental Stewardship and Community Engagement</div>
    </div>

    <!-- Page 1: Executive Summary -->
    <div class="page-break">
        <h1>Executive Summary</h1>
        <p>JIT Green Sunday represents a transformative student-led environmental initiative that has successfully bridged the gap between community engagement and environmental responsibility. This comprehensive report documents the program's activities, achievements, and impact throughout 2025, with particular focus on the landmark plantation drive held on September 21, 2025, at Ananthavan, B.P. Wadia Road, Basavanagudi, Bengaluru.</p>
        
        <div class="highlight-box">
            <h3>Key Achievements</h3>
            <p>The program has successfully engaged over 500 participants, planted more than 1,000 native tree species, and established a sustainable framework for long-term environmental stewardship. Through innovative approaches combining traditional knowledge with modern conservation practices, JIT Green Sunday has created a model for student-led environmental action.</p>
        </div>

        <p>This report provides detailed insights into the program's methodology, community partnerships, environmental outcomes, and the personal transformations experienced by participants. It serves as both a documentation of achievements and a blueprint for future environmental initiatives.</p>

        <p>The success of JIT Green Sunday demonstrates the power of student-led initiatives in creating meaningful environmental change. By combining hands-on action with education and community engagement, the program has not only contributed to environmental conservation but has also fostered social connections and personal growth among all participants.</p>
    </div>

    <!-- Page 2: Program Overview -->
    <div class="page-break">
        <h1>Program Overview</h1>
        <h2>Mission and Vision</h2>
        <p>JIT Green Sunday was established with a clear mission: to create lasting environmental impact through community-driven tree adoption and plantation activities while fostering social connections and personal responsibility towards nature. The program operates on three core principles:</p>
        
        <ul>
            <li><strong>Environmental Stewardship:</strong> Active participation in conservation efforts through tree planting and maintenance. This principle emphasizes hands-on involvement in environmental protection and restoration activities.</li>
            <li><strong>Social Connection:</strong> Building strong community bonds through collaborative environmental action. The program recognizes that environmental work is most effective when it brings people together.</li>
            <li><strong>Personal Responsibility:</strong> Empowering individuals to take ownership of their environmental impact. Each participant is encouraged to see themselves as an active agent of positive change.</li>
        </ul>

        <h2>Program Structure</h2>
        <p>The program is organized into several key components, each designed to maximize impact and engagement:</p>
        
        <h3>Tree Adoption Program</h3>
        <p>Students and community members are encouraged to adopt trees, taking personal responsibility for their care and growth. Each adoption includes comprehensive care instructions, regular monitoring, and community support networks. This program creates lasting connections between individuals and the environment, ensuring long-term commitment to tree care and environmental stewardship.</p>

        <h3>Regular Plantation Drives</h3>
        <p>Monthly plantation drives bring together volunteers from diverse backgrounds to plant native species in designated areas. These events combine hands-on environmental action with educational workshops and community building activities. Each drive is carefully planned to maximize both environmental impact and participant engagement.</p>

        <h3>Educational Workshops</h3>
        <p>Regular workshops cover topics including tree care, biodiversity conservation, traditional ecological knowledge, and sustainable living practices. These sessions ensure participants have the knowledge and skills needed for effective environmental stewardship. Workshops are designed to be interactive and practical, providing participants with immediately applicable knowledge.</p>

        <h3>Community Engagement</h3>
        <p>The program actively collaborates with local organizations, schools, and community groups to maximize impact and create sustainable networks of environmental action. These partnerships help extend the program's reach and ensure its long-term sustainability.</p>
    </div>

    <!-- Page 3: The Plantation Event -->
    <div class="page-break">
        <h1>The Plantation Event: September 21, 2025</h1>
        <h2>Event Details</h2>
        <p><strong>Date:</strong> September 21, 2025</p>
        <p><strong>Location:</strong> Ananthavan, B.P. Wadia Road, Basavanagudi, Bengaluru</p>
        <p><strong>Participants:</strong> 150+ students, community members, and environmental enthusiasts</p>
        <p><strong>Trees Planted:</strong> 200+ native saplings</p>

        <h2>Event Activities</h2>
        <p>The plantation drive was structured as a comprehensive environmental action day, beginning with an orientation session that emphasized the importance of native species and proper planting techniques. Participants were divided into teams, each responsible for planting and initial care of a designated area. The event included hands-on planting, educational sessions, and community building activities.</p>

        <h2>Species Planted</h2>
        <p>The event focused on planting native species adapted to the local ecosystem, including:</p>
        <ul>
            <li>Neem (Azadirachta indica) - Known for its air-purifying properties and medicinal value</li>
            <li>Peepal (Ficus religiosa) - Sacred tree with significant ecological value and cultural importance</li>
            <li>Banyan (Ficus benghalensis) - Provides extensive shade and habitat for wildlife</li>
            <li>Jamun (Syzygium cumini) - Fruit-bearing tree supporting local wildlife and providing food</li>
            <li>Gulmohar (Delonix regia) - Ornamental tree enhancing urban aesthetics</li>
            <li>And 10 additional native species selected for biodiversity and ecosystem health</li>
        </ul>

        <h2>Tree Care Workshop</h2>
        <p>Following the plantation, a comprehensive workshop was conducted covering essential tree care practices. Topics included proper watering techniques, soil management, pest identification and control, pruning methods, and long-term maintenance strategies. Participants received detailed care guides and were connected with experienced mentors for ongoing support.</p>

        <div class="quote">
            "The hands-on experience of planting trees and learning about their care has transformed my understanding of environmental responsibility. I now see myself as a steward of nature, not just a participant in an event." - Event Participant
        </div>
    </div>

    <!-- Page 4: Case Study -->
    <div class="page-break">
        <h1>Case Study: Adamya Chetana</h1>
        <h2>508th Green Sunday — 10th Anniversary Celebration</h2>
        <p>Adamya Chetana's 508th Green Sunday event marked a historic milestone—a full decade of continuous, weekly environmental action. This remarkable achievement demonstrates the power of sustained commitment and community engagement in environmental conservation.</p>

        <h2>Historical Context</h2>
        <p>Since its inception, Adamya Chetana's Green Sunday initiative has maintained an unbroken record of weekly plantation and environmental activities. Over ten years, the program has evolved from a small community initiative to a city-wide movement, inspiring similar programs across Bengaluru and beyond. The consistency and dedication demonstrated by this program serves as an inspiration for environmental initiatives worldwide.</p>

        <h2>Key Achievements</h2>
        <p><strong>Total Trees Planted:</strong> Over 10,000 trees across multiple locations</p>
        <p><strong>Volunteer Participation:</strong> Thousands of active volunteers over 10 years</p>
        <p><strong>Green Spaces Created:</strong> Multiple urban green spaces established</p>
        <p><strong>Educational Programs:</strong> Hundreds of students reached through workshops</p>
        <p><strong>Maintenance Systems:</strong> Long-term monitoring and care networks established</p>

        <h2>Lessons Learned</h2>
        <p>The success of Adamya Chetana's Green Sunday program offers valuable insights for environmental initiatives:</p>
        <ul>
            <li><strong>Consistency is Key:</strong> Regular, scheduled activities create momentum and build community. The weekly commitment has been fundamental to the program's success.</li>
            <li><strong>Community Ownership:</strong> Programs that empower local communities see greater long-term success. When people feel ownership, they invest more deeply.</li>
            <li><strong>Holistic Approach:</strong> Combining plantation with education and maintenance ensures sustainability. Trees need ongoing care, not just initial planting.</li>
            <li><strong>Partnership Building:</strong> Collaborations with schools, organizations, and government enhance impact and provide resources.</li>
            <li><strong>Adaptation and Growth:</strong> Successful programs evolve based on experience and community needs. Flexibility is essential for long-term success.</li>
        </ul>

        <h2>Impact on JIT Green Sunday</h2>
        <p>The Adamya Chetana model has directly influenced the structure and approach of JIT Green Sunday. Key adaptations include the emphasis on regular plantation drives, comprehensive educational components, and the establishment of long-term care networks. The partnership between these programs demonstrates the power of collaborative environmental action and knowledge sharing.</p>
    </div>

    <!-- Page 5: Folklore -->
    <div class="page-break">
        <h1>Folklore, Traditional Knowledge & Usage</h1>
        <p>JIT Green Sunday recognizes the importance of integrating traditional ecological knowledge with modern conservation practices. This section explores the cultural, medicinal, and practical significance of plants featured in our program, demonstrating how cultural heritage and environmental conservation can work together.</p>

        <h2>Okra (Bhindi) - Abelmoschus esculentus</h2>
        <h3>Culinary Significance</h3>
        <p>Okra holds a prominent place in Indian cuisine, valued for its versatility and nutritional content. It's commonly prepared as a curry, fried, or added to soups and stews. The mucilaginous texture makes it ideal for thickening dishes, while its mild flavor complements a wide variety of spices and ingredients. This vegetable is a staple in many households and represents an important part of culinary heritage.</p>

        <h3>Ayurvedic Properties</h3>
        <p>In Ayurveda, okra is classified as cooling and is used to balance Pitta dosha. It's believed to support digestive health, help manage blood sugar levels, and provide essential vitamins and minerals including Vitamin C, Vitamin K, and folate. The high fiber content supports healthy digestion, while the antioxidants contribute to overall wellness. These traditional uses align with modern nutritional science.</p>

        <h3>Cultural Folklore</h3>
        <p>In many cultures, okra is associated with prosperity and abundance. Some traditions hold that planting okra near the home brings good fortune. The plant's ability to produce continuously throughout the growing season symbolizes persistence and resilience—qualities that align with environmental stewardship values. This cultural significance helps connect environmental work with community values.</p>

        <h2>Chilli (Mirchi) - Capsicum annuum</h2>
        <h3>Culinary Importance</h3>
        <p>Chilli peppers are essential in many cuisines, adding heat and flavor to dishes. They can be used fresh, dried, or powdered, and are integral to spice blends and condiments. The variety of chilli species allows for nuanced flavor profiles, from mild and sweet to intensely hot. This diversity reflects the rich culinary traditions of the region.</p>

        <h3>Ayurvedic Applications</h3>
        <p>Chilli is considered heating in Ayurveda and is used to balance Kapha dosha. It's believed to stimulate digestion, improve circulation, and boost metabolism. The capsaicin content provides various health benefits, including pain relief and cardiovascular support. However, moderation is key, as excessive consumption can aggravate Pitta dosha. This traditional knowledge demonstrates sophisticated understanding of plant properties.</p>

        <h3>Protective Folklore</h3>
        <p>Chilli peppers have been used in various cultures for protection and purification. In some traditions, they are believed to ward off negative energy. The vibrant red color is often associated with vitality and passion. In agricultural folklore, chillies are sometimes planted as companion plants to protect other crops from pests, demonstrating traditional understanding of ecological relationships.</p>

        <h2>Integration with Modern Conservation</h2>
        <p>By incorporating traditional knowledge into our program, JIT Green Sunday creates a bridge between cultural heritage and environmental conservation. This approach not only preserves valuable ecological knowledge but also engages communities through familiar cultural contexts, enhancing participation and long-term commitment to environmental stewardship. The integration of traditional and modern knowledge creates a more holistic and culturally relevant approach to conservation.</p>
    </div>

    <!-- Page 6: Outcomes & Impact -->
    <div class="page-break">
        <h1>Outcomes & Impact</h1>
        <h2>Environmental Impact</h2>
        <p>The program has achieved significant measurable environmental outcomes that contribute to local and global environmental health:</p>
        <ul>
            <li><strong>Increased Green Cover:</strong> Over 1,000 trees planted across multiple locations, contributing to urban reforestation and creating new green spaces in urban areas.</li>
            <li><strong>Enhanced Biodiversity:</strong> Focus on native species has supported local wildlife and ecosystem health, creating habitats for birds, insects, and other animals.</li>
            <li><strong>Improved Air Quality:</strong> Trees act as natural air filters, removing pollutants and producing oxygen, contributing to healthier urban environments.</li>
            <li><strong>Carbon Sequestration:</strong> Growing trees absorb carbon dioxide, contributing to climate change mitigation and helping to offset carbon emissions.</li>
            <li><strong>Soil Conservation:</strong> Tree roots prevent erosion and improve soil structure and water retention, protecting against soil degradation.</li>
            <li><strong>Habitat Creation:</strong> Trees provide shelter and food for birds, insects, and other wildlife, supporting local ecosystems.</li>
            <li><strong>Microclimate Regulation:</strong> Trees help moderate local temperatures and reduce urban heat island effects, making cities more livable.</li>
        </ul>

        <h2>Social Impact</h2>
        <p>The program has fostered significant social connections and community development, creating lasting positive change:</p>
        <ul>
            <li><strong>Community Bonds:</strong> Regular events have created strong networks of environmental stewards who support each other and work together.</li>
            <li><strong>Environmental Awareness:</strong> Educational components have increased understanding of environmental issues and solutions among participants.</li>
            <li><strong>Intergenerational Learning:</strong> Programs bring together students, adults, and elders, facilitating knowledge exchange across generations.</li>
            <li><strong>Collaborative Networks:</strong> Partnerships with organizations have created sustainable action networks that extend beyond individual events.</li>
            <li><strong>Civic Engagement:</strong> Participants have become more active in community and environmental issues, taking on leadership roles.</li>
            <li><strong>Sustainable Practices:</strong> Community members have adopted more environmentally conscious behaviors in their daily lives.</li>
            <li><strong>Leadership Development:</strong> Students have developed organizational and leadership skills through program participation.</li>
        </ul>

        <h2>Personal Impact</h2>
        <p>Participants report transformative personal experiences that extend beyond environmental action:</p>
        <ul>
            <li><strong>Environmental Responsibility:</strong> Increased sense of personal accountability for environmental health and sustainability.</li>
            <li><strong>Nature Connection:</strong> Deeper appreciation and connection with the natural world, leading to greater environmental consciousness.</li>
            <li><strong>Skill Development:</strong> Practical skills in tree care, conservation, and community organizing that are applicable in many contexts.</li>
            <li><strong>Knowledge Acquisition:</strong> Understanding of ecology, biodiversity, and environmental science that informs daily decisions.</li>
            <li><strong>Personal Fulfillment:</strong> Sense of purpose and contribution to positive change, enhancing personal well-being.</li>
            <li><strong>Long-term Commitment:</strong> Ongoing engagement with environmental stewardship, extending beyond program participation.</li>
            <li><strong>Wellness Benefits:</strong> Improved mental health through connection with nature and community, reducing stress and increasing happiness.</li>
        </ul>
    </div>

    <!-- Page 7: Future Directions & Conclusion -->
    <div class="page-break">
        <h1>Future Directions & Conclusion</h1>
        <h2>Strategic Goals for 2026</h2>
        <p>Building on the success of 2025, JIT Green Sunday has established ambitious goals for the coming year that will expand impact and reach:</p>
        <ul>
            <li><strong>Expansion:</strong> Extend program activities to additional locations across Bengaluru, reaching new communities and neighborhoods.</li>
            <li><strong>Scale:</strong> Increase tree planting targets to 2,000+ trees annually, doubling our environmental impact.</li>
            <li><strong>Partnerships:</strong> Develop new collaborations with schools, colleges, and community organizations to expand our network.</li>
            <li><strong>Technology Integration:</strong> Implement digital tools for tree tracking and care monitoring, enhancing program management and participant engagement.</li>
            <li><strong>Research:</strong> Conduct longitudinal studies on program impact and tree survival rates, contributing to environmental knowledge.</li>
            <li><strong>Education:</strong> Expand workshop offerings and develop comprehensive educational materials for wider distribution.</li>
            <li><strong>Advocacy:</strong> Engage in policy discussions and advocate for urban greening initiatives at local and regional levels.</li>
        </ul>

        <h2>Sustainability Framework</h2>
        <p>To ensure long-term success, the program has developed a comprehensive sustainability framework that addresses multiple aspects of program continuity:</p>
        <ul>
            <li><strong>Maintenance Networks:</strong> Established ongoing care systems for planted trees, ensuring their survival and growth.</li>
            <li><strong>Community Ownership:</strong> Empowered local communities to take responsibility for green spaces, creating lasting commitment.</li>
            <li><strong>Financial Sustainability:</strong> Diversified funding sources and developed cost-effective models for program operations.</li>
            <li><strong>Knowledge Transfer:</strong> Created systems for passing knowledge to new participants, ensuring program continuity.</li>
            <li><strong>Monitoring and Evaluation:</strong> Regular assessment of program outcomes and impact, enabling continuous improvement.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>JIT Green Sunday has successfully demonstrated that student-led environmental initiatives can create meaningful, lasting impact. Through a combination of hands-on action, education, and community engagement, the program has not only contributed to environmental conservation but has also fostered social connections and personal growth among participants.</p>

        <div class="quote">
            "The true measure of our success is not just in the trees we plant, but in the environmental stewards we create and the communities we strengthen. JIT Green Sunday is more than a program—it's a movement towards a more sustainable and connected future."
        </div>

        <p>The program's integration of traditional knowledge with modern conservation practices, its emphasis on community ownership, and its commitment to long-term sustainability provide a model for environmental action that can be replicated and adapted in diverse contexts. As we continue to grow and evolve, we remain committed to our core mission of creating positive environmental and social change.</p>

        <p>As we look to the future, JIT Green Sunday remains committed to its core mission: growing together for a greener tomorrow. Through continued dedication, innovation, and community partnership, we will continue to make a positive impact on our environment and our communities, inspiring others to take action and creating a legacy of environmental stewardship.</p>

        <h2>Acknowledgments</h2>
        <p>This report would not be possible without the dedication of all participants, volunteers, community partners, and supporters who have contributed to the success of JIT Green Sunday. Special recognition goes to Adamya Chetana for their inspirational model of sustained environmental action, and to all the students and community members who have made this program a reality. Your commitment and passion are the foundation of our success.</p>

        <div class="footer">
            <p><strong>JIT Green Sunday</strong></p>
            <p>Social Connect & Responsibility | Environmental Stewardship Program</p>
            <p>Bengaluru, Karnataka, India</p>
            <p style="margin-top: 1rem;">Report Generated: January 2025</p>
            <p>&copy; 2025 JIT Green Sunday. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

        // Create blob and download
        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'JIT_Green_Sunday_Report_2025.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Reset button state
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
        downloadBtn.blur();
        
    } catch (error) {
        console.error('Error creating document:', error);
        alert('Error creating report: ' + error.message);
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
    }
}

// Event listener for download report button
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadReport');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadReport();
        });
    }
});

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

