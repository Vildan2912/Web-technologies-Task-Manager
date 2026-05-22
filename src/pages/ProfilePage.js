import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user, logout, toggleTheme, theme } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Выход из системы
  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
      navigate('/login');
    }
  };

  // Сворачивание/разворачивание сайдбара
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    const app = document.getElementById('app');
    if (app) {
      if (!sidebarCollapsed) {
        app.classList.add('sidebar-collapsed');
      } else {
        app.classList.remove('sidebar-collapsed');
      }
    }
  };

  // Форматирование даты из ISO в ДД.ММ.ГГГГ
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Неизвестно';
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Получаем дату регистрации из localStorage
  const registrationDates = JSON.parse(localStorage.getItem('taskmanager_registration_dates') || '{}');
  const registrationDate = formatDate(registrationDates[user?.email]);

  // Смена пароля: проверка полей и обновление в массиве users
  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Заполните все поля');
      return;
    }
    if (currentPassword !== user.password) {
      alert('Неверный текущий пароль');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    if (newPassword === currentPassword) {
      alert('Новый пароль совпадает с текущим');
      return;
    }

    const users = JSON.parse(localStorage.getItem('taskmanager_users') || '[]');
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;  // Обновляем пароль
      localStorage.setItem('taskmanager_users', JSON.stringify(users));
      alert('Пароль успешно изменён!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Переход на страницу задач
  const goToTasks = (e) => {
    e.preventDefault();
    navigate('/tasks');
  };

  return (
    <div id="app" className={`app logged-in ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Боковое меню */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
        </button>
        
        <div className="sidebar-section">
          <h3 className="sidebar-title">Меню</h3>
          <a href="#" className="nav-link" onClick={goToTasks}>
            <i className="fas fa-tasks"></i><span>Задачи</span>
          </a>
          <a href="#" className="nav-link active" onClick={(e) => e.preventDefault()}>
            <i className="fas fa-user"></i><span>Профиль</span>
          </a>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Настройки</h3>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleTheme(); }}>
            <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
            <span>{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</span>
          </a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <i className="fas fa-sign-out-alt"></i><span>Выйти</span>
          </a>
        </div>
      </aside>

      {/* Основная область контента */}
      <div className="main-container">
        <header className="top-header">
          <h1 className="header-title">Task Manager</h1>
        </header>
        <main className="content-area">
          <h2 className="profile-title">Профиль пользователя</h2>
          
          {/* Информация о пользователе */}
          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-label">Имя пользователя:</span>
              <span className="profile-value">{user?.username || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user?.email || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Дата регистрации:</span>
              <span className="profile-value">{registrationDate}</span>
            </div>
          </div>
          
          {/* Форма смены пароля */}
          <div className="profile-password">
            <div className="profile-field">
              <span className="profile-label">Текущий пароль</span>
            </div>
            <input 
              type="password" 
              className="profile-input" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
            />
            
            <div className="profile-field">
              <span className="profile-label">Новый пароль</span>
            </div>
            <input 
              type="password" 
              className="profile-input" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
            
            <div className="profile-field">
              <span className="profile-label">Подтвердите новый пароль</span>
            </div>
            <input 
              type="password" 
              className="profile-input" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
          
          <button className="btn btn-primary profile-btn" onClick={handleChangePassword}>
            Сменить пароль
          </button>
        </main>
      </div>

      {/* Дополнительные стили для страницы профиля */}
      <style>{`
        .profile-title {
          font-size: 1.4rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 30px;
          margin-top: 10px;
          color: var(--text);
        }
        
        .profile-info {
          margin-bottom: 20px;
        }
        
        .profile-field {
          margin-bottom: 6px;
        }
        
        .profile-label {
          font-weight: 700;
          color: var(--text);
          margin-right: 8px;
        }
        
        .profile-value {
          color: var(--text-light);
          font-weight: 400;
        }
        
        .profile-password {
          margin-bottom: 20px;
        }
        
        .profile-password .profile-label {
          font-weight: 700;
          display: block;
          margin-bottom: 6px;
        }
        
        .profile-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background-color: var(--bg);
          color: var(--text);
          font-size: 0.95rem;
          box-sizing: border-box;
          margin-bottom: 16px;
        }
        
        .profile-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .profile-btn {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;