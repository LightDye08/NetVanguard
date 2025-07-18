// script.js
// Payment Modal Functions
let currentPlan = "";
let currentAmount = 0;

function openPayment(plan, amount) {
    // Verificar si es consulta y usuario no autenticado
    if (plan === 'Consulta' && sessionStorage.getItem('loggedIn') !== 'true') {
        alert('Por favor, inicia sesión para solicitar una consulta.');
        openLogin();
        return;
    }
    
    currentPlan = plan;
    currentAmount = amount;
    
    document.getElementById('selectedPlan').textContent = plan;
    
    if(amount > 0) {
        document.getElementById('paymentAmount').textContent = '$' + amount;
    } else {
        document.getElementById('paymentAmount').textContent = 'Consulta Gratuita';
    }
    
    document.getElementById('paymentModal').style.display = 'flex';
    document.getElementById('paymentForm').style.display = 'block';
    document.getElementById('paymentSuccess').style.display = 'none';
    
    // Reset to credit card form
    switchPaymentMethod('creditCard');
}

// Actualizar botones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
    updatePlanButtons(); // Nueva línea
    
    // Tabs de login
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLoginTab(btn.dataset.tab);
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('loginModal');
        if (event.target === modal) {
            closeLogin();
        }
    });
});

function closePayment() {
    document.getElementById('paymentModal').style.display = 'none';
    // Reset form
    document.getElementById('creditCardForm').reset();
    document.getElementById('paypalForm').reset();
    document.getElementById('mercadopagoForm').reset();
}

function switchPaymentMethod(method) {
    // Remove active class from all methods
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    
    // Add active class to selected method
    document.querySelector(`.payment-method[data-method="${method}"]`).classList.add('active');
    
    // Hide all forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected form
    document.getElementById(`${method}Form`).classList.add('active');
}

// Obtener planes de un usuario específico
function getPlansForUser(userEmail) {
    const userPlans = JSON.parse(localStorage.getItem('userPlans')) || {};
    return userPlans[userEmail] || [];
}

// Almacenar planes por usuario
function storePlanForUser(planName, userEmail) {
    let userPlans = JSON.parse(localStorage.getItem('userPlans')) || {};
    if (!userPlans[userEmail]) {
        userPlans[userEmail] = [];
    }
    
    if (!userPlans[userEmail].includes(planName)) {
        userPlans[userEmail].push(planName);
        localStorage.setItem('userPlans', JSON.stringify(userPlans));
    }
}

// Obtener precio del plan por su nombre
function getPlanPrice(planName) {
    const cards = document.querySelectorAll('.pricing-card');
    for (const card of cards) {
        if (card.querySelector('h3').textContent === planName) {
            const priceText = card.querySelector('.price').textContent;
            return parseFloat(priceText.replace('$', '').split(' ')[0]);
        }
    }
    return 0;
}

// Actualizar botones de planes según usuario
function updatePlanButtons() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    pricingCards.forEach(card => {
        const planName = card.querySelector('h3').textContent;
        const button = card.querySelector('button');
        
        if (currentUser) {
            const userPlans = getPlansForUser(currentUser.email);
            
            if (userPlans.includes(planName)) {
                button.textContent = 'Usar';
                button.onclick = function() {
                    window.location.href = 'index.html';
                };
            } else {
                button.textContent = 'Contratar';
                button.onclick = function() {
                    openPayment(planName, getPlanPrice(planName));
                };
            }
        } else {
            button.textContent = 'Contratar';
            button.onclick = function() {
                openPayment(planName, getPlanPrice(planName));
            };
        }
    });
}

