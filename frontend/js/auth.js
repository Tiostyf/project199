// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    
    // Verify token is still valid
    return fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
            'x-auth-token': token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.valid) {
            return true;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return false;
        }
    })
    .catch(error => {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return false;
    });
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/home';
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = data.message || 'Login failed. Please try again.';
                        errorMessage.style.display = 'block';
                    } else {
                        alert(data.message || 'Login failed. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'Login failed. Please try again.';
                    errorMessage.style.display = 'block';
                } else {
                    alert('Login failed. Please try again.');
                }
            }
        });
    }
    
    // Registration form handling
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            // Reset messages
            if (errorMessage) errorMessage.style.display = 'none';
            if (successMessage) successMessage.style.display = 'none';
            
            // Validate passwords match
            if (password !== confirmPassword) {
                if (errorMessage) {
                    errorMessage.textContent = 'Passwords do not match';
                    errorMessage.style.display = 'block';
                }
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                if (errorMessage) {
                    errorMessage.textContent = 'Password must be at least 6 characters long';
                    errorMessage.style.display = 'block';
                }
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    if (successMessage) {
                        successMessage.textContent = 'Registration successful! Redirecting to login...';
                        successMessage.style.display = 'block';
                    }
                    
                    // Redirect to login after successful registration
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = data.message || 'Registration failed. Please try again.';
                        errorMessage.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'Registration failed. Please try again.';
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        });
    }
    
    // Check authentication on protected pages
    const protectedPages = ['/home', '/service', '/review'];
    if (protectedPages.includes(window.location.pathname)) {
        checkAuth().then(isAuthenticated => {
            if (isAuthenticated) {
                // Update UI with user info if needed
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const welcomeElement = document.getElementById('welcomeMessage');
                if (welcomeElement && user.name) {
                    welcomeElement.textContent = `Hello ${user.name}, access world-class healthcare services, book appointments, and manage your health records all in one place.`;
                }
            }
        });
    }
});