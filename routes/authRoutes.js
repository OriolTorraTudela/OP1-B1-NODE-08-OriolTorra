const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { register, login, me, checkPermission } = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('password mínim 6 caràcters')
], register);

router.post('/login', login);

router.get('/me', auth, me);

router.post('/check-permission', auth, checkPermission);

module.exports = router;
