import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  // Состояния для полей ввода
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();  // Отменяем перезагрузку страницы
    if (login(email, password)) {
      navigate('/tasks');  // Успешно → на страницу задач
    } else {
      alert('Неверный email или пароль');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate__animated animate__fadeIn">
        <div className="auth-header">
          <h2>Task Manager</h2>
          <p>Войдите в свой аккаунт</p>
        </div>
        <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}  // Двустороннее связывание
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              type="password"
              id="login-password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Войти
          </button>
        </form>
        <div className="auth-footer">
          Нет аккаунта? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Зарегистрироваться</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;