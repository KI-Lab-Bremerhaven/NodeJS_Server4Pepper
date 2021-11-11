const express = require('express')

const path = require('path');
var routes = require("./routes");
const {
    builtinModules
} = require("module");

const {
    PORT
} = process.env.NODE_ENV == "PROD" ? require("./config").PRODUCTION : require("./config").DEVELOPMENT;


/* *
 * ----- ----- GENERAL SETUP ----- ----- ----- ----- ----- ----- 
 */


const app = express()
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.set('views', [
    path.join(__dirname, 'views'),
]);

app.use(routes);
app.use(express.static(__dirname + "/public"));

/* *
 * ----- ----- ROUTES ----- ----- ----- ----- ----- ----- 
 */


app.get('/', (req, res) => {
    res.send('Hello World!')
})

function errorHandler(req, res, next) {
    // how to handle errors in express middleware
    res.status(404).end();
}

app.use(errorHandler);


/* *
 * ----- ----- GENERAL SETUP ----- ----- ----- ----- ----- ----- 
 */

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})