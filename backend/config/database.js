const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let sequelize;
if (databaseUrl && databaseUrl.startsWith('postgres') && process.env.USE_SQLITE !== 'true') {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: isProduction ? false : console.log,
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../skillbridge.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
