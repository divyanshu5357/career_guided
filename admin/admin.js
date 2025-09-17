document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
    const loginView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('admin-login-error');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const studentsTableBody = document.querySelector('#students-table tbody');
    const collegesTableBody = document.querySelector('#colleges-table tbody');
    const addCollegeForm = document.getElementById('add-college-form');
    const eventsTableBody = document.querySelector('#events-table tbody');
    const addEventForm = document.getElementById('add-event-form');

    // IMPORTANT: Apne admin ka email yahan set karein
    const ADMIN_EMAIL = "admin@careerconnect.com"; 

    // --- AUTHENTICATION ---
    auth.onAuthStateChanged(user => {
        if (user && user.email === ADMIN_EMAIL) {
            loginView.style.display = 'none';
            dashboardView.style.display = 'block';
            loadStudents();
            loadColleges();
            loadEvents();
        } else {
            loginView.style.display = 'flex';
            dashboardView.style.display = 'none';
            if (user) { auth.signOut(); } // Doosre users ko sign out kar dein
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const email = loginForm['admin-email'].value;
        const password = loginForm['admin-password'].value;
        if (email !== ADMIN_EMAIL) {
            loginError.textContent = "This email is not authorized for admin access.";
            return;
        }
        auth.signInWithEmailAndPassword(email, password)
            .catch(err => loginError.textContent = err.message);
    });

    logoutBtn.addEventListener('click', () => auth.signOut());

    // --- STUDENT LEADS ---
    async function loadStudents() {
        db.collection('users').onSnapshot(async (snapshot) => {
            studentsTableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
            let studentHtml = '';
            for (const doc of snapshot.docs) {
                const user = doc.data();
                if(user.email === ADMIN_EMAIL) continue; // Admin ko student list mein na dikhayein
                
                const quizHistoryRef = db.collection('users').doc(doc.id).collection('quizHistory').orderBy('timestamp', 'desc').limit(1);
                const quizSnapshot = await quizHistoryRef.get();
                const latestResult = quizSnapshot.empty ? 'No Test Taken' : quizSnapshot.docs[0].data().recommendedStream;

                studentHtml += `<tr>
                    <td>${user.name || ''}</td><td>${user.email || ''}</td>
                    <td>${user.phone || ''}</td><td>${user.city || ''}</td>
                    <td><strong>${latestResult}</strong></td></tr>`;
            }
            studentsTableBody.innerHTML = studentHtml || '<tr><td colspan="5">No students found.</td></tr>';
        });
    }

    // --- COLLEGE MANAGEMENT ---
    addCollegeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addCollegeForm);
        const courses = formData.get('courses').split(',').map(item => item.trim());
        const facilities = formData.get('facilities').split(',').map(item => item.trim());

        db.collection('colleges').add({
            name: formData.get('name'),
            city: formData.get('city'),
            image: formData.get('image'),
            lat: parseFloat(formData.get('lat')),
            lon: parseFloat(formData.get('lon')),
            courses: courses,
            facilities: facilities
        });
        addCollegeForm.reset();
    });

    function loadColleges() {
        db.collection('colleges').onSnapshot(snapshot => {
            collegesTableBody.innerHTML = '';
            snapshot.forEach(doc => {
                const college = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `<td>${college.name}</td><td>${college.city}</td><td><button class="delete-btn">Delete</button></td>`;
                row.querySelector('.delete-btn').onclick = () => {
                    if(confirm(`Are you sure you want to delete ${college.name}?`)) {
                        db.collection('colleges').doc(doc.id).delete();
                    }
                };
                collegesTableBody.appendChild(row);
            });
        });
    }

    // --- TIMELINE MANAGEMENT ---
    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addEventForm);
        db.collection('timelineEvents').add({
            title: formData.get('title'),
            description: formData.get('description'),
            type: formData.get('type'),
            deadline: formData.get('deadline'),
        });
        addEventForm.reset();
    });

    function loadEvents() {
        db.collection('timelineEvents').orderBy('deadline').onSnapshot(snapshot => {
            eventsTableBody.innerHTML = '';
            snapshot.forEach(doc => {
                const event = doc.data();
                const row = document.createElement('tr');
                const deadlineDate = new Date(event.deadline + 'T00:00:00');
                const formattedDate = deadlineDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'});
                row.innerHTML = `<td>${event.title}</td><td><span class="tag ${event.type}">${event.type}</span></td><td>${formattedDate}</td><td><button class="delete-btn">Delete</button></td>`;
                row.querySelector('.delete-btn').onclick = () => {
                    if (confirm(`Delete event: ${event.title}?`)) {
                        db.collection('timelineEvents').doc(doc.id).delete();
                    }
                }
                eventsTableBody.appendChild(row);
            });
        });
    }

    // --- DATABASE SEEDERS ---
    // Run these from browser console: seedColleges() or seedTimeline()
    window.seedColleges = function() {
        console.log("Seeding colleges...");
        const colleges = [
            { name: "SCD Government College", city: "Ludhiana", image: "https://images.unsplash.com/photo-1562774053-701939374585", lat: 30.9010, lon: 75.8573, courses: ["B.A.", "B.Sc.", "B.Com."], facilities: ["Hostel", "Library", "Wi-Fi", "Labs"] },
            { name: "Government Mohindra College", city: "Patiala", image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b", lat: 30.3398, lon: 76.3869, courses: ["B.A.", "B.Sc.", "BCA"], facilities: ["Library", "Sports Complex", "Labs"] },
            { name: "Government Bikram College of Commerce", city: "Patiala", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f", lat: 30.3421, lon: 76.3813, courses: ["B.Com.", "M.Com."], facilities: ["Wi-Fi", "Library", "Canteen", "Auditorium"] },
            { name: "NIT Jalandhar", city: "Jalandhar", image: "https://images.unsplash.com/photo-1607237138185-e894ee31b2af", lat: 31.3954, lon: 75.5355, courses: ["B.Tech", "M.Tech", "Ph.D"], facilities: ["Hostel", "Wi-Fi", "Labs", "Gym", "Swimming Pool"] },
            { name: "Shaheed Bhagat Singh State University", city: "Ferozepur", image: "https://images.unsplash.com/photo-1594492424565-44b219bae4a2", lat: 30.9389, lon: 74.9946, courses: ["B.Tech", "B.Sc.", "Diploma"], facilities: ["Hostel", "Library", "Transport"] },
            { name: "Government Barjindra College", city: "Faridkot", image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66", lat: 30.6775, lon: 74.7471, courses: ["B.A.", "B.Sc.", "M.A."], facilities: ["Library", "Labs", "Canteen"] },
            { name: "Government Medical College", city: "Amritsar", image: "https://images.unsplash.com/photo-1584931422245-c3dd3b35065c", lat: 31.6340, lon: 74.8723, courses: ["MBBS", "MD", "MS"], facilities: ["Hostel", "Labs", "Library", "Hospital"] },
            { name: "Beant College of Engineering & Technology", city: "Gurdaspur", image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23", lat: 32.0416, lon: 75.4053, courses: ["B.Tech", "MCA", "M.Tech"], facilities: ["Hostel", "Wi-Fi", "Sports"] },
            { name: "Government College of Education", city: "Chandigarh", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644", lat: 30.7415, lon: 76.7681, courses: ["B.Ed", "M.Ed"], facilities: ["Library", "Labs", "Auditorium"] },
            { name: "Guru Nanak Dev University", city: "Amritsar", image: "https://images.unsplash.com/photo-1532649538693-79046d41e58c", lat: 31.6366, lon: 74.8239, courses: ["B.A.", "B.Sc.", "B.Tech", "LLB"], facilities: ["Hostel", "Library", "Wi-Fi", "Sports Complex"] }
        ];
        const batch = db.batch();
        colleges.forEach(c => batch.set(db.collection("colleges").doc(), c));
        batch.commit().then(() => alert("Successfully added 10 colleges!"));
    }

    window.seedTimeline = function() {
        console.log("Seeding timeline...");
        const events = [
            { title: "Post-Matric Scholarship (Punjab)", type: "scholarship", description: "Apply for scholarships for SC/ST/OBC students.", deadline: "2025-10-25" },
            { title: "JEE Mains 2026 Session 1 Reg.", type: "exam", description: "Registration window for the first session.", deadline: "2025-11-30" },
            { title: "NEET 2026 Registration", type: "exam", description: "National Eligibility cum Entrance Test for medical courses.", deadline: "2026-01-31" },
            { title: "CUET 2026 Application", type: "exam", description: "Common University Entrance Test for UG programs.", deadline: "2026-03-12" },
            { title: "Punjab University Admissions", type: "admission", description: "Admission forms for B.A., B.Sc., B.Com. are available.", deadline: "2026-05-15" },
            { title: "NDA (II) 2026 Application", type: "exam", description: "Application for National Defence Academy.", deadline: "2026-06-04" }
        ];
        const batch = db.batch();
        events.forEach(e => batch.set(db.collection("timelineEvents").doc(), e));
        batch.commit().then(() => alert("Successfully added 6 timeline events!"));
    }
});

