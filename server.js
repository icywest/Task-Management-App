import express from 'express';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userRoutes from './routes/usersRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { findUserByUsername, addUser } from './models/user.js';  // Adjusted for your structure
import { getAllTasks } from './models/task.js';
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

// Middleware to check authentication (via URL params)
const checkAuth = (req, res, next) => {
  const { userId } = req.params;
  const user = findUserByUsername(userId); // Find user by ID
  if (!user) {
    return res.redirect('/'); // Redirect if user does not exist
  }
  else{
    res.redirect('/home/:userId');
  }
  next();
};

server.use(updateReqMethod);

// Routes
server.use('/user', userRoutes);
server.use('/tasks', taskRoutes);


server.get('/home/:userId',(req, res) => {
  const userId = parseFloat(req.params.userId); 
  const tasks = getAllTasks().filter(task => task.userId === userId); 
  res.render('home', { tasks, userId });
});

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



// User Routes (Inside routes/usersRoutes.js)
server.post('/login', (req, res) => {
  const { username, password, action } = req.body;

  if (action === '/home/:userId') {
    const user = findUserByUsername(username);
    if (!user) {
      return res.render('login', {
        title: 'Login / Create Profile',
        message: 'User does not exist. Please create an account.',
        alertType: 'error',
      });
    }

    if (user.password !== password) {
      return res.render('login', {
        title: 'Login / Create Profile',
        message: 'Incorrect password! Please try again.',
        alertType: 'error',
      });
    }

    // Redirect to home with userId as URL parameter
    res.redirect(`/home/:userId`);

  } else if (action === 'create') {
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return res.render('login', {
        title: 'Login / Create Profile',
        message: 'User already exists! Try a different username.',
        alertType: 'error',
      });
    }

    // Create a new user and redirect to home with the new userId
    const userId = addUser(username, password);
    res.redirect(`/home/${userId}`);
  }
});

// View Routes (Home, Logout, etc.)
server.get('/', (req, res) => {
  res.render('login', { title: 'Login / Create Profile' });
});

server.post('/add-task/:id', checkAuth, (req, res) => {
  const { title, description, category } = req.body;
  const { id: userId } = req.params;

  if (!title || !description || !category) {
    return res.render('addTask', { title: 'Add Task', userId, message: 'Please provide all task details.' });
  }

  addTask(userId, title, description, category);
  res.redirect(`/home/${userId}`);
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
