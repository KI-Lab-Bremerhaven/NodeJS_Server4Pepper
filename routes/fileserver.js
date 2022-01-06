/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const
    router = require("express").Router(),
    path = require("path");

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U T E S <----- ----- ----- */

router.get("/docker-hbv-kms-http/fileserver", (req, res, next) => {
    const query = req.query;
    if (query.name === "styles.css") res.sendFile(path.join(__dirname, "..", "static", "css", "styles.css"));
    else if (query.name === "dashboard.styles.css") res.sendFile(path.join(__dirname, "..", "static", "css", "dashboard.styles.css"));
    else if (query.name === "dashboard.chartjs.js") res.sendFile(path.join(__dirname, "..", "static", "scripts", "dashboard.chartjs.js"));
    else res.json({
        message: "hä?"
    })
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */