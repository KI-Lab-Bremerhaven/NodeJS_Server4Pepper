/**
 * This middleware is used to verify the user by checking the JWT
 * 
 *  @version: 1.0.0
 *  @author: Benjamin Thomas Schwertfeger (2022)
 *  @email development@b-schwertfeger.de
 *  @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 **/

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const jwt = require("jsonwebtoken"),
    fs = require("fs");

const RSA_PUBLIC_KEY = fs.readFileSync(__dirname + "/../keys/id_rsa_priv.pem");

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T S <----- ----- ----- */

module.exports.verifyToken = (req, res, next) => {
    let token = req.cookies["x-access-token"]
    if (!token) return res.redirect("/docker-hbv-kms-http");
    // return res.status(403).send({
    //     message: "No token provided!"
    // });

    jwt.verify(token, RSA_PUBLIC_KEY, {
        algorithms: ["RS256"]
    }, (err, decoded) => {
        // this also checks expiration
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        next();
    });
};

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */