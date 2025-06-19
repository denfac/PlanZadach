document.addEventListener('DOMContentLoaded', function() {
   
    // Элементы DOM
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.getElementById('authContainer');
    const welcomeContainer = document.getElementById('welcomeContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const notificationsContainer = document.getElementById('notifications');
    
    // Данные пользователей (в реальном приложении это было бы на сервере)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    // Проверяем, есть ли авторизованный пользователь
    if (currentUser) {
        showWelcomeScreen(currentUser);
    }
    async function registerUser(userData) {
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        return await response.json();
      }
      
      // Пример использования
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
          name: document.getElementById('regName').value,
          email: document.getElementById('regEmail').value,
          password: document.getElementById('regPassword').value,
          department: document.getElementById('regDepartment').value,
          position: document.getElementById('regPosition').value
        };
        
        try {
          const user = await registerUser(userData);
          console.log('Пользователь зарегистрирован:', user);
          // Дополнительная логика...
        } catch (error) {
          console.error('Ошибка регистрации:', error);
        }
    });


    // Переключение между вкладками входа и регистрации
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    
    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    // Обработка формы входа
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Поиск пользователя
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            }
            
            showWelcomeScreen(user);
            showNotification('Вы успешно вошли в систему!', 'success');
            
            // Переход на другую страницу после успешного входа
            setTimeout(function() {
                window.location.href = "Main.html"; // Замените на нужный URL
            }, 1500); // Задержка 1.5 секунды, чтобы пользователь увидел уведомление
        } else {
            showNotification('Неверный email или пароль', 'error');
        }
    });
    
    // Обработка формы регистрации
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const department = document.getElementById('regDepartment').value;
        const position = document.getElementById('regPosition').value;
        
        // Проверка паролей
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        // Проверка, есть ли уже пользователь с таким email
        if (users.some(u => u.email === email)) {
            showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }
        
        // Создание нового пользователя
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            department,
            position,
            registeredAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showNotification('Регистрация прошла успешно! Теперь вы можете войти.', 'success');
        
        // Переключаем на вкладку входа
        loginTab.click();
        
        // Очищаем форму регистрации
        registerForm.reset();
    });
    
    // Выход из системы
    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        
        authContainer.classList.remove('hidden');
        welcomeContainer.classList.add('hidden');
        
        showNotification('Вы вышли из системы', 'success');
    });
    
    // Показать экран приветствия
    function showWelcomeScreen(user) {
        document.getElementById('welcomeName').textContent = user.name;
        document.getElementById('welcomeEmail').textContent = user.email;
        document.getElementById('welcomeDepartment').textContent = user.department;
        document.getElementById('welcomePosition').textContent = user.position;
        
        const date = new Date(user.registeredAt);
        document.getElementById('welcomeDate').textContent = date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        authContainer.classList.add('hidden');
        welcomeContainer.classList.remove('hidden');
    }
    
    // Показать уведомление
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notificationsContainer.appendChild(notification);
        
        // Автоматическое закрытие уведомления через 5 секунд
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
});