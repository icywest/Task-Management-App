import express from 'express';
import { findUserByUsername, addUser } from '../models/user.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password, action } = req.body;

  if (action === 'login') {
    const user = findUserByUsername(username);
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

    const userId = addUser(username, password);
    res.redirect(`/home/${userId}`);
  }
});

export default router;
