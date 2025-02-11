import fs from 'fs';
import path from 'path';

const tasksFilePath = path.join('assets', 'tasks.json');

export const getAllTasks = () => {
  try {
    return JSON.parse(fs.readFileSync(tasksFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

export const addTask = (title, description, userId, category, priority, dueDate, status) => {
  const tasks = getAllTasks();
  const newTask = {
    taskId: tasks.length + 1,
    title,
    description,
    userId: parseInt(userId),
    category,
    priority,
    status,
    dueDate: dueDate || null
  };
  tasks.push(newTask);
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
  return newTask;
};

export const getTaskById = (taskId) => {
  return getAllTasks().find(task => task.taskId === parseInt(taskId));
};

export const updateTask = (taskId, updatedFields) => {
  const tasks = getAllTasks();
  const index = tasks.findIndex(task => task.taskId === parseInt(taskId));

  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updatedFields };
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
    return tasks[index];
  }
  return null;
};

export const deleteTask = (taskId) => {
  let tasks = getAllTasks();
  tasks = tasks.filter(task => task.taskId !== parseInt(taskId));
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};
