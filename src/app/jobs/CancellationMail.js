import Mail from '../../lib/Mail';

class CancellationMail {
    get key() {
        return 'CancellationMail';
    }

    async handle({ data }) {
        const { problem, delivery, deliveryman } = data;

        await Mail.sendMail({
            to: `${deliveryman.name} <${deliveryman.email}>`,
            subject: 'Uma entrega foi cancelada, veja os detalhes:',
            template: 'Cancellation',
            context: {
                deliveryman: deliveryman.name,
                product: delivery.recipient.product,
                name: delivery.recipient.name,
                street: delivery.recipient.street,
                number: delivery.recipient.number,
                complement: delivery.recipient.complement,
                city: delivery.recipient.city,
                cep: delivery.recipient.cep,
                description: problem.description,
            },
        });
    }
}

export default new CancellationMail();
