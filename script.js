// ====================================================
// 0. İLK GİRİŞ TARAMA SİMÜLASYONU VE DİZİLER
// ====================================================
let availableUsers = [];
let questionsList = []; 
let chatMessages = [];
let userAccounts = JSON.parse(localStorage.getItem('8d_accounts')) || [];
let currentUser = null;
let tempAvatarBase64 = null;

window.addEventListener('DOMContentLoaded', () => {
    runSecurityScanSimulation();

    startLGSCountdown();
    startGameCountdown();
    renderStudentAvailability();
    renderAdminAvailability();
    renderQuestions();
    renderChat();
    renderUserAccountsManagement();
});

function runSecurityScanSimulation() {
    const statusText = document.getElementById('scan-status-text');
    const loaderBar = document.getElementById('cyber-loader-bar');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        
        if (loaderBar) loaderBar.style.width = `${progress}%`;
        if (statusText) statusText.textContent = `GÜVENLİK TARAMASI YAPILIYOR... %${progress}`;

        if (progress >= 25) {
            const item1 = document.getElementById('scan-item-1');
            if (item1) {
                item1.innerHTML = '<span>[ ✔ ]</span> VİRÜS KONTROLÜ - TAMAMLANDI';
                item1.classList.add('done');
            }
        }

        if (progress >= 50) {
            const item2 = document.getElementById('scan-item-2');
            if (item2) {
                item2.innerHTML = '<span>[ ✔ ]</span> RAT & TROJAN KONTROLÜ - TAMAMLANDI';
                item2.classList.add('done');
            }
        }

        if (progress >= 75) {
            const item3 = document.getElementById('scan-item-3');
            if (item3) {
                item3.innerHTML = '<span>[ ✔ ]</span> KÖTÜ AMAÇLI YAZILIM (MALWARE) - TAMAMLANDI';
                item3.classList.add('done');
            }
        }

        if (progress >= 100) {
            clearInterval(interval);
            const item4 = document.getElementById('scan-item-4');
            if (item4) {
                item4.innerHTML = '<span>[ ✔ ]</span> SİSTEM GÜVENLİK PROTOKOLÜ - ONAYLANDI';
                item4.classList.add('done');
            }
            if (statusText) statusText.textContent = "SİSTEM BÜTÜNLÜĞÜ DOĞRULANDI! ERİŞİM SAĞLANIYOR...";

            setTimeout(() => {
                const introScreen = document.getElementById('welcome-intro-screen');
                const pinScreen = document.getElementById('pin-screen');
                
                if (introScreen) {
                    introScreen.classList.remove('active');
                    setTimeout(() => introScreen.style.display = 'none', 600);
                }
                if (pinScreen) pinScreen.classList.add('active');
            }, 1200);
        }
    }, 50);
}

// ====================================================
// 1. ŞİFRE / PIN AYARLARI
// ====================================================
const PINS = {
    student: "1234",
    teacher: "9876",
    fun: "5555"
};

const DEFAULT_AVATAR = "https://via.placeholder.com/100/9333ea/ffffff?text=8/D";

const BAD_WORDS = [
    "amk", "aq", "sg", "oç", "oc", "pic", "piç", "yarrak", "yarak",
    "amq", "sik", "sikiş", "sikim", "orospu", "kahpe", "göt", "got",
    "yarram", "yarragim", "amcık", "amcik", "fuck", "bitch", "porno"
];

let currentRole = 'student';
let enteredPin = "";
let enteredFunPin = "";
let wrongAttempts = 0;
let isLocked = false;
let announcements = [];

// ====================================================
// 2. HESAP GİRİŞİ, KAYIT & PORTAL YÖNLENDİRME
// ====================================================
function switchAuthTab(tab) {
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');
    const loginBtn = document.getElementById('tab-login-btn');
    const regBtn = document.getElementById('tab-register-btn');
    const errorMsg = document.getElementById('auth-error-msg');

    errorMsg.textContent = "";

    if (tab === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        loginBtn.classList.add('active');
        regBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        regBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }
}

