import Mail from '../../lib/Mail';

class NewOrderMail {
    get key() {
        return 'NewOrderMail';
    }

    async handle({ data }) {
        const { deliveryman, recipient, product } = data;
        Mail.sendMail({
            to: `${deliveryman.name} <${deliveryman.email}>`,
            subject: 'Nova retirada de produto disponível!',
            template: 'newOrder',
            context: {
                deliveryman: deliveryman.name,
                product,
                name: recipient.name,
                street: recipient.street,
                number: recipient.number,
                complement: recipient.complement,
                city: recipient.city,
                cep: recipient.cep,
            },
        });
    }
}

export default new NewOrderMail();
