/******************************************************************************
 *                               FETCH CDA FUNCTIONS                          *
 ******************************************************************************/
// Function to get flows data
function fetchAndUpdateStage(stageCell, tsidStage, flood_level, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours) {
    if (tsidStage !== null) {
        // Fetch the time series data from the API using the determined query string
        let urlStage = null;
        if (cda === "public") {
            urlStage = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        } else if (cda === "internal") {
            urlStage = `https://coe-${office}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        }
        // console.log("urlStage = ", urlStage);
        fetch(urlStage, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2'
            }
        })
            .then(response => {
                // Check if the response is ok
                if (!response.ok) {
                    // If not, throw an error
                    throw new Error('Network response was not ok');
                }
                // If response is ok, parse it as JSON
                return response.json();
            })
            .then(stage => {
                // console.log("stage:", stage);

                // Convert timestamps in the JSON object
                stage.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Output the updated JSON object
                // // console.log(JSON.stringify(stage, null, 2));

                // console.log("stageFormatted = ", stage);


                // Get the last non-null value from the stage data
                const lastNonNullValue = getLastNonNullValue(stage);
                // console.log("lastNonNullValue:", lastNonNullValue);

                // Check if a non-null value was found
                if (lastNonNullValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampLast = lastNonNullValue.timestamp;
                    var valueLast = parseFloat(lastNonNullValue.value).toFixed(2);
                    var qualityCodeLast = lastNonNullValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampLast:", timestampLast);
                    // console.log("valueLast:", valueLast);
                    // console.log("qualityCodeLast:", qualityCodeLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }

                const c_count = calculateCCount(tsidStage);
                // console.log("c_count:", c_count);


                const lastNonNull24HoursValue = getLastNonNull24HoursValue(stage, c_count);
                // console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

                // Check if a non-null value was found
                if (lastNonNull24HoursValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
                    var value24HoursLast = parseFloat(lastNonNull24HoursValue.value).toFixed(2);
                    var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestamp24HoursLast:", timestamp24HoursLast);
                    // console.log("value24HoursLast:", value24HoursLast);
                    // console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }


                // Calculate the 24 hours change between first and last value
                const delta_24 = (valueLast - value24HoursLast).toFixed(2);
                // console.log("delta_24:", delta_24);

                // Format the last valueLast's timestampLast to a string
                const formattedLastValueTimeStamp = formatTimestampToString(timestampLast);
                // console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);

                // Create a Date object from the timestampLast
                const timeStampDateObject = new Date(timestampLast);
                // console.log("timeStampDateObject = ", timeStampDateObject);

                // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampLast date
                const timeStampDateObjectMinus24Hours = new Date(timestampLast - (24 * 60 * 60 * 1000));
                // console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);


                // FLOOD CLASS
                var floodClass = determineStageClass(valueLast, flood_level);
                // console.log("floodClass:", floodClass);

                // DATATIME CLASS
                var dateTimeClass = determineDateTimeClass(timeStampDateObject, currentDateTimeMinus2Hours);
                // console.log("dateTimeClass:", dateTimeClass);

                if (valueLast === null) {
                    // innerHTMLStage = "-M-";
                    innerHTMLStage = "<span class='missing'>"
                        + "-M-"
                        + "</span>"
                        + "<span class='temp_water'>"
                        + "label"
                        + "</span>";
                } else {
                    // innerHTMLStage = lastValue.toFixed(2)
                    innerHTMLStage = "<span class='" + floodClass + "' title='" + stage.name + ", Value = " + valueLast + ", Date Time = " + timestampLast + "'>"
                        + "<a href='../chart/index.html?office=" + office + "&cwms_ts_id=" + stage.name + "&lookback=96&cda=public' target='_blank'>"
                        + valueLast
                        + "</a>"
                        + "</span>"
                        + " "
                        + stage.units
                        + " (" + "<span title='" + stage.name + ", Value = " + value24HoursLast + ", Date Time = " + timestamp24HoursLast + ", Delta = (" + valueLast + " - " + value24HoursLast + ") = " + delta_24 + "'>" + delta_24 + "</span>" + ")"
                        + "<br>"
                        + "<span class='" + dateTimeClass + "'>"
                        + formattedLastValueTimeStamp
                        + "</span>";
                }
                return stageCell.innerHTML += innerHTMLStage;
            })
            .catch(error => {
                // Catch and log any errors that occur during fetching or processing
                console.error("Error fetching or processing data:", error);
            });
    }
}

// Function to fetch and update NWS data
function fetchAndUpdateNWS(stageCell, tsidStage, tsid_stage_nws_3_day_forecast, flood_level, currentDateTime, currentDateTimePlus4Days) {
    // Log current date and time
    // // console.log("currentDateTime = ", currentDateTime);
    // // console.log("currentDateTimePlus4Days = ", currentDateTimePlus4Days);

    const { currentDateTimeMidNightISO, currentDateTimePlus4DaysMidNightISO } = generateDateTimeMidNightStringsISO(currentDateTime, currentDateTimePlus4Days);
    // // console.log("currentDateTimeMidNightISO = ", currentDateTimeMidNightISO);
    // // console.log("currentDateTimePlus4DaysMidNightISO = ", currentDateTimePlus4DaysMidNightISO);

    let innerHTMLStage = ""; // Declare innerHTMLStage variable with a default value

    if (tsidStage !== null) {
        // // console.log("tsidStage:", tsidStage);
        // // console.log("tsidStage:", typeof (tsidStage));
        // // console.log("tsidStage:", tsidStage.slice(-2));

        if (tsidStage.slice(-2) !== "29" && tsid_stage_nws_3_day_forecast !== null) {

            // Fetch the time series data from the API using the determined query string
            let urlNWS = null;
            if (cda === "public") {
                urlNWS = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=${office}`;
            } else if (cda === "internal") {
                urlNWS = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries?name=${tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=${office}`;
            }
            // console.log("urlNWS = ", urlNWS);
            fetch(urlNWS, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json;version=2'
                }
            })
                .then(response => {
                    // Check if the response is ok
                    if (!response.ok) {
                        // If not, throw an error
                        throw new Error('Network response was not ok');
                    }
                    // If response is ok, parse it as JSON
                    return response.json();
                })
                .then(nws3Days => {
                    // console.log("nws3Days: ", nws3Days);

                    // Convert timestamps in the JSON object
                    nws3Days.values.forEach(entry => {
                        entry[0] = formatNWSDate(entry[0]); // Update timestamp
                    });

                    // console.log("nws3DaysFormatted = ", nws3Days);

                    // Extract values with time ending in "13:00"
                    const valuesWithTimeNoon = extractValuesWithTimeNoon(nws3Days.values);

                    // Output the extracted values
                    // console.log("valuesWithTimeNoon = ", valuesWithTimeNoon);

                    // Extract the second middle value
                    const firstFirstValue = valuesWithTimeNoon[1][0];
                    const firstMiddleValue = (valuesWithTimeNoon[1][1] !== null) ? (parseFloat(valuesWithTimeNoon[1][1])).toFixed(2) : "-M-";

                    // Extract the second middle value
                    const secondFirstValue = valuesWithTimeNoon[2][0];
                    const secondMiddleValue = (valuesWithTimeNoon[2][1] !== null) ? (parseFloat(valuesWithTimeNoon[2][1])).toFixed(2) : "-M-";

                    // Extract the second middle value
                    const thirdFirstValue = valuesWithTimeNoon[3][0];
                    const thirdMiddleValue = (valuesWithTimeNoon[3][1] !== null) ? (parseFloat(valuesWithTimeNoon[3][1])).toFixed(2) : "-M-";

                    // FLOOD CLASS
                    var floodClassDay1 = determineStageClass(firstMiddleValue, flood_level);
                    // // console.log("floodClassDay1:", floodClassDay1);

                    var floodClassDay2 = determineStageClass(secondMiddleValue, flood_level);
                    // // console.log("floodClassDay2:", floodClassDay2);

                    var floodClassDay3 = determineStageClass(thirdMiddleValue, flood_level);
                    // // console.log("floodClassDay3:", floodClassDay3);


                    if (nws3Days !== null) {
                        innerHTMLStage = "<table id='nws'>"
                            + "<tr>"
                            + "<td colspan='3' class='day_nws_forecast'>"
                            + "3 Day NWS Forecast"
                            + "</td>"
                            + "</tr>"
                            + "<tr>"
                            + "<td class='" + floodClassDay1 + "'>"
                            + "<a href='../chart/index.html?office=" + office + "&cwms_ts_id=" + nws3Days.name + "&lookback=6&lookforward=96&cda=public' target='_blank' title='" + nws3Days.name + " " + firstFirstValue + "'>"
                            + firstMiddleValue
                            + "</a>"
                            + "</td>"
                            + "<td class='" + floodClassDay2 + "'>"
                            + "<a href='../chart/index.html?office=" + office + "&cwms_ts_id=" + nws3Days.name + "&lookback=6&lookforward=96&cda=public' target='_blank' title='" + nws3Days.name + " " + secondFirstValue + "'>"
                            + secondMiddleValue
                            + "</a>"
                            + "</td>"
                            + "<td class='" + floodClassDay3 + "'>"
                            + "<a href='../chart/index.html?office=" + office + "&cwms_ts_id=" + nws3Days.name + "&lookback=6&lookforward=96&cda=public' target='_blank' title='" + nws3Days.name + " " + thirdFirstValue + "'>"
                            + thirdMiddleValue
                            + "</a>"
                            + "</td>"
                            + "</tr>"
                            // + "<tr>"
                            // + "<td colspan='3' id='stageCell' class='day_nws_ded'></td>" // Placeholder for forecast time
                            // + "</tr>"
                            + "<table>";
                        // document.getElementById('someElementId').innerHTML = innerHTMLStage; // Insert the table into the DOM
                        // const stageCell = document.getElementById('stageCell'); // Get the placeholder element
                        // fetchAndLogNwsData2(tsid_stage_nws_3_day_forecast, stageCell); // Fetch and update the data
                    } else {
                        innerHTMLStage = "<span class='missing'>"
                            + "-M-"
                            + "</span>"
                            + "<span class='day_nws_forecast'>"
                            + "NWS 3 Days Forecast"
                            + "</span>";
                    }
                    return stageCell.innerHTML += innerHTMLStage;
                })
                .catch(error => {
                    // Catch and log any errors that occur during fetching or processing
                    console.error("Error fetching or processing data:", error);
                });
        } else {
            // console.log("The last two characters are '29'");
        }
    }
}

// Fetch PHP Json File to get Forecast Date
function fetchAndUpdateNWSForecastDate(stageCell, tsid_stage_nws_3_day_forecast) {
    fetchAndLogNwsData(stageCell, tsid_stage_nws_3_day_forecast); // Fetch and update the data


}

// Function to get flows data
function fetchAndUpdateFlow(flowCell, tsidFlow, label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours) {
    if (tsidFlow !== null) {
        let urlFlow = null;
        if (cda === "public") {
            urlFlow = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidFlow}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        } else if (cda === "internal") {
            urlFlow = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries?name=${tsidFlow}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        }
        // console.log("urlFlow = ", urlFlow);
        // Fetch the time series data from the API using the determined query string
        fetch(urlFlow, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2'
            }
        })
            .then(response => {
                // Check if the response is ok
                if (!response.ok) {
                    // If not, throw an error
                    throw new Error('Network response was not ok');
                }
                // If response is ok, parse it as JSON
                return response.json();
            })
            .then(flow => {
                // Once data is fetched, log the fetched data structure
                // console.log("flow: ", flow);

                // Convert timestamps in the JSON object
                flow.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Output the updated JSON object
                // // console.log(JSON.stringify(flow, null, 2));

                // console.log("flowFormatted = ", flow);

                // FLOW CLASS
                if (label === "COE") {
                    var myFlowLabelClass = "flow_coe";
                } else if (label === "USGS") {
                    var myFlowLabelClass = "flow_usgs";
                } else if (label === "NWS") {
                    var myFlowLabelClass = "flow_nws";
                } else if (label === "MVR") {
                    var myFlowLabelClass = "flow_coe_mvr";
                } else if (label === "USGSRAW") {
                    var myFlowLabelClass = "flow_usgsraw";
                } else if (label === "SLOPEADJ") {
                    var myFlowLabelClass = "flow_slopeadj";
                } else {
                    var myFlowLabelClass = "flow";
                }
                // console.log("myFlowLabelClass = ", myFlowLabelClass);

                // Get the last non-null value from the stage data
                const lastNonNullFlowValue = getLastNonNullValue(flow);
                // Check if a non-null value was found
                if (lastNonNullFlowValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampFlowLast = lastNonNullFlowValue.timestamp;
                    var valueFlowLast = parseFloat(lastNonNullFlowValue.value).toFixed(0);
                    var qualityCodeFlowLast = lastNonNullFlowValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampFlowLast:", timestampFlowLast);
                    // console.log("valueFlowLast:", valueFlowLast);
                    // console.log("qualityCodeFlowLast:", qualityCodeFlowLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }

                const c_count = calculateCCount(tsidFlow);

                const lastNonNull24HoursFlowValue = getLastNonNull24HoursValue(flow, c_count);
                // console.log("lastNonNull24HoursFlowValue:", lastNonNull24HoursFlowValue);

                // Check if a non-null value was found
                if (lastNonNull24HoursFlowValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampFlow24HoursLast = lastNonNull24HoursFlowValue.timestamp;
                    var valueFlow24HoursLast = parseFloat(lastNonNull24HoursFlowValue.value).toFixed(0);
                    var qualityCodeFlow24HoursLast = lastNonNull24HoursFlowValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampFlow24HoursLast:", timestampFlow24HoursLast);
                    // console.log("valueFlow24HoursLast:", valueFlow24HoursLast);
                    // console.log("qualityCodeFlow24HoursLast:", qualityCodeFlow24HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }

                // Calculate the 24 hours change between first and last value
                const delta24Flow = (valueFlowLast - valueFlow24HoursLast).toFixed(0);
                // console.log("delta24Flow:", delta24Flow);


                // Check if the value is greater than or equal to 1000
                if (parseFloat(delta24Flow) >= 1000 || delta24Flow <= -1000) {
                    // If greater than or equal to 1000, round to the nearest tenth and add commas at thousands place
                    roundedDelta24Flow = (Math.round(parseFloat(delta24Flow) / 10) * 10).toLocaleString();
                } else {
                    // If less than 1000, simply add commas at thousands place
                    roundedDelta24Flow = (parseFloat(delta24Flow)).toLocaleString();
                }
                // console.log("roundedDelta24Flow = ", roundedDelta24Flow); // Log the rounded and formatted value to the console

                // Check if the value is greater than or equal to 1000
                if (parseFloat(valueFlowLast) >= 1000) {
                    // If greater than or equal to 1000, round to the nearest tenth and add commas at thousands place
                    roundedValueFlowLast = (Math.round(parseFloat(valueFlowLast) / 10) * 10).toLocaleString();
                } else {
                    // If less than 1000, simply add commas at thousands place
                    roundedValueFlowLast = (parseFloat(valueFlowLast)).toLocaleString();
                }
                // console.log("roundedValueFlowLast = ", roundedValueFlowLast); // Log the rounded and formatted value to the console


                // Format the last valueLast's timestampFlowLast to a string
                const formattedLastValueTimeStamp = formatTimestampToString(timestampFlowLast);
                // console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);


                // Create a Date object from the timestampFlowLast
                const timeStampDateObject = new Date(timestampFlowLast);
                // console.log("timeStampDateObject = ", timeStampDateObject);


                // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampFlowLast date
                const timeStampDateObjectMinus24Hours = new Date(timestampFlowLast - (24 * 60 * 60 * 1000));
                // console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);


                // DATATIME CLASS
                var dateTimeClass = determineDateTimeClass(timeStampDateObject, currentDateTimeMinus2Hours);
                // console.log("dateTimeClass:", dateTimeClass);


                if (lastNonNullFlowValue === null) {
                    innerHTMLFlow = "<span class='missing'>"
                        + "-M-"
                        + "</span>"
                        + "<span class='temp_water'>"
                        + "label"
                        + "</span>";
                } else {
                    innerHTMLFlow = "<span class='last_max_value' title='" + flow.name + ", Value = " + roundedValueFlowLast + ", Date Time = " + timestampFlowLast + "'>"
                        + "<a href='../chart/index.html?office=" + office + "&cwms_ts_id=" + flow.name + "&lookback=96&cda=public' target='_blank'>"
                        + roundedValueFlowLast
                        + "</a>"
                        + "</span>"
                        + " "
                        + flow.units
                        + " (" + "<span title='" + flow.name + ", Value = " + roundedValueFlowLast + ", Date Time = " + timestampFlow24HoursLast + ", Delta = (" + valueFlowLast + " - " + valueFlow24HoursLast + ") = " + roundedDelta24Flow + "'>" + roundedDelta24Flow + "</span>" + ")"
                        + "<br>"
                        + "<span class='" + dateTimeClass + "'>"
                        + formattedLastValueTimeStamp
                        + "</span>"
                        + "<span class='" + myFlowLabelClass + "'>"
                        + label
                        + "</span>";
                }
                return flowCell.innerHTML += innerHTMLFlow;
            })
            .catch(error => {
                // Catch and log any errors that occur during fetching or processing
                console.error("Error fetching or processing data:", error);
            });
    }
}

// Function to get flows data
function fetchAndUpdatePrecip(precipCell, tsid, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours) {
    if (tsid !== null) {
        // Fetch the time series data from the API using the determined query string
        let urlPrecip = null;
        if (cda === "public") {
            urlPrecip = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        } else if (cda === "internal") {
            urlPrecip = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        }
        // console.log("urlPrecip = ", urlPrecip);
        fetch(urlPrecip, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2'
            }
        })
            .then(response => {
                // Check if the response is ok
                if (!response.ok) {
                    // If not, throw an error
                    throw new Error('Network response was not ok');
                }
                // If response is ok, parse it as JSON
                return response.json();
            })
            .then(precip => {
                // Once data is fetched, log the fetched data structure
                // console.log("precip: ", precip);

                // Convert timestamps in the JSON object
                precip.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Output the updated JSON object
                // // console.log(JSON.stringify(precip, null, 2));

                // console.log("precipFormatted = ", precip);


                // Get the last non-null value from the stage data
                const lastNonNullPrecipValue = getLastNonNullValue(precip);
                // console.log("lastNonNullPrecipValue:", lastNonNullPrecipValue);

                // Check if a non-null value was found
                if (lastNonNullPrecipValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampPrecipLast = lastNonNullPrecipValue.timestamp;
                    var valuePrecipLast = parseFloat(lastNonNullPrecipValue.value).toFixed(2);
                    var qualityCodePrecipLast = lastNonNullPrecipValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampPrecipLast:", timestampPrecipLast);
                    // console.log("valuePrecipLast:", valuePrecipLast);
                    // console.log("qualityCodePrecipLast:", qualityCodePrecipLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }


                const c_count = calculateCCount(tsid);


                const lastNonNull6HoursPrecipValue = getLastNonNull6HoursValue(precip, c_count);
                // console.log("lastNonNull6HoursPrecipValue:", lastNonNull6HoursPrecipValue);


                // Check if a non-null value was found
                if (lastNonNull6HoursPrecipValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampPrecip6HoursLast = lastNonNull6HoursPrecipValue.timestamp;
                    var valuePrecip6HoursLast = parseFloat(lastNonNull6HoursPrecipValue.value).toFixed(2);
                    var qualityCodePrecip6HoursLast = lastNonNull6HoursPrecipValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampPrecip6HoursLast:", timestampPrecip6HoursLast);
                    // console.log("valuePrecip6HoursLast:", valuePrecip6HoursLast);
                    // console.log("qualityCodePrecip6HoursLast:", qualityCodePrecip6HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }


                const lastNonNull24HoursPrecipValue = getLastNonNull24HoursValue(precip, c_count);
                // console.log("lastNonNull24HoursPrecipValue:", lastNonNull24HoursPrecipValue);


                // Check if a non-null value was found
                if (lastNonNull24HoursPrecipValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampPrecip24HoursLast = lastNonNull24HoursPrecipValue.timestamp;
                    var valuePrecip24HoursLast = parseFloat(lastNonNull24HoursPrecipValue.value).toFixed(2);
                    var qualityCodePrecip24HoursLast = lastNonNull24HoursPrecipValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampPrecip24HoursLast:", timestampPrecip24HoursLast);
                    // console.log("valuePrecip24HoursLast:", valuePrecip24HoursLast);
                    // console.log("qualityCodePrecip24HoursLast:", qualityCodePrecip24HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }


                // Calculate the 24 hours change between first and last value
                const precip_delta_6 = (valuePrecipLast - valuePrecip6HoursLast).toFixed(2);
                // console.log("precip_delta_6:", precip_delta_6);


                // Calculate the 24 hours change between first and last value
                const precip_delta_24 = (valuePrecipLast - valuePrecip24HoursLast).toFixed(2);
                // console.log("precip_delta_24:", precip_delta_24);


                // Format the last valueLast's timestampFlowLast to a string
                const formattedLastValueTimeStamp = formatTimestampToString(timestampPrecipLast);
                // console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);

                // Create a Date object from the timestampFlowLast
                const timeStampDateObject = new Date(timestampPrecipLast);
                // console.log("timeStampDateObject = ", timeStampDateObject);

                // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampFlowLast date
                const timeStampDateObjectMinus24Hours = new Date(timestampPrecipLast - (24 * 60 * 60 * 1000));
                // console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);

                // SET THE CLASS FOR PRECIP TO DISPLAY THE BACKGROUND COLOR
                if (precip_delta_6 < 0) {
                    // console.log("precip_delta_6 less than 0");
                    var myClass6 = "precip_less_0";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 === 0) {
                    // console.log("precip_delta_6 equal to 0");
                    var myClass6 = "precip_equal_0";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 0.00 && precip_delta_6 <= 0.25) {
                    // console.log("precip_delta_6 greater than 0 and less than or equal to 0.25");
                    var myClass6 = "precip_greater_0";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 0.25 && precip_delta_6 <= 0.50) {
                    // console.log("precip_delta_6 greater than 0.25 and less than or equal to 0.50");
                    var myClass6 = "precip_greater_25";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 0.50 && precip_delta_6 <= 1.00) {
                    // console.log("precip_delta_6 greater than 0.50 and less than or equal to 1.00");
                    var myClass6 = "precip_greater_50";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 1.00 && precip_delta_6 <= 2.00) {
                    // console.log("precip_delta_6 greater than 1.00 and less than or equal to 2.00");
                    var myClass6 = "precip_greater_100";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 2.00) {
                    // console.log("precip_delta_6 greater than 2.00");
                    var myClass6 = "precip_greater_200";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 === null) {
                    // console.log("precip_delta_6 missing");
                    var myClass6 = "precip_missing";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                } else {
                    // console.log("precip_delta_6 equal to else");
                    var myClass6 = "blank";
                    // console.log("myClass6 = ", tsid + " = " + myClass6);
                }

                if (precip_delta_24 < 0) {
                    // console.log("precip_delta_24 less than 0");
                    var myClass24 = "precip_less_0";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 === 0) {
                    // console.log("precip_delta_24 equal to 0");
                    var myClass24 = "precip_equal_0";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 0.00 && precip_delta_24 <= 0.25) {
                    // console.log("precip_delta_24 greater than 0 and less than or equal to 0.25");
                    var myClass24 = "precip_greater_0";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 0.25 && precip_delta_24 <= 0.50) {
                    // console.log("precip_delta_24 greater than 0.25 and less than or equal to 0.50");
                    var myClass24 = "precip_greater_25";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 0.50 && precip_delta_24 <= 1.00) {
                    // console.log("precip_delta_24 greater than 0.50 and less than or equal to 1.00");
                    var myClass24 = "precip_greater_50";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 1.00 && precip_delta_24 <= 2.00) {
                    // console.log("precip_delta_24 greater than 1.00 and less than or equal to 2.00");
                    var myClass24 = "precip_greater_100";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 2.00) {
                    // console.log("precip_delta_24 greater than 2.00");
                    var myClass24 = "precip_greater_200";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 === null) {
                    // console.log("precip_delta_24 missing");
                    var myClass24 = "precip_missing";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                } else {
                    // console.log("precip_delta_24 equal to else");
                    var myClass24 = "blank";
                    // console.log("myClass24 =", tsid + " = " + myClass24);
                }

                // DATATIME CLASS
                var dateTimeClass = determineDateTimeClass(timeStampDateObject, currentDateTimeMinus2Hours);
                // console.log("dateTimeClass:", dateTimeClass);

                if (lastNonNullPrecipValue === null) {
                    innerHTMLPrecip = "<table id='precip'>"
                        + "<tr>"
                        + "<td class='precip_missing' title='6 hr delta'>"
                        + "-M-"
                        + "</td>"
                        + "<td class='precip_missing' title='24 hr delta'>"
                        + "-M-"
                        + "</td>"
                        + "</tr>"
                        + "</table>";
                } else {
                    innerHTMLPrecip = "<table id='precip'>"
                        + "<tr>"
                        + "<td class='" + myClass6 + "' title='6 hr delta'>"
                        + "<span title='" + precip.name + ", Value = " + valuePrecip6HoursLast + ", Date Time = " + timestampPrecip6HoursLast + ", Delta = (" + valuePrecipLast + " - " + valuePrecip6HoursLast + ") = " + precip_delta_6 + "'>" + precip_delta_6 + "</span>"
                        + "</td>"
                        + "<td class='" + myClass24 + "' title='24 hr delta'>"
                        + "<span title='" + precip.name + ", Value = " + valuePrecip24HoursLast + ", Date Time = " + timestampPrecip24HoursLast + ", Delta = (" + valuePrecipLast + " - " + valuePrecip24HoursLast + ") = " + precip_delta_24 + "'>" + precip_delta_24 + "</span>"
                        + "</td>"
                        + "</tr>"
                        + "</table>"
                        + "<span class='last_max_value' title='" + precip.name + ", Value = " + valuePrecipLast + ", Date Time = " + timestampPrecipLast + "'>"
                        + "<a href='../chart/index.html?office=" + office + "&cwms_ts_id=" + precip.name + "&lookback=96&cda=public' target='_blank'>"
                        + valuePrecipLast
                        + "</a>"
                        + "</span>"
                        + " "
                        + precip.units
                        + "<span class='" + dateTimeClass + "'>"
                        + formattedLastValueTimeStamp
                        + "</span>";
                }
                return precipCell.innerHTML += innerHTMLPrecip;
            })
            .catch(error => {
                // Catch and log any errors that occur during fetching or processing
                console.error("Error fetching or processing data:", error);
            });
    } else {
        return precipCell.innerHTML = "";
    }
}

// Function to get flows data
function fetchAndUpdateWaterQuality(waterQualityCell, tsid, label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours) {
    if (tsid !== null) {
        // Fetch the time series data from the API using the determined query string
        let urlWaterQuality = null;
        if (cda === "public") {
            urlWaterQuality = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        } else if (cda === "internal") {
            urlWaterQuality = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        }
        // console.log("urlWaterQuality = ", urlWaterQuality);

        fetch(urlWaterQuality, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;version=2'
            }
        })
            .then(response => {
                // Check if the response is ok
                if (!response.ok) {
                    // If not, throw an error
                    throw new Error('Network response was not ok');
                }
                // If response is ok, parse it as JSON
                return response.json();
            })
            .then(waterQuality => {
                // Once data is fetched, log the fetched data structure
                // console.log("waterQuality:", waterQuality);

                // Convert timestamps in the JSON object
                waterQuality.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Output the updated JSON object
                // // console.log(JSON.stringify(waterQuality, null, 2));

                // console.log("lastNonNullWaterQualityValue = ", waterQuality);

                // console.log("tsid = ", tsid);
                // console.log("label = ", label);

                // WATER QUALITY CLASS
                if (label.includes("AIR")) {
                    var myWaterQualityClass = "water_quality_temp_air";
                } else if (label.includes("WATER")) {
                    var myWaterQualityClass = "water_quality_temp_water";
                } else if (label.includes("DO")) {
                    var myWaterQualityClass = "water_quality_do";
                } else if (label.includes("DEPTH")) {
                    var myWaterQualityClass = "water_quality_depth";
                } else if (label.includes("COND")) {
                    var myWaterQualityClass = "water_quality_cond";
                } else if (label.includes("PH")) {
                    var myWaterQualityClass = "water_quality_ph";
                } else if (label.includes("TURB")) {
                    var myWaterQualityClass = "water_quality_turb";
                } else if (label.includes("SPEED")) {
                    var myWaterQualityClass = "water_quality_speed_wind";
                } else if (label.includes("PRESSURE")) {
                    var myWaterQualityClass = "water_quality_pressure";
                } else if (label.includes("DIR")) {
                    var myWaterQualityClass = "water_quality_dir_wind";
                } else if (label.includes("NITRATE")) {
                    var myWaterQualityClass = "water_quality_dir_wind";
                } else if (label.includes("CHLOROPHYLL")) {
                    var myWaterQualityClass = "water_quality_dir_wind";
                } else if (label.includes("PHYCOCYANIN")) {
                    var myWaterQualityClass = "water_quality_dir_wind";
                } else if (label === undefined) {
                    var myWaterQualityClass = "water_quality_do";
                } else {
                    var myWaterQualityClass = "";
                }
                // console.log("myWaterQualityClass = ", myWaterQualityClass);


                // Get the last non-null value from the stage data
                const lastNonNullWaterQualityValue = getLastNonNullValue(waterQuality);

                // Check if a non-null value was found
                if (lastNonNullWaterQualityValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampWaterQualityLast = lastNonNullWaterQualityValue.timestamp;
                    var valueWaterQualityLast = parseFloat(lastNonNullWaterQualityValue.value).toFixed(0);
                    var qualityCodeWaterQualityLast = lastNonNullWaterQualityValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampWaterQualityLast:", timestampWaterQualityLast);
                    // console.log("valueWaterQualityLast:", valueWaterQualityLast);
                    // console.log("qualityCodeWaterQualityLast:", qualityCodeWaterQualityLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }


                const c_count = calculateCCount(tsid);


                const lastNonNull24HoursWaterQualityValue = getLastNonNull24HoursValue(waterQuality, c_count);
                // console.log("lastNonNull24HoursWaterQualityValue:", lastNonNull24HoursWaterQualityValue);


                // Check if a non-null value was found
                if (lastNonNull24HoursWaterQualityValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampWaterQuality24HoursLast = lastNonNull24HoursWaterQualityValue.timestamp;
                    var valueWaterQuality24HoursLast = parseFloat(lastNonNull24HoursWaterQualityValue.value).toFixed(0);
                    var qualityCodeWaterQuality24HoursLast = lastNonNull24HoursWaterQualityValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampWaterQuality24HoursLast:", timestampWaterQuality24HoursLast);
                    // console.log("valueWaterQuality24HoursLast:", valueWaterQuality24HoursLast);
                    // console.log("qualityCodeWaterQuality24HoursLast:", qualityCodeWaterQuality24HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }

                // Calculate the 24 hours change between first and last value
                const delta_24_water_quality = (valueWaterQualityLast - valueWaterQuality24HoursLast).toFixed(0);
                // console.log("delta_24_water_quality:", delta_24_water_quality);

                // Format the last valueLast's timestampFlowLast to a string
                const formattedLastValueTimeStamp = formatTimestampToString(timestampWaterQualityLast);
                // console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);

                // Create a Date object from the timestampFlowLast
                const timeStampDateObject = new Date(timestampWaterQualityLast);
                // console.log("timeStampDateObject = ", timeStampDateObject);

                // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampFlowLast date
                const timeStampDateObjectMinus24Hours = new Date(timestampWaterQualityLast - (24 * 60 * 60 * 1000));
                // console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);

                // DATATIME CLASS
                var dateTimeClass = determineDateTimeClassWaterQuality(timeStampDateObject, currentDateTimeMinus2Hours, currentDateTimeMinus8Hours, label);
                // console.log("dateTimeClass:", dateTimeClass);

                if (lastNonNullWaterQualityValue === null) {
                    innerHTMLWaterQuality = "<span class='missing' title='" + waterQuality.name + "'>"
                        + "-M-"
                        + "</span>"
                        + "<span class='" + myWaterQualityClass + "'>"
                        + label
                        + "</span>";
                } else {
                    innerHTMLWaterQuality = "<span class='last_max_value' title='" + waterQuality.name + ", Value = " + valueWaterQualityLast + ", Date Time = " + timestampWaterQualityLast + "'>"
                        + "<a href='../chart/index.html?office=" + office + "&cwms_ts_id=" + waterQuality.name + "&lookback=96&cda=public' target='_blank'>"
                        + valueWaterQualityLast
                        + "</a>"
                        + "</span>"
                        + " "
                        + waterQuality.units
                        + " (" + "<span title='" + waterQuality.name + ", Value = " + valueWaterQuality24HoursLast + ", Date Time = " + timestampWaterQuality24HoursLast + ", Delta = (" + valueWaterQualityLast + " - " + valueWaterQuality24HoursLast + ") = " + delta_24_water_quality + "'>" + delta_24_water_quality + "</span>" + ")"
                        + "<br>"
                        + "<span class='" + dateTimeClass + "'>"
                        + formattedLastValueTimeStamp
                        + "</span>"
                        + "<span class='" + myWaterQualityClass + "'>"
                        + label
                        + "</span>";
                }
                return waterQualityCell.innerHTML += innerHTMLWaterQuality;
            })
            .catch(error => {
                // Catch and log any errors that occur during fetching or processing
                console.error("Error fetching or processing data:", error);
            });
    }
}


/******************************************************************************
 *                               DATA CDA FUNCTIONS                           *
 ******************************************************************************/
// Function to get the last non null value from values array
function getLastNonNullValue(data) {
    // Iterate over the values array in reverse
    for (let i = data.values.length - 1; i >= 0; i--) {
        // Check if the value at index i is not null
        if (data.values[i][1] !== null) {
            // Return the non-null value as separate variables
            return {
                timestamp: data.values[i][0],
                value: data.values[i][1],
                qualityCode: data.values[i][2]
            };
        }
    }
    // If no non-null value is found, return null
    return null;
}

// Find time series value at 24 hours ago
function getLastNonNull24HoursValue(data, c_count) {
    let nonNullCount = 0;
    for (let i = data.values.length - 1; i >= 0; i--) {
        if (data.values[i][1] !== null) {
            nonNullCount++;
            if (nonNullCount > c_count) {
                return {
                    timestamp: data.values[i][0],
                    value: data.values[i][1],
                    qualityCode: data.values[i][2]
                };
            }
        }
    }
    return null;
}

// Find time series value at 6 hours ago
function getLastNonNull6HoursValue(data, c_count) {
    let nonNullCount = 0;
    for (let i = data.values.length - 1; i >= 0; i--) {
        if (data.values[i][1] !== null) {
            nonNullCount++;
            if (nonNullCount > (c_count / 4)) {
                return {
                    timestamp: data.values[i][0],
                    value: data.values[i][1],
                    qualityCode: data.values[i][2]
                };
            }
        }
    }
    return null;
}

// Function to get the first non-null value from values array
function getFirstNonNullValue(data) {
    // Iterate over the values array
    for (let i = 0; i < data.values.length; i++) {
        // Check if the value at index i is not null
        if (data.values[i][1] !== null) {
            // Return the non-null value as separate variables
            return {
                timestamp: data.values[i][0],
                value: data.values[i][1],
                qualityCode: data.values[i][2]
            };
        }
    }
    // If no non-null value is found, return null
    return null;
}


/******************************************************************************
 *                            CLASSES CDA FUNCTIONS                           *
 ******************************************************************************/
// Function determine last max class
function determineStageClass(stage_value, flood_value) {
    // console.log("determineStageClass = ", stage_value + typeof (stage_value) + " " + flood_value + typeof (flood_value));
    var myStageClass;
    if (parseFloat(stage_value) >= parseFloat(flood_value)) {
        // console.log("determineStageClass = ", stage_value + " >= " + flood_value);
        myStageClass = "last_max_value_flood";
    } else {
        // console.log("Stage Below Flood Level");
        myStageClass = "last_max_value";
    }
    return myStageClass;
}

// Function determine date time class
function determineDateTimeClass(formattedDate, currentDateTimeMinus2Hours) {
    var myDateTimeClass;
    if (formattedDate >= currentDateTimeMinus2Hours) {
        myDateTimeClass = "date_time_current";
        // console.log("formattedDate = ", formattedDate);
    } else {
        myDateTimeClass = "date_time_late";
        // console.log("formattedDate = ", formattedDate);
        // console.log("currentDateTimeMinus2Hours = ", currentDateTimeMinus2Hours);
    }
    // console.log("myDateTimeClass = ", myDateTimeClass);
    return myDateTimeClass;
}

// Function determine date time class
function determineDateTimeClassWaterQuality(formattedDate, currentDateTimeMinus2Hours, currentDateTimeMinus8Hours, label) {
    let myDateTimeClass;
    if (label.includes("LPMS")) {
        if (formattedDate >= currentDateTimeMinus8Hours) {
            myDateTimeClass = "date_time_current";
            // console.log("formattedDate = ", formattedDate);
        } else {
            myDateTimeClass = "date_time_late";
            // console.log("formattedDate = ", formattedDate);
            // console.log("currentDateTimeMinus8Hours = ", currentDateTimeMinus8Hours);
        }
    } else {
        if (formattedDate >= currentDateTimeMinus2Hours) {
            myDateTimeClass = "date_time_current";
            // console.log("formattedDate = ", formattedDate);
        } else {
            myDateTimeClass = "date_time_late";
            // console.log("formattedDate = ", formattedDate);
            // console.log("currentDateTimeMinus2Hours = ", currentDateTimeMinus2Hours);
        }
    }
    // console.log("myDateTimeClass = ", myDateTimeClass);
    return myDateTimeClass;
}


/******************************************************************************
 *                            SUPPORT CDA FUNCTIONS                           *
 ******************************************************************************/
// Function to get current data time
function subtractHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() - (hoursToSubtract * 60 * 60 * 1000));
}

// Function to get current data time
function plusHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() + (hoursToSubtract * 60 * 60 * 1000));
}

// Function to add days to a given date
function addDaysToDate(date, days) {
    return new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));
}

// Function to convert cda date time to mm-dd-yyyy 24hh:mi
function formatTimestampToString(timestampLast) {
    const date = new Date(timestampLast);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return formattedDate;
}

// Function to convert timestamp to specified format
function formatNWSDate(timestamp) {
    const date = new Date(timestamp);
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month
    const dd = String(date.getDate()).padStart(2, '0'); // Day
    const yyyy = date.getFullYear(); // Year
    const hh = String(date.getHours()).padStart(2, '0'); // Hours
    const min = String(date.getMinutes()).padStart(2, '0'); // Minutes
    return `${mm}-${dd}-${yyyy} ${hh}:${min}`;
}

// Function to extract values where time ends in "13:00"
function extractValuesWithTimeNoon(values) {
    return values.filter(entry => {
        const timestamp = new Date(entry[0]);
        const hours = timestamp.getHours();
        const minutes = timestamp.getMinutes();
        return (hours === 7 || hours === 6) && minutes === 0; // Check if time is 13:00
    });
}

// Function to find the c_count for each interval id
function calculateCCount(tsid) {
    // Split the string at the period
    const splitString = tsid.split('.');

    // Access the fifth element
    const forthElement = splitString[3];
    // console.log("forthElement = ", forthElement);

    // Initialize c_count variable
    let c_count;

    // Set c_count based on the value of firstTwoCharacters
    switch (forthElement) {
        case "15Minutes":
            c_count = 96;
            break;
        case "10Minutes":
            c_count = 144;
            break;
        case "30Minutes":
            c_count = 48;
            break;
        case "1Hour":
            c_count = 24;
            break;
        case "6Hours":
            c_count = 4;
            break;
        case "~2Hours":
            c_count = 12;
            break;
        case "5Minutes":
            c_count = 288;
            break;
        case "~1Day":
            c_count = 1;
            break;
        default:
            // Default value if forthElement doesn't match any case
            c_count = 0;
    }

    return c_count;
}

// Convert date time object to ISO format for CDA
function generateDateTimeMidNightStringsISO(currentDateTime, currentDateTimePlus4Days) {
    // Convert current date and time to ISO string
    const currentDateTimeISO = currentDateTime.toISOString();
    // Extract the first 10 characters from the ISO string
    const first10CharactersDateTimeISO = currentDateTimeISO.substring(0, 10);

    // Get midnight in the Central Time zone
    const midnightCentral = new Date(currentDateTime.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }));
    midnightCentral.setHours(0, 0, 0, 0); // Set time to midnight

    // Convert midnight to ISO string
    const midnightCentralISO = midnightCentral.toISOString();

    // Append midnight central time to the first 10 characters of currentDateTimeISO
    const currentDateTimeMidNightISO = first10CharactersDateTimeISO + midnightCentralISO.substring(10);

    // Convert currentDateTimePlus4Days to ISO string
    const currentDateTimePlus4DaysISO = currentDateTimePlus4Days.toISOString();
    // Extract the first 10 characters from the ISO string of currentDateTimePlus4Days
    const first10CharactersDateTimePlus4DaysISO = currentDateTimePlus4DaysISO.substring(0, 10);

    // Append midnight central time to the first 10 characters of currentDateTimePlus4DaysISO
    const currentDateTimePlus4DaysMidNightISO = first10CharactersDateTimePlus4DaysISO + midnightCentralISO.substring(10);

    return {
        currentDateTimeMidNightISO,
        currentDateTimePlus4DaysMidNightISO
    };
}

/******************************************************************************
 *                               FUNCTIONS PHP JSON                           *
 ******************************************************************************/
// Function to fetch data from NWS forecasts output
async function fetchDataFromNwsForecastsOutput() {
    let urlNwsForecast = null;
    if (cda === "public") {
        urlNwsForecast = `https://www.${office.toLocaleLowerCase()}-wc.usace.army.mil/php_data_api/public/json/exportNwsForecasts2Json.json`;
    } else if (cda === "internal") {
        urlNwsForecast = `https://wm.${office.toLocaleLowerCase()}.ds.usace.army.mil/php_data_api/public/json/exportNwsForecasts2Json.json`;
    }
    // console.log("urlNwsForecast: ", urlNwsForecast);

    try {
        const response = await fetch(urlNwsForecast);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Propagate the error further if needed
    }
}

// Function to filter NWS data by tsid_stage_nws_3_day_forecast
function filterDataByTsid(NwsOutput, cwms_ts_id) {
    return NwsOutput.filter(item => item !== null && item.cwms_ts_id_day1 === cwms_ts_id);
}

// Function to fetch and log NWS data
async function fetchAndLogNwsData(stageCell, tsid_stage_nws_3_day_forecast) {
    try {
        const NwsOutput = await fetchDataFromNwsForecastsOutput();
        // console.log('NwsOutput:', NwsOutput);

        const filteredData = filterDataByTsid(NwsOutput, tsid_stage_nws_3_day_forecast);
        // console.log("Filtered NwsOutput Data for", tsid_stage_nws_3_day_forecast + ":", filteredData);

        // Update the HTML element with filtered data
        updateNwsForecastTimeHTML(filteredData, stageCell);

        // Further processing of NWS data as needed
    } catch (error) {
        // Handle errors from fetchDataFromNwsForecastsOutput
        console.error('Failed to fetch data:', error);
    }
}

// Function to update the HTML element with filtered data
function updateNwsForecastTimeHTML(filteredData, stageCell) {
    const locationData = filteredData.find(item => item !== null); // Find the first non-null item
    if (!locationData) {
        stageCell.innerHTML = ''; // Handle case where no valid data is found
        return;
    }

    const entryDate = locationData.data_entry_date_cst1;

    // Parse the entry date string
    const dateParts = entryDate.split('-'); // Split by hyphen
    const day = dateParts[0]; // Day part
    const monthAbbreviation = dateParts[1]; // Month abbreviation (e.g., JUL)
    const year = dateParts[2].substring(0, 2); // Last two digits of the year (e.g., 24)

    // Map month abbreviation to month number
    const months = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };

    const month = months[monthAbbreviation]; // Get numeric month

    // Parse time parts
    const timeParts = entryDate.split(' ')[1].split('.'); // Split time part by period
    const hours = timeParts[0]; // Hours part
    const minutes = timeParts[1]; // Minutes part

    // Determine period (AM/PM)
    const period = timeParts[3] === 'PM' ? 'PM' : 'AM';

    // Construct formatted date and time
    const formattedDateTime = `${month}-${day}-${year} ${hours}:${minutes} ${period}`;

    // Update the HTML content
    stageCell.innerHTML += `<span class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option Yet">Forecast Date: ${formattedDateTime}<span>`;
}