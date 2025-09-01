// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  checkExistingAuth();
});

async function checkExistingAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const data = await safeFetch('/api/auth/verify', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (data.valid) {
        window.location.href = '/home';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

// Safe fetch function to handle both JSON and text responses
async function safeFetch(url, options = {}) {
  const response = await fetch(url, options);
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(text || 'Server error');
  }
  
  if (!response.ok) {
    throw new Error(data.msg || data.error || `Request failed with status ${response.status}`);
  }
  
  return data;
}

// Handle registration
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Basic validation
  if (!name || !email || !password) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }
  
  try {
    const data = await safeFetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/home';
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Basic validation
  if (!email || !password) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  try {
    const data = await safeFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/home';
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

function showMessage(message, type) {
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach(msg => msg.remove());
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  const form = document.querySelector('.auth-form');
  form.insertBefore(messageDiv, form.firstChild);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}