function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value.trim();
    const passConfirm = document.getElementById('reg-password-confirm').value.trim();
    const errorMsg = document.getElementById('auth-error-msg');

    if (!username || !pass || !passConfirm) {
        errorMsg.textContent = "Lütfen tüm alanları doldurun!";
        return;
    }

    if (pass !== passConfirm) {
        errorMsg.textContent = "Şifreler birbiriyle eşleşmiyor!";
        return;
    }

    if (userAccounts.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        errorMsg.textContent = "Bu kullanıcı adı zaten alınmış!";
        return;
    }

    const newUser = {
        username: username,
        password: pass,
        role: currentRole,
        avatar: DEFAULT_AVATAR,
        bio: ""
    };

    userAccounts.push(newUser);
    localStorage.setItem('8d_accounts', JSON.stringify(userAccounts));

    alert("🎉 Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.");

    document.getElementById('reg-username').value = "";
    document.getElementById('reg-password').value = "";
    document.getElementById('reg-password-confirm').value = "";
    switchAuthTab('login');
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const rememberMe = document.getElementById('remember-me-check').checked;
    const errorMsg = document.getElementById('auth-error-msg');

    if (!username || !pass) {
        errorMsg.textContent = "Kullanıcı adı ve şifrenizi girin!";
        return;
    }

    const user = userAccounts.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);

    if (user) {
        currentUser = user;
        errorMsg.textContent = "";

        if (rememberMe) {
            localStorage.setItem('8d_remembered_user', JSON.stringify(user));
        }

        openPortalForUser(user);
    } else {
        errorMsg.textContent = "Kullanıcı adı veya şifre hatalı!";
    }
}

function openPortalForUser(user) {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('pin-screen').classList.remove('active');

    updateUserProfileUI();

    // SADECE Giriş PIN'inde 'Yönetici' seçildiyse Yönetici Paneline yönlendir.
    if (currentRole === 'teacher') {
        document.getElementById('teacher-portal').classList.add('active');
        renderUserAccountsManagement();
    } else {
        document.getElementById('student-portal').classList.add('active');
        
        const chatAuthor = document.getElementById('chat-author-input');
        const askerAuthor = document.getElementById('asker-name-input');
        if (chatAuthor) chatAuthor.value = user.username;
        if (askerAuthor) askerAuthor.value = user.username;
    }
}

function updateUserProfileUI() {
    if (!currentUser) return;

    const avatarUrl = currentUser.avatar || DEFAULT_AVATAR;

    const loggedName = document.getElementById('logged-user-name');
    const topName = document.getElementById('top-username-text');
    const topAvatar = document.getElementById('top-avatar-img');

    if (loggedName) loggedName.textContent = currentUser.username;
    if (topName) topName.textContent = currentUser.username;
    if (topAvatar) topAvatar.src = avatarUrl;
}

function backToPinScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('pin-screen').classList.add('active');
}

// ====================================================
// 3. PROFİL ÖZELLEŞTİRME & DÜZENLEME SİSTEMİ
// ====================================================
function openProfileModal() {
    if (!currentUser) return;

    tempAvatarBase64 = currentUser.avatar || DEFAULT_AVATAR;
    document.getElementById('modal-avatar-preview').src = tempAvatarBase64;
    document.getElementById('edit-username-input').value = currentUser.username;
    document.getElementById('edit-bio-input').value = currentUser.bio || "";

    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function previewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            tempAvatarBase64 = e.target.result;
            document.getElementById('modal-avatar-preview').src = tempAvatarBase64;
        };
        reader.readAsDataURL(file);
    }
}

