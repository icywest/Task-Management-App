import fs from 'fs';
import path from 'path';

const usersFilePath = path.join('assets', 'users.json');
const userSession = path.join('assets', 'session.json');

// Render Users
const loadUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

// Store new user in the json file
const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Save the user's sesssion to the session json file
export const storeSessions = (user) => {
  fs.writeFileSync(userSession, JSON.stringify(user, null, 2));
}

// Check if there is an active session in the json file
export const checkSession = () => {
  const user = JSON.parse(fs.readFileSync(userSession, 'utf8'));

  // Check if the parsed user is an empty array or object
  if (!user || (Array.isArray(user) && user.length === 0) || (typeof user === 'object' && Object.keys(user).length === 0)) {
    return null;
  }

  return user;
}

// Logout the user by clearing the session json file
export const logout = () => {
  fs.writeFileSync(userSession, JSON.stringify([], null, 2));
}

// Find user by username
export const findUserByUsername = (username) => {
  return loadUsers().find(user => user.username === username);
};

// Find user by id
export const findUserById = (userId) => {
  return loadUsers().find(user => user.userId === parseInt(userId));
};


// Add a new user to the JSON file
export const addUser = (username, password) => {
  const users = loadUsers();
  const userId = users.length ? users[users.length - 1].userId + 1 : 1;
  const newUser = { userId, username, password };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};
