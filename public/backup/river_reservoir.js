document.addEventListener('DOMContentLoaded', () => {
    // Show the loading indicator
    const loadingIndicator = document.getElementById('loading_river_reservoir');
    loadingIndicator.style.display = 'block';

    // Define the path to the JSON file
    const jsonFilePath = 'json/gage_control2.json';
    
    // Fetch the initial gage control data
    fetch(jsonFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(async gageControlData => {
            console.log('Gage Control JSON Data:', gageControlData);

            // Create an array of promises for the second fetch based on basin data
            const fetchPromises = gageControlData.map(item => {
                const basin = item.basin;
                const secondFetchUrl = `get_gage_control.php?basin=${basin}`;
                console.log('Fetching URL:', secondFetchUrl);

                // Return the fetch promise for each basin
                return fetch(secondFetchUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    });
            });

            // Wait for all fetch operations to complete
            return Promise.all(fetchPromises)
                .then(secondDataArray => {
                    console.log('Second Fetch Data:', secondDataArray);

                    // Merge the initial gage control data with the second fetch data
                    const mergedData = mergeData(gageControlData, secondDataArray);
                    console.log('Merged Data:', mergedData);

                    // =================================================================== // 
                    // ========================== GET DATE TIME ========================== // 
                    // =================================================================== //  
                    // Get the current time in JavaScript (equivalent to PHP's strtotime('now'))
                    const now = new Date();
                    const timestamp = now.getTime(); // Get the current timestamp in milliseconds
                    console.log('timestamp: ', timestamp);

                    // If you need to get the time for "now minus two days", you can calculate it directly in JavaScript
                    const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // Number of milliseconds in two days
                    const timestampMinusTwoDays = timestamp - twoDaysInMillis;
                    console.log('timestampMinusTwoDays: ', timestampMinusTwoDays);

                    // Create a new JavaScript Date object
                    const date = new Date(timestamp);
                    console.log('date: ', date);

                    // Helper function to format date components with leading zero
                    const formatWithLeadingZero = (component) => ('0' + component).slice(-2);

                    // Format the date in "Y-m-d H:i" format
                    const formattedDateTime = `${date.getFullYear()}-${formatWithLeadingZero(date.getMonth() + 1)}-${formatWithLeadingZero(date.getDate())} ${formatWithLeadingZero(date.getHours())}:${formatWithLeadingZero(date.getMinutes())}`;
                    console.log('formattedDateTime: ', formattedDateTime);

                    // Extract and log individual date components
                    const currentYear = date.getFullYear();
                    console.log('currentYear: ', currentYear);

                    const currentMonth = formatWithLeadingZero(date.getMonth() + 1);
                    console.log('currentMonth: ', currentMonth);

                    const currentDay = formatWithLeadingZero(date.getDate());
                    console.log('currentDay: ', currentDay);

                    const currentHour = formatWithLeadingZero(date.getHours());
                    console.log('currentHour: ', currentHour);

                    const currentMinute = formatWithLeadingZero(date.getMinutes());
                    console.log('currentMinute: ', currentMinute);
                    

                    // =================================================================== // 
                    // ========================== GET NWS DATE =========================== // 
                    // =================================================================== //
                    // Day 1
                    var day1 = new Date(timestamp);
                    day1.setDate(date.getDate() + 1);
                    var nws_day1_date = ('0' + (day1.getMonth() + 1)).slice(-2) + '-' + ('0' + day1.getDate()).slice(-2) + '-' + day1.getFullYear();
                    var nws_day1_date_title = ('0' + (day1.getMonth() + 1)).slice(-2) + '-' + ('0' + day1.getDate()).slice(-2);
                    // console.log('nws_day1_date: ', nws_day1_date);
                    console.log('nws_day1_date_title: ', nws_day1_date_title);

                    // Day 2
                    var day2 = new Date(date);
                    day2.setDate(date.getDate() + 2);
                    var nws_day2_date = ('0' + (day2.getMonth() + 1)).slice(-2) + '-' + ('0' + day2.getDate()).slice(-2) + '-' + day2.getFullYear();
                    var nws_day2_date_title = ('0' + (day2.getMonth() + 1)).slice(-2) + '-' + ('0' + day2.getDate()).slice(-2);
                    // console.log('nws_day2_date: ', nws_day2_date);
                    console.log('nws_day2_date_title: ', nws_day2_date_title);

                    // Day 3
                    var day3 = new Date(date);
                    day3.setDate(date.getDate() + 3);
                    var nws_day3_date = ('0' + (day3.getMonth() + 1)).slice(-2) + '-' + ('0' + day3.getDate()).slice(-2) + '-' + day3.getFullYear();
                    var nws_day3_date_title = ('0' + (day3.getMonth() + 1)).slice(-2) + '-' + ('0' + day3.getDate()).slice(-2);
                    // console.log('nws_day3_date: ', nws_day3_date);
                    console.log('nws_day3_date_title: ', nws_day3_date_title);


                    // ============================================================================ // 
                    // ========================== GET NWS ABBREVIATIONS =========================== // 
                    // ============================================================================ //
                    // Define an array of day abbreviations
                    var dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    // Get the day of the week (0-6, where 0 is Sunday and 6 is Saturday)
                    var dayIndex = date.getDay();
                    // Ensure the day index doesn't go beyond the range
                    var dayIndexPlusOne = (dayIndex + 1) % 7;
                    var dayIndexPlusTwo = (dayIndex + 2) % 7;
                    var dayIndexPlusThree = (dayIndex + 3) % 7;
                    // Get the three-letter abbreviation for the current day
                    var currentDayAbbreviation = dayAbbreviations[dayIndex];
                    var currentPlusOneDayAbbreviation = dayAbbreviations[dayIndexPlusOne];
                    var currentPlusTwoDayAbbreviation = dayAbbreviations[dayIndexPlusTwo];
                    var currentPlusThreeDayAbbreviation = dayAbbreviations[dayIndexPlusThree];
                    // Output the result
                    console.log('currentDayAbbreviation: ', currentDayAbbreviation);
                    console.log('currentPlusOneDayAbbreviation: ', currentPlusOneDayAbbreviation);
                    console.log('currentPlusTwoDayAbbreviation: ', currentPlusTwoDayAbbreviation);
                    console.log('currentPlusThreeDayAbbreviation: ', currentPlusThreeDayAbbreviation);


                    // ============================================================================ // 
                    // ========================== CREATE TABLE HEADER ============================= // 
                    // ============================================================================ //
                    // Call the function to create and populate the table header merged data
                    console.log('Calling createTableHeader');
                    createTableHeader(mergedData, nws_day1_date, nws_day1_date_title, nws_day2_date, nws_day2_date_title, nws_day3_date, nws_day3_date_title);


                    // ========================================================================== // 
                    // ========================== CREATE TABLE BODY ============================= // 
                    // ========================================================================== //
                    // Call the function to create and populate the table header merged data
                    console.log('Calling createTableBody');
                    createTableBody(mergedData, nws_day1_date, nws_day1_date_title, nws_day2_date, nws_day2_date_title, nws_day3_date, nws_day3_date_title);

                    // Hide the loading indicator after data processing
                    loadingIndicator.style.display = 'none';
                });
        })
        .catch(error => {
            console.error('Error fetching data:', error);

            // Hide the loading indicator in case of an error
            loadingIndicator.style.display = 'none';
        });
});



