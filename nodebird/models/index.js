const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const User= require('./user');
const Post= require('./post'); // ./ 이거는 현재 폴더? 인듯
const Hashtag= require('./hashtag');
const UserPost=require('./userpost');

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.User= User;
db.Post= Post;
db.Hashtag= Hashtag;
db.UserPost=UserPost;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);
UserPost.init(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);
UserPost.associate(db);

module.exports = db;
