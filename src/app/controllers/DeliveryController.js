import * as Yup from 'yup';
import {
    startOfDay,
    endOfDay,
    isAfter,
    setSeconds,
    setMinutes,
    setHours,
    format,
    parseISO,
} from 'date-fns';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import User from '../models/User';
import Recipient from '../models/Recipient';
import File from '../models/File';

import NewOrderMail from '../jobs/NewOrderMail';

import Queue from '../../lib/Queue';

import rangeHours from '../../utils/rangeHours';

class DeliveryController {
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
        const schema = Yup.object().shape({
            start_date: Yup.number(),
            end_date: Yup.number(),
            canceled_at: Yup.number(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { start_date, end_date, canceled_at } = req.body;

        const delivery = await Delivery.findOne({
            where: { id: req.params.id },
        });

        if (!delivery) {
            return res.status(400).json({ error: 'Delivery does not exists' });
        }

        /**
         * Verify if delivery has already been cancelled
         */

        if (canceled_at && delivery.canceled_at !== null) {
            return res
                .status(400)
                .json({ error: 'Delivery has already been cancelled' });
        }

        /**
         * Verify if end_date is greather than start date
         */

        if (end_date && !isAfter(end_date, start_date)) {
            return res
                .status(400)
                .json({ error: 'End date must be after start date' });
        }

        const orderAmount = await Delivery.count({
            where: {
                deliveryman_id: req.userId,
                created_at: {
                    [Op.between]: [
                        startOfDay(new Date()),
                        endOfDay(new Date()),
                    ],
                },
            },
        });

        /**
         * Verify of limit of withdrawals has been expired
         */

        if (orderAmount > 5) {
            return res
                .status(401)
                .json({ error: 'Your daily withdrawal limit is over' });
        }

        /**
         * Verify if start date is according to range hours
         */

        const searchDate = parseISO(start_date);

        const isHourValid = rangeHours.map(time => {
            const [hour, minute] = time.split(':');
            const value = setSeconds(
                setMinutes(setHours(searchDate, hour), minute),
                0
            );
            return {
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
            };
        });

        const response = await delivery.update(req.body);

        return res.json(response);
    }
}

export default new DeliveryController();
