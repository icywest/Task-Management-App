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

export const addTask = (title, description, userId, category, priority, dueDate, status, completionDate = null) => {
  const tasks = getAllTasks();

  // Validate task based on status and due date pointing to the current date
  if (status === 'Completed' && !completionDate) {
    return { error: 'A task with status "Completed" requires a completion date.' };
  }

  const newTask = {
    taskId: tasks.length + 1,
    title,
    description,
    userId: parseInt(userId),
    category,
    priority,
    status,
    dueDate: dueDate || null,
    completionDate: completionDate || null 
  };

  tasks.push(newTask);
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
  return newTask;
};




export const getTaskById = (taskId) => {
  return getAllTasks().find(task => task.taskId === parseInt(taskId));
};

export const getTasksByUserId = (userId) => {
  return getAllTasks().filter(task => task.userId === parseInt(userId));
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


//the logic of the sort compares two pointers to determine the order
export const sortTasks = (tasks, sortBy) => {
  return tasks.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) { 
      return -1;
    }
    if (a[sortBy] > b[sortBy]) {
      return 1;
    }
    return 0;
  });
}

export const filterTasks = (userId, { status, dueDate, search }) => {
  let tasks = getTasksByUserId(userId);
  const today = new Date().toISOString().split("T")[0]; // Get today's date in the format "YYYY-MM-DD" 
  // console.log(new Date().toISOString().split("T"));

  if (status) {
    tasks = tasks.filter(task => task.status === status);
  }

  if (dueDate) {
    if (dueDate === "pastDue") {
      tasks = tasks.filter(task => task.dueDate < today && task.status !== "Completed");
    } else if (dueDate === "lateCompletion") {
      tasks = tasks.filter(task => task.dueDate < today && task.status === "Completed");
    }
  }

  if (search) {
    const lowerSearch = search.toLowerCase();
    tasks = tasks.filter(task => {
      return (task.title && task.title.toLowerCase().includes(lowerSearch)) ||
             (task.description && task.description.toLowerCase().includes(lowerSearch));
    });
  }

  return tasks;
};
