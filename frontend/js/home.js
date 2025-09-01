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
  loadDoctors();
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

async function loadDoctors() {
  try {
    // Sample doctor data (in a real app, this would come from an API)
    const doctors = [
      {
        id: 1,
        name: "Dr. Rajesh Kumar",
        specialty: "Cardiologist",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        description: "Senior Cardiologist with 15 years of experience. Specialized in heart surgeries."
      },
      {
        id: 2,
        name: "Dr. Priya Sharma",
        specialty: "Neurologist",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        description: "Expert in neurological disorders with extensive research background."
      },
      {
        id: 3,
        name: "Dr. Amit Singh",
        specialty: "Orthopedic Surgeon",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        description: "Specialized in joint replacement surgeries and sports injuries."
      },
      {
        id: 4,
        name: "Dr. Sunita Patel",
        specialty: "Pediatrician",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        description: "Caring pediatrician with expertise in child healthcare and development."
      }
    ];

    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = '';

    doctors.forEach(doctor => {
      const doctorCard = `
        <div class="card">
          <img src="${doctor.image}" alt="${doctor.name}" class="card-img">
          <div class="card-content">
            <h3 class="card-title">${doctor.name}</h3>
            <p class="card-text"><strong>Specialty:</strong> ${doctor.specialty}</p>
            <p class="card-text">${doctor.description}</p>
          </div>
        </div>
      `;
      doctorsGrid.innerHTML += doctorCard;
    });
  } catch (error) {
    console.error('Error loading doctors:', error);
    showMessage('Error loading doctors: ' + error.message, 'error');
  }
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