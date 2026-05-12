// ----- Управление вкладками (переключение форм) -----
const loginPanel = document.getElementById('loginForm');
const registerPanel = document.getElementById('registerForm');
const loginTab = document.getElementById('loginTabBtn');
const regTab = document.getElementById('registerTabBtn');
const switchToRegister = document.getElementById('switchToRegisterBtn');
const switchToLogin = document.getElementById('switchToLoginBtn');

function setActiveTab(isLoginActive) {
    if (isLoginActive) {
        loginPanel.classList.remove('hidden');
        registerPanel.classList.add('hidden');
        loginTab.classList.add('active');
        regTab.classList.remove('active');
        hideLoginError();
        hideRegisterError();
    } else {
        loginPanel.classList.add('hidden');
        registerPanel.classList.remove('hidden');
        regTab.classList.add('active');
        loginTab.classList.remove('active');
        hideLoginError();
        hideRegisterError();
    }
}

loginTab.addEventListener('click', () => setActiveTab(true));
regTab.addEventListener('click', () => setActiveTab(false));
if (switchToRegister) switchToRegister.addEventListener('click', () => setActiveTab(false));
if (switchToLogin) switchToLogin.addEventListener('click', () => setActiveTab(true));

function showLoginError(message) {
    const errDiv = document.getElementById('loginError');
    errDiv.innerText = message;
    errDiv.classList.remove('hidden');
}
function hideLoginError() {
    const errDiv = document.getElementById('loginError');
    errDiv.classList.add('hidden');
    errDiv.innerText = '';
}
function showRegisterError(message) {
    const errDiv = document.getElementById('registerError');
    errDiv.innerText = message;
    errDiv.classList.remove('hidden');
}
function hideRegisterError() {
    const errDiv = document.getElementById('registerError');
    errDiv.classList.add('hidden');
    errDiv.innerText = '';
}

// ----- имитация бэкенда (локальное хранилище для демо) -----
function getStoredUsers() {
    const users = localStorage.getItem('movie_scout_users');
    return users ? JSON.parse(users) : [];
}

function storeUsers(users) {
    localStorage.setItem('movie_scout_users', JSON.stringify(users));
}

function addUser(email, password, name) {
    const users = getStoredUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;
    users.push({ email: email.trim().toLowerCase(), password: password, name: name.trim() });
    storeUsers(users);
    return true;
}

function validateUser(email, password) {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase() && u.password === password);
    return user ? true : false;
}

function simulateLoginSuccess(redirectAfter = true) {
    localStorage.setItem('movie_scout_logged_in', 'true');
    alert('✅ Добро пожаловать в КиноСоветник! Выполнен вход.\n(В реальном приложении произойдёт редирект на главную)');
    if (redirectAfter) {
        // перенаправляем на главную через секунду
        setTimeout(() => {
            window.location.href = '/';
        }, 800);
    }
}

// ---- ОБРАБОТЧИК ВХОДА ----
const loginBtn = document.getElementById('doLoginBtn');
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    hideLoginError();
    if (!email || !password) {
        showLoginError('Пожалуйста, заполните почту и пароль.');
        return;
    }

    const isValid = validateUser(email, password);
    if (isValid) {
        localStorage.setItem('current_user_email', email);
        simulateLoginSuccess(true);
    } else {
        showLoginError('Неверная почта или пароль. Попробуйте ещё раз или зарегистрируйтесь.');
    }
});

// ---- ОБРАБОТЧИК РЕГИСТРАЦИИ ----
const registerBtn = document.getElementById('doRegisterBtn');
registerBtn.addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;

    hideRegisterError();

    if (!name || !email || !password || !confirm) {
        showRegisterError('Все поля обязательны для заполнения.');
        return;
    }
    if (password.length < 6) {
        showRegisterError('Пароль должен содержать минимум 6 символов.');
        return;
    }
    if (password !== confirm) {
        showRegisterError('Пароли не совпадают.');
        return;
    }
    const emailRegex = /^[^\s@@]+@@([^\s@@.,]+\.)+[^\s@@.,]{2,}$/;
    if (!emailRegex.test(email)) {
        showRegisterError('Введите корректный email (например, name@domain.ru).');
        return;
    }

    const success = addUser(email, password, name);
    if (success) {
        alert('🎉 Регистрация прошла успешно! Теперь вы можете войти.');
        setActiveTab(true);
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = '';
        hideRegisterError();
    } else {
        showRegisterError('Пользователь с таким email уже существует. Войдите в аккаунт.');
    }
});

// ---------- соцсети (демо) ----------
const googleBtn = document.getElementById('googleMockBtn');
const vkBtn = document.getElementById('vkMockBtn');
const googleRegBtn = document.getElementById('googleRegMockBtn');
const vkRegBtn = document.getElementById('vkRegMockBtn');

function socialAuth(provider) {
    alert(`🔐 ${provider} авторизация в демо-режиме.\nВ реальном проекте здесь будет OAuth-редирект.`);
    localStorage.setItem('movie_scout_logged_in', 'true');
    localStorage.setItem('current_user_email', `${provider.toLowerCase()}_demo@kinoscout.ru`);
    simulateLoginSuccess(true);
}

if (googleBtn) googleBtn.addEventListener('click', () => socialAuth('Google'));
if (vkBtn) vkBtn.addEventListener('click', () => socialAuth('VK'));
if (googleRegBtn) googleRegBtn.addEventListener('click', () => socialAuth('Google'));
if (vkRegBtn) vkRegBtn.addEventListener('click', () => socialAuth('VK'));

// кнопка "На главную" работает через ссылку, но добавим обработчик для уверенности
const backBtn = document.getElementById('backHomeBtn');
if (backBtn) {
    backBtn.addEventListener('click', (e) => {
        // стандартное поведение ссылки уже ведёт на "/", но можно дополнить логом
        console.log('Возврат на главную страницу');
    });
}

console.log('Для сброса сессии в консоли вызовите demoClearSession()');
window.demoClearSession = () => {
    localStorage.removeItem('movie_scout_logged_in');
    localStorage.removeItem('current_user_email');
    alert('Сессия сброшена (только для теста)');
};