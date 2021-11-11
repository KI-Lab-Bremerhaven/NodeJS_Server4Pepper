const dotenv = require('dotenv');
dotenv.config();

module.exports.DEVELOPMENT = {
    PORT: process.env.DEV_PORT,
};

module.exports.PRODUCTION = {
    PORT: process.env.PROD_PORT,
};