import Sequelize, { Model } from 'sequelize';

class Courier extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
            },
            { sequelize }
        );
    }
}

export default Courier;
