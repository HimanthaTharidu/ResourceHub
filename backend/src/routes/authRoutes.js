import express from 'express'
import {signup_get, signup_post, login_get, login_post, logout_post, get_me} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/signup', signup_get)
router.post('/signup', signup_post)
router.get('/login', login_get)
router.post('/login', login_post)
router.post('/logout', logout_post)
router.get('/me', protect, get_me)

export default router