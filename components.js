/**
 * Components.js - Shared components for the Steeply tea steeping guide website
 * 
 * This file contains the common header and footer HTML that will be inserted into each page,
 * along with the logic to handle the active navigation state and mobile menu functionality.
 */

// Function to insert the header and footer into each page
document.addEventListener('DOMContentLoaded', function() {
    insertHeader();
    insertFooter();
    setupMobileMenu();
    handleActiveNavLinks();
});

/**
 * Insert the navigation header into the page
 */
function insertHeader() {
    // Find the navbar element where the header will be inserted
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) return;
    
    // Create the header HTML
    const headerHTML = `
        <div class="navbar-container">
            <a href="index.html" class="logo">
                <img src="img/logo_steeply.png" alt="Steeply Logo" id="upper_logo">
                <h1>Steeply</h1>
            </a>
            
            <button class="menu-toggle" id="menu-toggle">
                <i class="fas fa-bars"></i>
            </button>
            
            <ul class="nav-menu" id="nav-menu">
                <li class="nav-item">
                    <a href="index.html" class="nav-link">Tea Search</a>
                </li>
                <li class="nav-item">
                    <a href="brewing-guide.html" class="nav-link">Brewing Guide</a>
                </li>
                <li class="nav-item">
                    <a href="contact.html" class="nav-link">Contact</a>
                </li>
                <li class=="nav-item" id="kofi-button">
                </li>
            </ul>
        </div>
    `;
    
    // Insert the header HTML
    navbar.innerHTML = headerHTML;
}

/**
 * Insert the footer into the page
 */
function insertFooter() {
    // Find the footer element where the footer content will be inserted
    const footer = document.querySelector('footer');
    
    if (!footer) return;
    
    // Create the footer HTML
    const footerHTML = `
        <div class="container">
            <p>© ${new Date().getFullYear()} Steeply. All tea descriptions and steeping parameters are provided as general guidelines. Adjust to your personal taste.</p>
        </div>
    `;
    
    // Insert the footer HTML
    footer.innerHTML = footerHTML;
}

/**
 * Set up the mobile menu toggle functionality
 */
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

/**
 * Set the active class on the current page's nav link
 */
function handleActiveNavLinks() {
    // Get the current page from the URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Set active class if this is the current page
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}