import User from '../models/User';

class AdminController {
    async index(req, res) {
        const admins = await User.findAll({
            where: { admin: true },
        });
        return res.json(admins);
    }

    async store(req, res) {
        const { email } = req.body;
        const admin = await User.findOne({
            where: { email },
        });

        if (admin) {
            return res.status(400).json({ error: 'User already exists' });
        }

        req.body.admin = true;

        const { name } = await admin.create(req.body);
        return res.json({
            name,
            email,
        });
    }
}

export default new AdminController();
