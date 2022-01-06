/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */


const
    router = require("express").Router(),
    mysql = require('mysql'),
    RSA_PRIVATE_KEY = require("fs").readFileSync(`${__dirname}/../../keys/id_rsa_priv.pem`),
    JWT_EXPIRE_TIME_IN_S = 60 * 60 * 24 * 14; // 14 days

var jwt = require("jsonwebtoken");

const {
    generatePassword,
    validatePassword,
    generateHash
} = require("../../lib/utils");

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = (process.env.NODE_ENV === "PROD") ? require("../../config").PRODUCTION: require("../../config").DEVELOPMENT;

require('dotenv').config();

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


// this initializes the table where we want to store the data
pool.getConnection(function (err, con) {
    if (err) throw err;
    // console.log("Connected!");
    var sql = "CREATE TABLE IF NOT EXISTS users (uid INT NOT NULL AUTO_INCREMENT, ";
    sql += "username VARCHAR(20), hash VARCHAR(128), salt VARCHAR(128), "
    sql += "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (uid))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        else {
            con.query("SELECT username FROM users WHERE username = 'admin'", (err, result, field) => {
                if (result.length !== 0) return;
                else {
                    const password = generateHash(20);
                    console.log(`ADMIN PASSWORD: ${password}`)

                    const saltHash = generatePassword(password);
                    const
                        hash = saltHash.hash,
                        salt = saltHash.salt;


                    sql = `INSERT INTO users (username, hash, salt) VALUES ('admin', '${hash}', '${salt}')`;
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        else console.log("Admin user created!");
                    });
                }
            });
        }
    });
});


/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

router.get("/docker-hbv-kms-http/login", (req, res, next) => {
    res.render("login", {
        title: "Login",
        environment: (process.env.NODE_ENV === "PROD") ? "Production" : "Developement",
    });
});

router.post("/docker-hbv-kms-http/login", (req, res, next) => {
    const body = req.body;

    if (!(typeof body.username_input !== "undefined" && body.username_input && typeof body.password_input !== "undefined" && body.password_input)) res.status(404).end();
    else {
        pool.getConnection(function (err, con) {
            if (err) throw err;
            var sql = `SELECT hash, salt FROM users WHERE username = '${body.username_input}'`;
            con.query(sql, function (err, result, field) {
                if (err) throw err // || result.length === 0) res.status(404).end();
                else {
                    console.log(body.password_input)
                    const passwordIsValid = validatePassword(body.password_input.toString(), result[0].hash, result[0].salt);

                    if (!passwordIsValid) res.status(401).end();
                    else {
                        console.log("logged in!")
                        const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
                            algorithm: 'RS256',
                            expiresIn: JWT_EXPIRE_TIME_IN_S,
                            subject: "idk"
                        });
                        res.cookie("x-access-token", jwtBearerToken);
                        res.redirect('dashboard');
                    }
                }
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