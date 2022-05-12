/**
 * This file is the entry point of this Express Server.
 * It includes setups, configs and router.
 * 
 * Run by: node server.js
 * 
 *  @version: 1.0.0
 *  @author: Benjamin Thomas Schwertfeger (2022)
 *  @email development@b-schwertfeger.de
 *  @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 **/

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const
    express = require('express'),
    http = require('http'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    routes = require('./routes'),
    session = require('express-session'),
    flash = require('express-flash');

const {
    PORT,
    URL
} = process.env.NODE_ENV == 'PROD' ? require('./config').PRODUCTION : require('./config').DEVELOPMENT;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> G E N E R A L - S E T U P <----- ----- ----- */

const app = express()
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(
    session({
      resave: true,
      saveUninitialized: true,
      secret:"Auohgf743t§%$&%/FT",
      cookie: { secure: false, maxAge: 14400000 },
    })
);

app.use(flash());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', [
    `${__dirname}/views`, `${__dirname}/views/includes`
]);

app.use('/static', express.static(path.join(__dirname, 'static'))); // lokal geht das, aber auf dem hopper nicht, daher gibt es 'routes/fileserver.js'
app.use(routes);

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

app.get('/docker-hbv-kms-http/', (req, res) => {
    res.render('', {
        environment: (process.env.NODE_ENV === 'PROD') ? 'Production' : 'Developement',
    });
});

// must be at the end to catch all incorrect requests
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