// Smooth scrolling for all internal links
document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", e => {
        // Only prevent default if it's an anchor to a section
        if (a.getAttribute("href").startsWith("#")) {
            e.preventDefault();
            const targetSection = document.querySelector(a.getAttribute("href"));
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
            
            // Close the mobile menu after clicking a link
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.getElementById('mobile-menu');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });
});


// Mobile Menu Toggle
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active'); // Optional: for burger-to-X animation
});