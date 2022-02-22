/**
 * This Route serves static files on request.
 * Usualy this is done by the express.static method - because of the inner redirect of the universities servrer,
 * this does not work, so we are using this approach.
 * 
 * @version 1.0
 * @author Benjamin Thomas Schwertfeger
 * @email development@b-schwertfeger.de
 * @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 **/

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T <----- ----- ----- */

const
    router = require('express').Router(),
    path = require('path');

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

router.get('/docker-hbv-kms-http/fileserver', (req, res, next) => {
    const query = req.query;
    if (query.name === 'styles.css') res.sendFile(path.join(__dirname, '..', 'static', 'css', 'styles.css'));
    else if (query.name === 'dashboard.styles.css') res.sendFile(path.join(__dirname, '..', 'static', 'css', 'dashboard.styles.css'));
    else if (query.name === 'dashboard.chartjs.js') res.sendFile(path.join(__dirname, '..', 'static', 'scripts', 'dashboard.chartjs.js'));
    else res.json({
        status_code: 404,
        message: 'File not found!'
    });
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */