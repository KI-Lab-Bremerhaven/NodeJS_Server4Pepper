/**
 * This script loads collected conversation data from the backend database via AJAX
 * and created Plots to visualize Distributoins.
 *     (Route: /docker-hbv-kms/dashboard)
    
*    @version: 1.0.0
*    @author: Benjamin Thomas Schwertfeger (2022)
*    @github: https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper
*/

/* * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * * 
 * * * ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- * * * 
 * * * -----> S E T T I N G S <----- ----- ----- */

const
    FONT_FAMILY = "Helvetica Neue",
    configLine = {
        type: "line",
        data: {
            labels: null,
            datasets: null,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '',
                    font: {
                        Family: FONT_FAMILY,
                        size: 18,
                    },
                },
                legend: {
                    position: "top",
                    display: false,
                },
                tooltip: {
                    usePointStyle: true,
                    callbacks: {
                        labelPointStyle: function (context) {
                            return {
                                pointStyle: "rectRot",
                                rotation: 0,
                            };
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '',
                        font: {
                            family: FONT_FAMILY,
                            size: 16,
                        },
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: '',
                        font: {
                            family: FONT_FAMILY,
                            size: 16,
                        },
                    },
                },
            },
            animations: {
                radius: {
                    duration: 400,
                    easing: 'linear',
                    loop: (ctx) => ctx.activate,
                },
            },
            hoverRadius: 8,
            hoverBackgroundColor: 'yellow',
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x',
            },
        },
    },
    configPie = {
        type: "doughnut",
        data: {
            labels: null,
            datasets: null,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: null,
                    font: {
                        Family: FONT_FAMILY,
                        size: 18,
                    },
                },
                legend: {
                    position: "top",
                    display: true,
                },
                tooltip: {
                    usePointStyle: true,
                    callbacks: {
                        labelPointStyle: function (context) {
                            return {
                                pointStyle: "rectRot",
                                rotation: 0,
                            };
                        },
                    },
                },
            },
        },
    };

$(document).ready(() => {
    const url = ($("#environment").html() === "Production") ? "https://informatik.hs-bremerhaven.de/docker-hbv-kms-http/getData" : "http://localhost:3000/docker-hbv-kms-http/getData";
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            dialogTimePlot(data);
            pieCharts(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(`${JSON.stringify(XMLHttpRequest)}`);
        },
    });
})

/**
 * @name dynamicColors
 * @description Return random rgb colorstring
 * 
 * @returns {string} rgba colorstring
 */
function dynamicColors() {
    const
        r = Math.floor(Math.random() * 255),
        g = Math.floor(Math.random() * 255),
        b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b}, 1)`;
}

/**
 * @name poolColors
 * @description Return a array filled with random rgba colorstrings
 * @param {number} a 
 * 
 * @returns {Array} pool
 */
function poolColors(a) {
    const pool = [...new Array(a)].map(() => dynamicColors());
    return pool;
}

/**
 * @name avg
 * @description Return the average value of array
 * @param {Array} grades 
 * 
 * @returns {number} average
 */
function avg(grades) {
    const total = grades.reduce((acc, c) => acc + c, 0);
    return total / grades.length;
}

/**
 * @name dialogTimePlot
 * @description Creates a chart to visualize the dialog time for every entry in data
 * @param {Object} data 
 */
function dialogTimePlot(data) {
    const dialogTimeData = [...new Array(data.length)].map((e, i) => parseFloat(data[i].dialog_time));
    const avgDialogTime = avg(dialogTimeData);

    const dialogTimeDataset = {
            label: "Dialog Time",
            data: dialogTimeData,
            fill: false,
            borderColor: "rgb(255, 0, 0)",
            pointRadius: 0,
            tension: 0.2,
            borderWidth: 2
        },
        averageDialogTime = {
            label: "Average Dialog Time",
            data: [...new Array(data.length)].map((e, i) => `${avgDialogTime}`),
            fill: false,
            borderColor: "black",
            pointRadius: 0,
            borderDash: [10, 5],
            borderWidth: 1
        },

        LABELS = [...new Array(data.length)].map((e, i) =>
            /*`${data[i].ts.substring(0, 10)} */
            `${i+1}, ${data[i].ts.substring(11, 16)}`
        );

    let config = JSON.parse(JSON.stringify(configLine));

    config.type = "line";
    config.data.labels = LABELS;
    config.data.datasets = [dialogTimeDataset, averageDialogTime];
    config.options.plugins.title.text = "Dialog Time";
    config.options.scales.x.title.text = "Conversation, Time";
    config.options.scales.y.title.text = "time in minutes";

    const ctx = $("#dashboard-plot-canvas-1");
    window.dashboard_plot_1 = new Chart(ctx, config);
}

