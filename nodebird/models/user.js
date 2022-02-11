const Sequelize= require('sequelize');
module.exports= class User extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            emailProvider: { //로컬 로그인인지 카카오 로그인인지
                type:Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local',
            },
            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true, //속성으로 createdAt updateAt 추가함
            underscored: false, //스네이크 케이스 created_at으로 만들껀지 물어봄
            modelName: 'User',
            tableName: 'users',
            paranoid: true, //deletedAt이 생기고 복원이 가능하도록 완전히 지우지 않음
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.User, {
            foreignkey: 'follwingId',
            as: 'Follwers',
            through: 'follow',
        });
        db.User.belongsToMany(db.User, {
            foreignkey: 'follwerId',
            as:'Follwings',
            through: 'follow',
        });
    }
};