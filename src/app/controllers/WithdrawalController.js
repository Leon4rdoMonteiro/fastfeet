import {
    startOfDay,
    endOfDay,
    setSeconds,
    setMinutes,
    setHours,
    format,
    parseISO,
    startOfHour,
} from 'date-fns';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';

import rangeHours from '../../utils/rangeHours';

class WithdrawalController {
    /**
     *  Update delivery status => Start Date
     */

    async update(req, res) {
        const delivery = await Delivery.findOne({
            where: { id: req.params.id },
        });

        if (!delivery) {
            return res.status(400).json({ error: 'Delivery does not exists' });
        }

        if (delivery.canceled_at !== null) {
            return res.status(401).json({ error: 'Delivery was canceled' });
        }

        if (delivery.end_date !== null) {
            return res
                .status(401)
                .json({ error: 'Delivery has been finished' });
        }

        if (delivery.start_date !== null) {
            return res
                .status(401)
                .json({ error: 'Delivery has been withdrawn' });
        }

        const orderAmount = await Delivery.count({
            where: {
                deliveryman_id: req.userId,
                start_date: {
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

        const available = rangeHours.map(time => {
            const [hour, minute] = time.split(':');
            const value = setSeconds(
                setMinutes(setHours(new Date(), hour), minute),
                0
            );

            return {
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
            };
        });

        const start_date = {
            value: format(startOfHour(new Date()), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        };

        const withdrawalAvailable = available.find(
            a => a.value === start_date.value
        );

        if (!withdrawalAvailable) {
            return res.status(401).json({
                error: 'You cannot pick up orders outside bussiness hours',
            });
        }

        await delivery.update({ start_date: parseISO(start_date.value) });

        return res.json({ message: 'The product was successfully withdrawn' });
    }
}

export default new WithdrawalController();
