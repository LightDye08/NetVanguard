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

function checkUserStatus() {
    fetch('/api/user-status')
    .then(response => response.json())
    .then(data => {
        if (data.logged_in) {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            updateUserUI(data.user);
        }
    });
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
        
        if (currentUser && currentUser.plan === planName) {
            button.textContent = 'Usar';
            button.onclick = function() {
                window.location.href = '/app';
            };
        } else {
            button.textContent = 'Contratar';
            button.onclick = function() {
                openPayment(planName, getPlanPrice(planName));
            };
        }
    });
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
    
    fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            updateUserUI(data.user);
            closeLogin();
            alert('Registro exitoso! Ahora puedes seleccionar un plan.');
        } else {
            alert(data.error || 'Error al registrar');
        }
    });
}

// Función para desplazarse a la sección de precios - (Bajo Revision)
function scrollToPricing() {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Al cargar la página, verificar si debemos mostrar precios
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si venimos de registro
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('show') === 'pricing') {
        setTimeout(scrollToPricing, 500);
    }

});

// Inicio de sesión
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            updateUserUI(data.user);
            closeLogin();
            
            if (data.user.plan) {
                alert('Sesión iniciada. Ya tienes un plan activo.');
            } else {
                alert('Sesión iniciada. Ahora puedes seleccionar un plan.');
            }
        } else {
            alert(data.error || 'Credenciales incorrectas');
        }
    });
}

// Función optimizada para verificar estado de usuario
function checkUserStatus() {
    // Verificar si ya tenemos el estado en caché
    const cachedStatus = sessionStorage.getItem('userStatus');
    if (cachedStatus) {
        const data = JSON.parse(cachedStatus);
        updateUIAndRedirect(data);
        return;
    }

    fetch('/api/user-status')
    .then(response => {
        if (!response.ok) throw new Error('Error en estado de usuario');
        return response.json();
    })
    .then(data => {
        // Almacenar en caché por 5 segundos
        sessionStorage.setItem('userStatus', JSON.stringify(data));
        setTimeout(() => {
            sessionStorage.removeItem('userStatus');
        }, 5000);
        
        updateUIAndRedirect(data);
    })
    .catch(error => {
        console.error('Error:', error);
        updateUserUI(null);
    });
}

// Función para actualizar UI y manejar redirecciones
function updateUIAndRedirect(data) {
    if (data.logged_in) {
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        updateUserUI(data.user);
        updatePlanButtons();
        
        // Redirigir solo si es necesario
        const currentPath = window.location.pathname;
        if (data.user.plan && currentPath !== '/app') {
            window.location.href = '/app';
        } else if (!data.user.plan && currentPath !== '/pricing') {
            window.location.href = '/pricing';
        }
    } else {
        updateUserUI(null);
        // Solo redirigir desde rutas protegidas
        const currentPath = window.location.pathname;
        if (currentPath === '/app' || currentPath === '/pricing') {
            window.location.href = '/';
        }
    }
}

// Función para procesar pagos
function processPayment(method) {
    const plan = document.getElementById('selectedPlan').textContent;

    fetch('/api/process-payment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ plan })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Actualizar UI con nuevo plan
            const user = JSON.parse(sessionStorage.getItem('currentUser'));
            if (user) {
                user.plan = plan;
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                updateUserUI(user);
                updatePlanButtons();
            }
            
            // Mostrar éxito
            document.getElementById('paymentForm').style.display = 'none';
            document.getElementById('paymentSuccess').style.display = 'block';
            
            // Generar ID de transacción ficticio
            const transactionId = 'WEB-' + Math.floor(1000 + Math.random() * 9000);
            document.getElementById('transactionId').textContent = transactionId;
        }
    });
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

    sessionStorage.removeItem('statusChecked');
    
    if (password !== confirm) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Guardar usuario en sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            updateUserUI(data.user);
            // Redirigir a la aplicación principal
            window.location.href = '/app';
        } else {
            alert(data.error || 'Error al registrar');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al registrar');
    });
}

// Inicio de sesión
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Guardar usuario en sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            updateUserUI(data.user);
            
            // Redirigir según si tiene plan o no
            if (data.user.plan) {
                window.location.href = data.redirect || '/app';
            } else {
                // Mostrar sección de precios
                window.location.href = '/pricing';
                setTimeout(scrollToPricing, 500);
            }
        } else {
            alert(data.error || 'Credenciales incorrectas');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}

