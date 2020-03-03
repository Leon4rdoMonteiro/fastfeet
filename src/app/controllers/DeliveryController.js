import * as Yup from 'yup';
import {} from 'date-fns';

import Delivery from '../models/Delivery';
import User from '../models/User';
import Recipient from '../models/Recipient';
import File from '../models/File';

import Mail from '../../lib/Mail';

class DeliveryController {
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

        const recipientExists = await Recipient.findByPk(recipient_id);

        if (!recipientExists) {
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

        await Mail.sendMail({
            to: `${deliveryman.name} <${deliveryman.email}>`,
            subject: 'Nova encomenda cadastrada!',
            text: `Uma nova encomenda foi cadastrada para entrega do produto: ${product} e sua retirada já está disponível!`,
        });

        return res.json(delivery);
    }
}

export default new DeliveryController();
