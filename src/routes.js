import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import AdminController from './app/controllers/AdminController';

const upload = multer(multerConfig);
const routes = new Router();

// LOGIN ROUTE
routes.post('/sessions', SessionController.store);

// AUTH MIDDLEWARE
routes.use(authMiddleware);

// ADMIN ROUTES
routes.get('/admins', AdminController.index);
routes.post('/admins', AdminController.store);

// USER ROUTES
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

// RECIPIENT ROUTES
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

// FILES ROUTES
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
