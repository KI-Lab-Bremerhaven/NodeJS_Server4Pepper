/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> IMPORTS <----- ----- ----- */

const router = require("express").Router();

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

    /*
     * FUNCTION TO GET TIMETABLE OF SOME STUDIENGANG 
     * e.g.: http://localhost:3000/docker-hbv-kms-http/timetable?course=WI&semester=3
     */

    const query = req.query;

    if (!(typeof query !== "undefined" && query &&
            typeof query.course !== "undefined" && query.course &&
            typeof query.semester !== "undefined" && query.semester
        )) res.status(404).end();
    else {
        const
            course = query.course.toUpperCase(),
            semester = query.semester,
            kw = (typeof query.kw !== "undefined" && query.kw) ? query.kw : 48;

        const course_name = `${course}_B${semester}`

        try {
            // get the courseId's
            myRequests(
                data_to_send = {},
                host = "www4.hs-bremerhaven.de",
                endpoint = "/fb2/ws2122.php?action=showfb&fb=%23SPLUS938DBF",
                method = "GET",
                callback = (response) => {
                    if (!response.statusCode === 200) res.status(reponse.statusCode).end();
                    else {
                        let
                            dom = new JSDOM(response),
                            courses = {};
                        Array.from(dom.window.document.getElementsByName("identifier")[0].options).forEach(option => {
                            courses[option.text] = option.value;
                        });
                        const courseId = courses[course_name];

                        // get the timetable by courseId
                        myRequests(
                            data_to_send = {},
                            host = "www4.hs-bremerhaven.de",
                            endpoint = `/fb2/ws2122.php?action=showplan&weeks=${kw}&fb=%23SPLUS938DBF&idtype=&listtype=Text-Listen&template=Set&objectclass=Studenten-Sets&identifier=${courseId}&days=1;2;3;4;5&tabstart=41`,
                            method = "GET",
                            callback = (response2) => {
                                if (!response2.statusCode === 200) res.status(reponse2.statusCode).end();
                                else {
                                    dom = new JSDOM(response2)
                                    let timetable = {
                                        "Mo": [],
                                        "Di": [],
                                        "Mi": [],
                                        "Do": [],
                                        "Fr": []
                                    };
                                    Array.from(dom.window.document.getElementsByTagName("tr")).forEach(table_data => {
                                        if (Object.keys(timetable).includes(table_data.getElementsByTagName("td")[0].innerHTML)) {
                                            timetable[table_data.getElementsByTagName("td")[0].innerHTML].push({
                                                begin: table_data.getElementsByTagName("td")[1].innerHTML,
                                                end: table_data.getElementsByTagName("td")[2].innerHTML,
                                                course: table_data.getElementsByTagName("td")[3].innerHTML,
                                                prof: table_data.getElementsByTagName("td")[4].innerHTML,
                                            })
                                        }
                                    });
                                    res.status(200).json(timetable).end(); // return the timetable
                                }
                            });
                    }
                }
            );
        } catch (err) {
            console.log(`some error: ${err}`);
            res.status(500).end();
        }
    }
});

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E X P O R T S <----- ----- ----- */

module.exports = router;

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> E O F <----- ----- ----- */