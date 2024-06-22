document.addEventListener('DOMContentLoaded', function () {
    // Display the loading_alarm_mvs indicator
    const loadingIndicatorGageData = document.getElementById('loading_gage_data');
    loadingIndicatorGageData.style.display = 'block';

    // Gage control json file
    const jsonFile = 'gage_control2.json';
    
    fetch('json/' + jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if data_items array is present in the data
            console.log('data: ', data);

            console.log('selectedBasin: ', selectedBasin);

            // Function to filter data for the "Big Muddy" basin
            function filterBasin(data) {
                return data.filter(entry => entry.basin === selectedBasin);
            }

            // Extracted data for the selected basin
            const basinData = filterBasin(data);

            // Print the extracted data for selected basin
            console.log('basinData: ', basinData);

            // Create an array of promises for each fetch
            const fetchPromises = basinData.map(item => {
                // Process each item and call the second fetch
                const basin = item.basin;

                const secondFetchUrl = `get_gage_control.php?basin=${basin}`;
                console.log('secondFetchUrl:', secondFetchUrl);

                // Return the fetch promise
                return fetch(secondFetchUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    });
            });
            // Execute all fetch operations concurrently
            return Promise.all(fetchPromises)
                .then(secondDataArray => {
                    // Handle the combined data from the second fetch
                    console.log('secondDataArray:', secondDataArray);

                    // Merge the data
                    const mergedData = mergeData(basinData, secondDataArray);
                    console.log('mergedData: ', mergedData);

                    // Call the function to create and populate the table
					createTable(mergedData);
                    //console.log("Calling createTable with mergedData:", mergedData);

                    // Hide the gage_data indicator
                    loadingIndicatorGageData.style.display = 'none';
                });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Hide the loading_alarm_mvs indicator regardless of success or failure
            loadingIndicatorGageData.style.display = 'none';
        });
});

// Function to merge two jsons based on basin and location
function mergeData(basinData, secondDataArray) {
    // Iterate over each basin item in basinData
    for (const basinKey in basinData) {
        if (basinKey !== "basin") {
            const basinItem = basinData[basinKey];
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

    return basinData;
}

// Function to get current data time
function subtractHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() - (hoursToSubtract * 60 * 60 * 1000));
}

