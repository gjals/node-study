require('dotenv').config();

module.exports = {
    "development": {
        "username": "root",
        "password": "1234",
        "database": "projectbook",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    "test": {
        "username": "root",
        "password": process.env.SEQUELIZE_PASSWORD,
        "database": "projectbook",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    "production": {
        "username": "root",
        "password": process.env.SEQUELIZE_PASSWORD,
        "database": "projectbook",
        "host": "projectbook.cgbl4edwm13h.ap-northeast-2.rds.amazonaws.com",
        "dialect": "mysql",
        logging: false,
	    "rds_port": "3306"
    }
}
