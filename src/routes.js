import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';

const routes = new Router();

// LOGIN ROUTE
routes.post('/sessions', SessionController.store);

// AUTH MIDDLEWARE
routes.use(authMiddleware);

// USER ROUTES
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

// RECIPIENT ROUTES
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

export default routes;
