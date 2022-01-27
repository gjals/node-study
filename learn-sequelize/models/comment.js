const Sequelize= require('sequelize');

module.exports= class Comment extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            comment: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            create_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        }, {
            sequelize,
            timestamps: false,
            //underscored: false,
            modelName: 'Comment',
            tableNAme: 'comments',
            paranoid: false,
            charset:'utf8mb4',
            collate: 'utf8m64_general_ci',
        });
    }

    static assosiate(db) {
        db.Comment.belongsTo(db.Users, {foreignKey: 'commenter', targetKey: 'id'});
    }
};