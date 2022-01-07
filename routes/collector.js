/**
 * This Routes handles requests to store and get data into and from the database. 
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
const router = require("express").Router();
require('dotenv').config()

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = (process.env.NODE_ENV === "PROD") ? require("./../config").PRODUCTION: require("../config").DEVELOPMENT;


/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> S E T U P <----- ----- ----- */

const dirty_sql_words = [
    "select", "delete", "from", "where",
    "order", "by", "desc", "asc", "join", "shift",
    "primary", "key", "secondary", "null", "auto_increment",
    "drop", "table", "create",
    "\\", ".", "..", "*", "$", "/", "//", "'", "\""
];

var pool = mysql.createPool({
    connectionLimit: 10, // default = 10
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

const
    emotion_table_name = "pepper_emotion_data_table",
    conversation_table_name = "pepper_conversation_data",
    use_case_table_name = "pepper_use_case_table",
    not_understand_table_name = "pepper_did_not_understand_table";


// this initializes the table where we want to store the data
pool.getConnection(function (err, con) {
    if (err) throw err;
    else {
        // EMOTION DATA + DIALOG TIME
        var sql = `CREATE TABLE IF NOT EXISTS ${emotion_table_name} (data_id INT NOT NULL AUTO_INCREMENT, identifier VARCHAR(128), distance `;
        sql += "VARCHAR(20), age VARCHAR(20), gender VARCHAR(20), basic_emotion VARCHAR(50), pleasure_state VARCHAR(30), excitement_state VARCHAR(30),";
        sql += "smile_state VARCHAR(30), dialog_time VARCHAR(30), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))";
        con.query(sql, function (err, result) {
            if (err) throw err;
            //else console.log(`Table ${emotion_table_name} created`);
        });

        // OTHER CONVERSATION DATA
        sql = `CREATE TABLE IF NOT EXISTS ${conversation_table_name} (data_id INT NOT NULL AUTO_INCREMENT, identifier VARCHAR(128), data LONGTEXT, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            //else console.log(`Table ${conversation_table_name} created`);
        });


        // USE CASE TABLE
        sql = `CREATE TABLE IF NOT EXISTS ${use_case_table_name} (data_id INT NOT NULL AUTO_INCREMENT, `;
        sql += "use_case VARCHAR(128),  identifier VARCHAR(128), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))";
        con.query(sql, function (err, result) {
            if (err) throw err;
            //else console.log(`Table ${use_case_table_name} created`);
        });

        // DID NOT UNDERSTAND PHRASES TABLE
        sql = `CREATE TABLE IF NOT EXISTS ${not_understand_table_name} (data_id INT NOT NULL AUTO_INCREMENT, `;
        sql += "phrase VARCHAR(1024), identifier VARCHAR(128), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))";
        con.query(sql, function (err, result) {
            if (err) throw err;
            //else console.log(`Table ${not_understand_table_name} created`);
        });
    }
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

router.post("/docker-hbv-kms-http/collector", (req, res, nect) => {
    let
        body = req.body;
    let
        identifier = body.identifier,
        data = body.data;
    const
        subject = body.subject,
        unknown = "UNKNOWN";

    if (!(body && typeof subject !== "undefined" && subject)) res.status(404).end();
    else if (!(typeof data !== "undefined" && data)) res.json({
        message: "No data provided!"
    }).end();
    else if (!(typeof identifier !== "undefined" && identifier)) identifier = unknown;
    else if (subject === "conversation_content") {

        // hier müsste man prüfen, ob nicht doch sql befehle dabei sind, damit niemand das auslesen kann
        // jedoch würde dadruch auch der json string kaputt gehen
        // man sollte stattdessen versuchen, dem pepper auch ein doken zu geben, welches er bei jeder anfrage übermittelt,
        // damit nur er daten schreiben kann

        try {
            const _ = JSON.parse(JSON.stringify(data));

            pool.getConnection(function (err, con) {
                if (err) res.json({
                    message: "Error while connecting to Database"
                }).end();
                else {
                    const json_str = JSON.stringify(data);
                    const sql = `INSERT INTO ${conversation_table_name} (identifier, data) VALUES ('${identifier.toString()}', '${json_str}')`;
                    con.query(sql, function (err, result) {
                        con.release();
                        if (err) res.json({
                            message: "Could not save data to database!"
                        });
                        else res.status(200).end();
                    });
                }
            });

        } catch (err) {
            res.json({
                message: "Data should be a valid object in format JSON"
            }).end();
        }


    } else res.json({
        message: "Subject not found!"
    }).end();

});

router.get("/docker-hbv-kms-http/collector", (req, res, next) => {
    // e.g.: https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/collector?subject=save_pepper_data&identifier=somehash&distance=1&age=29&gender=male&basic_emotion=good&pleasure_state=perfect&excitement_state=excited&smile_state=true&dialog_time=20
    let query = req.query;
    const
        subject = query.subject,
        unknown = "UNKNOWN";

    if (!(query && typeof subject !== "undefined" && subject)) res.status(404).end();
    else if (subject === "save_pepper_data") {
        if (!(typeof query.identifier !== "undefined" && query.identifier)) query.identifier = unknown;
        if (!(typeof query.distance !== "undefined" && query.distance)) query.distance = unknown;
        if (!(typeof query.age !== "undefined" && query.age)) query.age = unknown;
        if (!(typeof query.gender !== "undefined" && query.gender)) query.gender = unknown;
        if (!(typeof query.basic_emotion !== "undefined" && query.basic_emotion)) query.basic_emotion = unknown;
        if (!(typeof query.pleasure_state !== "undefined" && query.pleasure_state)) query.pleasure_state = unknown;
        if (!(typeof query.excitement_state !== "undefined" && query.excitement_state)) query.excitement_state = unknown;
        if (!(typeof query.smile_state !== "undefined" && query.pleasure_state)) query.smile_state = unknown;
        if (!(typeof query.dialog_time !== "undefined" && query.dialog_time)) query.dialog_time = unknown;

        const
            identifier = query.identifier,
            distance = query.distance,
            age = query.age,
            gender = query.gender,
            basic_emotion = query.basic_emotion,
            pleasure_state = query.pleasure_state,
            excitement_state = query.excitement_state,
            smile_state = query.smile_state,
            dialog_time = query.dialog_time;

        // to avoid some xss
        if (dirty_sql_words.some(v => [
                identifier, distance, age, gender, basic_emotion,
                pleasure_state, excitement_state,
                smile_state, dialog_time
            ].includes(v.toLocaleLowerCase()))) res.status(401).json({
            message: "Invalid parameter!"
        }).end();

        pool.getConnection(function (err, con) {
            if (err) res.json({
                message: "Error while connecting to Database"
            }).end();
            else {
                let sql = `INSERT INTO ${emotion_table_name} (identifier, distance, age, gender, basic_emotion, pleasure_state, excitement_state, smile_state, dialog_time) VALUES`;
                sql += `('${identifier.toString()}', '${distance.toString()}', '${age.toString()}', '${gender.toString()}', '${basic_emotion.toString()}', `
                sql += `'${pleasure_state.toString()}', '${excitement_state.toString()}', '${smile_state.toString()}', '${dialog_time.toString()}')`;

                con.query(sql, function (err, result) {
                    con.release();
                    if (err) throw err;
                    else res.status(200).end();
                });
            }
        });

    } else if (subject === "save_use_case_counter") {
        // e.g.: https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/collector?subject=save_use_case_counter&identifier=somenicehash&use_case=Mensaplan
        if (!(typeof query.identifier !== "undefined" && query.identifier)) query.identifier = unknown;
        if (!(typeof query.use_case !== "undefined" && query.use_case)) query.use_case = unknown;

        const
            identifier = query.identifier,
            use_case = query.use_case;

        if (dirty_sql_words.some(v => [identifier, use_case].includes(v.toLocaleLowerCase()))) res.status(401).json({
            message: "Invalid parameter!"
        }).end();

        pool.getConnection(function (err, con) {
            if (err) res.json({
                message: "Error while connecting to Database"
            }).end();
            else {
                const sql = `INSERT INTO ${use_case_table_name} (use_case, identifier) VALUES ('${use_case.toString()}', '${identifier.toString()}')`; // ON DUPLICATE KEY UPDATE count = count + 1`;
                con.query(sql, function (err, result) {
                    con.release();
                    if (err) res.json({
                        message: "Could not save data to database!"
                    });
                    else res.status(200).end();
                });
            }
        });

    } else if (subject === "save_not_understand") {
        // e.g.: https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/collector?subject=save_not_understand&identifier=somenicehash&phrase=blabla
        if (!(typeof query.identifier !== "undefined" && query.identifier)) query.identifier = unknown;
        if (!(typeof query.phrase !== "undefined" && query.phrase)) query.phrase = unknown;

        const
            identifier = query.identifier,
            phrase = query.phrase;

        if (dirty_sql_words.some(v => [phrase, identifier].includes(v.toLocaleLowerCase()))) res.status(401).json({
            message: "Invalid parameter!"
        }).end();

        pool.getConnection(function (err, con) {
            if (err) res.json({
                message: "Error while connecting to Database"
            }).end();
            else {
                const sql = `INSERT INTO ${not_understand_table_name} (phrase, identifier) VALUES ('${phrase.toString()}', '${identifier.toString()}')`; // ON DUPLICATE KEY UPDATE count = count + 1`;
                con.query(sql, function (err, result) {
                    con.release();
                    if (err) res.json({
                        message: "Could not save data to database!"
                    });
                    else res.status(200).end();
                });
            }
        });
    } else res.json({
        message: "Subject not Found!"
    }).end();
});

router.get("/docker-hbv-kms-http/getData", verifyToken, (req, res, next) => {
    // https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/getData

    const query = req.query;
    let query_string;

    if (typeof query.n !== "number") query_string = `LIMIT ${query.n}`

    pool.getConnection(function (err, con) {
        con.query(`SELECT * FROM ${emotion_table_name} ORDER BY ts DESC ${query_string}`, function (err, rows) {
            con.release()
            if (err) res.json({
                message: "Could not load data from database!"
            });
            else res.send(JSON.stringify(rows));
        });
    });
})

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */