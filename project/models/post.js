const { extend } = require('nunjucks/src/lib');
const Sequelize= require('sequelize');

module.exports= class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            content: {
                type: Sequelize.STRING(140),
                allowNull: false,
            },
            img: {
                type: Sequelize.STRING(200), //경로를 저장하기에 문자열인듯
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true, //속성으로 createdAt updateAt 추가함
            underscored: false, //스네이크 케이스 created_at으로 만들껀지 물어봄
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false, //deletedAt이 생기고 복원이 가능하도록 완전히 지우지 않음
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Post.belongsTo(db.User);
        db.Post.belongsToMany(db.Hashtag, {through:'PostHashtag'});
        db.Post.hasMany(db.UserPost);
    }
}