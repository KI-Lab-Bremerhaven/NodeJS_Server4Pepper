const https = require("https");
const http = require("http");
module.exports.myRequests = (data_to_send, host, endpoint, method = "POST", callback = () => {}) => {
    // const data_to_sign = JSON.stringify(data_to_send);

    const post_data = JSON.stringify(data_to_send);

    content = {
        host: host,
        path: endpoint,
        method: method,
    }
    if (method === "POST") conetnt.headers = {
        'Content-Type': 'application/json',
        'Content-Length': post_data.length
    }

    var request = https.request(content, (response) => {
        let data = "";

        // console.log('Status Code:', response.statusCode);
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            let resp_data = {}
            if (!data) data = {}
            else try {
                data = JSON.parse(data);
            } catch (err) {
                //okay, dann bleibt es ein string, dann ist es eine ganze html seite
            }
            callback(data);
        });
    }).on("error", (err) => {
        callback({
            statusCode: 500,
            message: err.message,
        });
    });
    if (method === "POST") request.write(post_data);
    request.end();
}