// Function to merge two jsons based on basin and location
function mergeData(data, secondDataArray) {
    // Iterate over each basin item in data
    for (const basinKey in data) {
        if (basinKey !== "basin") {
            const basinItem = data[basinKey];
            // Iterate over each location key within the basin item
            for (const locKey in basinItem) {
                // Check if the key starts with 'loc_' to identify location objects
                if (locKey.startsWith('loc_')) {
                    const location = basinItem[locKey];
                    // Find the matching data in secondDataArray based on location_id
                    secondDataArray.forEach(dataArr => {
                        const matchedObj = dataArr.find(obj => obj.location_id === location.location_id);
                        if (matchedObj) {
                            // Merge the matched data into the corresponding location object
                            Object.assign(location, matchedObj);
                        }
                    });
                }
            }
        }
    }

    return data;
}


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



// Function to create and populate the table header
function createTableHeader(mergedData, nws_day1_date, nws_day1_date_title, nws_day2_date, nws_day2_date_title, nws_day3_date, nws_day3_date_title) {
    // Create a table element
    const table = document.createElement('table');
    table.setAttribute('id', 'webrep');

    // TITLE ROW 1
    // Create a table header row
    const headerRow = table.insertRow(0);

    // Create table headers for the desired columns
    const columns  = ["River Mile", "Gage Station", "Current Level", "24hr Delta", "National Weather Service River Forecast", "Flood Level", "Gage Zero", "Record Stage", "Record Date"];

    columns.forEach((columnName) => {
        const th = document.createElement('th');
        th.textContent = columnName;
        if (columnName === "River Mile") {
            th.rowSpan = 3;
        }
        if (columnName === "Gage Station") {
            th.rowSpan = 3;
        }
        if (columnName === "Current Level") {
            th.rowSpan = 3;
        }
        if (columnName === "24hr Delta") {
            th.rowSpan = 3;
        }
        if (columnName === "National Weather Service River Forecast") {
            th.colSpan = 3;
        }
        if (columnName === "Flood Level") {
            th.rowSpan = 3;
        }
        if (columnName === "Gage Zero") {
            th.rowSpan = 3;
        }
        if (columnName === "Record Stage") {
            th.rowSpan = 3;
        }
        if (columnName === "Record Date") {
            th.rowSpan = 3;
        }
        headerRow.appendChild(th);
    });

    // TITLE ROW 2
    // Create a table header row
    const headerRow2 = table.insertRow(1);

    // Create table headers for the desired columns
    const columns2  = ["National Weather Service River Forecast"];

    columns2.forEach((columnName) => {
        if (columnName === "National Weather Service River Forecast") {
            const thNext3Days = document.createElement('th');
            thNext3Days.textContent = "Next 3 days";
            headerRow2.appendChild(thNext3Days);

            const thForecastTime = document.createElement('th');
            thForecastTime.textContent = "Forecast Time";
            thForecastTime.rowSpan = 2;
            headerRow2.appendChild(thForecastTime);

            const thCrest = document.createElement('th');
            thCrest.textContent = "Crest & Date";
            thCrest.rowSpan = 2;
            headerRow2.appendChild(thCrest);
        }
    });


    // TITLE ROW 3
    // Create a table header row
    const headerRow3 = table.insertRow(2);

    // Create table headers for the desired columns
    const columns3  = ["National Weather Service River Forecast"];

    columns3.forEach((columnName) => {
        if (columnName === "National Weather Service River Forecast") {
            const thNext3DaysDate = document.createElement('th');
            thNext3DaysDate.innerHTML = "<span style='margin-right: 7px;margin-left: 7px;'>" + nws_day1_date_title + "</span>" + "|";
            thNext3DaysDate.innerHTML += "<span style='margin-right: 7px;margin-left: 7px;'>" + nws_day2_date_title + "</span>" + "|";
            thNext3DaysDate.innerHTML += "<span style='margin-right: 7px;margin-left: 7px;'>" + nws_day3_date_title + "</span>";
            headerRow3.appendChild(thNext3DaysDate);
        }
    });
    // Append the table to the document or a specific container
    const tableContainerWebrep = document.getElementById('table_container_river_reservoir');
    if (tableContainerWebrep) {
        tableContainerWebrep.appendChild(table);
    }
}