// Función para cerrar sesión
function logoutUser() {
    fetch('/api/logout')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.removeItem('currentUser');
            updateUserUI(null);
            alert('Sesión cerrada correctamente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al cerrar sesión');
    });
}

// Al cargar la página, solo actualizar UI
document.addEventListener('DOMContentLoaded', function() {
    // Verificar estado del usuario solo para actualizar UI
    fetch('/api/user-status')
    .then(response => response.json())
    .then(data => {
        if (data.logged_in) {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            updateUserUI(data.user);
        }
    });
    
    // Agregar event listener al botón de login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openLogin();
        });
    }
});

// Función optimizada para verificar estado de usuario
function checkUserStatus() {
    // Verificar si ya tenemos el estado en caché
    const cachedStatus = sessionStorage.getItem('userStatus');
    if (cachedStatus) {
        const data = JSON.parse(cachedStatus);
        updateUIAndRedirect(data);
        return;
    }

    fetch('/api/user-status')
    .then(response => {
        if (!response.ok) throw new Error('Error en estado de usuario');
        return response.json();
    })
    .then(data => {
        // Almacenar en caché por 5 segundos
        sessionStorage.setItem('userStatus', JSON.stringify(data));
        setTimeout(() => {
            sessionStorage.removeItem('userStatus');
        }, 5000);
        
        updateUIAndRedirect(data);
    })
    .catch(error => {
        console.error('Error:', error);
        updateUserUI(null);
    });
}


// Actualizar la función updateUIAndRedirect
function updateUIAndRedirect(data) {
    // Solo procesar si no hemos verificado antes
    if (sessionStorage.getItem('statusChecked') !== 'true') {
        if (data.logged_in) {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            updateUserUI(data.user);
            
            if (data.user.plan && window.location.pathname !== '/app') {
                window.location.href = '/app';
            } else if (!data.user.plan && window.location.pathname !== '/pricing') {
                window.location.href = '/pricing';
            }
        } else {
            updateUserUI(null);
            if (window.location.pathname === '/app' || window.location.pathname === '/pricing') {
                window.location.href = '/';
            }
        }
        sessionStorage.setItem('statusChecked', 'true');
    }
}

// Actualizar UI con datos de usuario
// Función para actualizar UI con datos de usuario
function updateUserUI(user) {
    const loginBtnItem = document.getElementById('loginBtnItem');
    const userNameItem = document.getElementById('userNameItem');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!user) {
        // Si no hay usuario, mostrar botón de login
        if (loginBtnItem) loginBtnItem.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userNameItem) userNameItem.style.display = 'none';
        return;
    }
    
    // Si hay usuario, mostrar información
    if (loginBtnItem) loginBtnItem.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userNameItem && userName) {
        userNameItem.style.display = 'block';
        userName.textContent = user.name;
    }
    
    // Actualizar botones de planes
    updatePlanButtons();
}

// Función para actualizar botones de planes
function updatePlanButtons() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    pricingCards.forEach(card => {
        const planName = card.querySelector('h3').textContent;
        const button = card.querySelector('button');
        
        if (currentUser.plan === planName) {
            button.textContent = 'Usar';
            button.onclick = function() {
                window.location.href = '/app';
            };
        } else {
            button.textContent = 'Contratar';
            button.onclick = function() {
                openPayment(planName, getPlanPrice(planName));
            };
        }
    });
}


// Función para cerrar sesión
function logoutUser() {
    fetch('/api/logout')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Limpiar sessionStorage
            sessionStorage.removeItem('currentUser');
            // Actualizar UI
            updateUserUI(null);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al cerrar sesión');
    });
}

// Agregar estas funciones para mostrar/ocultar vistas de autenticación
function showLoginView() {
    document.getElementById('loginView').classList.add('active');
    document.getElementById('registerView').classList.remove('active');
}

function showRegisterView() {
    document.getElementById('registerView').classList.add('active');
    document.getElementById('loginView').classList.remove('active');
}

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Solo verificar estado del usuario
    // Resetear el flag al cargar la página
    sessionStorage.removeItem('statusChecked');
    
    // Verificar estado del usuario solo una vez
    checkUserStatus();

    // Agregar event listener al botón de login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openLogin();
        });
    }
    
    // Resto del código (sin llamar a updateUserUI ni updatePlanButtons directamente)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLoginTab(btn.dataset.tab);
        });
    });
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('loginModal');
        if (event.target === modal) {
            closeLogin();
        }
    });
    // ...existing code...
});
