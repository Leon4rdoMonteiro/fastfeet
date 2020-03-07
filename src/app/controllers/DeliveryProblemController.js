import * as Yup from 'yup';

import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';

class DeliveryProblemController {
    async index({ res }) {
        const allProblems = await DeliveryProblem.findAll({
            attributes: ['id', 'delivery_id', 'description'],
            include: [
                {
                    model: Delivery,
                    as: 'delivery',
                    attributes: ['id', 'product'],
                },
            ],
        });
        return res.json(allProblems);
    }

    async show(req, res) {
        const showProblems = await DeliveryProblem.findAll({
            where: { delivery_id: req.params.id },
        });

        return res.json(showProblems);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            description: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { description } = req.body;
        const newProblem = await DeliveryProblem.create({
            delivery_id: req.params.id,
            description,
            attributes: ['id', 'delivery_id', 'description'],
        });
        return res.json(newProblem);
    }
}

export default new DeliveryProblemController();
