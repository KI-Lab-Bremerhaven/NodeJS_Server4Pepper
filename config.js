const dotenv = require('dotenv');
dotenv.config();

module.exports.DEVELOPMENT = {
    PORT: process.env.DEV_PORT,
    URL: `http://localhost:${process.env.DEV_PORT}/docker-hbv-kms-http/`
};

module.exports.PRODUCTION = {
    PORT: process.env.PROD_PORT,
    URL: "https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/"
};