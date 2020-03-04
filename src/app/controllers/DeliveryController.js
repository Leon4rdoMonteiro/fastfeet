import * as Yup from 'yup';
import { isAfter, setSeconds, setMinutes, setHours, parseISO } from 'date-fns';

import Delivery from '../models/Delivery';
import User from '../models/User';
import Recipient from '../models/Recipient';
import File from '../models/File';

import NewOrderMail from '../jobs/NewOrderMail';

import Queue from '../../lib/Queue';

import rangeHours from '../../utils/rangeHours';

class DeliveryController {
    async show(req, res) {
        const delivery = await Delivery.findAll({
            where: {
                deliveryman_id: req.userId,
                canceled_at: null,
                end_date: null,
            },
        });

        return res.json(delivery);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            recipient_id: Yup.number().required(),
            deliveryman_id: Yup.number().required(),
            signature_id: Yup.number().required(),
            product: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const {
            recipient_id,
            deliveryman_id,
            signature_id,
            product,
        } = req.body;

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

        const signatureExists = await File.findByPk(signature_id);
        if (!signatureExists) {
            return res.status(400).json({ error: 'Signature not found' });
        }

        const delivery = await Delivery.create(req.body);

        await Queue.add(NewOrderMail.key, {
            recipient,
            product,
            deliveryman,
        });

        return res.json(delivery);
    }

    async update(req, res) {
        const { start_date, end_date } = req.body;

        if (!isAfter(end_date)) {
            return res
                .status(400)
                .json({ error: 'End date must be after current date' });
        }

        const delivery = await Delivery.findOne({
            where: {
                id: req.params.id,
                canceled_at: null,
                end_date: null,
            },
        });

        parseISO(start_date);

        const validHour = rangeHours.map(time => {
            const [hour, minute] = time.split(':');
            const value = setSeconds(
                setMinutes(setHours(start_date, hour), minute),
                0
            );
        });

        const response = await delivery.update(req.body);

        return res.json(response);
    }
}

export default new DeliveryController();
