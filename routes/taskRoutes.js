import {Router} from 'express';
import { addTask, getAllTasks, updateTask, deleteTask, getTaskById } from '../models/task.js';


const router = Router();

router.get('/tasks/:userId', (req, res) => {
  const { userId } = req.params;
  const tasks = getAllTasks();
  res.json(tasks);
});

router.post('/tasks/:userId', (req, res) => {
  const { userId } = req.params;
  const {title, description, category, priority, status, dueDate} = req.body;
  addTask(title, description, userId, category, priority, dueDate, status);

  res.redirect(`/home/${userId}`);
});

router.put('/tasks/:userId/:taskId', (req, res) => {
  const { userId, taskId } = req.params; 
  const { title, description, category, priority, status, dueDate } = req.body;  

  const updatedFields = {
    title,
    description,
    category,
    priority,
    status,
    dueDate: dueDate || null  
  };

  const updatedTask = updateTask(taskId, updatedFields);

  if (updatedTask) {
    res.redirect(`/home/${userId}`);
  } else {
    res.status(404).send('Task not found');
  }
});

router.delete('/tasks/:userId/:taskId', (req, res) => {
  const { userId, taskId } = req.params;

  deleteTask(taskId);
  res.redirect(`/home/${userId}`);
});


export default router;
