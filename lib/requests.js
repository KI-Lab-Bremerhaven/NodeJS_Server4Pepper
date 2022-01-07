/**
 * This file exports request functions to not write them over and over again.
 * 
 *  @version: 1.0.0
 *  @author: Benjamin Thomas Schwertfeger (2022)
 *  @email development@b-schwertfeger.de
 *  @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 **/

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const https = require("https");

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T S <----- ----- ----- */

module.exports.myRequests = (data_to_send, host, endpoint, method = "POST", callback = () => {}) => {
    // HIER BITTE NICHTS DRAN ÄNDERN!
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
                // okay, dann bleibt es ein String, dann ist es eine ganze html Seite als String
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

module.exports.asyncRequests = async (data_to_send, host, endpoint, method = "POST", callback = () => {}) => {
    return new Promise(function (resolve, reject) {
        // HIER BITTE NICHTS DRAN ÄNDERN!
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
                    // okay, dann bleibt es ein String, dann ist es eine ganze html Seite als String
                }
                resolve(data)
            });
        }).on("error", (err) => {
            callback({
                statusCode: 500,
                message: err.message,
            });
        });
        if (method === "POST") request.write(post_data);
        request.end();
    })
};