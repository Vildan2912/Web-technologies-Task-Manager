import React, { useState } from 'react';

function Calendar({ tasks, onEditTask }) {
  // Состояния для текущего месяца и года
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Проверка просрочки задачи (дедлайн < сегодня)
  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  // Получение задач на конкретную дату
  const getTasksForDate = (dateStr) => {
    return tasks.filter(task => task.deadline === dateStr);
  };

  // Генерация массива дней для текущего месяца
  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    // День недели первого дня месяца (Пн=0, Вс=6)
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = lastDay.getDate();

    const days = [];
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ empty: true });
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateStr = date.toISOString().split('T')[0];  // YYYY-MM-DD
      const dayTasks = getTasksForDate(dateStr);

      days.push({
        date: i,
        isToday: date.getDate() === today.getDate() &&
                 date.getMonth() === today.getMonth() &&
                 date.getFullYear() === today.getFullYear(),
        tasks: dayTasks,
        dateStr
      });
    }
    return days;
  };

  // Переключение месяца (вперёд/назад)
  const changeMonth = (offset) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth > 11) {  // Переход на следующий год
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {  // Переход на предыдущий год
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Возврат к текущему месяцу
  const resetToToday = () => {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  // CSS-класс приоритета для задачи в календаре
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'Высокий': return 'high';
      case 'Средний': return 'medium';
      default: return 'low';
    }
  };

  const days = renderCalendar();

  return (
    <div className="calendar-view">
      {/* Заголовок календаря с навигацией */}
      <div className="calendar-header">
        <h2 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h2>
        <div className="calendar-nav">
          <button className="btn btn-outline" onClick={() => changeMonth(-1)}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="btn btn-outline" onClick={resetToToday}>
            Сегодня
          </button>
          <button className="btn btn-outline" onClick={() => changeMonth(1)}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Сетка календаря */}
      <div className="calendar-grid">
        {/* Дни недели */}
        {dayNames.map(day => <div key={day} className="calendar-day-header">{day}</div>)}

        {/* Ячейки дней месяца */}
        {days.map((day, index) => (
          day.empty ? (
            <div key={index} className="calendar-day empty"></div>
          ) : (
            <div key={index} className={`calendar-day ${day.isToday ? 'today' : ''}`}>
              <div className="calendar-date">{day.date}</div>
              <div className="calendar-tasks">
                {day.tasks.map(task => {
                  const overdue = !task.completed && isOverdue(task.deadline);
                  return (
                    <div 
                      key={task.id} 
                      className={`calendar-task ${getPriorityClass(task.priority)} ${overdue ? 'calendar-task-overdue' : ''}`}
                      onClick={() => onEditTask(task)}
                    >
                      {task.title}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default Calendar;