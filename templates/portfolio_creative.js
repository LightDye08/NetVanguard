// Project hover effect
document.querySelectorAll('.project').forEach(project => {
    project.addEventListener('mouseenter', () => {
        project.style.transform = 'translateY(-10px)';
        project.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
    });
    
    project.addEventListener('mouseleave', () => {
        project.style.transform = 'translateY(0)';
        project.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
    });
});

// Contact button animation
document.querySelector('.contact-btn').addEventListener('mouseenter', () => {
    this.style.transform = 'translateY(-3px)';
});

document.querySelector('.contact-btn').addEventListener('mouseleave', () => {
    this.style.transform = 'translateY(0)';
});

// Smooth scrolling for navigation
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetSection = document.querySelector(targetId);
        if(targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