// Function to create and populate the table body
function createTableBody (mergedData, nws_day1_date, nws_day1_date_title, nws_day2_date, nws_day2_date_title, nws_day3_date, nws_day3_date_title) {
    const tableBody = document.querySelector('#webrep tbody');

    mergedData.forEach(basinData => {
        // Create a row for the basin with colspan=11
        const basinRow = document.createElement('tr');
        const basinCell = document.createElement('td');
        basinCell.colSpan = 11;
        basinCell.innerHTML = basinData.basin;
        basinCell.style.textAlign = 'left';
        basinCell.style.fontWeight = 'bold';
        basinRow.appendChild(basinCell);
        tableBody.appendChild(basinRow);

        // Get current date and time
        const currentDateTime = new Date();
        console.log('currentDateTime:', currentDateTime);

        // Subtract two hours from current date and time
        const currentDateTimeMinus2Hours = subtractHoursFromDate(currentDateTime, 2);
        console.log('currentDateTimeMinus2Hours :', currentDateTimeMinus2Hours);

        // Subtract thirty hours from current date and time
        const currentDateTimeMinus30Hours = subtractHoursFromDate(currentDateTime, 64);
        console.log('currentDateTimeMinus30Hours :', currentDateTimeMinus30Hours);

        // Add thirty hours to current date and time
        const currentDateTimePlus30Hours = plusHoursFromDate(currentDateTime, 30);
        console.log('currentDateTimePlus30Hours :', currentDateTimePlus30Hours);

        // Add four days to current date and time
        const currentDateTimePlus4Days = addDaysToDate(currentDateTime, 4);
        console.log('currentDateTimePlus4Days :', currentDateTimePlus4Days);

        // Loop through each location in the basin and create rows for them
        Object.keys(basinData).forEach(key => {
            if (key.startsWith('loc_')) {
                const locData = basinData[key];
                if (locData.river_reservoir === true) { // Check if river_reservoir is true
                    const locationRow = document.createElement('tr');

                        // SETTING UP VARIABLES
                        // Prepare c_count to get 24 hour values to calculate delta 
                        let c_count = null;
                        c_count = locData.c_count;
                        console.log("c_count hardcoded:", c_count);

                        let flood_level = null;
                        // Check if locData has the 'flood' property and if its 'constant-value' is not null
                        if (locData.flood_level !== null) {
                            // Check conditions for flood level value and format it to two decimal places if it falls within range
                            if (
                                locData.flood_level === null ||
                                parseFloat(locData.flood_level).toFixed(2) == 0.00 ||
                                parseFloat(locData.flood_level).toFixed(2) > 900
                            ) {
                                flood_level = null; // If flood level is null or outside range, set flood_level to an empty string
                            } else {
                                flood_level = parseFloat(locData.flood_level).toFixed(2); // Otherwise, format flood level to two decimal places
                            }
                        } else {
                            flood_level = null;
                        }

                        if (locData.visible === true && locData.river_reservoir === true) {
                            console.log("visible and river_reservoir are true");

                            // RIVER MILE
                            const rivermileCell = document.createElement('td');
                            rivermileCell.textContent = locData.station;
                            locationRow.appendChild(rivermileCell);
                            
                            // LOCATION
                            const locationCell = document.createElement('td');
                            locationCell.textContent = locData.public_name;
                            locationRow.appendChild(locationCell);


                            // STAGE
                            const stageCell = document.createElement('td');
                            stageCell.textContent = "";
                            


                            // DELTA
                            const deltaCell = document.createElement('td');
                            deltaCell.textContent = "";
                            


                            // NWS DAY1-DAY3
                            const nwsCell = document.createElement('td');
                            nwsCell.textContent = "";
                            


                            // FORECAST TIME
                            const forecastTimeCell = document.createElement('td');
                            forecastTimeCell.textContent = "";
                            

                            fetchAndUpdateStage(stageCell, deltaCell, nwsCell, forecastTimeCell, locData.tsid_stage_rev, locData.tsid_stage_29, locData.display_stage_29, locData.tsid_stage_nws_3_day_forecast, flood_level, nws_day1_date, nws_day2_date, nws_day3_date, currentDateTimeMinus2Hours);
                            locationRow.appendChild(stageCell);
                            locationRow.appendChild(deltaCell);
                            locationRow.appendChild(nwsCell);
                            locationRow.appendChild(forecastTimeCell);



                            // CREST AND DATE
                            const crestCell = document.createElement('td');
                            crestCell.textContent = "";
                            fetchAndUpdateCrest(crestCell, locData.tsid_crest, flood_level, currentDateTimeMinus2Hours);
                            locationRow.appendChild(crestCell);



                            // FLOOD LEVEL
                            const floodCell = document.createElement('td');
                            floodCell.textContent = flood_level;
                            locationRow.appendChild(floodCell);


                            // GAGE ZERO
                            const elevationCell = document.createElement('td');
                            elevationCell.textContent = (parseFloat(locData.elevation)).toFixed(2);
                            locationRow.appendChild(elevationCell);


                            // RECORD STAGE
                            const recordStageCell = document.createElement('td');
                            recordStageCell.textContent = "";
                            

                            // RECORD DATE
                            const recordStageDateCell = document.createElement('td');
                            recordStageDateCell.textContent = "";

                            fetchAndUpdateRecordStage(recordStageCell, recordStageDateCell, locData.tsid_stage_rev);
                            locationRow.appendChild(recordStageCell);
                            locationRow.appendChild(recordStageDateCell);
                        }

                    // Append locationRow to tableBody
                    tableBody.appendChild(locationRow);
                }
            }
        });
    });

}


