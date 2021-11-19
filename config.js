const dotenv = require('dotenv');
dotenv.config();

module.exports.DEVELOPMENT = {
    PORT: process.env.DEV_PORT,
    URL: "http://localhost"
};

module.exports.PRODUCTION = {
    PORT: process.env.PROD_PORT,
    URL: ""
};