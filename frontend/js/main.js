// Sample data for doctors and hospitals (would come from API in real app)
const doctors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    image: "assets/images/placeholder.jpg",
    experience: "15 years",
    education: "MBBS, MD - Medicine, DM - Cardiology"
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    image: "assets/images/placeholder.jpg",
    experience: "12 years",
    education: "MBBS, MD - Medicine, DM - Neurology"
  },
  {
    id: 3,
    name: "Dr. Amit Singh",
    specialty: "Orthopedic Surgeon",
    image: "assets/images/placeholder.jpg",
    experience: "18 years",
    education: "MBBS, MS - Orthopedics"
  },
  {
    id: 4,
    name: "Dr. Sunita Patel",
    specialty: "Pediatrician",
    image: "assets/images/placeholder.jpg",
    experience: "14 years",
    education: "MBBS, MD - Pediatrics"
  }
];

const hospitals = [
  {
    id: 1,
    name: "AIIMS New Delhi",
    services: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics"],
    address: "Ansari Nagar, New Delhi - 110029",
    contact: "+91-11-26588500"
  },
  {
    id: 2,
    name: "AIIMS Jodhpur",
    services: ["Cardiology", "Oncology", "Dermatology", "Ophthalmology"],
    address: "Basni Industrial Area, Jodhpur - 342005",
    contact: "+91-291-2740740"
  },
  {
    id: 3,
    name: "AIIMS Bhubaneswar",
    services: ["Cardiology", "Nephrology", "Psychiatry", "Endocrinology"],
    address: "Sijua, Bhubaneswar - 751019",
    contact: "+91-674-2476000"
  }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const user = checkAuth();
  if (!user) return;
  
  // Load content based on current page
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'home.html') {
    loadDoctors();
  } else if (currentPage === 'service.html') {
    loadHospitals();
  }
});

// Load doctors on home page
function loadDoctors() {
  const doctorsGrid = document.getElementById('doctors-grid');
  
  if (!doctorsGrid) return;
  
  doctorsGrid.innerHTML = doctors.map(doctor => `
    <div class="card">
      <img src="${doctor.image}" alt="${doctor.name}" class="card-img">
      <div class="card-content">
        <h3 class="card-title">${doctor.name}</h3>
        <p class="card-text"><strong>Specialty:</strong> ${doctor.specialty}</p>
        <p class="card-text"><strong>Experience:</strong> ${doctor.experience}</p>
        <p class="card-text"><strong>Education:</strong> ${doctor.education}</p>
        <a href="review.html" class="btn">Book Appointment</a>
      </div>
    </div>
  `).join('');
}

// Load hospitals on service page
function loadHospitals() {
  const hospitalsList = document.getElementById('hospitals-list');
  
  if (!hospitalsList) return;
  
  hospitalsList.innerHTML = hospitals.map(hospital => `
    <div class="hospital-item">
      <h3 class="hospital-name">${hospital.name}</h3>
      <p class="hospital-details"><strong>Services:</strong> ${hospital.services.join(', ')}</p>
      <p class="hospital-details"><strong>Address:</strong> ${hospital.address}</p>
      <p class="hospital-details"><strong>Contact:</strong> ${hospital.contact}</p>
    </div>
  `).join('');
}