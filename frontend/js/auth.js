const API_BASE = window.location.origin + '/api';

// Utility function for API calls
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Handle user registration
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');
  
  errorDiv.textContent = '';
  successDiv.textContent = '';
  
  try {
    const data = await safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    successDiv.textContent = 'Registration successful! Redirecting to login...';
    
    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to login after short delay
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

// Handle user login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = '';
  
  try {
    const data = await safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to home page
    window.location.href = '/home.html';
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    // Redirect to login if not authenticated
    window.location.href = '/login.html';
    return null;
  }
  
  return JSON.parse(user);
}

// Handle user logout
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// Initialize auth functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Check authentication for protected pages
  const protectedPages = ['home', 'service', 'review'];
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
  
  if (protectedPages.includes(currentPage)) {
    const user = checkAuth();
    if (user) {
      // Display user info if available
      const userInfoElement = document.getElementById('user-info');
      if (userInfoElement) {
        userInfoElement.textContent = `Welcome, ${user.name}`;
      }
    }
  }
});