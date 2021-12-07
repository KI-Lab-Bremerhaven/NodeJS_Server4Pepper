/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */


const router = require("express").Router();
const https = require("https");


/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> S E T U P <----- ----- ----- */

router.use(require("./mensa"));
router.use(require("./timetable"));
router.use(require("./dialog"));

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */


// http://localhost:3000/crypto?subject=price&symbol=BTC-USDT
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