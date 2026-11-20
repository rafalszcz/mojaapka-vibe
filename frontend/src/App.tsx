import React, { useEffect, useState } from 'react';
import type { TaskItem } from './types';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, AlertCircle, RefreshCw, Sun, Moon } from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed';

export function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError('Nie udało się połączyć z serwerem API. Upewnij się, że backend działa pod adresem http://localhost:5217.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      const created = await createTask(newTitle.trim());
      setTasks([...tasks, created]);
      setNewTitle('');
      setError(null);
    } catch (err) {
      setError('Nie udało się dodać zadania.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task: TaskItem) => {
    try {
      const updated = await updateTask({ ...task, isCompleted: !task.isCompleted });
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      setError('Nie udało się zaktualizować statusu zadania.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError('Nie udało się usunąć zadania.');
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-10 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl shadow-md">
              <ListTodo className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Menadżer Zadań</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Aplikacja Full-Stack (.NET 8 & React)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition border border-slate-200 dark:border-slate-800 shadow-sm"
              title="Przełącz tryb ciemny/jasny"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={fetchTasks}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition border border-slate-200 dark:border-slate-800 shadow-sm"
              title="Odśwież"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300 shadow-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {/* Add Task Form */}
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Co jest do zrobienia?..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newTitle.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Dodaj</span>
          </button>
        </form>

        {/* Filters and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 px-2">
          <div className="flex gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Wszystkie ({totalCount})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Aktywne ({totalCount - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Ukończone ({completedCount})
            </button>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Ukończone: {completedCount} / {totalCount}
          </span>
        </div>

        {/* Task List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {loading && tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Ładowanie zadań...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Brak zadań w tej kategorii</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Zmień filtr lub dodaj nowe zadanie.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                  task.isCompleted ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''
                }`}
              >
                <div
                  onClick={() => handleToggle(task)}
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className={`text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
                      task.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-50 dark:fill-emerald-950/50 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <span
                    className={`text-sm font-medium transition ${
                      task.isCompleted
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                  title="Usuń zadanie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          Zbudowano przy użyciu .NET 8 Web API, React, Vite oraz Tailwind CSS.
        </div>
      </div>
    </div>
  );
}

export default App;