// Function to format number with leading zero if less than 9
function formatNumberWithLeadingZero(number) {
    return number < 10 ? number.toFixed(2).padStart(5, '0') : number.toFixed(2);
}



// Function to get current date time
function formatDateTime(dateTimeString) {
    var dateParts = dateTimeString.split(" ");
    var date = dateParts[0];
    var time = dateParts[1];
    var [month, day, year] = date.split("-");
    var [hours, minutes] = time.split(":");
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
}


// Function to format date time to cst for comparison
function formatStageDateTimeCST(stage_date_time_cst) {
    console.log("stage_date_time_cst = ", stage_date_time_cst);
    var stage_date_time_cst_formatted = formatDateTime(stage_date_time_cst);
    console.log("stage_date_time_cst_formatted", stage_date_time_cst_formatted);
    return stage_date_time_cst_formatted;
}


// Function determine last max class
function determineStageClass(stage_value, flood_value) {
    console.log("determineStageClass = ", stage_value + typeof(stage_value) + " " + flood_value + typeof(flood_value));
    var myStageClass;
    if (parseFloat(stage_value) >= parseFloat(flood_value)) {
        console.log("determineStageClass = ", stage_value + " >= " + flood_value);
        myStageClass = "last_max_value_flood";
    } else {
        console.log("Stage Below Flood Level");
        myStageClass = "last_max_value";
    }
    return myStageClass;
}


