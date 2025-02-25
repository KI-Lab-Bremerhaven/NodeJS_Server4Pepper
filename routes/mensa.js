// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *       I M P O R T S         
// *------------------------------------------------------------------------------


const
    router = require('express').Router(),
    fs = require('fs');

// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *        R O U T E S         
// * ------------------------------------------------------------------------------


router.get('/docker-hbv-kms-http/api/v1/mensadata', (req, res) => {
    const filePath = `${__dirname}/../static/data/mensadata.json`;
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'latin1'));
    res.send(jsonData);
});

router.get('/docker-hbv-kms-http/api/v1/mensadata/img', (req, res) => {
    const filePath = `${__dirname}/../static/images/mensaplan.png`;
    const img = fs.readFileSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(img, 'binary');
});

// ! ------------------------------------------------------------------------------
// * -----------------------------------------------------------------------------
// *       E X P O R T         
// *------------------------------------------------------------------------------


module.exports = router;

// * -----------------------------------------------------------------------------
// *       E O F
// *------------------------------------------------------------------------------
// ! ------------------------------------------------------------------------------