/**
 * Router to handle incoming speach of pepper to reply some usefull information
 * 
 * @version 1.0
 * @author Benjamin Thomas Schwertfeger
 * @email development@b-schwertfeger.de
 */

// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *       I M P O R T S         
// *------------------------------------------------------------------------------

const
    mysql = require('mysql');
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
    all_speach_text_table_name
} = require('../config').TABLES;

const
    undefined = "undefined",
    topic_data = JSON.parse(require('fs').readFileSync('assets/topics.json'));

// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *       S E T U P         
// *------------------------------------------------------------------------------

let pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

// this initializes the table where we want to store the data
pool.getConnection((err, con) => {
    if (err) throw err;
    else {
        var sql = `CREATE TABLE IF NOT EXISTS ${all_speach_text_table_name} (data_id INT NOT NULL AUTO_INCREMENT, identifier VARCHAR(128),`;
        sql += ' text VARCHAR(2048), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))';
        con.query(sql, (err) => {
            if (err) throw err;
        });

    }
});

// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *        R O U T E S         
// * ------------------------------------------------------------------------------


/**
 * * Handle speach, reply and DB saving 
 * ? 
 */
const
    check_speach_input = (req, res, next) => {
        let data = req.body;
        console.log("check input: " + data);

        if (!(typeof (req.body) !== undefined && req.body &&
        typeof data !== undefined && data && typeof data.data !== undefined && data.data)) res.status(400).end();
        else{
            try{
                data = JSON.parse(data.data);

                if (!( typeof (data.identifier) !== undefined &&
                    data.identifier &&
                    typeof (data.text) !== undefined && data.text &&
                    typeof (data.topic) !== undefined && data.topic
                )) res.status(400).json({
                    message: 'No data provided!'
                }).end();
                else {
                    req.data = data;
                    next();
                }
            } catch {}
        }
    },
    check_store_in_db_state = (req, res, next) => {
        const data = req.data;
        console.log("check db storrage: " + JSON.stringify(data))
        req.db_state = undefined;
        if (!(typeof (data.saveInDB) !== undefined && data.saveInDB)) next();
        else {
            try {
                const _ = JSON.parse(data); // test - if it failes, data is not formated
                pool.getConnection((err, con) => {
                    if (err) res.status(500).json({
                        message: 'Error while connecting to Database'
                    }).end();
                    else {
                        const sql = `INSERT INTO ${all_speach_text_table_name} (identifier, text) VALUES ('${identifier.toString()}', '${data.text.toString()}')`;
                        con.query(sql, (err, result) => {
                            con.release();
                            // ? maybe we should log this?
                            if (err) {
                                req.db_state = "db err"
                                //     res.status(500).json({
                                //     message: 'Could not save data to database!'
                                // });
                            } else {
                                req.db_state = "ok";
                                // res.status(200).end();
                            }
                            next();
                        });
                    }
                });
            } catch (err) {
                // ? maybe we should log this?
                // res.status(400).json({
                //     message: 'Data should be a valid object in format JSON'
                // }).end();
                req.db_state = "json wrong formatted!";
                next();
            }
        }
    }
check_reply_state = (req, res, next) => {
    const data = req.data;
    console.log("check response text: " + JSON.stringify(data))
    req.response_state = undefined;
    if (!(typeof (data.needResponse) !== undefined && data.needResponse)) next();
    else {
        if (true) { //? do some checking what the user actually wants
            console.log(topic_data['greetings'][0])
            res.status(200).json({
                'response': topic_data['greetings'][0]
            });
            req.response_state = 'ok';
        } else {}
    }
};

router.post('/docker-hbv-kms-http/api/v1/speach',
    check_speach_input,
    check_store_in_db_state,
    check_reply_state,
    (req, res, next) => {
        let close_frame_needed = false;
        if (req.db_state !== undefined || req.db_state !== 'ok') {
            // ? do some logging
            close_frame_needed = true;
        }
        if (req.response_state !== undefined || req.response_state !== 'ok') {
            // ? do some logging
            close_frame_needed = true;
        } else close_frame_needed = false;

        if (close_frame_needed) res.status(200).end();
    });

router.get('/docker-hbv-kms-http/api/v1/speach', (req, res, next) => {
    res.json("ok");
});
// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *       E X P O R T         
// *------------------------------------------------------------------------------

module.exports = router;

// * -----------------------------------------------------------------------------
// *       E O F
// *------------------------------------------------------------------------------
// ! ------------------------------------------------------------------------------