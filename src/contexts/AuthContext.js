import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаём контекст для авторизации
const AuthContext = createContext();

// Ключи для хранения данных в localStorage
const STORAGE_KEYS = {
  USERS: 'taskmanager_users',           // массив всех пользователей
  AUTH: 'taskmanager_auth',             // текущий авторизованный пользователь
  REG_DATES: 'taskmanager_registration_dates', // даты регистрации
  THEME: 'taskmanager_theme',           // светлая/тёмная тема
  VIEW: 'taskmanager_view',             // выбранное представление (доска/список/календарь)
  SORT: 'taskmanager_sort',             // тип сортировки задач
  SIDEBAR: 'sidebarCollapsed'           // состояние сайдбара (свёрнут/развёрнут)
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE_KEYS.THEME) || 'light');

  // При монтировании: загружаем сохранённого пользователя из localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // При изменении темы: применяем класс к body и сохраняем в localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Авторизация: ищем пользователя в массиве users по email и паролю
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  // Регистрация: создаём нового пользователя, проверяем уникальность email
  const register = (username, email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    // Проверка на существующего пользователя
    if (users.find(u => u.email === email)) return false;

    const registrationDates = JSON.parse(localStorage.getItem(STORAGE_KEYS.REG_DATES)) || {};
    const newUser = { username, email, password };
    users.push(newUser);
    registrationDates[email] = new Date().toISOString().split('T')[0];  // Сохраняем дату регистрации

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.REG_DATES, JSON.stringify(registrationDates));
    return true;
  };

  // Выход из системы: очищаем состояние и localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  // Переключение между светлой и тёмной темой
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, toggleTheme, theme }}>
      {children}
    </AuthContext.Provider>
  );
}

// Хук для удобного доступа к контексту авторизации
export function useAuth() {
  return useContext(AuthContext);
}