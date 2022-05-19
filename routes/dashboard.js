/**
 * This routes handles the Admin Dashboard. It connects to the database and renders the view.
 * 
 * @version 1.0
 * @author Benjamin Thomas Schwertfeger
 * @email development@b-schwertfeger.de
 * @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 */

// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *       I M P O R T S         
// *------------------------------------------------------------------------------


const
    router = require("express").Router(),
    mysql = require("mysql");

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = (process.env.NODE_ENV === "PROD") ? require("./../config").PRODUCTION: require("../config").DEVELOPMENT;

const {
    verifyToken
} = require("../middleware/auth")

const {
    emotion_table_name,
    attributes_table_name,
    use_case_table_name,
    not_understand_table_name
} = require("../config").TABLES;


// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *       S E T U P         
// *------------------------------------------------------------------------------



var pool = mysql.createPool({
    connectionLimit: 10, // default = 10
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *        R O U T E S         
// * ------------------------------------------------------------------------------

// only if logged in
router.get('/docker-hbv-kms-http/dashboard', verifyToken, (req, res, next) => {
    pool.getConnection((err, con) => {
        con.query(`SELECT * FROM ${emotion_table_name} ORDER BY ts DESC LIMIT 250`, (err, data_rows) => {
            if (err) res.json({
                message: "Could not get data from database!"
            });
            else res.render("dashboard", {
                title: "Dashboard",
                environment: process.env.NODE_ENV,
                data: JSON.stringify(data_rows),
            });
        });
    });
});


router.get('/docker-hbv-kms-http/dashboard/view', verifyToken, (req, res, next) => {
    const
        conversation_id = req.query.conversation_id,
        db_err_msg = "Could not get data from database!";
    pool.getConnection((err, con) => {
        con.query(`SELECT distance, age, gender, basic_emotion, pleasure_state, excitement_state, smile_state, dialog_time, ts FROM ${emotion_table_name} WHERE identifier ="${conversation_id}"`, (err, emotion_data) => {
            if (err) res.json({
                message: db_err_msg
            });
            else if (emotion_data.length === 0) res.status(400).end();
            else con.query(`SELECT data FROM ${attributes_table_name} WHERE identifier = "${conversation_id}"`, (err, general_data) => {
                if (err) res.json({
                    message: db_err_msg
                });
                else con.query(`SELECT use_case, ts FROM ${use_case_table_name} WHERE identifier = "${conversation_id}"`, (err, use_case_data) => {
                    if (err) res.json({
                        message: db_err_msg
                    });
                    else con.query(`SELECT phrase, ts FROM ${not_understand_table_name} WHERE identifier = "${conversation_id}"`, (err, did_not_understand_data) => {
                        con.release();
                        if (err) res.json({
                            message: db_err_msg
                        });
                        else res.render("detailView", {
                            title: `View ${conversation_id}`,
                            environment: process.env.NODE_ENV,
                            conversation_id: conversation_id,
                            emotion_data: emotion_data[0],
                            use_case_data: use_case_data,
                            general_data: (general_data.length !== 0) ? general_data[0].data : null,
                            did_not_understand_data: did_not_understand_data
                        });
                    });
                });
            });
        });
    });
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