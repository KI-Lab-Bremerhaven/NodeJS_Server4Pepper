/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const crypto = require("crypto");

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> F U N T I O N S <----- ----- ----- */

function genPassword(password) {
    const salt = crypto.randomBytes(32).toString("hex");
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");

    return {
        salt: salt,
        hash: genHash
    };
}

function validatePassword(password, hash, salt) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return hash === hashVerify;
}

function generateHash(length) {
    return crypto.createHash('md5').update(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)).digest("hex").substring(0, length);
}

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T <----- ----- ----- */

module.exports.validatePassword = validatePassword;
module.exports.generatePassword = genPassword;
module.exports.generateHash = generateHash;


/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */