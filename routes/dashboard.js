/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

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

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> S E T U P <----- ----- ----- */


var pool = mysql.createPool({
    connectionLimit: 10, // default = 10
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

// only if logged in
router.get('/docker-hbv-kms-http/dashboard', verifyToken, (req, res, next) => {
    pool.getConnection(function (err, con) {
        con.query("SELECT * FROM pepper_data ORDER BY ts DESC LIMIT 250", function (err, rows) {
            if (err) res.json({
                message: "Could not get data from database!"
            });
            else res.render("dashboard", {
                title: "dashboard",
                data: JSON.stringify(rows)
            });
        });
    });
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T S <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */