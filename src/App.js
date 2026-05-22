import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import './css/main.css';
import './css/auth.css';
import './css/tasks.css';
import './css/calendar.css';

// Компонент маршрутизации с проверкой авторизации
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Если пользователь не авторизован — показываем страницу логина, иначе перенаправляем на задачи */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/tasks" />} />
      {/* Если пользователь не авторизован — показываем страницу регистрации, иначе на задачи */}
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/tasks" />} />
      {/* Если пользователь авторизован — показываем страницу задач, иначе на логин */}
      <Route path="/tasks" element={user ? <TasksPage /> : <Navigate to="/login" />} />
      {/* Если пользователь авторизован — показываем страницу профиля, иначе на логин */}
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
      {/* Корневой путь: редирект в зависимости от авторизации */}
      <Route path="/" element={<Navigate to={user ? "/tasks" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    // Оборачиваем в роутер для навигации между страницами
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;