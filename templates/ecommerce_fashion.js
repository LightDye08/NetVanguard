// Shopping cart functionality
let cartCount = 0;
const cartCountElement = document.querySelector('.cart .count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Animation effect
        button.textContent = 'Added!';
        button.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.style.backgroundColor = '';
        }, 1500);
    });
});

// Cart click event
document.querySelector('.cart').addEventListener('click', () => {
    alert(`You have ${cartCount} items in your cart`);
});