function processPayment(method) {
    // Get form values
    let name, email;
    
    if (method === 'creditCard') {
        name = document.getElementById('name').value;
        email = document.getElementById('email').value;
        const cardNumber = document.getElementById('cardNumber').value;
        
        // Simple validation
        if(!name || !email || !cardNumber) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }
        
        if(cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Por favor, ingrese un número de tarjeta válido de 16 dígitos.');
            return;
        }
    } else if (method === 'paypal') {
        email = document.getElementById('paypalEmail').value;
        if (!email) {
            alert('Por favor, ingrese su correo de PayPal.');
            return;
        }
        name = "Cliente PayPal";
    } else if (method === 'mercadopago') {
        email = document.getElementById('mercadopagoEmail').value;
        if (!email) {
            alert('Por favor, ingrese su correo de MercadoPago.');
            return;
        }
        name = "Cliente MercadoPago";
    }
    
    // Get redirect URL
    const redirectUrl = document.getElementById('redirectUrl').value;
    
    // Generate random transaction ID
    const transactionId = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('transactionId').textContent = transactionId;
    
    // Show success message
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('paymentSuccess').style.display = 'block';
    
    // Registrar plan para el usuario si está autenticado
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && currentPlan !== 'Consulta') {
        storePlanForUser(currentPlan, currentUser.email);
        updatePlanButtons();
    }
    
    // Simulate redirection after 3 seconds
    setTimeout(() => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }, 3000);
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePayment();
    }
}

// Smooth scrolling for anchor links - CORREGIDO
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignorar enlaces vacíos (#)
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Payment method switching
document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function() {
        const methodType = this.getAttribute('data-method');
        switchPaymentMethod(methodType);
    });
});

// Abrir modal (mostrar login por defecto)
function openLogin() {
    document.getElementById('loginModal').style.display = 'flex';
    showLoginView(); // Mostrar vista de login por defecto
}

// Cerrar modal
function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}


function switchLoginTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Tab`).classList.add('active');
}


// Almacenar planes contratados en localStorage
function markPlanAsUsed(planName) {
    let usedPlans = JSON.parse(localStorage.getItem('usedPlans')) || [];
    if (!usedPlans.includes(planName)) {
        usedPlans.push(planName);
        localStorage.setItem('usedPlans', JSON.stringify(usedPlans));
    }
}

// Registro de usuario
function registerUser() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    if (password !== confirm) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(user => user.email === email)) {
        alert('Este correo ya está registrado');
        return;
    }
    
    users.push({
        name,
        email,
        password
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    alert('¡Registro exitoso! Ahora puedes iniciar sesión');
    showLoginView(); // Cambiar a vista de login después de registro
}

// Inicio de sesión
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        alert(`¡Bienvenido ${user.name}!`);
        closeLogin();
        updateUserUI();
    } else {
        alert('Credenciales incorrectas');
    }
}

// Mostrar vista de login
function showLoginView() {
    document.getElementById('loginView').classList.add('active');
    document.getElementById('registerView').classList.remove('active');
}

// Mostrar vista de registro
function showRegisterView() {
    document.getElementById('registerView').classList.add('active');
    document.getElementById('loginView').classList.remove('active');
}

// Cerrar sesión
function logoutUser() {
    event.preventDefault();
    
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('currentUser');
    alert('Sesión cerrada correctamente');
    updateUserUI();

    window.location.href = 'landpage.html';
}

// Actualizar UI según estado de sesión
function updateUserUI() {
    const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    const user = isLoggedIn ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) {
        loginBtn.textContent = isLoggedIn ? user.name : 'Iniciar Sesión';
        loginBtn.onclick = isLoggedIn ? null : openLogin;
        
        // Eliminar el href si está logueado para evitar redirección
        if (isLoggedIn) {
            loginBtn.removeAttribute('href');
            loginBtn.style.cursor = 'default';
        } else {
            loginBtn.href = '#';
        }
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    }

    // Actualizar botones de planes
    updatePlanButtons();
}

// En el evento DOMContentLoaded:
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
    
    // Tabs de login
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLoginTab(btn.dataset.tab);
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('loginModal');
        if (event.target === modal) {
            closeLogin();
        }
    });
    
    // Inicializar botones de planes
    updatePlanButtons();
});
