/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const express = require('express')
const http = require("http");

const cookieParser = require('cookie-parser')
const path = require('path');
var routes = require("./routes");

const {
    PORT,
    URL
} = process.env.NODE_ENV == "PROD" ? require("./config").PRODUCTION : require("./config").DEVELOPMENT;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> G E N E R A L - S E T U P <----- ----- ----- */

const app = express()
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.set("view engine", "ejs");
app.engine('ejs', require('ejs').__express);
app.set('views', [
    path.join(__dirname, 'views'),
]);

app.use(routes);
app.use(express.static(__dirname + "/public"));

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

app.get("/docker-hbv-kms-http/", (req, res) => {
    res.render(""); // renders index.ejs
});


function errorHandler(req, res, next) {
    res.status(404).end();
}

app.use(errorHandler);

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> S T A R T <----- ----- ----- */

http.createServer(app).listen(PORT, () => {
    console.log(`Listening on ${URL}`)
})

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E OF <----- ----- ----- */