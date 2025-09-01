// Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

async function initApp() {
    // Check authentication for protected pages
    if (['/home', '/service', '/review'].includes(window.location.pathname)) {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;
        
        // Load user-specific data
        loadUserData();
    }
    
    // Initialize page-specific functionality
    if (window.location.pathname === '/home') {
        initHomePage();
    } else if (window.location.pathname === '/service') {
        initServicePage();
    } else if (window.location.pathname === '/review') {
        initReviewPage();
    }
}

function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update UI with user information
    const userElements = document.querySelectorAll('[data-user]');
    userElements.forEach(element => {
        const attribute = element.getAttribute('data-user');
        if (user[attribute]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = user[attribute];
            } else {
                element.textContent = user[attribute];
            }
        }
    });
    
    // Update welcome message if exists
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage && user.name) {
        welcomeMessage.textContent = `Hello ${user.name}, welcome to AIIMS Patient Portal`;
    }
}

function initHomePage() {
    // Load featured doctors or other home page data
    loadFeaturedDoctors();
}

function initServicePage() {
    // Load services data
    loadServices();
}

function initReviewPage() {
    // Initialize appointment form
    initAppointmentForm();
    
    // Load existing appointments
    loadAppointments();
}

async function loadFeaturedDoctors() {
    try {
        // This would typically come from your backend API
        const doctors = [
            {
                name: "Dr. Rajesh Sharma",
                specialty: "Cardiologist",
                experience: "15+ years experience",
                description: "MD, DM Cardiology, specializes in interventional cardiology and heart disease prevention."
            },
            {
                name: "Dr. Priya Patel",
                specialty: "Neurologist",
                experience: "12+ years experience",
                description: "DM Neurology, expert in stroke management and neurological disorders."
            },
            {
                name: "Dr. Amit Singh",
                specialty: "Orthopedic Surgeon",
                experience: "18+ years experience",
                description: "MS Orthopedics, specializes in joint replacement and sports medicine."
            }
        ];
        
        // You could render these dynamically if needed
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

async function loadServices() {
    try {
        // This would typically come from your backend API
        const services = [
            {
                name: "Cardiology Department",
                location: "Main Building, Floor 3",
                description: "Comprehensive heart care including angioplasty, bypass surgery, and cardiac rehabilitation.",
                services: [
                    "Electrocardiography (ECG)",
                    "Echocardiography",
                    "Cardiac Catheterization",
                    "24/7 Emergency Cardiac Care"
                ]
            },
            {
                name: "Neurology Department",
                location: "Specialty Wing, Floor 2",
                description: "Advanced treatment for neurological disorders including stroke, epilepsy, and Parkinson's disease.",
                services: [
                    "EEG and EMG Services",
                    "Stroke Unit",
                    "Epilepsy Monitoring",
                    "Neurological Rehabilitation"
                ]
            },
            {
                name: "Orthopedics Department",
                location: "Surgical Building, Floor 1",
                description: "Comprehensive bone and joint care including trauma surgery and joint replacement.",
                services: [
                    "Joint Replacement Surgery",
                    "Arthroscopy",
                    "Spinal Surgery",
                    "Sports Medicine"
                ]
            }
        ];
        
        // You could render these dynamically if needed
    } catch (error) {
        console.error('Error loading services:', error);
    }
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
        
        const appointmentType = document.getElementById('appointmentType').value;
        const preferredDate = document.getElementById('preferredDate').value;
        const description = document.getElementById('description').value;
        const review = document.getElementById('review').value;
        
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
        
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    appointmentType,
                    preferredDate,
                    description,
                    review
                })
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
                'x-auth-token': token
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

// Utility function for making API calls
async function apiCall(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'x-auth-token': token }),
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        
        return {
            success: response.ok,
            data,
            status: response.status
        };
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}