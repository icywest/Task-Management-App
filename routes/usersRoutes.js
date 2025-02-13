import express from 'express';
import { findUserByUsername, addUser, storeSessions,logout, checkSession } from '../models/user.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password, action } = req.body;
  const userSession = checkSession();

  if (userSession) {
    return res.render('login', { message: 'There is a session running. Please log out first.', alertType: 'error' });
  }

  if (action === 'login') {
    const user = findUserByUsername(username);

    storeSessions(user);

    if (!user) {
      return res.render('login', { message: 'User does not exist.', alertType: 'error' });
    }

    if (user.password !== password) {
      return res.render('login', { message: 'Incorrect password!', alertType: 'error' });
    }

    res.redirect(`/home/${user.userId}`);
    
  } else if (action === 'create') {
    if (findUserByUsername(username)) {
      return res.render('login', { message: 'User already exists!', alertType: 'error' });
    }

    if (userSession) {
      return res.render('login', { message: 'There is a session running. Please log out first.', alertType: 'error' });
    }

    const user = addUser(username, password);
    storeSessions(user);

    res.redirect(`/home/${user.userId}`);
  }
});

router.post('/logout', (req, res) => {
  logout();
  res.redirect('/');
});

export default router;
