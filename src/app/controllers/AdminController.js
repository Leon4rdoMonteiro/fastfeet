import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import User from '../models/User';

import authConfig from '../../config/auth';

class AdminController {
    async index(req, res) {
        const admins = await User.findAll({
            where: { admin: true },
            attributes: ['id', 'name', 'email'],
        });
        return res.json(admins);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string()
                .min(6)
                .required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { email } = req.body;
        const isAdmin = await User.findOne({
            where: { email },
        });

        if (isAdmin) {
            return res.status(400).json({ error: 'User already exists' });
        }

        req.body.admin = true;

        const { id, name, admin } = await User.create(req.body);

        return res.json({
            user: {
                id,
                name,
                email,
                admin,
            },
            token: jwt.sign({ id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            }),
        });
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string(),
            password: Yup.string()
                .min(6)
                .when('oldPassword', (oldPassword, field) =>
                    oldPassword ? field.required() : field
                ),
            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            ),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { email, oldPassword } = req.body;

        const adm = await User.findByPk(req.userId);

        if (email && email !== adm.email) {
            const emailExists = await User.findOne({
                where: { email },
            });

            if (emailExists) {
                return res.status(401).json({ error: 'User already exists' });
            }
        }

        if (oldPassword && !(await adm.checkPassword(oldPassword))) {
            return res.status(401).json({ error: 'Password does not match' });
        }

        const { id, name, admin } = await adm.update(req.body);

        return res.json({
            id,
            name,
            email,
            admin,
        });
    }
}

export default new AdminController();
