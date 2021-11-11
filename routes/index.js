const router = require("express").Router();
const https = require("https");

// http://localhost:3000/getpricedata/?symbol=BTC-USDT
router.get("/getpricedata", (req, res, next) => {
    const
        base_url = "api.kucoin.com",
        endpoint = "/api/v1/market/orderbook/level1?symbol=" + "BTC-USDT"; // req.body.symbol
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
});



module.exports = router;