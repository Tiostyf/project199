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
  loadHospitals();
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

async function loadHospitals() {
  try {
    // Sample hospital data (in a real app, this would come from an API)
    const hospitals = [
      {
        id: 1,
        name: "AIIMS New Delhi",
        image: "https://images.unsplash.com/photo-1587351021759-3e566b3db4f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        description: "Premier medical institution with state-of-the-art facilities and expert medical staff.",
        services: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology"]
      },
      {
        id: 2,
        name: "AIIMS Jodhpur",
        image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        description: "Advanced healthcare services with focus on research and patient care.",
        services: ["Cardiac Surgery", "Nephrology", "Endocrinology", "Gastroenterology"]
      },
      {
        id: 3,
        name: "AIIMS Bhubaneswar",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
        description: "Modern healthcare facility providing comprehensive medical services.",
        services: ["Neurosurgery", "Urology", "Dermatology", "Psychiatry"]
      }
    ];

    const hospitalsGrid = document.getElementById('hospitalsGrid');
    hospitalsGrid.innerHTML = '';

    hospitals.forEach(hospital => {
      const servicesList = hospital.services.map(service => `<li>${service}</li>`).join('');
      
      const hospitalCard = `
        <div class="card">
          <img src="${hospital.image}" alt="${hospital.name}" class="card-img">
          <div class="card-content">
            <h3 class="card-title">${hospital.name}</h3>
            <p class="card-text">${hospital.description}</p>
            <p class="card-text"><strong>Services:</strong></p>
            <ul>${servicesList}</ul>
          </div>
        </div>
      `;
      hospitalsGrid.innerHTML += hospitalCard;
    });
  } catch (error) {
    console.error('Error loading hospitals:', error);
    showMessage('Error loading hospitals: ' + error.message, 'error');
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