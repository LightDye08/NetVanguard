// Simple animation for read more links
document.querySelectorAll('.read-more').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateX(5px)';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateX(0)';
    });
});

// Article hover effect
document.querySelectorAll('article').forEach(article => {
    article.addEventListener('mouseenter', () => {
        article.style.transform = 'translateY(-5px)';
        article.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    });
    
    article.addEventListener('mouseleave', () => {
        article.style.transform = 'translateY(0)';
        article.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
    });
});