function saveProfileChanges() {
    const newUsername = document.getElementById('edit-username-input').value.trim();
    const newBio = document.getElementById('edit-bio-input').value.trim();

    if (!newUsername) {
        alert("Kullanıcı adı boş bırakılamaz!");
        return;
    }

    const isTaken = userAccounts.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.username.toLowerCase() !== currentUser.username.toLowerCase());
    if (isTaken) {
        alert("Bu kullanıcı adı zaten kullanılıyor!");
        return;
    }

    currentUser.username = newUsername;
    currentUser.avatar = tempAvatarBase64;
    currentUser.bio = newBio;

    const userIndex = userAccounts.findIndex(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
    if (userIndex !== -1) {
        userAccounts[userIndex] = currentUser;
    }

    localStorage.setItem('8d_accounts', JSON.stringify(userAccounts));

    const remembered = JSON.parse(localStorage.getItem('8d_remembered_user'));
    if (remembered) {
        localStorage.setItem('8d_remembered_user', JSON.stringify(currentUser));
    }

    updateUserProfileUI();
    closeProfileModal();

    alert("✨ Profiliniz başarıyla güncellendi!");
}

function viewUserProfile(username) {
    const targetUser = userAccounts.find(u => u.username.toLowerCase() === username.toLowerCase());

    const modal = document.getElementById('view-profile-modal');
    const avatarImg = document.getElementById('view-modal-avatar');
    const usernameText = document.getElementById('view-modal-username');
    const roleText = document.getElementById('view-modal-role');
    const bioText = document.getElementById('view-modal-bio');

    if (targetUser) {
        avatarImg.src = targetUser.avatar || DEFAULT_AVATAR;
        usernameText.textContent = targetUser.username;
        if (roleText) roleText.textContent = targetUser.role === 'teacher' ? "👑 Yönetici" : "👤 Öğrenci";
        bioText.textContent = targetUser.bio || "Henüz bir hobi veya ilgi alanı belirtilmemiş.";
    } else {
        avatarImg.src = DEFAULT_AVATAR;
        usernameText.textContent = username;
        if (roleText) roleText.textContent = "👤 Öğrenci";
        bioText.textContent = "Bu kullanıcı henüz ek profiline detay eklememiş.";
    }

    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeViewProfileModal() {
    const modal = document.getElementById('view-profile-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// ====================================================
// 4. YÖNETİCİ PANELİ - KULLANICI YETKİLENDİRME
// ====================================================
function toggleUserRole(username) {
    const user = userAccounts.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return;

    if (user.role === 'teacher') {
        user.role = 'student';
        alert(`👤 ${user.username} adlı kullanıcının yetkisi 'Öğrenci' olarak değiştirildi.`);
    } else {
        user.role = 'teacher';
        alert(`👑 ${user.username} adlı kullanıcıya Yönetici yetkisi verildi! Artık öğrenci paneli sohbetinde '👑 YÖNETİCİ' etiketi görünecektir.`);
    }

    localStorage.setItem('8d_accounts', JSON.stringify(userAccounts));
    renderUserAccountsManagement();
    renderChat();
    updateUserProfileUI();
}

function renderUserAccountsManagement() {
    const container = document.getElementById('user-accounts-list');
    if (!container) return;

    if (userAccounts.length === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 0.95rem; text-align: center;">Henüz sisteme kayıtlı öğrenci/kullanıcı bulunmuyor.</p>';
        return;
    }

    let html = "";
    userAccounts.forEach(u => {
        const isTeacher = u.role === 'teacher';
        const roleLabel = isTeacher ? "👑 Yönetici" : "👤 Öğrenci";
        const roleClass = isTeacher ? "role-teacher-tag" : "role-student-tag";
        const btnText = isTeacher ? "👤 Öğrenci Yap" : "👑 Yönetici Yap";
        const btnClass = isTeacher ? "make-student-btn" : "make-admin-btn";

        html += `
            <div class="user-manage-card">
                <div class="user-info-left">
                    <img src="${u.avatar || DEFAULT_AVATAR}" class="user-manage-avatar" alt="${u.username}">
                    <div class="user-details">
                        <span class="user-details-name">${u.username}</span>
                        <span class="user-role-tag ${roleClass}">${roleLabel}</span>
                    </div>
                </div>
                <button type="button" class="toggle-role-btn ${btnClass}" onclick="toggleUserRole('${u.username}')">
                    ${btnText}
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ====================================================
// 5. SOHBET (CHAT) SİSTEMİ MANTIĞI & KÜFÜR FİLTRESİ
// ====================================================
function containsBadWord(text) {
    const cleanText = text.toLowerCase().replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9\s]/g, "");
    const words = cleanText.split(/\s+/);

    return BAD_WORDS.some(bad => {
        return words.includes(bad) || cleanText.includes(bad);
    });
}

function sendChatMessage() {
    const msgInput = document.getElementById('chat-message-input');
    const text = msgInput.value.trim();

    if (!currentUser) {
        alert("Mesaj atmak için giriş yapmalısınız!");
        return;
    }

    if (!text) {
        alert("Lütfen bir mesaj yazın!");
        return;
    }

    if (containsBadWord(text)) {
        alert("⚠️ Yasaklı kelime kullandın lütfen kullanma devam edersen yönetici Ege tarafından banlanıcaksın");
        msgInput.value = "";
        return;
    }

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updatedUserAcc = userAccounts.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
    const isUserAdmin = (updatedUserAcc && updatedUserAcc.role === 'teacher') || currentUser.role === 'teacher';

    const newMsg = {
        id: Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatar || DEFAULT_AVATAR,
        text: text,
        time: time,
        isAdmin: isUserAdmin
    };

    chatMessages.push(newMsg);
    msgInput.value = "";

    renderChat();
}

function sendAdminChatMessage() {
    const input = document.getElementById('admin-chat-message-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    if (!currentUser) {
        alert("Mesaj atmak için giriş yapmalısınız!");
        return;
    }

    if (containsBadWord(text)) {
        alert("⚠️ Yasaklı kelime kullandınız!");
        input.value = "";
        return;
    }

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg = {
        id: Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatar || DEFAULT_AVATAR,
        text: text,
        time: time,
        isAdmin: true
    };

    chatMessages.push(newMsg);
    input.value = "";
    renderChat();
}

function handleChatEnter(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function handleAdminChatEnter(e) {
    if (e.key === 'Enter') sendAdminChatMessage();
}

function deleteChatMessage(id) {
    chatMessages = chatMessages.filter(m => m.id !== id);
    renderChat();
}

function renderChat() {
    const boxes = document.querySelectorAll('.chat-messages-box');
    if (!boxes || boxes.length === 0) return;

    let html = "";

    if (chatMessages.length === 0) {
        html = '<p style="color: #64748b; font-size: 0.9rem; text-align: center; margin-top: 20px;">Henüz hiç mesaj yazılmadı. İlk mesajı sen at! 🔥</p>';
    } else {
        chatMessages.forEach(m => {
            const acc = userAccounts.find(u => u.username.toLowerCase() === m.author.toLowerCase());
            const showAdminBadge = m.isAdmin || (acc && acc.role === 'teacher');

            const adminBadgeHtml = showAdminBadge ? `<span class="admin-chat-badge">👑 YÖNETİCİ</span>` : '';
            const avatarAdminClass = showAdminBadge ? 'admin-avatar' : '';

            html += `
                <div class="chat-bubble ${showAdminBadge ? 'admin-bubble' : ''}">
                    <div class="chat-bubble-header">
                        <div class="chat-user-info" onclick="viewUserProfile('${m.author}')">
                            <img src="${m.avatar}" class="chat-avatar-mini ${avatarAdminClass}" alt="${m.author}">
                            <span class="chat-author">${m.author}</span>
                            ${adminBadgeHtml}
                        </div>
                        <div>
                            <span class="chat-time">${m.time}</span>
                            <button type="button" class="chat-delete-btn" onclick="deleteChatMessage(${m.id})">❌</button>
                        </div>
                    </div>
                    <div class="chat-text">${m.text}</div>
                </div>
            `;
        });
    }

    boxes.forEach(box => {
        box.innerHTML = html;
        box.scrollTop = box.scrollHeight;
    });
}

// ====================================================
// 6. SORU-CEVAP SİSTEMİ MANTIĞI
// ====================================================
function addQuestion() {
    const subjectInput = document.getElementById('question-subject-input');
    const textInput = document.getElementById('question-text-input');

    const subject = subjectInput.value.trim();
    const text = textInput.value.trim();

    if (!currentUser) {
        alert("Soru sormak için giriş yapmalısınız!");
        return;
    }

    if (!subject || !text) {
        alert("Lütfen ders konusunu ve sorunuzu eksiksiz doldurun!");
        return;
    }

    if (containsBadWord(text) || containsBadWord(subject)) {
        alert("⚠️ Yasaklı kelime kullandın lütfen kullanma devam edersen yönetici Ege tarafından banlanıcaksın");
        return;
    }

    const newQuestion = {
        id: Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatar || DEFAULT_AVATAR,
        subject: subject,
        text: text,
        answers: []
    };

    questionsList.unshift(newQuestion);

    subjectInput.value = "";
    textInput.value = "";

    renderQuestions();
}

function deleteQuestion(id) {
    if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
        questionsList = questionsList.filter(q => q.id !== id);
        renderQuestions();
    }
}

function addAnswer(questionId) {
    const textInput = document.getElementById(`ans-text-${questionId}`);
    const text = textInput.value.trim();

    if (!currentUser) {
        alert("Cevap vermek için giriş yapmalısınız!");
        return;
    }

    if (!text) {
        alert("Lütfen cevabınızı doldurun!");
        return;
    }

    if (containsBadWord(text)) {
        alert("⚠️ Yasaklı kelime kullandın lütfen kullanma devam edersen yönetici Ege tarafından banlanıcaksın");
        return;
    }

    const question = questionsList.find(q => q.id === questionId);
    if (question) {
        question.answers.push({
            author: currentUser.username,
            avatar: currentUser.avatar || DEFAULT_AVATAR,
            text: text
        });
        renderQuestions();
    }
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) return;

    if (questionsList.length === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 0.95rem; text-align: center;">Henüz hiç soru sorulmadı. İlk soruyu sen sor!</p>';
        return;
    }

    let html = "";
    questionsList.forEach(q => {
        let answersHtml = "";
        q.answers.forEach(a => {
            answersHtml += `
                <div class="answer-item">
                    <span class="answer-author clickable-profile" onclick="viewUserProfile('${a.author}')">💬 ${a.author}:</span>
                    <span>${a.text}</span>
                </div>
            `;
        });

        html += `
            <div class="question-card">
                <div class="question-header">
                    <div>
                        <span class="question-author clickable-profile" onclick="viewUserProfile('${q.author}')">
                            <img src="${q.avatar}" class="chat-avatar-mini" style="vertical-align: middle; margin-right: 5px;"> ${q.author} sordu:
                        </span>
                        <span class="question-subject" style="margin-left: 10px;">📚 ${q.subject}</span>
                    </div>
                    <button type="button" class="delete-q-btn" onclick="deleteQuestion(${q.id})">🗑️ Soruyu Sil</button>
                </div>
                <div class="question-body">${q.text}</div>

                <div class="answers-list">
                    ${answersHtml}
                </div>

                <div class="answer-input-box">
                    <input type="text" id="ans-text-${q.id}" placeholder="Cevabınızı / Çözümünüzü yazın..." style="flex: 1;">
                    <button type="button" class="answer-btn" onclick="addAnswer(${q.id})">Cevapla</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ====================================================
// 7. MÜSAİTLİK SİSTEMİ MANTIĞI
// ====================================================
function addAvailability() {
    const input = document.getElementById('student-name-input');
    const name = input.value.trim();

    if (!name) {
        alert("Lütfen adınızı yazın!");
        return;
    }

    if (availableUsers.includes(name)) {
        alert("Zaten müsaitler listesindesiniz!");
        return;
    }

    availableUsers.push(name);
    input.value = "";

    renderStudentAvailability();
    renderAdminAvailability();
}

function removeAvailability(index) {
    availableUsers.splice(index, 1);
    renderStudentAvailability();
    renderAdminAvailability();
}

function renderStudentAvailability() {
    const container = document.getElementById('student-available-list');
    if (!container) return;

    if (availableUsers.length === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 0.9rem; text-align: center;">Henüz kimse ismini yazmadı.</p>';
        return;
    }

    let html = "";
    availableUsers.forEach((user, index) => {
        html += `
            <div class="available-item">
                <span>🟢 ${user}</span>
                <button type="button" class="remove-btn" onclick="removeAvailability(${index})">❌ Kaldır</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderAdminAvailability() {
    const adminDisplay = document.getElementById('admin-availability-display');
    const countDisplay = document.getElementById('available-count');
    if (!adminDisplay) return;

    if (countDisplay) countDisplay.textContent = availableUsers.length;

    if (availableUsers.length === 0) {
        adminDisplay.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Henüz kimse ismini yazmadı.</p>';
        return;
    }

    let html = "";
    availableUsers.forEach(user => {
        html += `<span class="user-badge">🟢 ${user}</span>`;
    });

    adminDisplay.innerHTML = html;
}

function resetAvailabilityList() {
    if (confirm("Müsaitlik listesini tamamen temizlemek istediğinize emin misiniz?")) {
        availableUsers = [];
        renderStudentAvailability();
        renderAdminAvailability();
    }
}

// ====================================================
// 8. GERİ SAYIM SAYAÇLARI
// ====================================================
function startLGSCountdown() {
    const lgsDate = new Date("June 6, 2027 09:30:00").getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const distance = lgsDate - now;

        if (distance < 0) {
            const container = document.querySelector('#lgs-zamani .countdown-container');
            if (container) container.innerHTML = "<h3 style='color:#4ade80;'>LGS Sınavı Başladı! Başarılar Dileriz!</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dElem = document.getElementById("days");
        const hElem = document.getElementById("hours");
        const mElem = document.getElementById("minutes");
        const sElem = document.getElementById("seconds");

        if (dElem) dElem.textContent = days.toString().padStart(2, '0');
        if (hElem) hElem.textContent = hours.toString().padStart(2, '0');
        if (mElem) mElem.textContent = minutes.toString().padStart(2, '0');
        if (sElem) sElem.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

function startGameCountdown() {
    setInterval(() => {
        const now = new Date();
        let targetFriday = new Date();

        const dayOfWeek = now.getDay();
        let daysUntilFriday = (5 - dayOfWeek + 7) % 7;

        targetFriday.setDate(now.getDate() + daysUntilFriday);
        targetFriday.setHours(20, 30, 0, 0);

        if (now.getTime() > targetFriday.getTime()) {
            targetFriday.setDate(targetFriday.getDate() + 7);
        }

        const distance = targetFriday.getTime() - now.getTime();

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const hElem = document.getElementById("game-hours");
        const mElem = document.getElementById("game-minutes");
        const sElem = document.getElementById("game-seconds");

        if (hElem) hElem.textContent = hours.toString().padStart(2, '0');
        if (mElem) mElem.textContent = minutes.toString().padStart(2, '0');
        if (sElem) sElem.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// ====================================================
// 9. EĞLENCE PIN SİSTEMİ MANTIĞI
// ====================================================
function openFunModal() {
    enteredFunPin = "";
    updateFunDots();
    const errorMsg = document.getElementById('fun-error-message');
    if (errorMsg) errorMsg.textContent = "";

    const modal = document.getElementById('fun-pin-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeFunModal() {
    const modal = document.getElementById('fun-pin-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    clearFunPin();
}

function pressFunKey(num) {
    if (enteredFunPin.length >= 4) return;
    enteredFunPin += num;
    updateFunDots();
}

function clearFunPin() {
    enteredFunPin = "";
    updateFunDots();
}

function updateFunDots() {
    const dots = document.querySelectorAll('.fun-dot');
    dots.forEach((dot, index) => {
        if (index < enteredFunPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function checkFunPin() {
    const errorMsg = document.getElementById('fun-error-message');

    if (enteredFunPin === PINS.fun) {
        closeFunModal();

        document.getElementById('main-student-menu').style.display = 'none';
        document.getElementById('fun-student-menu').style.display = 'block';

        const firstFunTab = document.querySelector('#fun-student-menu li');
        switchCategory('oyunlar', firstFunTab);
    } else {
        if (errorMsg) errorMsg.textContent = "Hatalı Eğlence PIN'i!";
        clearFunPin();
    }
}

function exitFunMenu() {
    document.getElementById('fun-student-menu').style.display = 'none';
    document.getElementById('main-student-menu').style.display = 'block';

    const firstMainTab = document.querySelector('#main-student-menu li');
    switchCategory('lgs-zamani', firstMainTab);
}

// ====================================================
// 10. GENEL ANA PIN KONTROLLERİ
// ====================================================
function selectRole(role) {
    if (isLocked) return;
    currentRole = role;

    const buttons = document.querySelectorAll('.role-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (role === 'student') {
        if (buttons[0]) buttons[0].classList.add('active');
    } else {
        if (buttons[1]) buttons[1].classList.add('active');
    }

    clearPin();
}

function pressKey(num) {
    if (isLocked || enteredPin.length >= 4) return;
    enteredPin += num;
    updateDots();
}

function clearPin() {
    if (isLocked) return;
    enteredPin = "";
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('#pin-screen .dot');
    dots.forEach((dot, index) => {
        if (index < enteredPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function checkPin() {
    if (isLocked) return;

    const errorMsg = document.getElementById('error-message');

    if (enteredPin === PINS[currentRole]) {
        errorMsg.textContent = "";
        wrongAttempts = 0;

        const rememberedUser = JSON.parse(localStorage.getItem('8d_remembered_user'));

        if (rememberedUser && rememberedUser.role === currentRole) {
            currentUser = rememberedUser;
            openPortalForUser(rememberedUser);
        } else {
            document.getElementById('pin-screen').classList.remove('active');
            document.getElementById('auth-screen').classList.add('active');
        }

        clearPin();
    } else {
        wrongAttempts++;
        clearPin();

        if (wrongAttempts >= 3) {
            lockSystem();
        } else {
            errorMsg.textContent = `Hatalı PIN! Kalan Hak: ${3 - wrongAttempts}`;
        }
    }
}

function lockSystem() {
    isLocked = true;
    let timeLeft = 60;
    const errorMsg = document.getElementById('error-message');

    errorMsg.style.color = "#ef4444";

    const timer = setInterval(() => {
        errorMsg.textContent = `3 kez hatalı girildi! Sistem kilitlendi: ${timeLeft}sn`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            isLocked = false;
            wrongAttempts = 0;
            errorMsg.textContent = "";
            errorMsg.style.color = "#f87171";
        }
    }, 1000);
}

function switchCategory(categoryId, element) {
    document.querySelectorAll('#student-portal .category-content').forEach(cat => cat.classList.remove('active'));

    const targetCat = document.getElementById(categoryId);
    if (targetCat) targetCat.classList.add('active');

    document.querySelectorAll('#student-portal .sidebar li').forEach(li => li.classList.remove('active'));
    if (element) element.classList.add('active');
}

function switchTeacherCategory(categoryId, element) {
    document.querySelectorAll('#teacher-portal .category-content').forEach(cat => cat.classList.remove('active'));

    const targetCat = document.getElementById(categoryId);
    if (targetCat) targetCat.classList.add('active');

    document.querySelectorAll('#teacher-portal .sidebar li').forEach(li => li.classList.remove('active'));
    if (element) element.classList.add('active');

    if (categoryId === 't-fun-area') {
        renderChat();
    }
}

function publishAnnouncement() {
    const titleInput = document.getElementById('announcement-title');
    const textInput = document.getElementById('announcement-text');

    const title = titleInput.value.trim();
    const text = textInput.value.trim();

    if (!title || !text) {
        alert("Lütfen duyuru başlığını ve detayını boş bırakmayın!");
        return;
    }

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    announcements.unshift({
        id: Date.now(),
        title: title,
        text: text,
        time: timeString
    });

    titleInput.value = "";
    textInput.value = "";

    renderAnnouncements();
    alert("Duyuru başarıyla yayınlandı!");
}

function deleteAnnouncement(id) {
    if (confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
        announcements = announcements.filter(item => item.id !== id);
        renderAnnouncements();
    }
}

function renderAnnouncements() {
    const studentContainer = document.getElementById('student-announcements-list');
    const teacherContainer = document.getElementById('teacher-announcements-list');
    const manageContainer = document.getElementById('teacher-manage-announcements-list');

    if (announcements.length === 0) {
        if (studentContainer) studentContainer.innerHTML = '<div class="announcement-card empty-msg">Henüz duyuru yayınlanmadı.</div>';
        if (teacherContainer) teacherContainer.innerHTML = '<div class="announcement-card empty-msg">Henüz duyuru eklenmedi.</div>';
        if (manageContainer) manageContainer.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Henüz yayınlanmış duyuru yok.</p>';
        return;
    }

    let studentHtml = "";
    announcements.forEach(item => {
        studentHtml += `
            <div class="announcement-card">
                <div class="announcement-header">
                    <span class="announcement-title">${item.title}</span>
                    <span class="announcement-date">${item.time}</span>
                </div>
                <div class="announcement-body">${item.text}</div>
            </div>
        `;
    });

    if (studentContainer) studentContainer.innerHTML = studentHtml;
    if (teacherContainer) teacherContainer.innerHTML = studentHtml;

    if (manageContainer) {
        let manageHtml = "";
        announcements.forEach(item => {
            manageHtml += `
                <div class="photo-card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; text-align: left; border: 1px solid rgba(168,85,247,0.3); margin-top: 10px;">
                    <div>
                        <h5 style="font-size: 1rem; color: #e879f9; margin-bottom: 4px;">${item.title} <small style="color: #a78bfa; font-weight: normal;">(${item.time})</small></h5>
                        <p style="font-size: 0.85rem; color: #cbd5e1; padding: 0; text-align: left;">${item.text}</p>
                    </div>
                    <button type="button" onclick="deleteAnnouncement(${item.id})" style="padding: 8px 16px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap; margin-left: 15px;">🗑️ Sil</button>
                </div>
            `;
        });
        manageContainer.innerHTML = manageHtml;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('8d_remembered_user');
    document.querySelectorAll('.portal-screen').forEach(p => p.classList.remove('active'));
    document.getElementById('pin-screen').classList.add('active');
    exitFunMenu();
    clearPin();
}

// ====================================================
// 11. HAREKETLİ KEDİ MANTIĞI & PIN EKRANI 3D EĞİLME
// ====================================================
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let catX = window.innerWidth / 2;
let catY = window.innerHeight / 2;
let idleTimer = null;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const cat = document.getElementById('pet-cat');
    if (cat) {
        cat.classList.remove('sitting');
        cat.classList.add('walking');
    }

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        if (cat) {
            cat.classList.remove('walking');
            cat.classList.add('sitting');
        }
    }, 1500);

    // PIN Ekranı 3D Fare Takip Eğilmesi
    const pinScreen = document.getElementById('pin-screen');
    const card = document.querySelector('.cyber-vault-card');

    if (pinScreen && pinScreen.classList.contains('active') && card) {
        const xAxis = (window.innerWidth / 2 - e.clientX) / 25;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 25;

        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
});

function animateCat() {
    const cat = document.getElementById('pet-cat');
    
    if (cat) {
        const diffX = mouseX - catX;
        const diffY = mouseY - catY;

        catX += diffX * 0.08;
        catY += diffY * 0.08;

        if (diffX < -2) {
            cat.classList.add('flip');
        } else if (diffX > 2) {
            cat.classList.remove('flip');
        }

        cat.style.left = `${catX + 15}px`;
        cat.style.top = `${catY + 15}px`;
    }

    requestAnimationFrame(animateCat);
}

animateCat();
