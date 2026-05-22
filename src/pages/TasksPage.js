import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Calendar from '../components/Calendar';

function TasksPage() {
  const { user, logout, toggleTheme, theme } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('board');
  const [sort, setSort] = useState('none');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Состояния для API запросов
  const [currency, setCurrency] = useState('Загрузка...');
  const [weather, setWeather] = useState('Загрузка погоды...');

  // Загрузка задач пользователя из localStorage
  useEffect(() => {
    if (user) {
      const allTasks = JSON.parse(localStorage.getItem('taskmanager_tasks') || '{}');
      setTasks(allTasks[user.email] || []);
    }
  }, [user]);

	// Загрузка курса валют (USD, EUR, CNY)
	useEffect(() => {
	  let isActive = true;

	  const fetchCurrency = async () => {
		try {
		  const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
		  if (!response.ok) throw new Error('Ошибка загрузки');
		  const data = await response.json();
		  if (isActive) {
			const usd = data.Valute.USD.Value.toFixed(2);
			const eur = data.Valute.EUR.Value.toFixed(2);
			const cny = data.Valute.CNY.Value.toFixed(2);
			
			setCurrency(`💵 USD: ${usd} ₽ | 💶 EUR: ${eur} ₽ | ¥ CNY: ${cny} ₽`);
		  }
		} catch (error) {
		  if (isActive) {
			console.error('Не удалось загрузить курс валют:', error);
			setCurrency('⚠️ Курс валют временно недоступен');
		  }
		}
	  };

	  fetchCurrency();

	  return () => {
		isActive = false;
	  };
	}, []);

  // Загрузка погоды в Казани (подробная)
	useEffect(() => {
	  let isActive = true;

	  const fetchWeather = async () => {
		try {
		  // Запрашиваем текущую погоду + почасовой прогноз для определения восхода/заката
		  const response = await fetch(
			'https://api.open-meteo.com/v1/forecast?latitude=55.79&longitude=49.12&current_weather=true&daily=sunrise,sunset&timezone=Europe/Moscow'
		  );
		  if (!response.ok) throw new Error('Ошибка сети');
		  const data = await response.json();
		  if (isActive) {
			const temperature = Math.round(data.current_weather.temperature);
			const windSpeed = data.current_weather.windspeed;
			const windDirection = data.current_weather.winddirection;
			const weatherCode = data.current_weather.weathercode;
			
			// Определение состояния погоды по коду WMO
			const getWeatherDescription = (code) => {
			  const weatherMap = {
				0: '☀️ Ясно',
				1: '🌤️ Преимущественно ясно',
				2: '⛅ Переменная облачность',
				3: '☁️ Пасмурно',
				45: '🌫️ Туман',
				51: '🌧️ Морось',
				61: '🌧️ Дождь',
				71: '🌨️ Снег',
				80: '🌦️ Ливень',
				95: '⛈️ Гроза'
			  };
			  return weatherMap[code] || '🌡️ Облачно';
			};
			
			// Определение направления ветра
			const getWindDirection = (degrees) => {
			  const directions = ['⬆️ С', '↗️ СВ', '➡️ В', '↘️ ЮВ', '⬇️ Ю', '↙️ ЮЗ', '⬅️ З', '↖️ СЗ'];
			  const index = Math.round(degrees / 45) % 8;
			  return directions[index];
			};
			
			// Форматирование времени (восход/закат)
			const sunrise = data.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '--:--';
			const sunset = data.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '--:--';
			
			setWeather(
			  `${getWeatherDescription(weatherCode)} | 🌡️ ${temperature}°C | ` +
			  `💨 ${windSpeed} м/с (${getWindDirection(windDirection)}) | ` +
			  `🌅 Восход: ${sunrise} | 🌇 Закат: ${sunset}`
			);
		  }
		} catch (error) {
		  if (isActive) {
			console.error('Не удалось загрузить погоду:', error);
			setWeather('⚠️ Погода временно недоступна');
		  }
		}
	  };

	  fetchWeather();

	  return () => {
		isActive = false;
	  };
	}, []);

  // Сохранение задач в localStorage
  const saveTasks = (newTasks) => {
    if (!user) return;
    const allTasks = JSON.parse(localStorage.getItem('taskmanager_tasks') || '{}');
    allTasks[user.email] = newTasks;
    localStorage.setItem('taskmanager_tasks', JSON.stringify(allTasks));
    setTasks(newTasks);
  };

  // Создание новой задачи
  const addTask = (taskData) => {
    const newTask = { id: Date.now(), ...taskData, completed: false };
    saveTasks([...tasks, newTask]);
  };

  // Обновление существующей задачи
  const updateTask = (id, updates) => {
    const newTasks = tasks.map(task => task.id === id ? { ...task, ...updates } : task);
    saveTasks(newTasks);
  };

  // Удаление задачи
  const deleteTask = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      saveTasks(tasks.filter(task => task.id !== id));
    }
  };

  // Переключение статуса задачи
  const toggleTaskStatus = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { completed: !task.completed });
    }
  };

  // Проверка просрочки задачи
  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  // Сортировка задач
  const getSortedTasks = () => {
    const tasksCopy = [...tasks];
    const priorityOrder = { 'Низкий': 1, 'Средний': 2, 'Высокий': 3 };
    
    switch(sort) {
      case 'priority-asc':
        return tasksCopy.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'priority-desc':
        return tasksCopy.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'deadline-asc':
        return tasksCopy.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
      case 'deadline-desc':
        return tasksCopy.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        });
      case 'title-asc':
        return tasksCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return tasksCopy.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return tasksCopy;
    }
  };

  const sortedTasks = getSortedTasks();
  const pendingTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  // Форматирование даты
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
      navigate('/login');
    }
  };

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

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  // Компонент карточки задачи
  const TaskCard = ({ task }) => {
    const overdue = !task.completed && isOverdue(task.deadline);
    
    return (
      <div className={`task-card ${overdue ? 'task-overdue' : ''}`}>
        <div className="task-title">{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          <span className={`task-priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}>
            {task.priority}
          </span>
          {task.deadline && (
            <span className={overdue ? 'deadline-overdue' : ''}>
              <i className="far fa-calendar-alt"></i> {formatDate(task.deadline)}
            </span>
          )}
        </div>
        <div className="task-actions">
          <button className="task-btn" onClick={() => toggleTaskStatus(task.id)} title={task.completed ? 'Вернуть' : 'Выполнить'}>
            <i className={`fas fa-${task.completed ? 'undo' : 'check'}`}></i>
          </button>
          <button className="task-btn" onClick={() => openEditModal(task)} title="Редактировать">
            <i className="fas fa-edit"></i>
          </button>
          <button className="task-btn" onClick={() => deleteTask(task.id)} title="Удалить">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    );
  };

  // Модальное окно для создания/редактирования задачи
  const TaskModal = () => {
    const [title, setTitle] = useState(editingTask?.title || '');
    const [description, setDescription] = useState(editingTask?.description || '');
    const [priority, setPriority] = useState(editingTask?.priority || 'Средний');
    const [deadline, setDeadline] = useState(editingTask?.deadline || '');

    useEffect(() => {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || '');
        setPriority(editingTask.priority);
        setDeadline(editingTask.deadline || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('Средний');
        setDeadline('');
      }
    }, [editingTask]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!title) {
        alert('Название задачи обязательно');
        return;
      }
      if (editingTask) {
        updateTask(editingTask.id, { title, description, priority, deadline });
      } else {
        addTask({ title, description, priority, deadline });
      }
      setModalOpen(false);
      setEditingTask(null);
    };

    if (!modalOpen) return null;

    return (
      <div className="modal-overlay" onClick={() => { setModalOpen(false); setEditingTask(null); }}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingTask ? 'Редактировать задачу' : 'Создать задачу'}</h3>
            <button className="modal-close" onClick={() => { setModalOpen(false); setEditingTask(null); }}>&times;</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="task-title">Название задачи *</label>
                <input type="text" id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="task-desc">Описание</label>
                <textarea id="task-desc" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-priority">Приоритет</label>
                  <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Низкий">Низкий</option>
                    <option value="Средний">Средний</option>
                    <option value="Высокий">Высокий</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="task-deadline">Дедлайн</label>
                  <input type="date" id="task-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingTask(null); }}>Отмена</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Сохранить' : 'Создать'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
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
          <a href="#" className="nav-link active" onClick={(e) => e.preventDefault()}>
            <i className="fas fa-tasks"></i><span>Задачи</span>
          </a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
            <i className="fas fa-user"></i><span>Профиль</span>
          </a>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Представления</h3>
          <a href="#" className={`nav-link view-link ${view === 'board' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('board'); }}>
            <i className="fas fa-table-cells"></i><span>Доска</span>
          </a>
          <a href="#" className={`nav-link view-link ${view === 'list' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('list'); }}>
            <i className="fas fa-list"></i><span>Список</span>
          </a>
          <a href="#" className={`nav-link view-link ${view === 'calendar' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('calendar'); }}>
            <i className="fas fa-calendar"></i><span>Календарь</span>
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
          <div className="header-top">
            <h1 className="header-title">Task Manager</h1>
            <button className="btn btn-primary new-task-btn" onClick={() => { setEditingTask(null); setModalOpen(true); }}>
              <i className="fas fa-plus"></i> Новая задача
            </button>
          </div>
        </header>

        <main className="content-area">
          {/* Блок сортировки */}
          <div className="sort-controls">
            <label htmlFor="sort-select">Сортировать по:</label>
            <select id="sort-select" className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="none">Без сортировки</option>
              <option value="priority-asc">Приоритет (возр.)</option>
              <option value="priority-desc">Приоритет (убыв.)</option>
              <option value="deadline-asc">Дедлайн (ближ.)</option>
              <option value="deadline-desc">Дедлайн (дальн.)</option>
              <option value="title-asc">Название (А-Я)</option>
              <option value="title-desc">Название (Я-А)</option>
            </select>
          </div>

          {/* Блок с курсом валют (API) */}
          <div className="currency-card">
            <i className="fas fa-chart-line"></i>
            <div className="currency-content">
              <span className="currency-label">Курс валют (ЦБ РФ)</span>
              <p className="currency-data">{currency}</p>
            </div>
          </div>

          {/* Блок с погодой в Казани (API) */}
          <div className="weather-card">
            <i className="fas fa-cloud-sun-rain"></i>
            <div className="weather-content">
              <span className="weather-label">Погода в Казани</span>
              <p className="weather-data">{weather}</p>
            </div>
          </div>

          {/* Представление: Доска */}
          {view === 'board' && (
            <div className="board-view">
              <div className="board-column">
                <div className="column-title">Новые</div>
                {pendingTasks.map(task => <TaskCard key={task.id} task={task} />)}
                {pendingTasks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>Нет задач</p>}
              </div>
              <div className="board-column">
                <div className="column-title">Выполненные</div>
                {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
                {completedTasks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>Нет выполненных задач</p>}
              </div>
            </div>
          )}

          {/* Представление: Список */}
          {view === 'list' && (
            <div className="list-view">
              <div className="list-header">
                <div>Задача</div><div>Приоритет</div><div>Срок</div><div>Действия</div>
              </div>
              {sortedTasks.map(task => {
                const overdue = !task.completed && isOverdue(task.deadline);
                return (
                  <div className={`list-item ${overdue ? 'list-item-overdue' : ''}`} key={task.id}>
                    <div className={`list-item-title ${overdue ? 'text-overdue' : ''}`}>{task.title}</div>
                    <div><span className={`task-priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}>{task.priority}</span></div>
                    <div className={overdue ? 'deadline-overdue' : ''}>{task.deadline ? formatDate(task.deadline) : '-'}</div>
                    <div className="list-item-actions">
                      <button className="task-btn" onClick={() => toggleTaskStatus(task.id)}><i className={`fas fa-${task.completed ? 'undo' : 'check'}`}></i></button>
                      <button className="task-btn" onClick={() => openEditModal(task)}><i className="fas fa-edit"></i></button>
                      <button className="task-btn" onClick={() => deleteTask(task.id)}><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                );
              })}
              {sortedTasks.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Нет задач. Создайте первую задачу!</p>}
            </div>
          )}

          {/* Представление: Календарь */}
          {view === 'calendar' && (
            <Calendar tasks={sortedTasks} onEditTask={openEditModal} />
          )}
        </main>
      </div>

      {/* Модальное окно */}
      <TaskModal />
    </div>
  );
}

export default TasksPage;