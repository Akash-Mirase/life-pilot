import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks || data);
      return data;
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally { setLoading(false); }
  }, []);

  const createTask = async (taskData) => {
    try {
      const { data } = await api.post('/tasks', taskData);
      setTasks(prev => [data, ...prev]);
      toast.success('Task created!');
      return { success: true, task: data };
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create task');
      return { success: false };
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => t._id === id ? data : t));
      toast.success('Task updated!');
      return { success: true, task: data };
    } catch (e) {
      toast.error('Failed to update task');
      return { success: false };
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
      return { success: true };
    } catch (e) {
      toast.error('Failed to delete task');
      return { success: false };
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    return updateTask(id, { completed: !task.completed });
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, createTask, updateTask, deleteTask, toggleComplete }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
