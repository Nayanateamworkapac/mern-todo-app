import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function getTaskId(task) {
  return task._id || task.id;
}

const FILTERS = {
  all: t => true,
  active: t => !t.completed,
  completed: t => t.completed,
};

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Fetch tasks
  useEffect(() => {
    setLoading(true);
    axios.get('/tasks')
      .then(res => {
        if (Array.isArray(res.data)) {
          setTasks(res.data);
        } else {
          setTasks([]);
          setError('API did not return an array.');
        }
      })
      .catch(err => {
        setTasks([]);
        setError('Failed to load tasks. Backend may not be running or API route is incorrect.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Add task
  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/tasks', { title: newTask });
      setTasks([...tasks, res.data]);
      setNewTask('');
    } catch (err) {
      setError('Failed to add task.');
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async id => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await axios.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => getTaskId(t) !== id));
    } catch (err) {
      setError('Failed to delete task.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = task => {
    setEditId(getTaskId(task));
    setEditTitle(task.title);
  };

  // Update task
  const updateTask = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`/tasks/${editId}`, { title: editTitle });
      setTasks(tasks.map(t => (getTaskId(t) === editId ? res.data : t)));
      setEditId(null);
      setEditTitle('');
    } catch (err) {
      setError('Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle complete
  const toggleComplete = async task => {
    setLoading(true);
    try {
      const res = await axios.put(`/tasks/${getTaskId(task)}`, { completed: !task.completed });
      setTasks(tasks.map(t => (getTaskId(t) === getTaskId(task) ? res.data : t)));
    } catch (err) {
      setError('Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  // Clear completed
  const clearCompleted = async () => {
    setLoading(true);
    try {
      const completedTasks = tasks.filter(t => t.completed);
      await Promise.all(completedTasks.map(t => axios.delete(`/tasks/${getTaskId(t)}`)));
      setTasks(tasks.filter(t => !t.completed));
    } catch (err) {
      setError('Failed to clear completed tasks.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(FILTERS[filter]);
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;

  return (
    <div className="todo-app rich-ui">
      <h2>To-Do List</h2>
      <div className="stats">
        <span>Total: {total}</span>
        <span>Active: {active}</span>
        <span>Completed: {completed}</span>
      </div>
      <div className="filters">
        <button className={filter==='all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter==='active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
        <button className={filter==='completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
      </div>
      {error && <div style={{color: 'red', margin: '1em 0'}}>{error}</div>}
      {loading && <div className="spinner">Loading...</div>}
      <div className="add-task card">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add new task"
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {filteredTasks.map(task => (
          <li key={getTaskId(task)} className={`task-item card ${task.completed ? 'completed' : ''}`}>
            {editId === getTaskId(task) ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="edit-input"
                />
                <button onClick={updateTask}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className="task-title">{task.title}</span>
                <button onClick={() => toggleComplete(task)}>
                  {task.completed ? 'Mark Active' : 'Complete'}
                </button>
                <button onClick={() => startEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(getTaskId(task))}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="actions">
        <button onClick={clearCompleted} disabled={completed === 0}>Clear Completed</button>
      </div>
    </div>
  );
}

export default TodoApp;
