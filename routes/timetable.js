/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> IMPORTS <----- ----- ----- */

const router = require("express").Router();
const https = require("https");

const jsdom = require('jsdom');
const {
    JSDOM
} = jsdom;

const {
    myRequests
} = require("./../lib/requests");

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> F U N C T I O N S <----- ----- ----- */


/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U E T S <----- ----- ----- */

router.get("/docker-hbv-kms-http/timetable", (req, res, next) => {
    const query = req.query;



    if (!(typeof query !== "undefined" && query &&
            typeof query.course !== "undefined" && query.course &&
            typeof query.semester !== "undefined" && query.semester
        )) res.status(404).end();
    else {
        const
            course = query.course,
            semester = query.semester,
            kw = 48;
        const courseId = `${course}_B${semester}`
        // ----- get course id

        var page_content;
        myRequests(
            data_to_send = {},
            host = "www4.hs-bremerhaven.de",
            endpoint = "/fb2/ws2122.php?action=showfb&fb=%23SPLUS938DBF",
            method = "GET",
            callback = (response) => {
                // console.log(response)
                page_content = response; // <- this is now the page content

                const jsdom = require("jsdom");
                const dom = new JSDOM(page_content) //`<!DOCTYPE html><body><p id="main">My First JSDOM!</p></body>`);

                let courses = {}
                Array.from(dom.window.document.getElementsByName("identifier")[0].options).forEach(option => {
                    courses[option.text] = option.value;
                });

                console.log(courses)


                myRequests(
                    data_to_send = {},
                    host = "www4.hs-bremerhaven.de",
                    endpoint = `/fb2/ws2122.php?action=showplan&weeks=${kw}&fb=%23SPLUS938DBF&idtype=&listtype=Text-Listen&template=Set&objectclass=Studenten-Sets&identifier=${courseId}&days=1;2;3;4;5&tabstart=41`,
                    method = "GET",
                    callback = (response2) => {
                        res.status(200).end();
                    });
            }
        );
        res.status(500).end();
    }
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T S <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */