require('dotenv').config();

module.exports.DEVELOPMENT = {
    PORT: process.env.DEV_PORT,
    URL: `http://localhost:${process.env.DEV_PORT}/docker-hbv-kms-http/`,
    DB_HOST: process.env.DB_HOST_dev,
    DB_USER: process.env.DB_USER_dev,
    DB_PASSWORD: process.env.DB_PASSWORD_dev,
    DB_NAME: process.env.DB_NAME_dev
};

module.exports.PRODUCTION = {
    PORT: process.env.PROD_PORT,
    URL: "https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/",
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME
};