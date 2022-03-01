const Sequelize = require('sequelize');
const User= require('./user');
const Good= require('./good');
const Auction= require('./auction');
const env= 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize= sequelize;
db.User= User;
db.Good= Good;
db.Auction= Auction;

User.init(sequelize);
Good.init(sequelize);
Auction.init(sequelize);

User.associate(db);
Good.associate(db);
Auction.associate(db);

module.exports = db;