// Function determine date time class
function determineStageDateTimeClass(stage29_date_time_cst_formatted, currentDateTimeMinusHours) {
    var myStage29DateTimeClass;
    if (stage29_date_time_cst_formatted >= currentDateTimeMinusHours) {
        myStage29DateTimeClass = "date_time_current";
        console.log("on_time = ", stage29_date_time_cst_formatted);
    } else {
        myStage29DateTimeClass = "date_time_late";
        console.log("late = ", stage29_date_time_cst_formatted);
    }
    console.log("myStage29DateTimeClass = ", myStage29DateTimeClass);
    return myStage29DateTimeClass;
}


// Function to get water quality data
async function fetchAndUpdateRecordStage(recordStageCell, recordStageDateCell, tsid_stage_rev) {
    // Create an object to hold all the properties you want to pass
    const recordStageToSend = {
        cwms_ts_id: encodeURIComponent(tsid_stage_rev),
    };
    console.log("recordStageToSend: " + recordStageToSend);

    // Convert the object into a query string
    const recordStageQueryString = Object.keys(recordStageToSend).map(key => key + '=' + recordStageToSend[key]).join('&');
    console.log("recordStageQueryString: " + recordStageQueryString);

    // Make an AJAX request to the PHP script, passing all the variables
    var recordStageURL = `get_record_stage.php?${recordStageQueryString}`;
    console.log("recordStageURL: " + "https://wm.mvs.ds.usace.army.mil/District-Templates/gage_data/public/" + recordStageURL);
    fetch(recordStageURL)
    .then(response => response.json())
    .then(recordStage => {
        if (recordStage !== null) {
            // Log the stage to the console
            console.log("recordStage: ", recordStage);

            const recordStageInnerHTML = "<span title='" + recordStage.location_level_id + " " + recordStage.level_date + "'>" + parseFloat(recordStage.constant_level).toFixed(2) + "</span>";
            console.log("recordStageInnerHTML = ", recordStageInnerHTML);
            // Set the HTML inside the cell once the fetch is complete
            recordStageCell.innerHTML = recordStageInnerHTML;

            const recordStageDateInnerHTML = "<span>" + recordStage.level_date.slice(0, -6) + "</span>";
            console.log("recordStageDateInnerHTML = ", recordStageDateInnerHTML);
            // Set the HTML inside the cell once the fetch is complete
            recordStageDateCell.innerHTML = recordStageDateInnerHTML;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// Function to get flows data
async function fetchAndUpdateCrest(crestCell, tsid_crest, flood_level, currentDateTimeMinus2Hours) {
    if (tsid_crest !== null) {
        // Create an object to hold all the properties you want to pass
        const dataToSendcrest = {
            cwms_ts_id: encodeURIComponent(tsid_crest),
            //crest_date: encodeURIComponent(crest_date),
        };
        console.log("dataToSendcrest: " + dataToSendcrest);

        // Convert the object into a query string
        const queryStringcrest = Object.keys(dataToSendcrest).map(key => key + '=' + dataToSendcrest[key]).join('&');
        console.log("queryStringcrest: " + queryStringcrest);
    
        // Make an AJAX request to the PHP script, passing all the variables
        const urlcrest = `get_crest.php?${queryStringcrest}`;
        console.log("urlcrest: " + "https://wm.mvs.ds.usace.army.mil/District-Templates/gage_data/public/" + urlcrest);
        fetch(urlcrest)
        .then(response => response.json())
        .then(crest => {
            // Log the crest to the console
            console.log("crest: ", crest);

            if (crest !== null) {
                // Your code to be executed if crest is not null
                console.log("crest is not null");

                // GET CREST VALUE
                const crest_cwms_ts_id = crest.cwms_ts_id;
                console.log("crest_cwms_ts_id = ", crest_cwms_ts_id);

                const crest_value = parseFloat(crest.value);
                console.log("crest_value = ", crest_value);

                const crest_date_time = crest.date_time;
                console.log("crest_date_time = ", crest_date_time);

                const crest_delta_24 = parseFloat(crest.delta_24);
                console.log("crest_delta_24 = ", crest_delta_24);

                const crest_unit_id = crest.unit_id;
                console.log("crest_unit_id = ", crest_unit_id);

                // CREST CLASS
                if (crest_value >= flood_level) {
                    console.log("Crest Above Flood Level");
                    var myCrestClass = "last_max_value_flood";
                } else {
                    console.log("Crest Below Flood Level");
                    var myCrestClass = "--";
                }
                console.log("myCrestClass = ", myCrestClass);

                crestCellInnerHTML = "<span class='" + myCrestClass + "' title='" + tsid_crest + " " + crest.date_time + "'>" + crest_value.toFixed(2) + "&nbsp;&nbsp;" + crest.date_time.substring(0, 5) + "</span>";
            
                // Set the combined value to the cell, preserving HTML
                console.log("crestCellInnerHTML = ", crestCellInnerHTML);

                // Set the HTML inside the cell once the fetch is complete
                crestCell.innerHTML = crestCellInnerHTML;
            } else {
                // Your code to be executed if crest is null
                console.log("crest is null");

                crestCellInnerHTML = "<span title='" + tsid_crest + "'>"+ "  " + "</span>";
            
                // Set the combined value to the cell, preserving HTML
                console.log("crestCellInnerHTML = ", crestCellInnerHTML);

                // Set the HTML inside the cell once the fetch is complete
                crestCell.innerHTML = crestCellInnerHTML;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


async function fetchAndUpdateStage(stageCell, deltaCell, nwsCell, forecastTimeCell, tsid_stage_rev, tsid_stage_29, display_stage_29, tsid_stage_nws_3_day_forecast, flood_value, nws_day1_date, nws_day2_date, nws_day3_date, currentDateTimeMinusHours) {
    // Create an object to hold all the properties you want to pass
    let stageToSend = null;
    if (display_stage_29 === true) {
        stageToSend = {
            cwms_ts_id: encodeURIComponent(tsid_stage_29),
        };
        console.log("stageToSend: " + stageToSend);
    } else {
        stageToSend = {
            cwms_ts_id: encodeURIComponent(tsid_stage_rev),
        };
        console.log("stageToSend: " + stageToSend);
    }
    

    // Convert the object into a query string
    const stageQueryString = Object.keys(stageToSend).map(key => key + '=' + stageToSend[key]).join('&');
    console.log("stageQueryString: " + stageQueryString);

    // Make an AJAX request to the PHP script, passing all the variables
    const urlStage = `get_stage.php?${stageQueryString}`;

    // Create an object to hold all the properties you want to pass
    const dataToSendNWSDay1 = {
        cwms_ts_id: encodeURIComponent(tsid_stage_nws_3_day_forecast),
        nws_day1_date: encodeURIComponent(nws_day1_date),
        nws_day2_date: encodeURIComponent(nws_day2_date),
        nws_day3_date: encodeURIComponent(nws_day3_date),
    };
    console.log("dataToSendNWSDay1: " + dataToSendNWSDay1);

    // Convert the object into a query string
    const queryStringNWS = Object.keys(dataToSendNWSDay1).map(key => key + '=' + dataToSendNWSDay1[key]).join('&');
    console.log("queryStringNWS: " + queryStringNWS);

    const urlNWS = `get_nws_forecast.php?${queryStringNWS}`;


    // Perform two fetch requests
    const fetch1 = fetch(urlStage);
    console.log("fetch1: " + fetch1);

    const fetch2 = fetch(urlNWS);
    console.log("fetch2: " + fetch2);

    // Process the data when both requests are fulfilled
    return Promise.all([fetch1, fetch2])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        // Data from the first request
        const data1 = data[0];
        // Process the data as needed
        console.log('Data from fetch1:', data1);

        if (data1 !== null) {
            const stage_cwms_ts_id = data[0].cwms_ts_id;
            console.log("stage_cwms_ts_id = ", stage_cwms_ts_id);

            // Format returned data time string to date time object
            var stage_date_time_cst = data[0].date_time_cst;
            var formattedDateTimeCST = formatStageDateTimeCST(stage_date_time_cst);

            const stage_value = (parseFloat(data[0].value)).toFixed(2);
            console.log("stage_value = ", stage_value);

            const stage_delta_24 = (parseFloat(data[0].delta_24)).toFixed(2);
            console.log("stage_delta_24 = ", stage_delta_24);

            // FLOOD CLASS
            var floodClass = determineStageClass(stage_value, flood_value);
            console.log("floodClass:", floodClass);

            // DATATIME CLASS
            var dateTimeClass = determineStageDateTimeClass(formattedDateTimeCST, currentDateTimeMinusHours);
            console.log("dateTimeClass:", dateTimeClass);

            let stageCellInnerHTML = "";
            stageCellInnerHTML = 	"<span class='" + floodClass + "' title='" + stage_cwms_ts_id + ", Value = " + stage_value + ", DateTime = " + stage_date_time_cst + ", Flood = " + parseFloat(flood_value).toFixed(2) + "'>"
                                    + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + stage_cwms_ts_id + "&start_day=4&end_day=0' target='_blank'>"
                                    + stage_value
                                    + "</a>"
                                    +"</span>";
                        
            let deltaCellInnerHTML = "";
            deltaCellInnerHTML =  "<span title='" + stage_cwms_ts_id + ", Delta = " + stage_delta_24 + " = (" + stage_value + " - " + (parseFloat(data[0].value_24)).toFixed(2) +"), Value24 = " + (parseFloat(data[0].value_24)).toFixed(2) + ", DateTime = " + data[0].date_time_24_cst + ", Flood = " + parseFloat(flood_value).toFixed(2) + "'>" + stage_delta_24 + "</span>";

            // Set the combined value to the cell, preserving HTML
            console.log("stageCellInnerHTML = ", stageCellInnerHTML);

            // Set the HTML inside the cell once the fetch is complete
            stageCell.innerHTML = stageCellInnerHTML;
            deltaCell.innerHTML = deltaCellInnerHTML;

        }
            
            // Data from the second request
            const data2 = data[1];
            // Process the data as needed
            console.log('Data from fetch2:', data2);

        if (data2 !== null) {
            // Get nws values from nwsData
            const nws1_value = formatNumberWithLeadingZero(parseFloat(data[1].value_day1));
            console.log("nws1_value = ", nws1_value);

            const nws2_value = formatNumberWithLeadingZero(parseFloat(data[1].value_day2));
            console.log("nws2_value = ", nws2_value);

            const nws3_value = formatNumberWithLeadingZero(parseFloat(data[1].value_day3));
            console.log("nws3_value = ", nws3_value);


            // FLOOD CLASS
            var floodClassDay1 = determineStageClass(nws1_value, flood_value);
            console.log("floodClassDay1:", floodClassDay1);

            var floodClassDay2 = determineStageClass(nws2_value, flood_value);
            console.log("floodClassDay2:", floodClassDay2);

            var floodClassDay3 = determineStageClass(nws3_value, flood_value);
            console.log("floodClassDay3:", floodClassDay3);

            const nwsCellInnerHTML  = "<span class='" + floodClassDay1 + "' style='margin-right: 7px;margin-left: 7px;'>" 
                                    + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + tsid_stage_nws_3_day_forecast + "&start_day=0&end_day=4' title='" + tsid_stage_nws_3_day_forecast + " " + data[1].date_time_day1 + "' target='_blank'>"
                                    + nws1_value
                                    + "</a>"
                                    + "</span>"
                                    + " | "
                                    + "<span class='" + floodClassDay2 + "' style='margin-right: 7px;margin-left: 7px;'>" 
                                    + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + tsid_stage_nws_3_day_forecast + "&start_day=0&end_day=4' title='" + tsid_stage_nws_3_day_forecast + " " + data[1].date_time_day2 + "' target='_blank'>"
                                    + nws2_value
                                    + "</a>"
                                    + "</span>"
                                    + " | "
                                    + "<span class='" + floodClassDay3 + "' style='margin-right: 7px;margin-left: 7px;'>" 
                                    + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + tsid_stage_nws_3_day_forecast + "&start_day=0&end_day=4' title='" + tsid_stage_nws_3_day_forecast + " " + data[1].date_time_day3 + "' target='_blank'>"
                                    + nws3_value
                                    + "</a>"
                                    + "</span>";
            console.log('nwsCellInnerHTML: ', nwsCellInnerHTML);

            const forecastTimeCellInnerHTML   = "<span class='day_nws_ded' title='Data Entry Date'>" + data[1].data_entry_date_day1 + "</span>";
            console.log('nwsCellInnerHTML: ', nwsCellInnerHTML);

            // Update the HTML inside the cell with the combined data
            nwsCell.innerHTML = nwsCellInnerHTML;
            forecastTimeCell.innerHTML = forecastTimeCellInnerHTML;
        }
    })
    .catch(error => {
        // Handle errors
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error for the caller to handle
    });
}