const router = require("express").Router();
const https = require("https");

router.get("/docker-hbv-kms-http/mensadata", (req, res) => {
    filePath = path.join(__dirname, '/public/mensadata.json');
    var jsonData = JSON.parse(fs.readFileSync(filePath, 'latin1'));
    res.send(jsonData);
});

router.get("/docker-hbv-kms-http/mensadata/img", (req, res) => {
    filePath = path.join(__dirname, '/public/images/mensaplan.png');
    var img = fs.readFileSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(img, 'binary');
});

module.exports = router;