document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentUser = null;
    let latestQuizResultForSignup = null;
    let latestQuizScores = null;
    let latestRecommendedStream = null;
    let collegesFromDB = []; // This will hold our colleges from Firestore

    // --- DOM ELEMENT SELECTORS ---
    const userAuthSection = document.getElementById('user-auth-section');
    const mainContent = document.getElementById('main-content');
    const dashboardSection = document.getElementById('dashboard');

    // Modals & Auth
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const showLoginBtn = document.getElementById('show-login-btn');
    const showSignupBtn = document.getElementById('show-signup-btn');
    const closeModalBtns = document.querySelectorAll('.close-btn');
    // Open Auth Modal
    document.getElementById("login-signup-btn").addEventListener("click", () => {
        document.getElementById("auth-container").style.display = "block";
        document.body.classList.add("no-scroll"); // stop background scroll
    });

    // Close buttons for all modals
    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const target = e.currentTarget.getAttribute("data-target");
            document.getElementById(target).style.display = "none";
            document.body.classList.remove("no-scroll"); // restore scroll
        });
    });

    // Quiz Elements
    const startQuizBtnHero = document.getElementById('start-quiz-btn-hero');
    const retakeQuizBtn = document.getElementById('retake-quiz-btn');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionNum = document.getElementById('current-question-num');
    const totalQuestionsNum = document.getElementById('total-questions-num');

    // Dashboard Elements
    const welcomeMessage = document.getElementById('welcome-message');
    const latestResultContent = document.getElementById('latest-result-content');
    const recommendedCollegesContent = document.getElementById('recommended-colleges-content');
    const studyMaterialsContent = document.getElementById('study-materials-content');
    const recommendedCoursesContent = document.getElementById('recommended-courses-content');
    const takeNewTestBtn = document.getElementById('take-new-test-btn');
    const viewAllCollegesLink = document.getElementById('view-all-colleges-link');
    const reportContainer = document.getElementById('report-container');
    const reportTitle = document.getElementById('report-title');
    const reportContent = document.getElementById('report-content');

    // AI Chatbot Elements
    const aiChatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const chatLoading = document.getElementById('chat-loading');
    const aiChatSubmitBtn = document.getElementById('ai-chat-submit');

    // Homepage elements
    const collegeSearchInput = document.getElementById('college-search-bar');
    const collegeListContainer = document.querySelector('.college-list-container');
    const nearbyCollegesBtn = document.getElementById('nearby-colleges-btn');
    const timelineContainer = document.querySelector('.timeline-container');
    const courseCards = document.querySelectorAll('.course-card');
    const careerPathContainer = document.getElementById('career-path-container');

    // --- STATIC DATA (Except Colleges & Timeline) ---
    const studyMaterials = { Science: [{ title: "Physics Wallah JEE", desc: "YouTube channel for engineering entrance.", link: "https://www.youtube.com/@PhysicsWallah" }, { title: "Khan Academy - Biology", desc: "In-depth video lessons for medical prep.", link: "https://www.khanacademy.org/science/biology" }], Arts: [{ title: "StudyIQ IAS", desc: "Comprehensive resource for Civil Services.", link: "https://www.youtube.com/@StudyIQIAS" }], Commerce: [{ title: "CA Wallah by PW", desc: "Dedicated channel for CA aspirants.", link: "https://www.youtube.com/@CAWallahbyPW" }], Vocational: [{ title: "CodeWithHarry", desc: "Hindi tutorials for programming.", link: "https://www.youtube.com/@CodeWithHarry" }] };
    const topCourses = { Science: ["B.Tech/B.E.", "MBBS", "B.Sc", "BCA"], Arts: ["B.A.", "LLB (Law)", "B.J.M.C."], Commerce: ["B.Com", "BBA", "CA"], Vocational: ["Diploma", "ITI", "B.Voc"] };
    const careerData = { Science: { title: "Career Paths for Science", columns: [{ title: "Top Courses", icon: "fa-graduation-cap", items: ["B.Tech/B.E.", "MBBS", "B.Sc"] }, { title: "Career Options", icon: "fa-briefcase", items: ["Engineer", "Doctor", "Scientist"] }, { title: "Govt. Exams", icon: "fa-building-columns", items: ["UPSC", "NDA", "SSC CGL"] }] }, Arts: { title: "Career Paths for Arts", columns: [{ title: "Top Courses", icon: "fa-graduation-cap", items: ["B.A.", "LLB (Law)", "B.J.M.C."] }, { title: "Career Options", icon: "fa-briefcase", items: ["Lawyer", "Journalist", "Teacher"] }, { title: "Govt. Exams", icon: "fa-building-columns", items: ["UPSC", "SSC CGL"] }] }, Commerce: { title: "Career Paths for Commerce", columns: [{ title: "Top Courses", icon: "fa-graduation-cap", items: ["B.Com", "BBA", "CA"] }, { title: "Career Options", icon: "fa-briefcase", items: ["Accountant", "Manager", "Banker"] }, { title: "Govt. Exams", icon: "fa-building-columns", items: ["UPSC", "RBI Grade B"] }] }, Vocational: { title: "Career Paths for Vocational", columns: [{ title: "Top Courses", icon: "fa-graduation-cap", items: ["Diploma", "ITI", "B.Voc"] }, { title: "Career Options", icon: "fa-briefcase", items: ["Technician", "Web Developer", "Chef"] }, { title: "Govt. Exams", icon: "fa-building-columns", items: ["Railway (ALP)", "PSU Tech"] }] } };
    const questions = [{ text: "When you have free time, you prefer to:", options: [{ text: "Build or fix things", weights: { Vocational: 2, Science: 1 } }, { text: "Read a book or write", weights: { Arts: 2 } }, { text: "Organize your room or plan a budget", weights: { Commerce: 2 } }, { text: "Watch a documentary or solve puzzles", weights: { Science: 2 } }] }, { text: "Which subject do you enjoy most?", options: [{ text: "Physics or Chemistry", weights: { Science: 2 } }, { text: "History or Literature", weights: { Arts: 2 } }, { text: "Mathematics or Economics", weights: { Commerce: 2, Science: 1 } }, { text: "Computer Science or a workshop class", weights: { Vocational: 2, Science: 1 } }] }, { text: "How do you prefer to solve a problem?", options: [{ text: "By analyzing data logically", weights: { Science: 2, Commerce: 1 } }, { text: "By thinking creatively", weights: { Arts: 2 } }, { text: "By collaborating and managing", weights: { Commerce: 2 } }, { text: "By taking a hands-on approach", weights: { Vocational: 2 } }] }, { text: "Which work environment sounds appealing?", options: [{ text: "A laboratory or a tech company", weights: { Science: 2 } }, { text: "An art studio or a law firm", weights: { Arts: 2 } }, { text: "A bank or my own startup", weights: { Commerce: 2 } }, { text: "A workshop or working on-site", weights: { Vocational: 2 } }] },];

    // --- AUTHENTICATION & UI TOGGLING ---
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = { uid: user.uid, email: user.email };
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    currentUser.name = doc.data().name;
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('view')) {
                        showHomepageView();
                        const section = urlParams.get('view');
                        setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 300);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else {
                        showDashboardView(currentUser.name);
                    }
                } else { auth.signOut(); }
            });
        } else {
            currentUser = null;
            showHomepageView();
        }
    });

    function showDashboardView(name) {
        mainContent.style.display = 'none';
        dashboardSection.style.display = 'block';
        userAuthSection.innerHTML = `<span id="user-display-name">Hi, ${name.split(' ')[0]}</span><button class="cta-button-nav" id="home-btn">Home</button><button class="logout-btn">Logout</button>`;
        userAuthSection.querySelector('.logout-btn').addEventListener('click', () => auth.signOut());
        userAuthSection.querySelector('#home-btn').addEventListener('click', (e) => { e.preventDefault(); showHomepageView(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        loadAptitudeResults();
        loadRecommendedColleges();
    }

    function showHomepageView() {
        dashboardSection.style.display = 'none';
        mainContent.style.display = 'block';
        if (currentUser) {
            userAuthSection.innerHTML = `<span id="user-display-name">Hi, ${currentUser.name.split(' ')[0]}</span><button class="cta-button-nav" id="dashboard-btn">Dashboard</button><button class="logout-btn">Logout</button>`;
            userAuthSection.querySelector('#dashboard-btn').addEventListener('click', () => showDashboardView(currentUser.name));
            userAuthSection.querySelector('.logout-btn').addEventListener('click', () => auth.signOut());
        } else {
            userAuthSection.innerHTML = `<button class="cta-button-nav" id="login-signup-btn">Login / Signup</button>`;
            document.getElementById('login-signup-btn').addEventListener('click', () => showModal(authContainer));
        }
        triggerAnimations();
    }

    function handleSignup(e) {
        e.preventDefault();
        const name = signupForm.querySelector('#signup-name').value;
        const phone = signupForm.querySelector('#signup-phone').value;
        const city = signupForm.querySelector('#signup-city').value;
        const email = signupForm.querySelector('#signup-email').value;
        const password = signupForm.querySelector('#signup-password').value;
        signupError.textContent = '';
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                const userDocRef = db.collection('users').doc(user.uid);
                userDocRef.set({ name: name, email: email, phone: phone, city: city, createdAt: new Date() });
                if (latestQuizResultForSignup) {
                    userDocRef.collection('quizHistory').add(latestQuizResultForSignup);
                    latestQuizResultForSignup = null;
                }
            })
            .then(() => { hideModal(authContainer); signupForm.reset(); })
            .catch(error => signupError.textContent = error.message);
    }

    function handleLogin(e) { e.preventDefault(); const email = loginForm.querySelector('#login-email').value; const password = loginForm.querySelector('#login-password').value; loginError.textContent = ''; auth.signInWithEmailAndPassword(email, password).then(() => hideModal(authContainer)).catch(error => loginError.textContent = error.message); }

    // --- QUIZ LOGIC ---
    let currentQuestionIndex = 0;
    let scores = { Science: 0, Arts: 0, Commerce: 0, Vocational: 0 };
    function startQuiz() { currentQuestionIndex = 0; scores = { Science: 0, Arts: 0, Commerce: 0, Vocational: 0 }; showModal(quizContainer); displayQuestion(); }
    function displayQuestion() { if (currentQuestionIndex < questions.length) { const question = questions[currentQuestionIndex]; questionText.textContent = question.text; optionsContainer.innerHTML = ''; question.options.forEach(option => { const button = document.createElement('button'); button.textContent = option.text; button.classList.add('option'); button.onclick = () => selectOption(option.weights); optionsContainer.appendChild(button); }); currentQuestionNum.textContent = currentQuestionIndex + 1; totalQuestionsNum.textContent = questions.length; } else { showResult(); } }
    function selectOption(weights) { for (const stream in weights) { scores[stream] += weights[stream]; } currentQuestionIndex++; displayQuestion(); }
    function showResult() { hideModal(quizContainer); const totalScore = Object.values(scores).reduce((a, b) => a + b, 0); const percentages = {}; for (const stream in scores) { percentages[stream] = totalScore === 0 ? 0 : Math.round((scores[stream] / totalScore) * 100); } const sortedScores = Object.entries(percentages).sort((a, b) => b[1] - a[1]); const bestStream = sortedScores[0][0]; const resultData = { recommendedStream: bestStream, scores: scores, timestamp: new Date() }; if (currentUser) { db.collection('users').doc(currentUser.uid).collection('quizHistory').add(resultData); resultContent.innerHTML = `<h3>Result Saved!</h3><p>Your top recommendation is <strong>${bestStream}</strong>. Check your dashboard for details.</p>`; setTimeout(() => hideModal(resultContainer), 2000); } else { latestQuizResultForSignup = resultData; resultContent.innerHTML = `<h3>Your top recommendation is ${bestStream}!</h3><p>Sign up to save your results and get personalized recommendations.</p><div class="result-actions"><button class="cta-button" id="signup-from-result-btn">Signup to Save</button></div>`; document.getElementById('signup-from-result-btn').addEventListener('click', () => { hideModal(resultContainer); showModal(authContainer); showSignupBtn.click(); }); } showModal(resultContainer); }

    // --- DASHBOARD LOGIC ---
    function loadAptitudeResults() { if (!currentUser) return; latestResultContent.innerHTML = '<p class="placeholder-text">Loading...</p>'; const userQuizHistoryRef = db.collection('users').doc(currentUser.uid).collection('quizHistory').orderBy('timestamp', 'desc').limit(1); userQuizHistoryRef.onSnapshot(snapshot => { if (snapshot.empty) { latestResultContent.innerHTML = '<p class="placeholder-text">Take your first test!</p>'; studyMaterialsContent.innerHTML = '<p class="placeholder-text">Take a test!</p>'; recommendedCoursesContent.innerHTML = '<p class="placeholder-text">Take a test!</p>'; latestRecommendedStream = null; } else { const latestResult = snapshot.docs[0].data(); latestQuizScores = latestResult.scores; latestRecommendedStream = latestResult.recommendedStream; const resultDate = latestResult.timestamp.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); latestResultContent.innerHTML = `<div class="latest-result-summary"><p>Your top recommendation:</p><div class="stream-badge">${latestResult.recommendedStream}</div><p class="date">On ${resultDate}</p><button class="view-report-btn" id="view-report-btn">View Detailed Report</button></div>`; document.getElementById('view-report-btn').addEventListener('click', showDetailedReport); loadStudyMaterials(latestResult.recommendedStream); loadRecommendedCourses(latestResult.recommendedStream); } }); }
    function showDetailedReport() { if (!latestQuizScores) return; reportTitle.textContent = "Detailed Aptitude Report"; const totalScore = Object.values(latestQuizScores).reduce((a, b) => a + b, 0); const percentages = {}; for (const stream in latestQuizScores) { percentages[stream] = totalScore === 0 ? 0 : Math.round((latestQuizScores[stream] / totalScore) * 100); } const sortedScores = Object.entries(percentages).sort((a, b) => b[1] - a[1]); reportContent.innerHTML = `<div class="score-bars-container">${sortedScores.map(([stream, p]) => `<div class="score-bar-item"><p>${stream} <span>${p}%</span></p><div class="score-bar-bg"><div class="score-bar-fill" style="width: 0%;" data-width="${p}%"></div></div></div>`).join('')}</div>`; showModal(reportContainer); setTimeout(() => { document.querySelectorAll('.score-bar-fill').forEach(bar => bar.style.width = bar.dataset.width); }, 100); }
    function loadRecommendedColleges() { recommendedCollegesContent.innerHTML = collegesFromDB.slice(0, 3).map(college => `<div class="recommended-college-item"><img src="${college.image}" alt="${college.name}"><div><h4>${college.name}</h4><p>${college.city}</p></div></div>`).join(''); }
    function loadStudyMaterials(stream) { const materials = studyMaterials[stream] || []; studyMaterialsContent.innerHTML = materials.length === 0 ? '<p class="placeholder-text">No materials found.</p>' : materials.map(item => `<a href="${item.link}" target="_blank" class="study-item"><h4><i class="fa-solid fa-link"></i> ${item.title}</h4><p>${item.desc}</p></a>`).join(''); }
    function loadRecommendedCourses(stream) { const courses = topCourses[stream] || []; recommendedCoursesContent.innerHTML = courses.length === 0 ? '<p class="placeholder-text">No courses found.</p>' : `<div class="course-tags-container">${courses.map(course => `<span class="course-item">${course}</span>`).join('')}</div>`; }

    // --- HOMEPAGE LOGIC ---
    function renderColleges(collegeArray) { collegeListContainer.innerHTML = ''; if (!collegeArray || collegeArray.length === 0) { collegeListContainer.innerHTML = '<p class="placeholder-text">No colleges found.</p>'; return; } collegeArray.forEach(college => { const card = document.createElement('div'); card.className = 'college-card'; const coursesHtml = (college.courses && college.courses.length > 0) ? `<strong>Courses:</strong> ${college.courses.join(', ')}` : ''; const facilitiesHtml = (college.facilities && college.facilities.length > 0) ? college.facilities.map(facility => `<span class="facility-tag"><i class="fa-solid fa-check"></i> ${facility}</span>`).join('') : ''; card.innerHTML = `<div class="college-card-image" style="background-image: url('${college.image}')"></div><div class="college-card-content"><h3>${college.name}</h3><p class="college-city"><i class="fa-solid fa-map-marker-alt"></i> ${college.city}</p><div class="college-card-courses">${coursesHtml}</div><div class="college-card-facilities">${facilitiesHtml}</div></div>`; collegeListContainer.appendChild(card); }); }
    async function loadCollegesFromFirestore() { collegeListContainer.innerHTML = '<p class="placeholder-text">Loading colleges...</p>'; try { db.collection('colleges').onSnapshot(snapshot => { if (snapshot.empty) { collegeListContainer.innerHTML = '<p class="placeholder-text">No colleges added yet.</p>'; return; } collegesFromDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); renderColleges(collegesFromDB); if (dashboardSection.style.display === 'block') { loadRecommendedColleges(); } }); } catch (error) { console.error("Error fetching colleges:", error); collegeListContainer.innerHTML = '<p class="placeholder-text">Could not load colleges.</p>'; } }
    function filterColleges() { const searchTerm = collegeSearchInput.value.toLowerCase(); const filtered = collegesFromDB.filter(college => college.name.toLowerCase().includes(searchTerm) || college.city.toLowerCase().includes(searchTerm)); renderColleges(filtered); }
    function findNearbyColleges() { if (!navigator.geolocation) { alert("Geolocation not supported."); return; } nearbyCollegesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Finding...'; nearbyCollegesBtn.disabled = true; const success = (pos) => { const userLat = pos.coords.latitude; const userLon = pos.coords.longitude; const collegesWithDist = collegesFromDB.map(c => ({ ...c, dist: getDistance(userLat, userLon, c.lat, c.lon) })); collegesWithDist.sort((a, b) => a.dist - b.dist); renderColleges(collegesWithDist); nearbyCollegesBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Find Nearby'; nearbyCollegesBtn.disabled = false; }; const error = (err) => { alert("Could not get your location."); console.error(err); nearbyCollegesBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Find Nearby'; nearbyCollegesBtn.disabled = false; }; navigator.geolocation.getCurrentPosition(success, error); }
    function getDistance(lat1, lon1, lat2, lon2) { const R = 6371; const dLat = deg2rad(lat2 - lat1); const dLon = deg2rad(lon2 - lon1); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }
    function deg2rad(deg) { return deg * (Math.PI / 180); }

    function renderTimeline(events) { if (!timelineContainer) return; timelineContainer.innerHTML = ''; const now = new Date(); if (events) { events.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)); events.forEach((event, index) => { const deadline = new Date(event.deadline); const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)); let countdownHTML = daysLeft > 0 ? `<div class="countdown"><span>${daysLeft}</span> days left</div>` : (daysLeft === 0 ? `<div class="countdown" style="color:#E63946">Last day!</div>` : `<div class="countdown" style="color:#888">Passed.</div>`); const item = document.createElement('div'); item.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`; item.innerHTML = `<div class="timeline-content"><h3><span class="tag ${event.type}">${event.type}</span> ${event.title}</h3><p>${event.description || ''}</p>${countdownHTML}</div>`; timelineContainer.appendChild(item); }); } }
    async function loadTimelineFromFirestore() { try { db.collection('timelineEvents').onSnapshot(snapshot => { if (snapshot.empty) { timelineContainer.innerHTML = '<p class="placeholder-text">No important dates added yet.</p>'; return; } const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); renderTimeline(events); }); } catch (error) { console.error("Error fetching timeline events:", error); timelineContainer.innerHTML = '<p class="placeholder-text">Could not load timeline.</p>'; } }
    function showCareerPath(stream) { const data = careerData[stream]; if (!data) return; document.getElementById('career-modal-title').textContent = data.title; document.getElementById('career-modal-content').innerHTML = data.columns.map(col => `<div class="grid-column"><h4><i class="fa-solid ${col.icon}"></i> ${col.title}</h4><ul>${col.items.map(item => `<li>${item}</li>`).join('')}</ul></div>`).join(''); showModal(careerPathContainer); }

    // --- AI CHATBOT LOGIC ---
    async function handleAIChatSubmit(e) { e.preventDefault(); const userQuery = chatInput.value.trim(); if (!userQuery) return; appendMessage(userQuery, 'user-message'); chatInput.value = ''; chatLoading.style.display = 'block'; aiChatSubmitBtn.disabled = true; chatWindow.scrollTop = chatWindow.scrollHeight; try { const apiKey = "AIzaSyAVuQFwX8BhkGHjfORzCMdnrb_467M86S0"; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; const systemPrompt = `You are an expert career counselor for Indian students. The user's aptitude test suggests their interest lies in the '${latestRecommendedStream || 'Not specified'}' stream. Base your answers on this context. Keep answers concise, helpful, and use simple language. Focus on Indian education, colleges, and jobs.`; const payload = { contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, }; const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) { throw new Error(`API request failed: ${response.status}`); } const result = await response.json(); const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text; if (aiResponse) { appendMessage(aiResponse, 'ai-message'); } else { appendMessage("Sorry, I couldn't process that. Please try again.", 'ai-message'); } } catch (error) { console.error("AI Chat Error:", error); appendMessage("Sorry, I am having trouble connecting. Please check your connection.", 'ai-message'); } finally { chatLoading.style.display = 'none'; aiChatSubmitBtn.disabled = false; } }
    function appendMessage(text, className) { const messageDiv = document.createElement('div'); messageDiv.className = `chat-message ${className}`; let formattedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); formattedText = formattedText.split('\n* ').map((item, index) => index === 0 ? item : `<li>${item}</li>`).join(''); if (formattedText.includes('<li>')) { formattedText = `<ul>${formattedText.replace(/<\/li>(\s*)/g, '</li>')}</ul>`; } messageDiv.innerHTML = `<p>${formattedText.replace(/\n/g, '<br>')}</p>`; chatWindow.appendChild(messageDiv); chatWindow.scrollTop = chatWindow.scrollHeight; }

    // --- UTILITY & EVENT LISTENERS ---
    function showModal(modal) { if (modal) modal.style.display = 'flex'; }
    function hideModal(modal) { if (modal) modal.style.display = 'none'; }
    const animatedElements = document.querySelectorAll('.anim-on-scroll');
    const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }); }, { threshold: 0.1 });
    function triggerAnimations() { animatedElements.forEach(el => observer.observe(el)); }
    startQuizBtnHero.addEventListener('click', startQuiz);
    takeNewTestBtn.addEventListener('click', startQuiz);
    retakeQuizBtn.addEventListener('click', startQuiz);
    viewAllCollegesLink.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'index.html?view=colleges'; });
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    showLoginBtn.addEventListener('click', () => { signupForm.style.display = 'none'; loginForm.style.display = 'flex'; showLoginBtn.classList.add('active'); showSignupBtn.classList.remove('active'); });
    showSignupBtn.addEventListener('click', () => { loginForm.style.display = 'none'; signupForm.style.display = 'flex'; showSignupBtn.classList.add('active'); showLoginBtn.classList.remove('active'); });
    closeModalBtns.forEach(btn => btn.addEventListener('click', (e) => hideModal(document.getElementById(e.currentTarget.dataset.target))));
    courseCards.forEach(card => card.addEventListener('click', () => showCareerPath(card.dataset.stream)));
    collegeSearchInput.addEventListener('keyup', filterColleges);
    nearbyCollegesBtn.addEventListener('click', findNearbyColleges);
    aiChatForm.addEventListener('submit', handleAIChatSubmit);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { Object.values(document.querySelectorAll('.modal-wrapper')).forEach(hideModal); } });

    // --- INITIAL LOAD ---
    loadCollegesFromFirestore();
    loadTimelineFromFirestore();
    triggerAnimations();
});

