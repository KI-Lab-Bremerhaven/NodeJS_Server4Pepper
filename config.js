require('dotenv').config();

module.exports.DEVELOPMENT = {
    PORT: process.env.DEV_PORT,
    URL: `http://localhost:${process.env.DEV_PORT}/docker-hbv-kms-http/`,
    DB_HOST: process.env.DB_HOST_dev,
    DB_USER: process.env.DB_USER_dev,
    DB_PASSWORD: process.env.DB_PASSWORD_dev,
    DB_NAME: process.env.DB_NAME_dev,
    API_KEY: process.env.API_KEY
};

module.exports.PRODUCTION = {
    PORT: process.env.PROD_PORT,
    URL: 'https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/',
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    API_KEY: process.env.API_KEY
};

module.exports.TABLES = {
    emotion_table_name: 'pepper_emotion_table',
    attributes_table_name: 'pepper_attributes_table',
    use_case_table_name: 'pepper_use_case_table',
    not_understand_table_name: 'pepper_did_not_understand_table',
    all_speach_text_table_name: 'all_speach_text_table'
}