import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';
import isAdminMiddleware from './app/middlewares/isAdmin';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import AdminController from './app/controllers/AdminController';
import CourierController from './app/controllers/CourierController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import WithdrawalController from './app/controllers/WithdrawalController';
import DeliveryEndController from './app/controllers/DeliveryEndController';

const upload = multer(multerConfig);
const routes = new Router();

// LOGIN ROUTE
routes.post('/sessions', SessionController.store);

// AUTH MIDDLEWARE
routes.use(authMiddleware);

// RECIPIENT ROUTES
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

// FILES ROUTES
routes.post('/files', upload.single('file'), FileController.store);

// COURIER DELIVERY ROUTES
routes.get('/deliveries', DeliveryController.index);

routes.get('/delivery/problems', DeliveryProblemController.index);
routes.get('/delivery/:id/problems', DeliveryProblemController.show);
routes.post('/delivery/:id/problems', DeliveryProblemController.store);
routes.delete('/problem/:id/cancel_delivery', DeliveryController.destroy);

routes.put('/delivery/:id/delivery_withdrawal', WithdrawalController.update);
routes.put('/delivery/:id/delivery_end', DeliveryEndController.update);

routes.use(isAdminMiddleware);

// ADMIN ROUTES
routes.get('/admins', AdminController.index);
routes.post('/admins', AdminController.store);
routes.put('/admins', AdminController.update);
routes.delete('/admins', AdminController.destroy);

// COURIER ROUTES
routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.destroy);

// DELIVERY ROUTES
routes.post('/deliveries', DeliveryController.store);

export default routes;
