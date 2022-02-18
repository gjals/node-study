const Sequelize= require('sequelize');

module.exports= class Domain extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            host: {
                type: Sequelize.STRING(80),
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM('free', 'premium'), //둘 중 선택
                allowNull: false,
            },
            clientSecret: {
                type: Sequelize.UUID, //랜덤문자열?
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: 'Domain',
            tableName: 'domains',
        });
    }
    static associate(db) {
        db.Domain.belongsTo(db.User);
    }
}