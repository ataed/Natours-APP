const express = require('express');

const router = express.Router();

const {
  getOverview,
  getTour,
  getLoginForm,
  getSignupForm,
  getAccount,
  getMyTours,
  alert,
} = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');

router.use(alert);

router.get('/', isLoggedIn, getOverview);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/signup', isLoggedIn, getSignupForm);
router.get('/tour/:tourSlug', isLoggedIn, getTour);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

module.exports = router;
