/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */


const mysql = require('mysql');
const router = require("express").Router();
require('dotenv').config()

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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


// this initializes the table where we want to store the data
pool.getConnection(function (err, con) {
    if (err) throw err;
    // console.log("Connected!");
    var sql = "CREATE TABLE IF NOT EXISTS pepper_data (data_id INT NOT NULL AUTO_INCREMENT, distance ";
    sql += "VARCHAR(20), age VARCHAR(20), gender VARCHAR(20), basic_emotion VARCHAR(50), pleasure_state VARCHAR(30), excitement_state VARCHAR(30),";
    sql += "smile_state VARCHAR(30), dialog_time VARCHAR(30), ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (data_id))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        // console.log("Table created");
    });
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

router.get("/docker-hbv-kms-http/collector", (req, res, next) => {
    // e.g.: https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/collector?subject=save_pepper_data&distance=1&age=29&gender=male&basic_emotion=good&pleasure_state=perfect&excitement_state=excited&smile_state=true&dialog_time=20
    if (!(req.query && typeof req.query.subject !== "undefined" && req.query.subject)) res.status(404).end();
    if (req.query.subject === "save_pepper_data") {
        const unknown = "UNKNOWN"
        var query = req.query;
        if (!(typeof query.distance !== "undefined" && query.distance)) query.distance = unknown;
        if (!(typeof query.age !== "undefined" && query.age)) query.age = unknown;
        if (!(typeof query.gender !== "undefined" && query.gender)) query.gender = unknown;
        if (!(typeof query.basic_emotion !== "undefined" && query.basic_emotion)) query.basic_emotion = unknown;
        if (!(typeof query.pleasure_state !== "undefined" && query.pleasure_state)) query.pleasure_state = unknown;
        if (!(typeof query.excitement_state !== "undefined" && query.excitement_state)) query.excitement_state = unknown;
        if (!(typeof query.smile_state !== "undefined" && query.pleasure_state)) query.smile_state = unknown;
        if (!(typeof query.dialog_time !== "undefined" && query.dialog_time)) query.dialog_time = unknown;

        const
            distance = query.distance,
            age = query.age,
            gender = query.gender,
            basic_emotion = query.basic_emotion,
            pleasure_state = query.pleasure_state,
            excitement_state = query.excitement_state,
            smile_state = query.smile_state,
            dialog_time = query.dialog_time;

        // to avoid some xss
        if (dirty_sql_words.some(v => [distance, age, gender, basic_emotion, pleasure_state, excitement_state, smile_state, dialog_time].includes(v.toLocaleLowerCase()))) {
            res.status(401).json({
                message: "Invalid parameter!"
            }).end();
        };

        pool.getConnection(function (err, con) {
            if (err) throw err; // res.status(500).end();
            var sql = `INSERT INTO pepper_data (distance, age, gender, basic_emotion, pleasure_state, excitement_state, smile_state, dialog_time) VALUES`;
            sql += `('${distance.toString()}', '${age.toString()}', '${gender.toString()}', '${basic_emotion.toString()}', `
            sql += `'${pleasure_state.toString()}', '${excitement_state.toString()}', '${smile_state.toString()}', '${dialog_time.toString()}')`;

            con.query(sql, function (err, result) {
                if (err) throw err;
                con.release()
                res.status(200).end();
            });
        });
    } else if (req.query.subject === "getData") {
        // https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/collector?subject=getData
        pool.getConnection(function (err, con) {
            con.query("SELECT * FROM pepper_data", function (err, rows) {
                if (err) throw err;

                console.log(rows.length);
                res.send(JSON.stringify(rows));
            });
        });
    }
});


/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */