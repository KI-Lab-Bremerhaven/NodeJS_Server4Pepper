const router = require("express").Router();


router.get("/docker-hbv-kms-http/logout", (req, res, next) => {
    ["connect.sid", "x-access-token"].forEach((key) => {
        res.clearCookie(key)
    });
    res.redirect("/docker-hbv-kms-http/");
});

module.exports = router;