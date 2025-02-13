import {Router} from 'express';
import { addTask, getAllTasks, updateTask, deleteTask, getTaskById, getTasksByUserId, filterTasks } from '../models/task.js';


const router = Router();

//Get all tasks by user
router.get('/tasks/:userId', (req, res) => {
  const { userId } = req.params;
  const { status, dueDate, search } = req.query; 

  let tasks;

  if (status || dueDate || search) {
    tasks = filterTasks(userId, { status, dueDate, search });
  } else {
    tasks = getTasksByUserId(userId).filter(task => task.status !== "Completed");
  }

  res.json(tasks);
});

//Add tasks by user
router.post('/tasks/:userId', (req, res) => {
  const { userId } = req.params;
  const { title, description, category, priority, status, dueDate, completionDate } = req.body;

  const task = addTask(title, description, userId, category, priority, dueDate, status, completionDate);

  if (task.error) {
    res.render('taskForm', { message: task.error, userId });
  } else {
    res.redirect(`/home/${userId}`);
  }
});


// Update or edit a task by user
router.put('/tasks/:userId/:taskId', (req, res) => {
  const { userId, taskId } = req.params; 
  const { title, description, category, priority, status, dueDate, completionDate } = req.body;

  let updatedFields = {};

  if (status) {
    updatedFields.status = status;
    if (status === 'Completed') {
      // Mark completion date as current date when clicking on the complete button
      updatedFields.completionDate = new Date().toISOString().split("T")[0];
    }
  }

  if (title) updatedFields.title = title;
  if (description) updatedFields.description = description;
  if (category) updatedFields.category = category;
  if (priority) updatedFields.priority = priority;
  if (dueDate) updatedFields.dueDate = dueDate;

  // Ensure that completionDate can be set if provided in the request body.
  if (completionDate) {
    updatedFields.completionDate = completionDate;
  }

  const updatedTask = updateTask(taskId, updatedFields);

  if (updatedTask) {
    res.redirect(`/home/${userId}`);
  } else {
    res.status(404).send('Task not found');
  }
});


// Delete a task by user
router.delete('/tasks/:userId/:taskId', (req, res) => {
  const { userId, taskId } = req.params;

  deleteTask(taskId);
  res.redirect(`/home/${userId}`);
});

export default router;