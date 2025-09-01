// Handle appointment form submission
document.addEventListener('DOMContentLoaded', function() {
  const appointmentForm = document.getElementById('appointmentForm');
  
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData();
      const imageInput = document.getElementById('image');
      const description = document.getElementById('description').value;
      const review = document.getElementById('review').value;
      const appointmentType = document.getElementById('appointmentType').value;
      const preferredDate = document.getElementById('preferredDate').value;
      
      // Add image file if selected
      if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
      }
      
      formData.append('description', description);
      formData.append('review', review);
      formData.append('appointmentType', appointmentType);
      formData.append('preferredDate', preferredDate);
      
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'x-auth-token': token
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('Appointment request submitted successfully!');
          appointmentForm.reset();
        } else {
          // Handle rate limiting errors
          if (response.status === 429) {
            alert('Too many appointment requests. Please try again later.');
          } else {
            alert(data.error || data.message || 'Submission failed');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Submission failed. Please try again.');
      }
    });
  }
  
  // Load user's previous appointments
  loadUserAppointments();
});

async function loadUserAppointments() {
  const appointmentsList = document.getElementById('appointmentsList');
  
  if (!appointmentsList) return;
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/posts', {
      method: 'GET',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const appointments = await response.json();
      
      if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found.</p>';
        return;
      }
      
      appointmentsList.innerHTML = appointments.map(appt => `
        <div class="appointment-card">
          <h4>${appt.appointmentType} Appointment</h4>
          <p><strong>Preferred Date:</strong> ${new Date(appt.preferredDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status-pending">Pending</span></p>
          <p><strong>Review:</strong> ${appt.review}</p>
        </div>
      `).join('');
    } else {
      appointmentsList.innerHTML = '<p>Error loading appointments.</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    appointmentsList.innerHTML = '<p>Error loading appointments.</p>';
  }
}