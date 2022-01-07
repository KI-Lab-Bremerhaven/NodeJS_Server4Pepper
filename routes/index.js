/**
 * This router imports all other router and exports them.
 * This Router must be inclueded in the server.js
 * 
 * @version 1.0
 * @author Benjamin Thomas Schwertfeger
 * @email development@b-schwertfeger.de
 * @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 **/

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const
    router = require("express").Router(),
    https = require("https");
require('dotenv').config();

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> S E T U P <----- ----- ----- */

[
    "./dashboard", "./collector",
    "./mensa", "./timetable", "./dialog",
    "./auth/login", "./auth/logout",
    "./fileserver"
].forEach((elem) => {
    router.use(require(elem));
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

router.get("/docker-hbv-kms-http/ip", (req, res, next) => {
    res.status(200).json({
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    })
});

// http://localhost:3000/crypto?subject=price&symbol=BTC-USDT <- for testing only
router.get("/docker-hbv-kms-http/crypto", (req, res, next) => {

    if (!(req.query && req.query.subject)) res.status(404).end();
    if (req.query.subject === "price" && req.query.symbol) {
        const
            base_url = "api.kucoin.com",
            endpoint = "/api/v1/market/orderbook/level1?symbol=" + req.query.symbol.toUpperCase(); // req.body.symbol
        let
            output = '',
            message,
            code;

        const options = {
            host: base_url,
            path: endpoint,
            method: "GET",
            json: true,
        };

        var request = https.request(options, function (response) {
            // console.log(options.host + ':' + res.statusCode);
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                output += chunk;
            });

            response.on('end', function () {
                output = JSON.parse(output)
                res.send(output);
            });
        });

        request.on('error', function (err) {
            message = "Internal server error";
            res.writeHead(500, message.toString(), {
                'content-type': 'text/plain'
            });
            res.end(message.toString());
        });
        request.end();
    } else {
        res.status(404).end()
    }
});



/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T S <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */