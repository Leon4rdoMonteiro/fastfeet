/* eslint-disable no-undef */
import request from 'supertest';

import truncate from '../utils/truncate';

import app from '../../src/app';

describe('Auth', () => {
    beforeEach(async () => {
        await truncate();
    });
    it('should log in on application', async () => {
        const auth = await factory.attrs('Auth');

        await request(app)
            .post('/admins')
            .send(auth, {
                name: 'Leonardo Monteiro',
            })
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer Token');

        const response = await request(app)
            .post('/sessions')
            .send(auth);

        expect(response.status).toBe(200);
    });
});
