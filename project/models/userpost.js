const Sequelize= require('sequelize');
module.exports= class UserPost extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            gg: {
                type: Sequelize.STRING(100),
                allowNull: true,
                unique: false,
            },
        }, {
            sequelize,
            timestamps: true, //속성으로 createdAt updateAt 추가함
            underscored: false, //스네이크 케이스 created_at으로 만들껀지 물어봄
            modelName: 'UserPost',
            tableName: 'userpost',
            paranoid: false, //deletedAt이 생기고 복원이 가능하도록 완전히 지우지 않음
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.UserPost.belongsTo(db.User);
        db.UserPost.belongsTo(db.Post);
    }
};