import Sequelize, { Model } from 'sequelize';

class Delivery extends Model {
    static init(sequelize) {
        super.init(
            {
                product: Sequelize.STRING,
            },
            { sequelize }
        );
        return this;
    }
}

export default Delivery;
