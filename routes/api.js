/**
 * This Router handles requests to store and get data into and from the database. 
 * Getting Data is only possible if the user has a verifieed JWT Token.
 * 
 * @version 1.0
 * @author Benjamin Thomas Schwertfeger
 * @email development@b-schwertfeger.de
 * @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 * /

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const mysql = require('mysql');
const {
    verifyToken
} = require('../middleware/auth');
const router = require('express').Router();
require('dotenv').config()

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    API_KEY
} = (process.env.NODE_ENV === 'PROD') ? require('../config').PRODUCTION: require('../config').DEVELOPMENT;

const {
    emotion_table_name,
    attributes_table_name,
    use_case_table_name,
    not_understand_table_name
} = require('../config').TABLES;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> S E T U P <----- ----- ----- */

const
    dirty_sql_words = [
        'select', 'delete', 'from', 'where',
        'order', 'by', 'desc', 'asc', 'join', 'shift',
        'primary', 'key', 'secondary', 'null', 'auto_increment',
        'drop', 'table', 'create',
        '\\', '.', '..', '*', '$', '/', '//', '\''
    ],
    undefined = 'undefined',
    unknown = 'UNKNOWN';

let pool = mysql.createPool({
    connectionLimit: 10, // default = 10
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

// this initializes the table where we want to store the data
pool.getConnection((err, con) => {
    if (err) throw err;
    else {
        // EMOTION DATA + DIALOG TIME
        var sql = `CREATE TABLE IF NOT EXISTS ${emotion_table_name} (data_id INT NOT NULL AUTO_INCREMENT, identifier VARCHAR(128), distance `;
        sql += 'VARCHAR(20), age VARCHAR(20), gender VARCHAR(20), basic_emotion VARCHAR(50), pleasure_state VARCHAR(30), excitement_state VARCHAR(30),';
        sql += 'smile_state VARCHAR(30), dialog_time VARCHAR(30), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))';
        con.query(sql, (err, result) => {
            if (err) throw err;
            //else console.log(`Table ${emotion_table_name} created`);
        });

        // OTHER CONVERSATION DATA
        sql = `CREATE TABLE IF NOT EXISTS ${attributes_table_name} (data_id INT NOT NULL AUTO_INCREMENT, identifier VARCHAR(128), data LONGTEXT, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))`;
        con.query(sql, (err, result) => {
            if (err) throw err;
            //else console.log(`Table ${conversation_table_name} created`);
        });

        // USE CASE TABLE
        sql = `CREATE TABLE IF NOT EXISTS ${use_case_table_name} (data_id INT NOT NULL AUTO_INCREMENT, `;
        sql += 'identifier VARCHAR(128), use_case VARCHAR(128), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))';
        con.query(sql, (err, result) => {
            if (err) throw err;
            //else console.log(`Table ${use_case_table_name} created`);
        });

        // DID NOT UNDERSTAND PHRASES TABLE
        sql = `CREATE TABLE IF NOT EXISTS ${not_understand_table_name} (data_id INT NOT NULL AUTO_INCREMENT, `;
        sql += 'identifier VARCHAR(128), phrase VARCHAR(1024), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))';
        con.query(sql, (err, result) => {
            if (err) throw err;
            //else console.log(`Table ${not_understand_table_name} created`);
        });
    }
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

/**
 * Route to save JSON like object into database, by referencing the conversation by 
 * addding the identifier 
 */
router.post('/docker-hbv-kms-http/api/v1/saveAttributeData', (req, res, next) => {
    let
        body = req.body;
    let
        identifier = body.identifier,
        data = body.data;

    if (!(typeof data !== undefined && data)) res.status(401).json({
        message: 'No data provided!'
    }).end();
    else {
        if (!(typeof identifier !== undefined && identifier)) identifier = unknown;

        // hier müsste man prüfen, ob nicht doch SQL Befehle dabei sind, damit niemand unsere DB manipulieren kann
        // jedoch würde dadruch auch der json string kaputt gehen
        // Mman sollte stattdessen versuchen, dem pepper auch ein Token zu geben, welches er bei jeder Anfrage übermittelt,
        // damit nur er Daten schreiben (und nicht lesen) kann

        try {
            const _ = JSON.parse(data); // test - if it failes, data is not formated
            pool.getConnection((err, con) => {
                if (err) res.json({
                    message: 'Error while connecting to Database'
                }).end();
                else {
                    const sql = `INSERT INTO ${attributes_table_name} (identifier, data) VALUES ('${identifier.toString()}', '${data}')`;
                    con.query(sql, (err, result) => {
                        con.release();
                        if (err) res.status(500).json({
                            message: 'Could not save data to database!'
                        });
                        else res.status(200).end();
                    });
                }
            });
        } catch (err) {
            res.status(401).json({
                message: 'Data should be a valid object in format JSON'
            }).end();
        }
    }
});
/**
 * Saves the general conversation data into the database
 * https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/saveEmotionData?identifier=1348769234&distance=1&age=20&gender=trans&basic_emotion=good&pleasure_state=wild&excitement_state=excited&smile_state=smiling&dialog_time=6.4
 */
router.get('/docker-hbv-kms-http/api/v1/saveEmotionData', (req, res, next) => {
    const query = req.query;

    if (typeof query === undefined || !query) res.status(401).end();
    else {
        let
            identifier = query.identifier,
            distance = query.distance,
            age = query.age,
            gender = query.gender,
            basic_emotion = query.basic_emotion,
            pleasure_state = query.pleasure_state,
            excitement_state = query.excitement_state,
            smile_state = query.smile_state,
            dialog_time = query.dialog_time;

        if (!(typeof identifier !== undefined && identifier)) identifier = unknown;
        if (!(typeof distance !== undefined && distance)) distance = unknown;
        if (!(typeof age !== undefined && age)) age = unknown;
        if (!(typeof gender !== undefined && gender)) gender = unknown;
        if (!(typeof basic_emotion !== undefined && basic_emotion)) basic_emotion = unknown;
        if (!(typeof pleasure_state !== undefined && pleasure_state)) pleasure_state = unknown;
        if (!(typeof excitement_state !== undefined && excitement_state)) excitement_state = unknown;
        if (!(typeof smile_state !== undefined && pleasure_state)) smile_state = unknown;
        if (!(typeof dialog_time !== undefined && dialog_time)) dialog_time = unknown;

        // to avoid some xss
        if (dirty_sql_words.some(v => [
                identifier, distance, age, gender, basic_emotion,
                pleasure_state, excitement_state,
                smile_state, dialog_time
            ].includes(v.toLocaleLowerCase()))) res.status(401).json({
            message: 'Invalid parameter!'
        }).end();

        pool.getConnection((err, con) => {
            if (err) res.json({
                message: 'Error while connecting to Database'
            }).end();
            else {
                let sql = `INSERT INTO ${emotion_table_name} (identifier, distance, age, gender, basic_emotion, pleasure_state, excitement_state, smile_state, dialog_time) VALUES`;
                sql += `('${identifier.toString()}', '${distance.toString()}', '${age.toString()}', '${gender.toString()}', '${basic_emotion.toString()}', `
                sql += `'${pleasure_state.toString()}', '${excitement_state.toString()}', '${smile_state.toString()}', '${dialog_time.toString()}')`;

                con.query(sql, (err, result) => {
                    con.release();
                    if (err) throw err;
                    else res.status(200).end();
                });
            }
        });
    }
});
/**
 * Stores the used use-cases into the database by referencing the conversation id 
 * e.g.: https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/api/v1/saveUseCaseData?identifier=353245234&use_case=Mensaplan
 */
router.get('/docker-hbv-kms-http/api/v1/saveUseCaseData', (req, res, next) => {

    const query = req.query;
    if (typeof query === 'undefined' || !query) res.status(401).end();
    else {
        let
            identifier = query.identifier,
            use_case = query.use_case;
        if (!(typeof identifier !== undefined && identifier)) identifier = unknown;
        if (!(typeof use_case !== undefined && use_case)) use_case = unknown;

        if (dirty_sql_words.some(v => [identifier, use_case].includes(v.toLocaleLowerCase()))) res.status(401).json({
            message: 'Invalid parameter!'
        }).end();

        pool.getConnection((err, con) => {
            if (err) res.json({
                message: 'Error while connecting to Database'
            }).end();
            else {
                const sql = `INSERT INTO ${use_case_table_name} (identifier, use_case) VALUES ('${identifier.toString()}', '${use_case.toString()}')`; // ON DUPLICATE KEY UPDATE count = count + 1`;
                con.query(sql, (err, result) => {
                    con.release();
                    if (err) res.json({
                        message: 'Could not save data to database!'
                    });
                    else res.status(200).end();
                });
            }
        });
    }
});
/**
 * Saves phrases which the robot did not understand during the conversation
 * e.g.: https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/api/v1/saveNotUnderstandPhrases?identifier=rtretwre&phrase=blabla
 */
router.get('/docker-hbv-kms-http/api/v1/saveNotUnderstandPhrases', (req, res, next) => {
    const query = req.query;
    if (typeof query === 'undefined' || !query) res.status(401).end();
    else {
        if (!(typeof query.identifier !== undefined && query.identifier)) query.identifier = unknown;
        if (!(typeof query.phrase !== undefined && query.phrase)) query.phrase = unknown;

        const
            identifier = query.identifier,
            phrase = query.phrase;

        if (dirty_sql_words.some(v => [phrase, identifier].includes(v.toLocaleLowerCase()))) res.status(401).json({
            message: 'Invalid parameter!'
        }).end();

        pool.getConnection((err, con) => {
            if (err) res.json({
                message: 'Error while connecting to Database'
            }).end();
            else {
                const sql = `INSERT INTO ${not_understand_table_name} (identifier, phrase) VALUES ('${identifier.toString()}', '${phrase.toString()}')`; // ON DUPLICATE KEY UPDATE count = count + 1`;
                con.query(sql, (err, result) => {
                    con.release();
                    if (err) res.json({
                        message: 'Could not save data to database!'
                    });
                    else res.status(200).end();
                });
            }
        });
    }
});

/**
 * Returns n rows of emotion table; this is used in the admin dashboard
 * e.g.: https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/getData?n=100
 */
router.get('/docker-hbv-kms-http/api/v1/getData', verifyToken, (req, res, next) => {
    const query = req.query;
    let query_string = 'LIMIT ';

    if (typeof query.n !== 'number') query_string += '250';
    else query_string += ` ${query.n}`

    pool.getConnection((err, con) => {
        con.query(`SELECT * FROM ${emotion_table_name} ORDER BY ts DESC ${query_string}`, (err, rows) => {
            con.release()
            if (err) res.json({
                message: 'Could not load data from database!'
            });
            else res.send(JSON.stringify(rows));
        });
    });
})

/**
 * Restricted Route to query database information
 * e.g. https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/api/v1/sql?query_str=select%*%from*table
 */
router.post('/docker-hbv-kms-http/api/v1/sql', (req, res, next) => {
    const body = req.body;
    const auth_key = body.auth_key;

    if (typeof auth_key === undefined || auth_key !== API_KEY) res.status(401).send('Invalid API KEY').end();
    else if (typeof body.subject !== undefined && body.subject === 'test') res.status(200).json({
        message: 'Connected!'
    }).end();
    else if (typeof body.query_str !== undefined && body.query_str) {
        const unwanted_actions = ['drop', 'delete', 'show', 'users', 'insert', 'into', 'create'];
        if (unwanted_actions.some(v => body.query_str.includes(v.toLocaleLowerCase()))) res.status(401).send('Invalid SQL command!').end();
        else pool.getConnection((err, con) => {
            if (err) res.status(500).send(`${err}`).end();
            con.query(body.query_str, (err, rows) => {
                con.release();
                if (err) res.status(500).send(`${err}`).end();
                else res.status(200).json(rows);
            });

        });
    } else next();
});
/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */