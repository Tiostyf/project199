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

document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadPosts();
  setupForm();
});

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  try {
    await safeFetch('/api/auth/verify', {
      headers: {
        'x-auth-token': token
      }
    });
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

function setupForm() {
  document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const image = document.getElementById('image').value;
    const description = document.getElementById('description').value;
    const review = document.getElementById('review').value;
    
    // Basic validation
    if (!image || !description || !review) {
      showMessage('Please fill in all fields', 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await safeFetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ image, description, review })
      });
      
      document.getElementById('reviewForm').reset();
      showMessage('Review submitted successfully!', 'success');
      loadPosts();
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
  });
}

async function loadPosts() {
  try {
    const token = localStorage.getItem('token');
    
    const posts = await safeFetch('/api/posts', {
      headers: {
        'x-auth-token': token
      }
    });
    
    displayPosts(posts);
  } catch (error) {
    console.error('Error loading posts:', error);
    showMessage('Error loading posts: ' + error.message, 'error');
  }
}

function displayPosts(posts) {
  const postsContainer = document.getElementById('postsContainer');
  postsContainer.innerHTML = '';
  
  if (posts.length === 0) {
    postsContainer.innerHTML = '<p class="no-posts">No posts yet. Be the first to share your experience!</p>';
    return;
  }
  
  posts.forEach(post => {
    const postDate = new Date(post.date).toLocaleDateString();
    const initial = post.userId && post.userId.name ? post.userId.name.charAt(0).toUpperCase() : 'U';
    
    const postElement = `
      <div class="post">
        <div class="post-header">
          <div class="post-avatar">${initial}</div>
          <div class="post-author">${post.userId && post.userId.name ? post.userId.name : 'Unknown User'}</div>
          <div class="post-date">${postDate}</div>
        </div>
        <img src="${post.image}" alt="Post image" class="post-image">
        <div class="post-content">
          <p><strong>Description:</strong> ${post.description}</p>
          <p><strong>Review:</strong> ${post.review}</p>
        </div>
      </div>
    `;
    
    postsContainer.innerHTML += postElement;
  });
}

function showMessage(message, type) {
  // Create message element if it doesn't exist
  let messageDiv = document.getElementById('message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'message';
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.zIndex = '1000';
    document.body.appendChild(messageDiv);
  }
  
  messageDiv.textContent = message;
  messageDiv.style.backgroundColor = type === 'error' ? '#ffebee' : '#e8f5e9';
  messageDiv.style.color = type === 'error' ? '#c62828' : '#2e7d32';
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}