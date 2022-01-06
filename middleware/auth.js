const jwt = require("jsonwebtoken");
const fs = require("fs");

const RSA_PUBLIC_KEY = fs.readFileSync(__dirname + "/../keys/id_rsa_priv.pem");

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