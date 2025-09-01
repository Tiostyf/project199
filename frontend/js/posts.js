// Post-related functionality (appointments, reviews)
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page that needs post functionality
    if (window.location.pathname === '/review') {
        initPosts();
    }
});

function initPosts() {
    // Initialize appointment form
    initAppointmentForm();
    
    // Load existing appointments
    loadAppointments();
}

function initAppointmentForm() {
    const appointmentForm = document.getElementById('appointmentForm');
    if (!appointmentForm) return;
    
    // Set minimum date to today
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
    
    appointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        
        const formData = new FormData();
        const imageInput = document.getElementById('image');
        const appointmentType = document.getElementById('appointmentType').value;
        const preferredDate = document.getElementById('preferredDate').value;
        const description = document.getElementById('description').value;
        const review = document.getElementById('review').value;
        
        // Add image file if selected
        if (imageInput && imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }
        
        formData.append('appointmentType', appointmentType);
        formData.append('preferredDate', preferredDate);
        formData.append('description', description);
        formData.append('review', review);
        
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
        
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
                if (successMessage) {
                    successMessage.textContent = 'Appointment request submitted successfully!';
                    successMessage.style.display = 'block';
                }
                
                // Reset form
                appointmentForm.reset();
                
                // Reload appointments
                loadAppointments();
            } else {
                if (errorMessage) {
                    errorMessage.textContent = data.message || 'Failed to submit appointment. Please try again.';
                    errorMessage.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Appointment submission error:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Failed to submit appointment. Please try again.';
                errorMessage.style.display = 'block';
            }
        }
    });
}

async function loadAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    if (!appointmentsList) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
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
                    <p><strong>Description:</strong> ${appt.description}</p>
                    ${appt.review ? `<p><strong>Notes:</strong> ${appt.review}</p>` : ''}
                    ${appt.image ? `<p><strong>Attachment:</strong> <a href="${appt.image}" target="_blank">View</a></p>` : ''}
                    <p><strong>Submitted:</strong> ${new Date(appt.date).toLocaleDateString()}</p>
                </div>
            `).join('');
        } else {
            appointmentsList.innerHTML = '<p>Error loading appointments.</p>';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        appointmentsList.innerHTML = '<p>Error loading appointments.</p>';
    }
}

// Function to delete an appointment
async function deleteAppointment(id) {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const response = await fetch(`/api/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            // Reload appointments after successful deletion
            loadAppointments();
            return true;
        } else {
            console.error('Failed to delete appointment');
            return false;
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return false;
    }
}