// Function to create and populate the table
function createTable(mergedData) {
    // Create a table element
    const table = document.createElement('table');
    table.setAttribute('id', 'gage_data'); // Set the id to "customers"

    // Create a table header row
    const headerRow = document.createElement('tr');

    // Create table headers for the desired columns
    const columns = ["Gage", "Stage (24hr)", "Flow (24hr)", "Precip (6hr - 24hr)", "Water Quality", "River Mile", "Flood Level"];

    columns.forEach((columnName) => {
        const th = document.createElement('th');
        th.textContent = columnName;
        th.style.height = '50px';
        headerRow.appendChild(th);
    });

    // Append the header row to the table
    table.appendChild(headerRow);

    // Get current data time and minus two hours to compare current value
    const currentDateTime = new Date();
    const currentDateTimeMinusHours = subtractHoursFromDate(currentDateTime, 2);
    console.log('currentDateTime:', currentDateTime);
    console.log('currentDateTimeMinusHours :', currentDateTimeMinusHours);

    // Iterate through the mergedData to populate the table
    mergedData.forEach((locationData) => {
        // Iterate over each loc property
        for (let locKey in locationData) {
            // Check if the property starts with 'loc_'
            if (locKey.startsWith('loc_')) {
                const locData = locationData[locKey];

                // HIDE LOCATION BASED ON VISIBLE
                if (locData.visible !== false) {
                    const row = table.insertRow(); // Insert a new row for each loc
                    // LOCATION
                    const locationCell = row.insertCell();
                    locationCell.style.textAlign = 'left'; // You can change 'center' to other values like 'left', 'right', or 'justify'
					locationCell.style.fontWeight = 'bold'; // Bold text

                    if (locData.owner === "MVS") {
                        locationCell.innerHTML = locData.order + " " + locData.location_id;
                        locationCell.style.color = 'darkblue'; // Set text color to dark blue
                    } else {
                        locationCell.innerHTML = locData.order + " " + locData.location_id;
                    }
                    

                    // get flood stage for each location, this value was used to compare to stage
                    const flood_value = (parseFloat(locData.flood_level)).toFixed(2);
                    console.log("flood_value = ", flood_value);

                    // STAGE
                    const stageCell = row.insertCell();

                    // PROJECT GAGE STAGES
                    if (locData.display_stage_29 === true) {
                        // Create an object to hold all the properties you want to pass
                        const stage29ToSend = {
                            cwms_ts_id: encodeURIComponent(locData.tsid_stage_29),
                        };
                        console.log("stage29ToSend: " + stage29ToSend);

                        // Convert the object into a query string
                        const stage29QueryString = Object.keys(stage29ToSend).map(key => key + '=' + stage29ToSend[key]).join('&');
                        console.log("stage29QueryString: " + stage29QueryString);

                        // Make an AJAX request to the PHP script, passing all the variables
                        const urlStage29 = `get_stage29.php?${stage29QueryString}`;
                        console.log("urlStage29: " + "https://wm.mvs.ds.usace.army.mil/District-Templates/gage_data/public/" + urlStage29);
                        fetch(urlStage29)
                        .then(response => response.json())
                        .then(stage29 => {
                            // Log the stage to the console
                            console.log("stage29 = ", stage29);
                            // GET STAGE VALUE
                            const stage29_cwms_ts_id = stage29.cwms_ts_id;
                            console.log("stage29_cwms_ts_id = ", stage29_cwms_ts_id);

                            // Format returned data time string to date time object
                            var stage29_date_time_cst = stage29.date_time_cst;
                            var formattedDateTimeCST = formatStageDateTimeCST(stage29_date_time_cst);

                            const stage29_value = (parseFloat(stage29.value)).toFixed(2);
                            console.log("stage29_value = ", stage29_value);

                            const stage29_delta_24 = (parseFloat(stage29.delta_24)).toFixed(2);
                            console.log("stage29_delta_24 = ", stage29_delta_24);

                            // FLOOD CLASS
                            var floodClass = determineStageClass(stage29_value, flood_value);
                            console.log("floodClass:", floodClass);

                            // DATATIME CLASS
                            var dateTimeClass = determineStageDateTimeClass(formattedDateTimeCST, currentDateTimeMinusHours);
                            console.log("dateTimeClass:", dateTimeClass);

                            stage29CwmsIdCellInnerHTML = "<span class='" + floodClass + "' title='" + stage29.cwms_ts_id + "'>"
                                                    + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + stage29_cwms_ts_id + "&start_day=4&end_day=0' target='_blank'>"
                                                    + stage29_value
                                                    + "</a>"
                                                    +"</span>" 
                                                    + " " 
                                                    + stage29.unit_id 
                                                    + " (" + stage29_delta_24 + ")"
                                                    + "<br>" 
                                                    + "<span class='" + dateTimeClass + "'>"
                                                    + stage29_date_time_cst
                                                    + "</span>";
                            
                            // Set the combined value to the cell, preserving HTML
                            console.log("stage29CwmsIdCellInnerHTML = ", stage29CwmsIdCellInnerHTML);

                            // Set the HTML inside the cell once the fetch is complete
                            stageCell.innerHTML = stage29CwmsIdCellInnerHTML;
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    
                    // NON-PROJECT GAGE STAGES WITH 3 DAYS NWS FORECAST
                    } else if (locData.display_stage_29 === false && locData.tsid_stage_nws_3_day_forecast !== null) {		
                        // Create an object to hold all the properties you want to pass
                        const stageToSend = {
                            cwms_ts_id: encodeURIComponent(locData.tsid_stage_rev),
                        };
                        console.log("stageToSend: " + stageToSend);

                        // Convert the object into a query string
                        const stageQueryString = Object.keys(stageToSend).map(key => key + '=' + stageToSend[key]).join('&');
                        console.log("stageQueryString: " + stageQueryString);
                    
                        // Make an AJAX request to the PHP script, passing all the variables
                        const urlStage = `get_stage.php?${stageQueryString}`;
                        console.log("urlStage: " + "https://wm.mvs.ds.usace.army.mil/District-Templates/gage_data/public/" + urlStage);
                        fetch(urlStage)
                        .then(response => response.json())
                        .then(stage => {
                            // Log the stage to the console
                            console.log(stage);
                        // GET STAGE VALUE
                            const stage_cwms_ts_id = stage.cwms_ts_id;
                            console.log("stage_cwms_ts_id = ", stage_cwms_ts_id);

                            // Format returned data time string to date time object
                            var stage_date_time_cst = stage.date_time_cst;
                            var formattedDateTimeCST = formatStageDateTimeCST(stage_date_time_cst);

                            const stage_value = (parseFloat(stage.value)).toFixed(2);
                            console.log("stage_value = ", stage_value);

                            const stage_delta_24 = (parseFloat(stage.delta_24)).toFixed(2);
                            console.log("stage_delta_24 = ", stage_delta_24);

                            // FLOOD CLASS
                            var floodClass = determineStageClass(stage_value, flood_value);
                            console.log("floodClass:", floodClass);

                            // DATATIME CLASS
                            var dateTimeClass = determineStageDateTimeClass(formattedDateTimeCST, currentDateTimeMinusHours);
                            console.log("dateTimeClass:", dateTimeClass);

                            stageCellInnerHTML = 	"<span class='" + floodClass + "' title='" + stage_cwms_ts_id + "   " + "Flood=" + parseFloat(locData.flood_level).toFixed(2) + "'>"
                                                    + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + stage_cwms_ts_id + "&start_day=4&end_day=0' target='_blank'>"
                                                    + stage_value
                                                    + "</a>"
                                                    +"</span>" 
                                                    + " " 
                                                    + stage.unit_id
                                                    + " (" + stage_delta_24 + ")"
                                                    + "<br>" 
                                                    + "<span class='" + dateTimeClass + "'>"
                                                    + stage_date_time_cst
                                                    + "</span>";
                            
                            // Set the combined value to the cell, preserving HTML
                            console.log("stageCellInnerHTML = ", stageCellInnerHTML);

                            // Set the HTML inside the cell once the fetch is complete
                            stageCell.innerHTML = stageCellInnerHTML;

                            // Create an object to hold all the properties you want to pass
                            const dataToSendNWSDay1 = {
                                cwms_ts_id: encodeURIComponent(locData.tsid_stage_nws_3_day_forecast),
                                nws_day1_date: encodeURIComponent(nws_day1_date),
                                nws_day2_date: encodeURIComponent(nws_day2_date),
                                nws_day3_date: encodeURIComponent(nws_day3_date),
                            };
                            console.log("dataToSendNWSDay1: " + dataToSendNWSDay1);

                            // Convert the object into a query string
                            const queryStringNWS = Object.keys(dataToSendNWSDay1).map(key => key + '=' + dataToSendNWSDay1[key]).join('&');
                            console.log("queryStringNWS: " + queryStringNWS);

                            // Now, make another fetch to get additional data
                            const secondUrl = `get_nws_forecast.php?${queryStringNWS}`; // Replace with your actual URL
                            console.log("secondUrl: " + "https://wm.mvs.ds.usace.army.mil/District-Templates/gage_data/public/" + secondUrl);
                            return fetch(secondUrl);
                        })

                        .then(response => response.json())
                        .then(nwsData => {
                            // Process the data from the second fetch
                            console.log('nwsData:', nwsData);

                            let stageCellInnerHTML = "";

                            if (nwsData !== null) {
                                // Get nws values from nwsData
                                const nws1_value = (parseFloat(nwsData.value_day1)).toFixed(2);
                                console.log("nws1_value = " , nws1_value);
                                const nws2_value = (parseFloat(nwsData.value_day2)).toFixed(2);
                                console.log("nws2_value = " , nws2_value);
                                const nws3_value = (parseFloat(nwsData.value_day3)).toFixed(2);
                                console.log("nws3_value = " , nws3_value);

                                const flood_value = (parseFloat(locData.flood_level)).toFixed(2);
                                console.log("flood_value = ", flood_value);

                                // FLOOD CLASS
                                var floodClassDay1 = determineStageClass(nws1_value, flood_value);
                                console.log("floodClassDay1:", floodClassDay1);

                                var floodClassDay2 = determineStageClass(nws2_value, flood_value);
                                console.log("floodClassDay2:", floodClassDay2);

                                var floodClassDay3 = determineStageClass(nws3_value, flood_value);
                                console.log("floodClassDay3:", floodClassDay3);

                                stageCellInnerHTML  = "<table id='nws'>"
                                                    + "<tr>"
                                                        + "<td colspan='3' class='day_nws_forecast'>"
                                                            + "3 Day NWS Forecast"
                                                        + "</td>"
                                                    + "</tr>"
                                                    + "<tr>"
                                                    + "<td class='" + floodClassDay1 + "'>" 
                                                        + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + locData.tsid_stage_nws_3_day_forecast + "&start_day=0&end_day=4' title='" + locData.tsid_stage_nws_3_day_forecast + " " + nwsData.date_time_day1 + "' target='_blank'>"
                                                            + nws1_value
                                                        + "</a>"
                                                    + "</td>"
                                                    + "<td class='" + floodClassDay2 + "'>" 
                                                        + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + locData.tsid_stage_nws_3_day_forecast + "&start_day=0&end_day=4' title='" + locData.tsid_stage_nws_3_day_forecast + " " + nwsData.date_time_day2 + "' target='_blank'>"
                                                            + nws2_value
                                                        + "</a>"
                                                    + "</td>"
                                                    + "<td class='" + floodClassDay3 + "'>" 
                                                        + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + locData.tsid_stage_nws_3_day_forecast + "&start_day=0&end_day=4' title='" + locData.tsid_stage_nws_3_day_forecast + " " + nwsData.date_time_day3 + "' target='_blank'>"
                                                            + nws3_value
                                                        + "</a>"
                                                    + "</td>"
                                                    + "</tr>"
                                                    + "<tr>"
                                                        + "<td colspan='3' class='day_nws_ded' title='Data Entry Date'>" + "Forecast Date: " + nwsData.data_entry_date_day1 + "</td>";
                                                    + "</tr>"
                                                    +"<table>";
                                console.log('stageCellInnerHTML Day1:', stageCellInnerHTML);
                                
                                // Update the HTML inside the cell with the combined data
                                stageCell.innerHTML += stageCellInnerHTML;
                            } else {
                                // Handle case when data is null
                                stageCellInnerHTML = "<span class='missing'>"
                                                            + "-M-"
                                                            + "</span>"
                                                            + "<span class='temp_water'>"
                                                            + "NWS 3 Days Forecast"
                                                            + "</span>";

                                // Set the combined value to the cell, preserving HTML
                                console.log("stageCellInnerHTML = ", stageCellInnerHTML);

                                // Update the HTML inside the cell with the combined data
                                stageCell.innerHTML += stageCellInnerHTML;
                            }
                            	
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    // NON-PROJECT GAGES
                    } else {
                        // Create an object to hold all the properties you want to pass
                        const stageToSend = {
                            cwms_ts_id: encodeURIComponent(locData.tsid_stage_rev),
                        };
                        console.log("stageToSend: " + stageToSend);

                        // Convert the object into a query string
                        const stageQueryString = Object.keys(stageToSend).map(key => key + '=' + stageToSend[key]).join('&');
                        console.log("stageQueryString: " + stageQueryString);

                        // Make an AJAX request to the PHP script, passing all the variables
                        const urlStage = `get_stage.php?${stageQueryString}`;
                        console.log("urlStage: " + "https://wm.mvs.ds.usace.army.mil/District-Templates/gage_data/public/" + urlStage);
                        fetch(urlStage)
                        .then(response => response.json())
                        .then(stage => {
                            // Log the stage to the console
                            console.log("stage: ", stage);
                        // GET STAGE VALUE
                            // Format returned data time string to date time object
                            var stage_date_time_cst = stage.date_time_cst;
                            var formattedDateTimeCST = formatStageDateTimeCST(stage_date_time_cst);

                            const stage_value = (parseFloat(stage.value)).toFixed(2);
                            console.log("stage_value = ", stage_value);

                            const stage_delta_24 = (parseFloat(stage.delta_24)).toFixed(2);
                            console.log("stage_delta_24 = ", stage_delta_24);

                            // FLOOD CLASS
                            var floodClass = determineStageClass(stage_value, flood_value);
                            console.log("floodClass:", floodClass);

                            // DATATIME CLASS
                            var dateTimeClass = determineStageDateTimeClass(formattedDateTimeCST, currentDateTimeMinusHours);
                            console.log("dateTimeClass:", dateTimeClass);

                            stageCwmsIdCellInnerHTML = "<span class='" + floodClass + "' title='" + stage.cwms_ts_id + "'>"
                                                    + "<a href='https://wm.mvs.ds.usace.army.mil/web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + stage.cwms_ts_id + "&start_day=4&end_day=0' target='_blank'>"
                                                    + stage_value 
                                                    + "</a>"
                                                    +"</span>" 
                                                    + " " 
                                                    + stage.unit_id 
                                                    + " (" + stage_delta_24 + ")"
                                                    + "<br>" 
                                                    + "<span class='" + dateTimeClass + "'>"
                                                    + stage_date_time_cst
                                                    + "</span>";
                            
                            // Set the combined value to the cell, preserving HTML
                            console.log("stageCwmsIdCellInnerHTML = ", stageCwmsIdCellInnerHTML);

                            // Set the HTML inside the cell once the fetch is complete
                            stageCell.innerHTML = stageCwmsIdCellInnerHTML; 
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    }
                    
                    // FLOW
                    const flowCell = row.insertCell();
                    //flowCell.innerHTML = locData.tsid_flow_coe + "<br>" + locData.tsid_flow_usgs + "<br>" + locData.tsid_flow_nws;
                    
                    fetchAndUpdateFlow(locData.tsid_flow_coe, locData.tsid_flow_coe_label, currentDateTimeMinusHours, flowCell);
                    fetchAndUpdateFlow(locData.tsid_flow_usgs, locData.tsid_flow_usgs_label, currentDateTimeMinusHours, flowCell);
                    fetchAndUpdateFlow(locData.tsid_flow_nws, locData.tsid_flow_nws_label, currentDateTimeMinusHours, flowCell);
                    fetchAndUpdateFlow(locData.tsid_flow_mvr, locData.tsid_flow_mvr_label, currentDateTimeMinusHours, flowCell);
                    fetchAndUpdateFlow(locData.tsid_flow_slope, locData.tsid_flow_slope_label, currentDateTimeMinusHours, flowCell);


                    // PRECIP
                    const precipCell = row.insertCell();
                    //precipCell.innerHTML = locData.tsid_precip_raw || '--';

                    // Initialize stageCwmsIdCell.innerHTML as an empty string
                    let precipCwmsIdCellInnerHTML = "";

                    if (locData.tsid_precip_raw !== null) {
                        // GET PRECIP VALUE
                        // Create an object to hold all the properties you want to pass
                        const precipDataToSend = {
                                cwms_ts_id: encodeURIComponent(locData.tsid_precip_raw),
                        };
                        console.log("precipDataToSend: " + precipDataToSend);

                        // Convert the object into a query string
                        const precipQueryString = Object.keys(precipDataToSend).map(key => key + '=' + precipDataToSend[key]).join('&');
                        console.log("precipQueryString: " + precipQueryString);

                        // Make an AJAX request to the PHP script, passing all the variables
                        const urlPrecip = `get_precip.php?${precipQueryString}`;
                        console.log("urlPrecip: " + "https://wm.mvs.ds.usace.army.mil/District-Templates/gage_data/public/" + urlPrecip);
                        
                        fetch(urlPrecip)
                        .then(response => response.json())
                        .then(precip => {
                            // Log the stage to the console
                            console.log("precip = ", precip);

                            if (precip !== null) {
                                // GET PRECIP VALUE
                                const precip_cwms_ts_id = precip.cwms_ts_id;
                                console.log("precip_cwms_ts_id = ", precip_cwms_ts_id);

                                // Format returned data time string to date time object
                                var precip_date_time_cst = precip.date_time_cst;
                                var formattedDateTimeCST = formatStageDateTimeCST(precip_date_time_cst);

                                const precip_value = (parseFloat(precip.value)).toFixed(2);
                                console.log("precip_value = ", precip_value);

                                const precip_value_6 = (parseFloat(precip.value_6)).toFixed(2);
                                console.log("precip_value_6 = ", precip_value_6);

                                const precip_value_24 = (parseFloat(precip.value_24)).toFixed(2);
                                console.log("precip_value_24 = ", precip_value_24);

                                const precip_delta_6 = (parseFloat(precip.delta_6)).toFixed(2);
                                console.log("precip_delta_6 = ", precip_delta_6);

                                const precip_delta_24 = (parseFloat(precip.delta_24)).toFixed(2);
                                console.log("precip_delta_24 = ", precip_delta_24);

                                // SET THE CLASS FOR PRECIP TO DISPLAY THE BACKGROUND COLOR
                                if (precip_delta_6 < 0) {
                                    console.log("precip_delta_6 less than 0");
                                    var myClass6 = "precip_less_0";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else if (precip_delta_6 === 0) {
                                    console.log("precip_delta_6 equal to 0");
                                    var myClass6 = "precip_equal_0";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else if (precip_delta_6 > 0.00 && precip_delta_6 <= 0.25) {
                                    console.log("precip_delta_6 greater than 0 and less than or equal to 0.25");
                                    var myClass6 = "precip_greater_0";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else if (precip_delta_6 > 0.25 && precip_delta_6 <= 0.50) {
                                    console.log("precip_delta_6 greater than 0.25 and less than or equal to 0.50");
                                    var myClass6 = "precip_greater_25";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else if (precip_delta_6 > 0.50 && precip_delta_6 <= 1.00) {
                                    console.log("precip_delta_6 greater than 0.50 and less than or equal to 1.00");
                                    var myClass6 = "precip_greater_50";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else if (precip_delta_6 > 1.00 && precip_delta_6 <= 2.00) {
                                    console.log("precip_delta_6 greater than 1.00 and less than or equal to 2.00");
                                    var myClass6 = "precip_greater_100";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else if (precip_delta_6 > 2.00) {
                                    console.log("precip_delta_6 greater than 2.00");
                                    var myClass6 = "precip_greater_200";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else if (precip_delta_6 === null) {
                                    console.log("precip_delta_6 missing");
                                    var myClass6 = "precip_missing";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                } else {
                                    console.log("precip_delta_6 equal to else");
                                    var myClass6 = "blank";
                                    console.log("myClass6 = ", precip_cwms_ts_id + " = " + myClass6);
                                }

                                if (precip_delta_24 < 0) {
                                    console.log("precip_delta_24 less than 0");
                                    var myClass24 = "precip_less_0";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else if (precip_delta_24 === 0) {
                                    console.log("precip_delta_24 equal to 0");
                                    var myClass24 = "precip_equal_0";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else if (precip_delta_24 > 0.00 && precip_delta_24 <= 0.25) {
                                    console.log("precip_delta_24 greater than 0 and less than or equal to 0.25");
                                    var myClass24 = "precip_greater_0";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else if (precip_delta_24 > 0.25 && precip_delta_24 <= 0.50) {
                                    console.log("precip_delta_24 greater than 0.25 and less than or equal to 0.50");
                                    var myClass24 = "precip_greater_25";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else if (precip_delta_24 > 0.50 && precip_delta_24 <= 1.00) {
                                    console.log("precip_delta_24 greater than 0.50 and less than or equal to 1.00");
                                    var myClass24 = "precip_greater_50";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else if (precip_delta_24 > 1.00 && precip_delta_24 <= 2.00) {
                                    console.log("precip_delta_24 greater than 1.00 and less than or equal to 2.00");
                                    var myClass24 = "precip_greater_100";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else if (precip_delta_24 > 2.00) {
                                    console.log("precip_delta_24 greater than 2.00");
                                    var myClass24 = "precip_greater_200";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else if (precip_delta_24 === null) {
                                    console.log("precip_delta_24 missing");
                                    var myClass24 = "precip_missing";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                } else {
                                    console.log("precip_delta_24 equal to else");
                                    var myClass24 = "blank";
                                    console.log("myClass24 =", precip_cwms_ts_id + " = " + myClass24);
                                }

                                // DATATIME CLASS
                                var dateTimeClass = determineStageDateTimeClass(formattedDateTimeCST, currentDateTimeMinusHours);
                                console.log("dateTimeClass:", dateTimeClass);

                                precipCwmsIdCellInnerHTML = "<table id='precip'>"
                                                                + "<tr>"
                                                                    + "<td class='" + myClass6 + "' title='6 hr delta'>"
                                                                        + precip_delta_6
                                                                    + "</td>"
                                                                    + "<td class='" + myClass24 + "' title='24 hr delta'>"
                                                                        + precip_delta_24
                                                                    + "</td>"
                                                                + "</tr>"
                                                            +"</table>"
                                                            + "<span class='last_max_value'>"
                                                            + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + precip_cwms_ts_id + "&start_day=4&end_day=0' title='" + precip_cwms_ts_id + "' target='_blank'>"
                                                                    + precip_value
                                                                + "</a>"
                                                            + "</span>"
                                                                + " "
                                                                + precip.unit_id
                                                                + "<span class='" + dateTimeClass + "'>"
                                                                + precip_date_time_cst
                                                                + "</span>";

                                // Set the combined value to the cell, preserving HTML
                                console.log("precipCwmsIdCellInnerHTML = ", precipCwmsIdCellInnerHTML);

                                precipCell.innerHTML = precipCwmsIdCellInnerHTML;
                            } else {
                                // NO PRECIP
                                precipCwmsIdCellInnerHTML = "<table id='precip'>"
                                                                + "<tr>"
                                                                    + "<td class='precip_missing' title='6 hr delta'>"
                                                                        + "-M-"
                                                                    + "</td>"
                                                                    + "<td class='precip_missing' title='24 hr delta'>"
                                                                        + "-M-"
                                                                    + "</td>"
                                                                + "</tr>"
                                                            +"</table>";

                                // Set the combined value to the cell, preserving HTML
                                console.log("precipCwmsIdCellInnerHTML = ", precipCwmsIdCellInnerHTML);

                                precipCell.innerHTML = precipCwmsIdCellInnerHTML;
                            }
                                
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    } else {
                        precipCell.innerHTML = precipCwmsIdCellInnerHTML;	
                    }

                // WATER QUALITY
                    const waterQualityCell = row.insertCell();
                    //waterQualityCell.innerHTML = locData.tsid_temp_water + "<br>" + locData.tsid_temp_water2 + "<br>" + locData.tsid_temp_water3 + "<br>" + locData.tsid_temp_water4;

                    // Call the function for each temperature data
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water, locData.tsid_temp_water_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water2, locData.tsid_temp_water2_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water3, locData.tsid_temp_water3_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water4, locData.tsid_temp_water4_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water5, locData.tsid_temp_water5_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water6, locData.tsid_temp_water6_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water7, locData.tsid_temp_water7_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water8, locData.tsid_temp_water8_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water9, locData.tsid_temp_water9_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water10, locData.tsid_temp_water10_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water11, locData.tsid_temp_water11_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water12, locData.tsid_temp_water12_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water13, locData.tsid_temp_water13_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water14, locData.tsid_temp_water14_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water15, locData.tsid_temp_water15_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_water16, locData.tsid_temp_water16_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_temp_air, locData.tsid_temp_air_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_air2, locData.tsid_temp_air2_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_air_max, locData.tsid_temp_air_max_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_temp_air_min, locData.tsid_temp_air_min_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_do, locData.tsid_do_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do2, locData.tsid_do2_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do3, locData.tsid_do3_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do4, locData.tsid_do4_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do5, locData.tsid_do5_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do6, locData.tsid_do6_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do7, locData.tsid_do7_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do8, locData.tsid_do8_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do9, locData.tsid_do9_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do10, locData.tsid_do10_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do11, locData.tsid_do11_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do12, locData.tsid_do12_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do13, locData.tsid_do13_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do14, locData.tsid_do14_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_do15, locData.tsid_do15_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_cond, locData.tsid_cond_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_cond2, locData.tsid_cond2_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_depth, locData.tsid_depth_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth2, locData.tsid_depth2_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth3, locData.tsid_depth3_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth4, locData.tsid_depth4_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth5, locData.tsid_depth5_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth6, locData.tsid_depth6_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth7, locData.tsid_depth7_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth8, locData.tsid_depth8_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth9, locData.tsid_depth9_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth10, locData.tsid_depth10_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth11, locData.tsid_depth11_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth12, locData.tsid_depth12_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth13, locData.tsid_depth13_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth14, locData.tsid_depth14_label, currentDateTimeMinusHours, waterQualityCell);
                    fetchAndUpdateWaterQuality(locData.tsid_depth15, locData.tsid_depth15_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_ph, locData.tsid_ph_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_turb, locData.tsid_turb_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_speed_wind, locData.tsid_speed_wind_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_speed, locData.tsid_speed_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_pressure, locData.tsid_pressure_label, currentDateTimeMinusHours, waterQualityCell);

                    fetchAndUpdateWaterQuality(locData.tsid_dir_wind, locData.tsid_dir_wind_label, currentDateTimeMinusHours, waterQualityCell);

                    // RIVER MILE
                    const riverMileCell = row.insertCell();
                    let river_mile = "";
                    if (locData.station === null || ((parseFloat(locData.station)).toFixed(2) == 0.00) || ((parseFloat(locData.station)).toFixed(2) > 900)) {
                        river_mile = ""
                    } else {
                        river_mile = (parseFloat(locData.station)).toFixed(2)
                    }
                    riverMileCell.innerHTML = river_mile;

                    // FLOOD LEVEL
                    const floodCell = row.insertCell();
                    let flood_level = "";
                    if (locData.flood_level === null || ((parseFloat(locData.flood_level)).toFixed(2) == 0.00) || ((parseFloat(locData.flood_level)).toFixed(2) > 900)) {
                        flood_level = ""
                    } else {
                        flood_level = (parseFloat(locData.flood_level)).toFixed(2)
                    }
                    floodCell.innerHTML = flood_level;
                } else {

                }
                
            }
        }
    });
    
    // Append the table to the document or a specific container
    const tableContainer = document.getElementById('table_container_gage_data');
    if (tableContainer) {
        tableContainer.appendChild(table);
    }
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
function fetchAndUpdateWaterQuality(tsid, label, currentDateTimeMinusHours, waterQualityCell) {
    if (tsid !== null) {
        const waterQualityDataToSend = {
            cwms_ts_id: encodeURIComponent(tsid),
        };
        const waterQualityQueryString = Object.keys(waterQualityDataToSend).map(key => key + '=' + waterQualityDataToSend[key]).join('&');
        const urlWaterQuality = `get_temp_water.php?${waterQualityQueryString}`;
        console.log("urlWaterQuality = ", urlWaterQuality);

        // WATER QUALITY CLASS
        if (label.startsWith("TEMP AIR")) {
            var myWaterQualityClass = "water_quality_temp_air";
        } else if (label.startsWith("TEMP WATER")) {
            var myWaterQualityClass = "water_quality_temp_water";
        } else if (label.startsWith("DO")) {
            var myWaterQualityClass = "water_quality_do";
        } else if (label.startsWith("DEPTH")) {
            var myWaterQualityClass = "water_quality_depth";
        } else if (label.startsWith("COND")) {
            var myWaterQualityClass = "water_quality_cond";
        } else if (label.startsWith("PH")) {
            var myWaterQualityClass = "water_quality_ph";
        } else if (label.startsWith("TURB")) {
            var myWaterQualityClass = "water_quality_turb";
        } else if (label.startsWith("SPEED")) {
            var myWaterQualityClass = "water_quality_speed_wind";
        } else if (label.startsWith("PRESSURE")) {
            var myWaterQualityClass = "water_quality_pressure";
        } else if (label.startsWith("DIR")) {
            var myWaterQualityClass = "water_quality_dir_wind";
        } else {
            var myWaterQualityClass = "flow";
        }
        console.log("myWaterQualityClass = ", myWaterQualityClass);
        
        fetch(urlWaterQuality)
        .then(response => response.json())
        .then(waterQuality => {
            console.log("waterQuality = ", waterQuality)

            let waterQualityCellInnerHTML = ""; // Initialize variable

            if (waterQuality !== null) {
                // Format returned data time string to date time object
                var temp_water_date_time_cst = waterQuality.date_time_cst;
                var formattedDateTimeCST = formatStageDateTimeCST(temp_water_date_time_cst);

                // Format value
                const water_quality_value = (parseFloat(waterQuality.value)).toFixed(2);
                let formatted_water_quality_value;

                if (water_quality_value > 900) {
                    formatted_water_quality_value = "OL"; // Use "OL" if value is greater than 900
                } else {
                    formatted_water_quality_value = water_quality_value; // Convert to a fixed number of decimal places
                }

                console.log("water_quality_value = ", formatted_water_quality_value);



                // Format delta
                let temp_water_delta_24;

                if (waterQuality.delta_24 !== null) {
                    // If delta_24 is not null, format it
                    temp_water_delta_24 = (parseFloat(waterQuality.delta_24)).toFixed(0); // Convert delta_24 to a fixed number of decimal places
                    console.log("temp_water_delta_24 = ", temp_water_delta_24); // Log the formatted delta_24 to the console
                } else {
                    // If delta_24 is null, set a placeholder value
                    temp_water_delta_24 = "-M-"; // Placeholder value for null delta_24
                }

                

                // DATATIME CLASS
                var dateTimeClass = determineStageDateTimeClass(formattedDateTimeCST, currentDateTimeMinusHours);
                console.log("dateTimeClass:", dateTimeClass);

                // Update HTML
                //let waterQualityCellInnerHTML = ""; // Initialize variable
                // Construct HTML content based on received data
                // waterQualityCellInnerHTML += ...
                waterQualityCellInnerHTML = "<span class='last_max_value' title='" + waterQuality.cwms_ts_id + " " + water_quality_value + "'>"
                                                            + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + waterQuality.cwms_ts_id + "&start_day=4&end_day=0' target='_blank'>"
                                                            + formatted_water_quality_value
                                                            + "</a>"
                                                            + "</span>"
                                                            + " "
                                                            + waterQuality.unit_id
                                                            + " (" + temp_water_delta_24 + ")"
                                                            + "<span class='" + dateTimeClass + "'>"
                                                            + temp_water_date_time_cst
                                                            + "</span>"
                                                            + "<span class='" + myWaterQualityClass + "'>"
                                                            + label
                                                            + "</span>";
                
                console.log("waterQualityCellInnerHTML = ", waterQualityCellInnerHTML);

                // Update the HTML inside the cell with the combined data
                waterQualityCell.innerHTML += waterQualityCellInnerHTML;	
            } else {
                //let waterQualityCellInnerHTML = ""; // Initialize variable
                // Handle case when data is null
                waterQualityCellInnerHTML = "<span class='missing' title='" + tsid + "'>"
                                            + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + tsid + "&start_day=4&end_day=0' target='_blank'>"
                                            + "-M-"
                                            + "</a>"
                                            + "</span>"
                                            + "<span class='" + myWaterQualityClass + "'>"
                                            + label
                                            + "</span>";

                // Set the combined value to the cell, preserving HTML
                console.log("waterQualityCellInnerHTML = ", waterQualityCellInnerHTML);

                // Update the HTML inside the cell with the combined data
                waterQualityCell.innerHTML += waterQualityCellInnerHTML;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


// Function to get flows data
function fetchAndUpdateFlow(tsid, label, currentDateTimeMinusHours, flowCell) {
    if (tsid !== null) {
        const flowDataToSend = {
            cwms_ts_id: encodeURIComponent(tsid),
        };
        const flowQueryString = Object.keys(flowDataToSend).map(key => key + '=' + flowDataToSend[key]).join('&');
        const urlFlow = `get_temp_water.php?${flowQueryString}`;

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
        console.log("myFlowLabelClass = ", myFlowLabelClass);
        
        fetch(urlFlow)
        .then(response => response.json())
        .then(flow => {

            let flowCellInnerHTML = ""; // Initialize variable

            if (flow !== null) {
                // Format returned data time string to date time object
                var flow_date_time_cst = flow.date_time_cst;
                var formattedDateTimeCST = formatStageDateTimeCST(flow_date_time_cst);

                // Format value
                const flow_value = parseFloat(flow.value).toFixed(0); // Convert to a fixed number of decimal places
                console.log("flow_value = ", flow_value); // Log the formatted value to the console
                let rounded_flow_value; // Declare variable for rounded value

                // Check if the value is greater than or equal to 1000
                if (parseFloat(flow_value) >= 1000) {
                    // If greater than or equal to 1000, round to the nearest tenth and add commas at thousands place
                    rounded_flow_value = (Math.round(parseFloat(flow_value) / 10) * 10).toLocaleString();
                } else {
                    // If less than 1000, simply add commas at thousands place
                    rounded_flow_value = (parseFloat(flow_value)).toLocaleString();
                }

                console.log("rounded_flow_value = ", rounded_flow_value); // Log the rounded and formatted value to the console

                

                // Format delta
                let rounded_flow_delta_24; // Declare variable for rounded delta

                if (flow.delta_24 !== null) {
                    // If delta_24 is not null, format it
                    const flow_delta_24 = (parseFloat(flow.delta_24)).toFixed(0); // Convert delta to a fixed number of decimal places
                    console.log("flow_delta_24 = ", flow_delta_24); // Log the formatted delta to the console

                    // Check if the delta is greater than or equal to 1000 or less than or equal to -1000
                    if (flow_delta_24 >= 1000 || flow_delta_24 <= -1000) {
                        // If greater than or equal to 1000 or less than or equal to -1000, round to the nearest tenth and add commas at thousands place
                        rounded_flow_delta_24 = (Math.round(parseFloat(flow_delta_24) / 10) * 10).toLocaleString();
                    } else {
                        // If between -999 and 999, simply add commas at thousands place
                        rounded_flow_delta_24 = (parseFloat(flow_delta_24)).toLocaleString();
                    }

                    console.log("rounded_flow_delta_24 = ", rounded_flow_delta_24); // Log the rounded and formatted delta to the console
                } else {
                    // If delta_24 is null, set a placeholder value
                    rounded_flow_delta_24 = "-M-"; // Placeholder value for null delta_24
                }


                // DATATIME CLASS
                var dateTimeClass = determineStageDateTimeClass(formattedDateTimeCST, currentDateTimeMinusHours);
                console.log("dateTimeClass:", dateTimeClass);
                
                // Update HTML
                let flowCellInnerHTML = "";
                flowCellInnerHTML = "<span class='last_max_value' title='" + flow.cwms_ts_id + "'>"
                                                            + "<a href='../../../web_apps/plot_macro/public/plot_macro.php?cwms_ts_id=" + flow.cwms_ts_id + "&start_day=4&end_day=0' target='_blank'>"
                                                            + rounded_flow_value
                                                            + "</a>"
                                                            + "</span>"
                                                            + " "
                                                            + flow.unit_id
                                                            + " (" + rounded_flow_delta_24 + ")"
                                                            + "<span class='" + dateTimeClass + "'>"
                                                            + flow_date_time_cst
                                                            + "</span>"
                                                            + "<span class='" + myFlowLabelClass + "'>"
                                                            + label
                                                            + "</span>";
                
                console.log("flowCellInnerHTML = ", flowCellInnerHTML);

                // Update the HTML inside the cell with the combined data
                flowCell.innerHTML += flowCellInnerHTML;	
            } else {
                // Handle case when data is null
                flowCellInnerHTML = "<span class='missing'>"
                                            + "-M-"
                                            + "</span>"
                                            + "<span class='temp_water'>"
                                            + label
                                            + "</span>";

                // Set the combined value to the cell, preserving HTML
                console.log("flowCellInnerHTML = ", flowCellInnerHTML);

                // Update the HTML inside the cell with the combined data
                flowCell.innerHTML += flowCellInnerHTML;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}