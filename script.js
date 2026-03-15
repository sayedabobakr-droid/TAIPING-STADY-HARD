// 1. المتغيرات الأساسية وقاعدة البيانات
let userImageData = localStorage.getItem('userPhoto') || "";
let favoriteLessons = JSON.parse(localStorage.getItem('favorites')) || [];

const MY_DATA = {
    "اللغة العربية": [
        { title: "مراجعة الترم الاول نحو", subject: "مستر فاروق", videoUrl: "https://www.youtube.com/embed/lndBYseKiRc" }
    ],
    "الرياضيات": [
        { title: "مراجعة تراكمي جبر", subject: "مستر مايكل صفوت", videoUrl: "https://www.youtube.com/embed/jTnMZdWg_oY" }
    ]
};

// 2. منطق تسجيل الدخول وزر الواتساب
function checkInputs() {
    const waBtn = document.getElementById('waBtn');
    const fields = ['username', 'password', 'adress', 'phone'].map(id => document.getElementById(id));
    
    if (waBtn && fields.every(f => f)) {
        const allFilled = fields.every(f => f.value.trim() !== "");
        if (allFilled) {
            waBtn.classList.add('active');
        } else {
            waBtn.classList.remove('active');
        }
    }
}

// 3. معالجة الصور والتسجيل
const imageInput = document.getElementById('userImage');
if (imageInput) {
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userImageData = e.target.result;
                const previewImg = document.getElementById('profilePreviewImg');
                if (previewImg) {
                    previewImg.src = userImageData;
                    previewImg.style.display = 'block';
                    document.querySelector('.image-preview i').style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('currentUser', document.getElementById('username').value);
        localStorage.setItem('userAddress', document.getElementById('adress').value);
        localStorage.setItem('userPhone', document.getElementById('phone').value);
        if (userImageData) localStorage.setItem('userPhoto', userImageData);
        window.location.href = 'profile.html';
    });
}

// 4. عرض الدروس ونظام المفضلة (القلب)
function renderLessons(dataToRender = MY_DATA, isFavView = false) {
    const container = document.getElementById('foldersContainer');
    if (!container) return;
    container.innerHTML = "";

    for (const folder in dataToRender) {
        if (dataToRender[folder].length === 0) continue;

        container.innerHTML += `
            <div class="folder-group" style="margin-bottom: 40px;">
                <h2 class="folder-title">${folder}</h2>
                <div class="cards-grid">
                    ${dataToRender[folder].map(lesson => {
                        const isFav = favoriteLessons.some(f => f.title === lesson.title);
                        return `
                        <div class="card">
                            <button class="favorite-btn ${isFav ? 'active' : ''}" 
                                onclick="toggleFavorite(event, '${lesson.title}', '${lesson.subject}', '${lesson.videoUrl}')">
                                <i class="fas fa-heart"></i>
                            </button>
                            <div onclick="playLesson('${lesson.title}', '${lesson.videoUrl}')">
                                <div class="card-img-placeholder">🎬</div>
                                <div class="card-info">
                                    <h3>${lesson.title}</h3>
                                    <div class="card-subject">${lesson.subject}</div>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
    }
}

function toggleFavorite(event, title, subject, videoUrl) {
    event.stopPropagation();
    const index = favoriteLessons.findIndex(f => f.title === title);
    
    if (index > -1) {
        favoriteLessons.splice(index, 1);
    } else {
        favoriteLessons.push({ title, subject, videoUrl });
    }

    localStorage.setItem('favorites', JSON.stringify(favoriteLessons));
    // تحديث العرض فوراً
    const currentView = document.body.dataset.view === 'fav' ? { "دروسك المفضلة": favoriteLessons } : MY_DATA;
    renderLessons(currentView);
}

function renderFavorites() {
    document.body.dataset.view = 'fav';
    if (favoriteLessons.length === 0) {
        document.getElementById('foldersContainer').innerHTML = "<h2 class='folder-title'>المفضلة فارغة حالياً 💔</h2>";
    } else {
        renderLessons({ "دروسك المفضلة": favoriteLessons }, true);
    }
}

// 5. وظائف إضافية (بحث، سلايدر، بروفايل)
function playLesson(title, url) {
    localStorage.setItem('play_title', title);
    localStorage.setItem('play_url', url); 
    window.location.href = 'player.html';
}

function searchLessons() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(term) ? "block" : "none";
    });
}

let slideIndex = 0;
function moveSlide(n) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    slides[slideIndex].classList.remove('active');
    slideIndex = (slideIndex + n + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
}

function updateSidebarProfile() {
    if (document.getElementById('sideUserImg')) {
        document.getElementById('sideUserImg').src = localStorage.getItem('userPhoto') || "image/0.jpg";
        document.getElementById('sideUserName').innerText = localStorage.getItem('currentUser') || "طالب";
        document.getElementById('sideUserAddress').innerText = localStorage.getItem('userAddress') || "غير مسجل";
        document.getElementById('sideUserPhone').innerText = localStorage.getItem('userPhone') || "غير مسجل";
        if (document.getElementById('studentNameDisplay')) {
            document.getElementById('studentNameDisplay').innerText = localStorage.getItem('currentUser') || "طالب";
        }
    }
}

// 6. تشغيل السكربت عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.view = 'home';
    updateSidebarProfile();
    renderLessons();
    
    // تفعيل فحص المدخلات في صفحة الاندكس
    const inputs = document.querySelectorAll('.input-box input');
    inputs.forEach(input => input.addEventListener('input', checkInputs));

    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('isLogged');
            window.location.href = 'index.html';
        };
    }
    
    // تشغيل السلايدر تلقائياً
    if (document.querySelectorAll('.slide').length > 0) {
        setInterval(() => moveSlide(1), 5000);
    }
});