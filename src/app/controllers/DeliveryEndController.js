import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import File from '../models/File';

class DeliveryEndController {
    /**
     *  Update delivery status => End Date
     */

    async update(req, res) {
        const schema = Yup.object().shape({
            signature_id: Yup.number().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { signature_id } = req.body;

        const delivery = await Delivery.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (delivery.end_date !== null) {
            return res
                .status(401)
                .json({ error: 'Delivery has been finished' });
        }

        if (!delivery) {
            return res.status(400).json({ error: 'Delivery does not exists' });
        }

        if (delivery.start_date === null) {
            return res.status(400).json({
                error: 'The product withdrawal is necessary for this operation',
            });
        }

        if (delivery.canceled_at !== null) {
            return res.status(400).json({ error: 'Delivery was canceled' });
        }

        const signature = await File.findOne({
            where: { id: signature_id, signature: true },
        });

        if (!signature) {
            return res.status(400).json({ error: 'Signature does not exists' });
        }

        const response = await delivery.update({
            signature_id,
            end_date: new Date(),
        });

        return res.json(response);
    }
}

export default new DeliveryEndController();
