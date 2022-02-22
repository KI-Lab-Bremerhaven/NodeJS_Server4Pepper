/**
 * This endpoints fetching timetable related data and return them as response.
 * 
 * @version 1.0
 * @author Benjamin Thomas Schwertfeger
 * @email development@b-schwertfeger.de
 * @github https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
 * /

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> I M P O R T S <----- ----- ----- */

const router = require('express').Router();
const jsdom = require('jsdom');
const {
    JSDOM
} = jsdom;

const {
    myRequests
} = require('./../lib/requests');

const undefined = 'undefined';

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> R O U E T S <----- ----- ----- */

/**
 * FUNCTION TO GET TIMETABLE OF SOME STUDIENGANG 
 * e.g.: http://localhost:3000/docker-hbv-kms-http/api/v1/timetable?course=WI&semester=3
 */
router.get('/docker-hbv-kms-http/api/v1/timetable', (req, res, next) => {

    const query = req.query;

    if (!(typeof query !== undefined && query &&
            typeof query.course !== undefined && query.course
        )) res.status(400).end();
    else {
        const
            course = query.course.toUpperCase(),
            kw = (typeof query.kw !== undefined && query.kw) ? query.kw : 48;
        let
            semester = null,
            timetable = {
                'Mo': [],
                'Di': [],
                'Mi': [],
                'Do': [],
                'Fr': []
            };

        if (typeof query.semester !== undefined && query.semester) semester = query.semester

        const
            course_names = [`${course}_B1`, `${course}_B3`, `${course}_B5`, `${course}_B7`],
            course_name = (semester) ? `${course}_B${semester}` : null;

        try {
            const url = 'www4.hs-bremerhaven.de';
            // get the courseId's
            myRequests(
                data_to_send = {},
                host = url,
                endpoint = '/fb2/ws2122.php?action=showfb&fb=%23SPLUS938DBF',
                method = 'GET',
                callback = (response) => {
                    if (!response.statusCode === 200) res.status(reponse.statusCode).end();
                    else {
                        let
                            dom = new JSDOM(response),
                            courses = {},
                            course_ids = [], // all courseIds 
                            custom_course_id = null; // id for one specific semester

                        Array.from(dom.window.document.getElementsByName('identifier')[0].options).forEach(option => {
                            courses[option.text] = option.value;
                            if (option.text === course_name) custom_course_id = option.value;
                        });

                        for (var id = 0; id < course_names.length; id++) course_ids.push(courses[course_names[id]])

                        function getEndpoint(i, custom = false) {
                            if (custom) return `/fb2/ws2122.php?action=showplan&weeks=${kw}&fb=%23SPLUS938DBF&idtype=&listtype=Text-Listen&template=Set&objectclass=Studenten-Sets&identifier=${custom_course_id}&days=1;2;3;4;5&tabstart=41`
                            else return `/fb2/ws2122.php?action=showplan&weeks=${kw}&fb=%23SPLUS938DBF&idtype=&listtype=Text-Listen&template=Set&objectclass=Studenten-Sets&identifier=${course_ids[i]}&days=1;2;3;4;5&tabstart=41`;
                        }

                        function uptdateTimeTable(timetable, dom) {
                            Array.from(dom.window.document.getElementsByTagName('tr')).forEach(table_data => {
                                if (Object.keys(timetable).includes(table_data.getElementsByTagName('td')[0].innerHTML)) {
                                    timetable[table_data.getElementsByTagName('td')[0].innerHTML].push({
                                        begin: table_data.getElementsByTagName('td')[1].innerHTML,
                                        end: table_data.getElementsByTagName('td')[2].innerHTML,
                                        course: table_data.getElementsByTagName('td')[3].innerHTML,
                                        prof: table_data.getElementsByTagName('td')[4].innerHTML,
                                    })
                                }
                            });
                            return timetable;
                        }

                        // J A - DAS HIER IST NICHT SHÖN
                        // --> aber es sind asynchrone dinger, die alle passieren müssen und die route kann sonst nicht asynchron gestaltet werden
                        myRequests(data_to_send = {},
                            host = url,
                            endpoint = getEndpoint(0, custom_course_id),
                            method = 'GET',
                            callback = (response) => {
                                // console.log(response)
                                if (!response.statusCode === 200) res.status(reponse.statusCode).end();
                                else if (typeof query.htmlOnly !== undefined && query.htmlOnly) {
                                    res.set({ // not working for some reason
                                        'content-type': 'text/html; charset=UTF-8'
                                    });
                                    res.send(response).end();
                                } else {
                                    timetable = uptdateTimeTable(timetable, new JSDOM(response));

                                    if (custom_course_id) res.status(200).json(timetable).end();
                                    else if (course_ids.length > 1) myRequests(data_to_send = {},
                                        host = url,
                                        endpoint = getEndpoint(1),
                                        method = 'GET',
                                        callback = (response) => {
                                            // console.log(response)
                                            if (!response.statusCode === 200) res.status(reponse.statusCode).end();
                                            else {
                                                timetable = uptdateTimeTable(timetable, new JSDOM(response));
                                                if (course_ids.length > 2) myRequests(data_to_send = {},
                                                    host = url,
                                                    endpoint = getEndpoint(2),
                                                    method = 'GET',
                                                    callback = (response) => {
                                                        if (!response.statusCode === 200) res.status(reponse.statusCode).end();
                                                        else {
                                                            timetable = uptdateTimeTable(timetable, new JSDOM(response));

                                                            if (course_ids.length > 3) myRequests(data_to_send = {},
                                                                host = url,
                                                                endpoint = getEndpoint(3),
                                                                method = 'GET',
                                                                callback = (response) => {
                                                                    if (!response.statusCode === 200) res.status(reponse.statusCode).end();
                                                                    else {
                                                                        timetable = uptdateTimeTable(timetable, new JSDOM(response));

                                                                        if (course_ids.length > 4) myRequests(data_to_send = {},
                                                                            host = url,
                                                                            endpoint = getEndpoint(4),
                                                                            method = 'GET',
                                                                            callback = (response) => {
                                                                                if (!response.statusCode === 200) res.status(reponse.statusCode).end();
                                                                                else {
                                                                                    timetable = uptdateTimeTable(timetable, new JSDOM(response));
                                                                                    res.status(200).json(timetable).end();
                                                                                }
                                                                            }
                                                                        );
                                                                        else res.status(200).json(timetable).end();
                                                                    }
                                                                }
                                                            );
                                                            else res.status(200).json(timetable).end();
                                                        }
                                                    }
                                                );
                                                else res.status(200).json(timetable).end();
                                            }
                                        }
                                    );
                                    else res.status(200).json(timetable).end();
                                }
                            }
                        );
                    }
                });
        } catch (err) {
            console.log(`some error: ${err}`);
            res.status(500).json({
                message: err.message
            }).end();
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