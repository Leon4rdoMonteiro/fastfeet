import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import User from '../models/User';
import Recipient from '../models/Recipient';

import NewOrderMail from '../jobs/NewOrderMail';
import CancellationMail from '../jobs/CancellationMail';

import Queue from '../../lib/Queue';

class DeliveryController {
    /**
     *  List all deliveries non cancelled or finished
     */

    async index(req, res) {
        const delivery = await Delivery.findAll({
            where: {
                deliveryman_id: req.userId,
                canceled_at: null,
                end_date: null,
            },
        });

        return res.json(delivery);
    }

    /**
     *  Create a new delivery
     */

    async store(req, res) {
        const schema = Yup.object().shape({
            recipient_id: Yup.number().required(),
            deliveryman_id: Yup.number().required(),
            product: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { recipient_id, deliveryman_id, product } = req.body;

        const recipient = await Recipient.findByPk(recipient_id);

        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' });
        }

        const deliveryman = await User.findOne({
            where: { id: deliveryman_id, admin: false },
            attributes: ['id', 'name', 'email'],
        });

        if (!deliveryman) {
            return res.status(400).json({ error: 'Courier not found' });
        }

        const delivery = await Delivery.create(req.body);

        await Queue.add(NewOrderMail.key, {
            recipient,
            product,
            deliveryman,
        });

        return res.json(delivery);
    }

    /**
     *  Cancel a delivery
     */

    async destroy(req, res) {
        const problem = await DeliveryProblem.findByPk(req.params.id);

        if (!problem) {
            return res
                .status(400)
                .json({ error: 'Delivery problem does not exists' });
        }

        const delivery = await Delivery.findOne({
            where: { id: problem.delivery_id },
            include: [
                {
                    model: Recipient,
                    as: 'recipient',
                },
            ],
        });

        if (delivery.canceled_at !== null) {
            return res
                .status(400)
                .json({ error: 'Delivery has already been canceled ' });
        }

        if (delivery.end_date !== null) {
            return res
                .status(400)
                .json({ error: 'The delivery cannot be canceled' });
        }

        const deliveryman = await User.findOne({
            where: { id: req.userId },
        });

        delivery.canceled_at = new Date();

        delivery.save();

        await Queue.add(CancellationMail.key, {
            problem,
            delivery,
            deliveryman,
        });

        return res.json({
            message: 'Delivery has been cancelled successfully',
        });
    }
}

export default new DeliveryController();
