document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const user = checkAuth();
  if (!user) return;
  
  // Load departments for dropdown
  loadDepartments();
  
  // Handle form submission
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmit);
  }
});

// Load departments from API or use predefined list
function loadDepartments() {
  const departmentSelect = document.getElementById('department');
  
  if (!departmentSelect) return;
  
  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Oncology',
    'Dermatology',
    'Ophthalmology',
    'Psychiatry',
    'Endocrinology',
    'Nephrology'
  ];
  
  departmentSelect.innerHTML = departments.map(dept => 
    `<option value="${dept}">${dept}</option>`
  ).join('');
}

// Handle review form submission
async function handleReviewSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    description: formData.get('description'),
    review: formData.get('review'),
    appointmentDate: formData.get('appointment-date'),
    department: formData.get('department'),
    doctor: formData.get('doctor')
  };
  
  const token = localStorage.getItem('token');
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');
  
  errorDiv.textContent = '';
  successDiv.textContent = '';
  
  try {
    const response = await safeFetch(`${API_BASE}/auth/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    
    successDiv.textContent = 'Appointment booked successfully!';
    e.target.reset();
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}