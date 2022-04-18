const Sequelize= require('sequelize');

module.exports= class Book extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            author: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            title_url: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },
            kdc_code: {
                type: Sequelize.STRING(10),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true, //속성으로 createdAt updateAt 추가함
            underscored: false, //스네이크 케이스 created_at으로 만들껀지 물어봄
            modelName: 'Book',
            tableName: 'books',
            paranoid: false, //deletedAt이 생기고 복원이 가능하도록 완전히 지우지 않음
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Book.hasMany(db.Post);
    }
}