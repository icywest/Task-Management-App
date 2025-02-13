import express from 'express';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userRoutes from './routes/usersRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { findUserByUsername, addUser, checkSession } from './models/user.js';
import { getAllTasks, sortTasks } from './models/task.js';
import Handlebars from "handlebars";

function updateReqMethod(req, res, next) {
  if (req.body && req.body._method) {
      req.method = req.body._method.toUpperCase();
      delete req.body._method;
  }
  next();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 1000;
const HOST = process.env.HOST || '127.0.0.1';
const fetchUrl = `http://${HOST}:${PORT}`;
const server = express();

// Setup the template engine
server.engine('handlebars', engine());
server.set('view engine', 'handlebars');
server.set('views', './views');

// Setup static files and body parsers
server.use(express.static(__dirname + '/public'));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Helper
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  const user = checkSession();

  if (!user) {
    return res.redirect('/');
  }

  req.user = user;

  //console.log(user);

  next();
};

server.use(updateReqMethod);

// Routes
server.use('/user', userRoutes);
server.use('/tasks', taskRoutes);

// Home page according the user id
server.get('/home/:userId', checkAuth,  async (req, res) => {
  const userId = parseFloat(req.params.userId); 
  const { sort, status, dueDate, search } = req.query;

  const user = req.user;

  if(userId != user.userId) {
    return res.redirect(`/home/${user.userId}`);
  }

  try {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    if (dueDate) queryParams.append("dueDate", dueDate);
    if (search) queryParams.append("search", search);

    const response = await fetch(`${fetchUrl}/tasks/tasks/${userId}?${queryParams.toString()}`);
    const tasks = await response.json();

    if (sort) {
      sortTasks(tasks, sort);
      return res.render('home', { tasks, userId, user });
    }

    res.render('home', { tasks, userId, user });
  }
  catch (error) {
    console.error(error);
  }
});

// Add Task Route
server.get('/add-task/:userId/:taskId?', (req, res) => {
  const userId = parseFloat(req.params.userId);

  if (req.params.taskId) {
    const taskId = parseFloat(req.params.taskId);
    const task = getAllTasks().find(task => task.taskId === taskId);
    if (task) {
      return res.render('taskForm', { task, userId });
    } else {
      return res.status(404).render('taskForm', { message: 'Task not found', userId });
    }
  }

  res.render('taskForm', { userId });
});

// View Routes (Home, Logout, etc.)
server.get('/', (req, res) => {
  res.render('login', { title: 'Login / Create Profile' });
});

// 404 Error
server.use((req, res) => {
  res.status(404).render('404');
});

// 500 Error
server.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { err });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
