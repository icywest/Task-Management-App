import fs from 'fs';
import path from 'path';

const usersFilePath = path.join('assets', 'users.json');

const loadUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

export const findUserByUsername = (username) => {
  return loadUsers().find(user => user.username === username);
};

export const findUserById = (userId) => {
  return loadUsers().find(user => user.userId === parseInt(userId));
};

export const addUser = (username, password) => {
  const users = loadUsers();
  const userId = users.length ? users[users.length - 1].userId + 1 : 1;
  const newUser = { userId, username, password };
  users.push(newUser);
  saveUsers(users);
  return userId;
};