/**
 * @name pieCharts
 * @description Creates a chart to visualize the distribution of genders, basic emotions, pleasure states and smile states
 * @param {Object} data 
 */
function pieCharts(data) {

    let
        genderData = new Array(0),
        basicEmotionData = new Array(0),
        pleasureData = new Array(0),
        smileData = new Array(0);

    data.forEach(element => {
        genderData.push(element.gender);
        basicEmotionData.push(element.basic_emotion);
        pleasureData.push(element.pleasure_state);
        smileData.push(element.smile_state);
    });

    const
        uniqueGender = [...new Set(genderData)],
        uniqueBasicEmotions = [...new Set(basicEmotionData)],
        uniquePleasureData = [...new Set(pleasureData)],
        uniqueSmileData = [...new Set(smileData)];

    let
        genderCounts = [...new Array(uniqueGender.length)].map(() => 0),
        basicEmotionCounts = [...new Array(uniqueBasicEmotions.length)].map(() => 0),
        pleasureCounts = [...new Array(uniquePleasureData.length)].map(() => 0),
        smileCounts = [...new Array(uniqueSmileData.length)].map(() => 0);

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        uniqueGender.forEach((elem, index) => {
            if (row.gender === elem) genderCounts[index]++
        });
        uniqueBasicEmotions.forEach((elem, index) => {
            if (row.basic_emotion === elem) basicEmotionCounts[index]++
        });
        uniquePleasureData.forEach((elem, index) => {
            if (row.pleasure_state === elem) pleasureCounts[index]++
        });
        uniqueSmileData.forEach((elem, index) => {
            if (row.smile_state === elem) smileCounts[index]++
        });
    }

    // ----- G E N D E R - S T U F F
    let configGenderPie = JSON.parse(JSON.stringify(configPie));
    configGenderPie.data.labels = uniqueGender;
    configGenderPie.data.datasets = [{
        label: "Gender Distribution",
        data: genderCounts,
        backgroundColor: poolColors(uniqueGender.length),
        hoverOffset: 4
    }];
    configGenderPie.options.plugins.title.text = "Gender Distribution";
    const ctxGender = $("#dashboard-plot-canvas-2");
    window.dashboard_plot_2 = new Chart(ctxGender, configGenderPie);

    // ----- E M O T I O N - S T U F F
    let configEmotionPie = JSON.parse(JSON.stringify(configPie));
    configEmotionPie.data.labels = uniqueBasicEmotions;
    configEmotionPie.data.datasets = [{
        label: "Basic Emotion",
        data: basicEmotionCounts,
        backgroundColor: poolColors(uniqueBasicEmotions.length),
        hoverOffset: 4
    }];
    configEmotionPie.options.plugins.title.text = "Basic Emotion";
    const ctxEmotion = $("#dashboard-plot-canvas-3");
    window.dashboard_plot_3 = new Chart(ctxEmotion, configEmotionPie);

    // ----- P L E A S U R E - S T U F F
    let configPleasurePie = JSON.parse(JSON.stringify(configPie));
    configPleasurePie.data.labels = uniquePleasureData;
    configPleasurePie.data.datasets = [{
        label: "Pleasure State",
        data: pleasureCounts,
        backgroundColor: poolColors(uniquePleasureData.length),
        hoverOffset: 4
    }];
    configPleasurePie.options.plugins.title.text = "Pleasure State";
    const ctxPleasure = $("#dashboard-plot-canvas-4");
    window.dashboard_plot_4 = new Chart(ctxPleasure, configPleasurePie);

    // ----- S M I L E - S T U F F 
    let configSmilePie = JSON.parse(JSON.stringify(configPie));
    configSmilePie.data.labels = uniqueSmileData;
    configSmilePie.data.datasets = [{
        label: "Smile State",
        data: smileCounts,
        backgroundColor: poolColors(uniqueSmileData.length),
        hoverOffset: 4
    }];
    configSmilePie.options.plugins.title.text = "Smile State";
    const ctxSmile = $("#dashboard-plot-canvas-5");
    window.dashboard_plot_5 = new Chart(ctxSmile, configSmilePie);
}