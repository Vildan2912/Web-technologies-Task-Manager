import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  // Состояния для полей формы регистрации
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Обработчик отправки формы регистрации
  const handleSubmit = (e) => {
    e.preventDefault();
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    if (register(username, email, password)) {
      alert('Регистрация успешна!');
      navigate('/login');  // Успешно → на страницу входа
    } else {
      alert('Пользователь с таким email уже существует');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate__animated animate__fadeIn">
        <div className="auth-header">
          <h2>Регистрация</h2>
          <p>Создайте новый аккаунт</p>
        </div>
        <form id="register-form" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-username">Имя пользователя</label>
            <input
              type="text"
              id="register-username"
              placeholder="Иван Иванов"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              type="email"
              id="register-email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Пароль</label>
            <input
              type="password"
              id="register-password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-confirm-password">Подтверждение пароля</label>
            <input
              type="password"
              id="register-confirm-password"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Зарегистрироваться
          </button>
        </form>
        <div className="auth-footer">
          Уже есть аккаунт? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Войти</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;