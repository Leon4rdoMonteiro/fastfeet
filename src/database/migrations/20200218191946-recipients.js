module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            street: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            number: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            complement: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            state: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            CEP: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        });
    },

    down: queryInterface => {
        return queryInterface.dropTable('users');
    },
};
