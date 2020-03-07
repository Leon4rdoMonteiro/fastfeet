import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
    async index({ res }) {
        const recipients = await Recipient.findAll();
        return res.json(recipients);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            street: Yup.string().required(),
            number: Yup.string().required(),
            complement: Yup.string(),
            state: Yup.string().required(),
            city: Yup.string().required(),
            cep: Yup.string()
                .min(8)
                .required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const recipient = await Recipient.create(req.body);
            return res.json(recipient);
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            street: Yup.string(),
            number: Yup.string(),
            complement: Yup.string(),
            state: Yup.string(),
            city: Yup.string().when('state', (state, field) =>
                state ? field.required() : field
            ),
            cep: Yup.string()
                .min(8)
                .when('state', (state, field) =>
                    state ? field.required() : field
                ),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const recipient = await Recipient.findByPk(req.params.id);

        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' });
        }

        try {
            const {
                id,
                name,
                street,
                number,
                complement,
                state,
                city,
                cep,
            } = await recipient.update(req.body);

            return res.json({
                id,
                name,
                street,
                number,
                complement,
                state,
                city,
                cep,
            });
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new RecipientController();
