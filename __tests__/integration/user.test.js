/* eslint-disable no-undef */
import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../../src/app';

import factory from '../factories';

import truncate from '../utils/truncate';

describe('User', () => {
    beforeEach(async () => {
        await truncate();
    });

    it('should encrypt user password when new user created', async () => {
        const user = await factory.create('UserCreate', {
            password: '123456',
        });

        const compareHash = await bcrypt.compare('123456', user.password_hash);

        expect(compareHash).toBe(true);
    });

    it('should be able to register', async () => {
        const create = await factory.attrs('UserCreate');

        const response = await request(app)
            .post('/admins')
            .send(create)
            .set('Authorization', 'Bearer Token');

        expect(response.body).toHaveProperty('user');
    });

    it('should be able to update', async () => {
        const create = await factory.attrs('UserCreate');
        const update = await factory.attrs('UserUpdate');

        await request(app)
            .post('/admins')
            .send(create)
            .set('Authorization', 'Bearer Token');

        const response = await request(app)
            .put('/admins')
            .send(update)
            .set('Authorization', 'Bearer Token');

        expect(response.body).toHaveProperty('id');
    });
});
