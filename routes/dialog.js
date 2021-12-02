const router = require("express").Router();
const https = require("https");

router.get("/docker-hbv-kms-http/dialogtest", (req, res) => {
    res.status(200).json({
        sometext: "no"
    })
});


module.exports = router;