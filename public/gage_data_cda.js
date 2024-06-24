var allData = [];
document.addEventListener('DOMContentLoaded', async function () {
    // Display the loading_alarm_mvs indicator
    const loadingIndicator = document.getElementById('loading_gage_data_cda');
    loadingIndicator.style.display = 'block';

    // Gage control json file
    const jsonFileURL = 'https://wm.mvs.ds.usace.army.mil/php-data-api/public/json/gage_control.json';
    console.log('jsonFileURL: ', jsonFileURL);

    const response = await fetch(jsonFileURL);
    console.log('response: ', response);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const gageControlData = await response.json();

    // Check if data_items array is present in the gageControlData
    console.log('gageControlData: ', gageControlData);

    console.log('basin: ', basin);

    // Function to filter gageControlData for the "Big Muddy" basin
    function filterBasin(gageControlData) {
        return gageControlData.filter(entry => entry.basin === basin);
    }

    // Extracted gageControlData for the basin
    const basinData = filterBasin(gageControlData);

    // Print the extracted data for basin
    console.log('basinData: ', basinData);
    console.log('basinData: ', typeof(basinData));

    // Combine all secondDataArray into one object based on name
    const combinedFirstData = [];
    const combinedSecondData = [];
    const combinedThirdData = [];
    const combinedForthData = [];
    const combinedFifthData = [];
    const combinedSixthData = [];

    // Array to store all promises from API requests
    const apiPromises = [];

    // Iterate over each object in basinData
    for (const locData of basinData[0].gages) {
        // Prepare variable to pass in when call api
        const locationId = locData.location_id;
        console.log('locationId: ', locationId);

        // Location level "Flood"
        const levelIdFlood = locData.level_id_flood;
        const levelIdEffectiveDateFlood = locData.level_id_effective_date_flood;
        const levelIdUnitIdFlood = locData.level_id_unit_id_flood;

        // Location level "NGVD29"
        const levelIdNgvd29 = locData.level_id_ngvd29;
        const levelIdEffectiveDateNgvd29 = locData.level_id_effective_date_ngvd29;
        const levelIdUnitIdNgvd29 = locData.level_id_unit_id_ngvd29;

        // Location level "Record Stage"
        const levelIdRecordStage = locData.level_id_record_stage;
        const levelIdEffectiveDateRecordStage = locData.level_id_effective_date_record_stage;
        const levelIdUnitIdRecordStage = locData.level_id_unit_id_record_stage;

        // START CDA CALL

        // Construct the URL for the API first request - metadata
        let firstApiUrl = null;
        if (cda === "public") {
            firstApiUrl = `https://water.usace.army.mil/cwms-data/locations/${locationId}?office=MVS`;
        } else if (cda === "internal") {
            firstApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations/${locationId}?office=MVS`;
        }
        console.log('firstApiUrl: ', firstApiUrl);
        
        // Push the fetch promise to the apiPromises array
        apiPromises.push(fetch(firstApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(firstData => {
                // Process the response firstData as needed
                console.log('firstData :', firstData);
                combinedFirstData.push(firstData);
            })
        );


        // Construct the URL for the API second request - flood
        if (levelIdFlood !== null || levelIdEffectiveDateFlood !== null || levelIdUnitIdFlood !== null) {
            let secondApiUrl = null;
            if (cda === "public") {
                secondApiUrl = `https://water.usace.army.mil/cwms-data/levels/${levelIdFlood}?office=MVS&effective-date=${levelIdEffectiveDateFlood}&unit=${levelIdUnitIdFlood}`;
            } else if (cda === "internal") {
                secondApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdFlood}?office=MVS&effective-date=${levelIdEffectiveDateFlood}&unit=${levelIdUnitIdFlood}`;
            }
            console.log('secondApiUrl: ', secondApiUrl);

            apiPromises.push(
                fetch(secondApiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(secondData => {
                        // Check if secondData is null
                        if (secondData === null) {
                            // Handle the case when secondData is null
                            console.log('secondData is null');
                            // You can choose to return or do something else here
                        } else {
                            // Process the response from another API as needed
                            console.log('secondData:', secondData);
                            combinedSecondData.push(secondData);
                        }
                    })
                    .catch(error => {
                        // Handle any errors that occur during the fetch or processing
                        console.error('Error fetching or processing data:', error);
                    })
            )
        }


        // Construct the URL for the API third request - basin
        let thirdApiUrl = null;
        if (cda === "public") {
            thirdApiUrl = `https://water.usace.army.mil/cwms-data/location/group/${basin}?office=MVS&category-id=RDL_Basins`;
        } else if (cda === "internal") {
            thirdApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/location/group/${basin}?office=MVS&category-id=RDL_Basins`;
        }
        console.log('thirdApiUrl: ', thirdApiUrl);

        // Push the fetch promise to the apiPromises array
        apiPromises.push(
            fetch(thirdApiUrl)
            .then(response => {
                // Check if the network response is successful
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(thirdData => {
                // Check if thirdData is null
                if (thirdData === null) {
                    console.log('thirdData is null');
                    // Handle the case when thirdData is null (optional)
                } else {
                    // Process the response from another API as needed
                    console.log('thirdData:', thirdData);

                    // Filter the assigned locations array to find the desired location
                    const foundThirdLocation = thirdData["assigned-locations"].find(location => location["location-id"] === locationId);

                    // Extract thirdData if the location is found
                    let extractedThirdData = null;
                    if (foundThirdLocation) {
                        extractedThirdData = {
                            "office-id": thirdData["office-id"],
                            "id": thirdData["id"],
                            "location-id": foundThirdLocation["location-id"]
                        };
                    }
                    console.log("extractedThirdData", extractedThirdData);

                    // Push the extracted thirdData to the combinedThirdData array
                    combinedThirdData.push(extractedThirdData);
                }
            })
        );


        // Construct the URL for the API forth request - owner
        let forthApiUrl = null;
        if (cda === "public") {
            forthApiUrl = `https://water.usace.army.mil/cwms-data/location/group/MVS?office=MVS&category-id=RDL_MVS`;
        } else if (cda === "internal") {
            forthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/location/group/MVS?office=MVS&category-id=RDL_MVS`;
        }
        console.log('forthApiUrl: ', forthApiUrl);

        // Push the fetch promise to the apiPromises array
        apiPromises.push(
            fetch(forthApiUrl)
            .then(response => {
                // Check if the network response is successful
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(forthData => {
                // Check if forthData is null
                if (forthData === null) {
                    console.log('forthData is null');
                    // Handle the case when forthData is null (optional)
                } else {
                    // Process the response from another API as needed
                    console.log('forthData:', forthData);

                    // Filter the assigned locations array to find the desired location
                    const foundForthLocation = forthData["assigned-locations"].find(location => location["location-id"] === locationId);

                    // Extract forthData if the location is found
                    let extractedForthData = null;
                    if (foundForthLocation) {
                        extractedForthData = {
                            "office-id": forthData["office-id"],
                            "id": forthData["id"],
                            "location-id": foundForthLocation["location-id"]
                        };
                    }
                    console.log("extractedForthData", extractedForthData);

                    // Push the extracted forthData to the combinedForthData array
                    combinedForthData.push(extractedForthData);
                }
            })
        );


        // Construct the URL for the API fifth request - Record Stage
        if (levelIdRecordStage !== null || levelIdEffectiveDateRecordStage !== null || levelIdUnitIdRecordStage !== null) {
            let fifthApiUrl = null;
            if (cda === "public") {
                fifthApiUrl = `https://water.usace.army.mil/cwms-data/levels/${levelIdRecordStage}?office=MVS&effective-date=${levelIdEffectiveDateRecordStage}&unit=${levelIdUnitIdRecordStage}`;
            } else if (cda === "internal") {
                fifthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdRecordStage}?office=MVS&effective-date=${levelIdEffectiveDateRecordStage}&unit=${levelIdUnitIdRecordStage}`;
            }
            console.log('fifthApiUrl: ', fifthApiUrl);

            apiPromises.push(
                fetch(fifthApiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(fifthData => {
                        // Check if fifthData is null
                        if (fifthData === null) {
                            // Handle the case when fifthData is null
                            console.log('fifthData is null');
                        } else {
                            // Process the response from another API as needed
                            combinedFifthData.push(fifthData);
                            console.log('combinedFifthData:', combinedFifthData);
                        }
                    })
                    .catch(error => {
                        // Handle any errors that occur during the fetch or processing
                        if (error.name === 'AbortError') {
                            console.error('The fetch operation was aborted.');
                        } else {
                            // Handle any errors that occur during the fetch or processing
                            console.error('Error fetching or processing data:', error);
                        }
                    })
            )
        }
        

        // Construct the URL for the API sixth request - NGVD29
        let sixthApiUrl = null;
        if (cda === "public") {
            sixthApiUrl = `https://water.usace.army.mil/cwms-data/levels/${levelIdNgvd29}?office=MVS&effective-date=${levelIdEffectiveDateNgvd29}&unit=${levelIdUnitIdNgvd29}`;
        } else if (cda === "internal") {
            sixthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdNgvd29}?office=MVS&effective-date=${levelIdEffectiveDateNgvd29}&unit=${levelIdUnitIdNgvd29}`;
        }
        console.log('sixthApiUrl: ', sixthApiUrl);

        apiPromises.push(
            fetch(sixthApiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(sixthData => {
                    // Check if sixthData is null
                    if (sixthData === null) {
                        // Handle the case when sixthData is null
                        console.log('sixthData is null');
                    } else {
                        // Process the response from another API as needed
                        combinedSixthData.push(sixthData);
                        console.log('combinedSixthData:', combinedSixthData);
                    }
                })
                .catch(error => {
                    // Handle any errors that occur during the fetch or processing
                    console.error('Error fetching or processing data:', error);
                })
        );
        // END CDA CALL     
    };

    // Wait for all API requests to finish
    await Promise.all(apiPromises);

    // Call mergeData
    mergeData(basinData, combinedFirstData, combinedSecondData, combinedThirdData, combinedForthData, combinedFifthData, combinedSixthData);
    console.log('allData:', allData);

    // Call the function to create and populate the table
    createGageDataTable(allData);
    loadingIndicator.style.display = 'none';
});


// Function to merge basinData with additional data
function mergeData(basinData, combinedFirstData, combinedSecondData, combinedThirdData, combinedForthData, combinedFifthData, combinedSixthData) {
    // Clear allData before merging data
    allData = [];

    // Iterate through each gage in basinData[0].gages
    basinData[0].gages.forEach(gage => {
        const locationId = gage.location_id;

        // Find the corresponding firstData object
        const firstData = combinedFirstData.find(data => data["name"] === locationId);
        if (firstData) {
            // Append the firstData properties to the gage object
            gage.metadata = firstData;
        }

        // Find the corresponding secondData object
        if (Array.isArray(combinedSecondData)) {
            const secondData = combinedSecondData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
            if (secondData) {
                // Append the fifthData properties to the gage object
                gage.flood = secondData;
            } else {
                gage.flood = null;
            }
        } else {
            gage.flood = null;
        }

        // Find the corresponding thirdData object
        if (Array.isArray(combinedThirdData)) {
            const thirdData = combinedThirdData.find(data => data && data['location-id'] === locationId);
            if (thirdData) {
                // Append the thirdData properties to the gage object
                gage.basin = thirdData;
            } else {
                gage.basin = null;
            }
        } else {
            gage.basin = null;
        }

        // Find the corresponding forthData object
        if (Array.isArray(combinedForthData)) {
            const forthData = combinedForthData.find(data => data && data['location-id'] === locationId);
            if (forthData) {
                // Append the forthData properties to the gage object
                gage.owner = forthData;
            } else {
                gage.owner = null;
            }
        } else {
            gage.owner = null;
        }

        // Find the corresponding secondData object
        if (Array.isArray(combinedFifthData)) {
            const fifthData = combinedFifthData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
            if (fifthData) {
                // Append the fifthData properties to the gage object
                gage.recordstage = fifthData;
            } else {
                gage.recordstage = null;
            }
        } else {
            gage.recordstage = null;
        }

        // Find the corresponding sixthData object
        if (Array.isArray(combinedSixthData)) {
            const sixthData = combinedSixthData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
            if (sixthData) {
                // Append the sixthData properties to the gage object
                gage.ngvd29 = sixthData;
            } else {
                gage.ngvd29 = null;
            }
        } else {
            gage.ngvd29 = null;
        }

    });

    // Push the updated basinData to allData
    allData = basinData;
}

// Function to create and populate the table
function createGageDataTable(allData) {
    console.log("createGageDataTable function is called."); // Check if the function is being called

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
        if (cda === "public" || cda === "internal") {
            th.style.height = '50px';
            th.style.backgroundColor = 'darkblue'; // Set background color to dark blue
        } else {
            th.style.height = '50px';
        }
        headerRow.appendChild(th);
    });

    // Append the header row to the table
    table.appendChild(headerRow);

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


    // Iterate through the mergedData to populate the table
    for (const locData of allData[0].gages) {
        // HIDE LOCATION BASED ON VISIBLE
        if (locData.visible !== false) {
            const row = table.insertRow(); // Insert a new row for each loc

            // Prepare c_count to get 24 hour values to calculate delta 
            let c_count = null;
            c_count = locData.c_count;
            console.log("c_count hardcoded:", c_count);

            // ***** START 

            let flood_level = null;
            // Check if locData has the 'flood' property and if its 'constant-value' is not null
            if (locData.flood && locData.flood["constant-value"] !== null) {
                // Check conditions for flood level value and format it to two decimal places if it falls within range
                if (
                    locData.flood["constant-value"] === null ||
                    parseFloat(locData.flood["constant-value"]).toFixed(2) == 0.00 ||
                    parseFloat(locData.flood["constant-value"]).toFixed(2) > 900
                ) {
                    flood_level = null; // If flood level is null or outside range, set flood_level to an empty string
                } else {
                    flood_level = parseFloat(locData.flood["constant-value"]).toFixed(2); // Otherwise, format flood level to two decimal places
                }
            } else {
                flood_level = null;
            }


            // LOCATION
            // Create a new table cell for displaying location information
            const locationCell = row.insertCell();
            locationCell.style.textAlign = 'left'; // Align text to the left
            locationCell.style.fontWeight = 'bold'; // Make text bold

            // Check if locData has an 'owner' property
            if (locData.owner) {
                // If locData has an 'owner' property, check if the owner's ID is "MVS"
                if (locData.owner['id'] === "MVS") {
                    // If the owner's ID is "MVS", set the text color to dark blue
                    locationCell.style.color = 'darkblue';
                }
                // Set the inner HTML of locationCell to include the order and location ID
                locationCell.innerHTML = "<span title='MVS Own This Gage'>" + locData.order + " " + locData.location_id + "</span>";
            } else {
                // If locData does not have an 'owner' property, set the inner HTML of locationCell to include the order and location ID
                locationCell.innerHTML = locData.order + " " + locData.location_id;
            }



            
            // STAGE
            // Create a new table cell
            const stageCell = row.insertCell();
            const tsidStage = locData.display_stage_29 ? locData.tsid_stage_29 : locData.tsid_stage_rev;
            fetchAndUpdateStage(stageCell, tsidStage, flood_level, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            if (locData.tsid_stage_nws_3_day_forecast !== null) {
                fetchAndUpdateNWS(stageCell, tsidStage, locData.tsid_stage_nws_3_day_forecast, flood_level, currentDateTime, currentDateTimePlus4Days);
            }

            


            // FLOW
            const flowCell = row.insertCell();
            fetchAndUpdateFlow(flowCell, locData.tsid_flow_coe, locData.tsid_flow_coe_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateFlow(flowCell, locData.tsid_flow_usgs, locData.tsid_flow_usgs_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateFlow(flowCell, locData.tsid_flow_nws, locData.tsid_flow_nws_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateFlow(flowCell, locData.tsid_flow_mvr, locData.tsid_flow_mvr_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateFlow(flowCell, locData.tsid_flow_slope, locData.tsid_flow_slope_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            

            // PRECIP
            const precipCell = row.insertCell();
            fetchAndUpdatePrecip(precipCell, locData.tsid_precip_raw, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);




            // WATER QUALITY
            const waterQualityCell = row.insertCell();
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water, locData.tsid_temp_water_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water2, locData.tsid_temp_water2_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water3, locData.tsid_temp_water3_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water4, locData.tsid_temp_water4_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water5, locData.tsid_temp_water5_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water6, locData.tsid_temp_water6_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water7, locData.tsid_temp_water7_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water8, locData.tsid_temp_water8_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water9, locData.tsid_temp_water9_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water10, locData.tsid_temp_water10_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water11, locData.tsid_temp_water11_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water12, locData.tsid_temp_water12_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water13, locData.tsid_temp_water13_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water14, locData.tsid_temp_water14_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water15, locData.tsid_temp_water15_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_water16, locData.tsid_temp_water16_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_air, locData.tsid_temp_air_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_air2, locData.tsid_temp_air2_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_air_max, locData.tsid_temp_air_max_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_temp_air_min, locData.tsid_temp_air_min_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do, locData.tsid_do_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do2, locData.tsid_do2_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do3, locData.tsid_do3_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do4, locData.tsid_do4_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do5, locData.tsid_do5_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do6, locData.tsid_do6_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do7, locData.tsid_do7_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do8, locData.tsid_do8_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do9, locData.tsid_do9_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do10, locData.tsid_do10_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do11, locData.tsid_do11_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do12, locData.tsid_do12_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do13, locData.tsid_do13_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do14, locData.tsid_do14_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_do15, locData.tsid_do15_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_cond, locData.tsid_cond_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_cond2, locData.tsid_cond2_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth, locData.tsid_depth_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth2, locData.tsid_depth2_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth3, locData.tsid_depth3_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth4, locData.tsid_depth4_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth5, locData.tsid_depth5_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth6, locData.tsid_depth6_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth7, locData.tsid_depth7_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth8, locData.tsid_depth8_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth9, locData.tsid_depth9_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth10, locData.tsid_depth10_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth11, locData.tsid_depth11_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth12, locData.tsid_depth12_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth13, locData.tsid_depth13_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth14, locData.tsid_depth14_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_depth15, locData.tsid_depth15_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_ph, locData.tsid_ph_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_turb, locData.tsid_turb_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_speed_wind, locData.tsid_speed_wind_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_speed, locData.tsid_speed_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_pressure, locData.tsid_pressure_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);

            fetchAndUpdateWaterQuality(waterQualityCell, locData.tsid_dir_wind, locData.tsid_dir_wind_label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);




            // RIVER MILE
            const riverMileCell = row.insertCell();
            if (locData.river_mile_hard_coded !== null) {
                riverMileCell.innerHTML = "<span style='background-color: orange;' title='Hard Coded in JSON, No Cloud Option Yet'>" + (parseFloat(locData.river_mile_hard_coded)).toFixed(2) + "<span>";
            } else {
                riverMileCell.innerHTML = '<div style="background-color: orange;"></div>';
            }



            // FLOOD LEVEL
            const floodCell = row.insertCell();
            floodCell.innerHTML = flood_level;
            


            // ***** END
        } 
    };
    
    // Append the table to the document or a specific container
    const tableContainer = document.getElementById('table_container_gage_data_cda');
    console.log("Table container:", tableContainer); // Check if the container element is found
    if (tableContainer) {
        tableContainer.appendChild(table);
    }
}

// ============================================================================ // 
// ========================== FETCH CDA FUNCTIONS ============================= // 
// ============================================================================ //
// Function to get flows data
function fetchAndUpdateStage(stageCell, tsidStage, flood_level, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours) {
    if (tsidStage !== null) {
        // Fetch the time series data from the API using the determined query string
        let urlStage = null;
        if (cda === "public") {
            urlStage = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        } else if (cda === "internal") {
            urlStage = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        }
        console.log("urlStage = ", urlStage);
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
            console.log("stage:", stage);

            // Convert timestamps in the JSON object
            stage.values.forEach(entry => {
                entry[0] = formatNWSDate(entry[0]); // Update timestamp
            });

            // Output the updated JSON object
            // console.log(JSON.stringify(stage, null, 2));

            console.log("stageFormatted = ", stage);


            // Get the last non-null value from the stage data
            const lastNonNullValue = getLastNonNullValue(stage);
            console.log("lastNonNullValue:", lastNonNullValue);

            // Check if a non-null value was found
            if (lastNonNullValue !== null) {
                // Extract timestamp, value, and quality code from the last non-null value
                var timestampLast = lastNonNullValue.timestamp;
                var valueLast = parseFloat(lastNonNullValue.value).toFixed(2);
                var qualityCodeLast = lastNonNullValue.qualityCode;

                // Log the extracted valueLasts
                console.log("timestampLast:", timestampLast);
                console.log("valueLast:", valueLast);
                console.log("qualityCodeLast:", qualityCodeLast);
            } else {
                // If no non-null valueLast is found, log a message
                console.log("No non-null valueLast found.");
            }

            const c_count = calculateCCount(tsidStage);
            console.log("c_count:", c_count);


            const lastNonNull24HoursValue = getLastNonNull24HoursValue(stage, c_count);
            console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

            // Check if a non-null value was found
            if (lastNonNull24HoursValue !== null) {
                // Extract timestamp, value, and quality code from the last non-null value
                var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
                var value24HoursLast = parseFloat(lastNonNull24HoursValue.value).toFixed(2);
                var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

                // Log the extracted valueLasts
                console.log("timestamp24HoursLast:", timestamp24HoursLast);
                console.log("value24HoursLast:", value24HoursLast);
                console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
            } else {
                // If no non-null valueLast is found, log a message
                console.log("No non-null valueLast found.");
            }


            // Calculate the 24 hours change between first and last value
            const delta_24 = (valueLast - value24HoursLast).toFixed(2);
            console.log("delta_24:", delta_24);

            // Format the last valueLast's timestampLast to a string
            const formattedLastValueTimeStamp = formatTimestampToString(timestampLast);
            console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);

            // Create a Date object from the timestampLast
            const timeStampDateObject = new Date(timestampLast);
            console.log("timeStampDateObject = ", timeStampDateObject);

            // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampLast date
            const timeStampDateObjectMinus24Hours = new Date(timestampLast - (24 * 60 * 60 * 1000));
            console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);


            // FLOOD CLASS
            var floodClass = determineStageClass(valueLast, flood_level);
            console.log("floodClass:", floodClass);

            // DATATIME CLASS
            var dateTimeClass = determineDateTimeClass(timeStampDateObject, currentDateTimeMinus2Hours);
            console.log("dateTimeClass:", dateTimeClass);

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
                                + "<a href='https://wm.mvs.ds.usace.army.mil/district_templates/chart/public/chart.html?cwms_ts_id=" + stage.name + "&lookback=96&cda=public' target='_blank'>"
                                + valueLast
                                + "</a>"
                                +"</span>" 
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
    console.log("currentDateTime = ", currentDateTime);
    console.log("currentDateTimePlus4Days = ", currentDateTimePlus4Days);
    
    const { currentDateTimeMidNightISO, currentDateTimePlus4DaysMidNightISO } = generateDateTimeMidNightStringsISO(currentDateTime, currentDateTimePlus4Days);
    console.log("currentDateTimeMidNightISO = ", currentDateTimeMidNightISO);
    console.log("currentDateTimePlus4DaysMidNightISO = ", currentDateTimePlus4DaysMidNightISO);

    let innerHTMLStage = ""; // Declare innerHTMLStage variable with a default value

    if (tsidStage !== null) {
        console.log("tsidStage:", tsidStage);
        console.log("tsidStage:", typeof(tsidStage));
        console.log("tsidStage:", tsidStage.slice(-2));

        if (tsidStage.slice(-2) !== "29" && tsid_stage_nws_3_day_forecast !== null) {
            console.log("The last two characters are not '29'");

            // Fetch the time series data from the API using the determined query string
            let urlNWS = null;
            if (cda === "public") {
                urlNWS = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
            } else if (cda === "internal") {
                urlNWS = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
            }
            console.log("urlNWS = ", urlNWS);
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
                console.log("nws3Days: ", nws3Days);

                // Convert timestamps in the JSON object
                nws3Days.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                console.log("nws3DaysFormatted = ", nws3Days);

                // Extract values with time ending in "13:00"
                const valuesWithTimeNoon = extractValuesWithTimeNoon(nws3Days.values);

                // Output the extracted values
                console.log("valuesWithTimeNoon = ", valuesWithTimeNoon);

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
                console.log("floodClassDay1:", floodClassDay1);

                var floodClassDay2 = determineStageClass(secondMiddleValue, flood_level);
                console.log("floodClassDay2:", floodClassDay2);

                var floodClassDay3 = determineStageClass(thirdMiddleValue, flood_level);
                console.log("floodClassDay3:", floodClassDay3);

                
                if (nws3Days !== null) {
                    innerHTMLStage  = "<table id='nws'>"
                                    + "<tr>"
                                    + "<td colspan='3' class='day_nws_forecast'>"
                                    + "3 Day NWS Forecast"
                                    + "</td>"
                                    + "</tr>"
                                    + "<tr>"
                                    + "<td class='" + floodClassDay1 + "'>" 
                                    + "<a href='../../../district_templates/chart/public/chart.html?cwms_ts_id=" + nws3Days.name + "&lookback=96&cda=public' target='_blank' title='" + nws3Days.name + " " + firstFirstValue + "'>"
                                    + firstMiddleValue
                                    + "</a>"
                                    + "</td>"
                                    + "<td class='" + floodClassDay2 + "'>" 
                                    + "<a href='../../../district_templates/chart/public/chart.html?cwms_ts_id=" + nws3Days.name + "&lookback=96&cda=public' target='_blank' title='" + nws3Days.name + " " + secondFirstValue + "'>"
                                    + secondMiddleValue
                                    + "</a>"
                                    + "</td>"
                                    + "<td class='" + floodClassDay3 + "'>" 
                                    + "<a href='../../../district_templates/chart/public/chart.html?cwms_ts_id=" + nws3Days.name + "&lookback=96&cda=public' target='_blank' title='" + nws3Days.name + " " + thirdFirstValue + "'>"
                                    +  thirdMiddleValue
                                    + "</a>"
                                    + "</td>"
                                    + "</tr>"
                                    + "<tr>"
                                    + "<td colspan='3' class='day_nws_ded' title='Data Entry Date, No Cloud Option Yet' style='background-color: orange;'>" + "Forecast Date: " + "-cdana-" + "</td>";
                                    + "</tr>"
                                    +"<table>";
                } else {
                    innerHTMLStage  = "<span class='missing'>"
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
            console.log("The last two characters are '29'");
        }
    }
}

// Function to get flows data
function fetchAndUpdateFlow(flowCell, tsidFlow, label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours) {
    if (tsidFlow !== null) {
        let urlFlow = null;
        if (cda === "public") {
            urlFlow = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidFlow}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        } else if (cda === "internal") {
            urlFlow = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsidFlow}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        }
        console.log("urlFlow = ", urlFlow);
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
                console.log("flow: ", flow);

                // Convert timestamps in the JSON object
                flow.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Output the updated JSON object
                // console.log(JSON.stringify(flow, null, 2));

                console.log("flowFormatted = ", flow);

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


                // Get the last non-null value from the stage data
                const lastNonNullFlowValue = getLastNonNullValue(flow);
                // Check if a non-null value was found
                if (lastNonNullFlowValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampFlowLast = lastNonNullFlowValue.timestamp;
                    var valueFlowLast = parseFloat(lastNonNullFlowValue.value).toFixed(0);
                    var qualityCodeFlowLast = lastNonNullFlowValue.qualityCode;

                    // Log the extracted valueLasts
                    console.log("timestampFlowLast:", timestampFlowLast);
                    console.log("valueFlowLast:", valueFlowLast);
                    console.log("qualityCodeFlowLast:", qualityCodeFlowLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    console.log("No non-null valueLast found.");
                }


                const c_count = calculateCCount(tsidFlow);


                const lastNonNull24HoursFlowValue = getLastNonNull24HoursValue(flow, c_count);
                console.log("lastNonNull24HoursFlowValue:", lastNonNull24HoursFlowValue);


                // Check if a non-null value was found
                if (lastNonNull24HoursFlowValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampFlow24HoursLast = lastNonNull24HoursFlowValue.timestamp;
                    var valueFlow24HoursLast = parseFloat(lastNonNull24HoursFlowValue.value).toFixed(0);
                    var qualityCodeFlow24HoursLast = lastNonNull24HoursFlowValue.qualityCode;

                    // Log the extracted valueLasts
                    console.log("timestampFlow24HoursLast:", timestampFlow24HoursLast);
                    console.log("valueFlow24HoursLast:", valueFlow24HoursLast);
                    console.log("qualityCodeFlow24HoursLast:", qualityCodeFlow24HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    console.log("No non-null valueLast found.");
                }


                // Calculate the 24 hours change between first and last value
                const delta24Flow = (valueFlowLast - valueFlow24HoursLast).toFixed(0);
                console.log("delta24Flow:", delta24Flow);


                // Check if the value is greater than or equal to 1000
                if (parseFloat(delta24Flow) >= 1000 || delta24Flow <= -1000) {
                    // If greater than or equal to 1000, round to the nearest tenth and add commas at thousands place
                    roundedDelta24Flow = (Math.round(parseFloat(delta24Flow) / 10) * 10).toLocaleString();
                } else {
                    // If less than 1000, simply add commas at thousands place
                    roundedDelta24Flow = (parseFloat(delta24Flow)).toLocaleString();
                }
                console.log("roundedDelta24Flow = ", roundedDelta24Flow); // Log the rounded and formatted value to the console


                // Check if the value is greater than or equal to 1000
                if (parseFloat(valueFlowLast) >= 1000) {
                    // If greater than or equal to 1000, round to the nearest tenth and add commas at thousands place
                    roundedValueFlowLast = (Math.round(parseFloat(valueFlowLast) / 10) * 10).toLocaleString();
                } else {
                    // If less than 1000, simply add commas at thousands place
                    roundedValueFlowLast = (parseFloat(valueFlowLast)).toLocaleString();
                }
                console.log("roundedValueFlowLast = ", roundedValueFlowLast); // Log the rounded and formatted value to the console


                // Format the last valueLast's timestampFlowLast to a string
                const formattedLastValueTimeStamp = formatTimestampToString(timestampFlowLast);
                console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);


                // Create a Date object from the timestampFlowLast
                const timeStampDateObject = new Date(timestampFlowLast);
                console.log("timeStampDateObject = ", timeStampDateObject);


                // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampFlowLast date
                const timeStampDateObjectMinus24Hours = new Date(timestampFlowLast - (24 * 60 * 60 * 1000));
                console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);


                // DATATIME CLASS
                var dateTimeClass = determineDateTimeClass(timeStampDateObject, currentDateTimeMinus2Hours);
                console.log("dateTimeClass:", dateTimeClass);


                if (lastNonNullFlowValue === null) {
                    innerHTMLFlow = "<span class='missing'>"
                                    + "-M-"
                                    + "</span>"
                                    + "<span class='temp_water'>"
                                    + "label"
                                    + "</span>";
                } else {
                    innerHTMLFlow = "<span class='last_max_value' title='" + flow.name + ", Value = " + roundedValueFlowLast + ", Date Time = " + timestampFlowLast + "'>"
                                    + "<a href='https://wm.mvs.ds.usace.army.mil/district_templates/chart/public/chart.html?cwms_ts_id=" + flow.name + "&lookback=96&cda=public' target='_blank'>"
                                    + roundedValueFlowLast
                                    + "</a>"
                                    +"</span>" 
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
            urlPrecip = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        } else if (cda === "internal") {
            urlPrecip = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        }
        console.log("urlPrecip = ", urlPrecip);
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
                console.log("precip: ", precip);

                // Convert timestamps in the JSON object
                precip.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Output the updated JSON object
                // console.log(JSON.stringify(precip, null, 2));

                console.log("precipFormatted = ", precip);


                // Get the last non-null value from the stage data
                const lastNonNullPrecipValue = getLastNonNullValue(precip);
                console.log("lastNonNullPrecipValue:", lastNonNullPrecipValue);

                // Check if a non-null value was found
                if (lastNonNullPrecipValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampPrecipLast = lastNonNullPrecipValue.timestamp;
                    var valuePrecipLast = parseFloat(lastNonNullPrecipValue.value).toFixed(2);
                    var qualityCodePrecipLast = lastNonNullPrecipValue.qualityCode;

                    // Log the extracted valueLasts
                    console.log("timestampPrecipLast:", timestampPrecipLast);
                    console.log("valuePrecipLast:", valuePrecipLast);
                    console.log("qualityCodePrecipLast:", qualityCodePrecipLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    console.log("No non-null valueLast found.");
                }


                const c_count = calculateCCount(tsid);


                const lastNonNull6HoursPrecipValue = getLastNonNull6HoursValue(precip, c_count);
                console.log("lastNonNull6HoursPrecipValue:", lastNonNull6HoursPrecipValue);


                // Check if a non-null value was found
                if (lastNonNull6HoursPrecipValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampPrecip6HoursLast = lastNonNull6HoursPrecipValue.timestamp;
                    var valuePrecip6HoursLast = parseFloat(lastNonNull6HoursPrecipValue.value).toFixed(2);
                    var qualityCodePrecip6HoursLast = lastNonNull6HoursPrecipValue.qualityCode;

                    // Log the extracted valueLasts
                    console.log("timestampPrecip6HoursLast:", timestampPrecip6HoursLast);
                    console.log("valuePrecip6HoursLast:", valuePrecip6HoursLast);
                    console.log("qualityCodePrecip6HoursLast:", qualityCodePrecip6HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    console.log("No non-null valueLast found.");
                }


                const lastNonNull24HoursPrecipValue = getLastNonNull24HoursValue(precip, c_count);
                console.log("lastNonNull24HoursPrecipValue:", lastNonNull24HoursPrecipValue);


                // Check if a non-null value was found
                if (lastNonNull24HoursPrecipValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampPrecip24HoursLast = lastNonNull24HoursPrecipValue.timestamp;
                    var valuePrecip24HoursLast = parseFloat(lastNonNull24HoursPrecipValue.value).toFixed(2);
                    var qualityCodePrecip24HoursLast = lastNonNull24HoursPrecipValue.qualityCode;

                    // Log the extracted valueLasts
                    console.log("timestampPrecip24HoursLast:", timestampPrecip24HoursLast);
                    console.log("valuePrecip24HoursLast:", valuePrecip24HoursLast);
                    console.log("qualityCodePrecip24HoursLast:", qualityCodePrecip24HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    console.log("No non-null valueLast found.");
                }


                // Calculate the 24 hours change between first and last value
                const precip_delta_6 = (valuePrecipLast - valuePrecip6HoursLast).toFixed(2);
                console.log("precip_delta_6:", precip_delta_6);


                // Calculate the 24 hours change between first and last value
                const precip_delta_24 = (valuePrecipLast - valuePrecip24HoursLast).toFixed(2);
                console.log("precip_delta_24:", precip_delta_24);
                

                // Format the last valueLast's timestampFlowLast to a string
                const formattedLastValueTimeStamp = formatTimestampToString(timestampPrecipLast);
                console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);

                // Create a Date object from the timestampFlowLast
                const timeStampDateObject = new Date(timestampPrecipLast);
                console.log("timeStampDateObject = ", timeStampDateObject);

                // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampFlowLast date
                const timeStampDateObjectMinus24Hours = new Date(timestampPrecipLast - (24 * 60 * 60 * 1000));
                console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);

                // SET THE CLASS FOR PRECIP TO DISPLAY THE BACKGROUND COLOR
                if (precip_delta_6 < 0) {
                    console.log("precip_delta_6 less than 0");
                    var myClass6 = "precip_less_0";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 === 0) {
                    console.log("precip_delta_6 equal to 0");
                    var myClass6 = "precip_equal_0";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 0.00 && precip_delta_6 <= 0.25) {
                    console.log("precip_delta_6 greater than 0 and less than or equal to 0.25");
                    var myClass6 = "precip_greater_0";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 0.25 && precip_delta_6 <= 0.50) {
                    console.log("precip_delta_6 greater than 0.25 and less than or equal to 0.50");
                    var myClass6 = "precip_greater_25";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 0.50 && precip_delta_6 <= 1.00) {
                    console.log("precip_delta_6 greater than 0.50 and less than or equal to 1.00");
                    var myClass6 = "precip_greater_50";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 1.00 && precip_delta_6 <= 2.00) {
                    console.log("precip_delta_6 greater than 1.00 and less than or equal to 2.00");
                    var myClass6 = "precip_greater_100";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 > 2.00) {
                    console.log("precip_delta_6 greater than 2.00");
                    var myClass6 = "precip_greater_200";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else if (precip_delta_6 === null) {
                    console.log("precip_delta_6 missing");
                    var myClass6 = "precip_missing";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                } else {
                    console.log("precip_delta_6 equal to else");
                    var myClass6 = "blank";
                    console.log("myClass6 = ", tsid + " = " + myClass6);
                }

                if (precip_delta_24 < 0) {
                    console.log("precip_delta_24 less than 0");
                    var myClass24 = "precip_less_0";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 === 0) {
                    console.log("precip_delta_24 equal to 0");
                    var myClass24 = "precip_equal_0";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 0.00 && precip_delta_24 <= 0.25) {
                    console.log("precip_delta_24 greater than 0 and less than or equal to 0.25");
                    var myClass24 = "precip_greater_0";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 0.25 && precip_delta_24 <= 0.50) {
                    console.log("precip_delta_24 greater than 0.25 and less than or equal to 0.50");
                    var myClass24 = "precip_greater_25";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 0.50 && precip_delta_24 <= 1.00) {
                    console.log("precip_delta_24 greater than 0.50 and less than or equal to 1.00");
                    var myClass24 = "precip_greater_50";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 1.00 && precip_delta_24 <= 2.00) {
                    console.log("precip_delta_24 greater than 1.00 and less than or equal to 2.00");
                    var myClass24 = "precip_greater_100";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 > 2.00) {
                    console.log("precip_delta_24 greater than 2.00");
                    var myClass24 = "precip_greater_200";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else if (precip_delta_24 === null) {
                    console.log("precip_delta_24 missing");
                    var myClass24 = "precip_missing";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                } else {
                    console.log("precip_delta_24 equal to else");
                    var myClass24 = "blank";
                    console.log("myClass24 =", tsid + " = " + myClass24);
                }

                // DATATIME CLASS
                var dateTimeClass = determineDateTimeClass(timeStampDateObject, currentDateTimeMinus2Hours);
                console.log("dateTimeClass:", dateTimeClass);

                if (lastNonNullPrecipValue === null) {
                    innerHTMLPrecip =   "<table id='precip'>"
                                            + "<tr>"
                                                + "<td class='precip_missing' title='6 hr delta'>"
                                                    + "-M-"
                                                + "</td>"
                                                + "<td class='precip_missing' title='24 hr delta'>"
                                                    + "-M-"
                                                + "</td>"
                                            + "</tr>"
                                        +"</table>";
                } else {
                    innerHTMLPrecip =   "<table id='precip'>"
                                            + "<tr>"
                                                + "<td class='" + myClass6 + "' title='6 hr delta'>"
                                                    + "<span title='" + precip.name + ", Value = " + valuePrecip6HoursLast + ", Date Time = " + timestampPrecip6HoursLast + ", Delta = (" + valuePrecipLast + " - " + valuePrecip6HoursLast + ") = " + precip_delta_6 + "'>" + precip_delta_6 + "</span>"
                                                + "</td>"
                                                + "<td class='" + myClass24 + "' title='24 hr delta'>"
                                                    + "<span title='" + precip.name + ", Value = " + valuePrecip24HoursLast + ", Date Time = " + timestampPrecip24HoursLast + ", Delta = (" + valuePrecipLast + " - " + valuePrecip24HoursLast + ") = " + precip_delta_24 + "'>" + precip_delta_24 + "</span>"
                                                + "</td>"
                                            + "</tr>"
                                        +"</table>"
                                        + "<span class='last_max_value' title='" + precip.name + ", Value = " + valuePrecipLast + ", Date Time = " + timestampPrecipLast + "'>"
                                        + "<a href='../../../district_templates/chart/public/chart.html?cwms_ts_id=" + precip.name + "&lookback=96&cda=public' target='_blank'>"
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
function fetchAndUpdateWaterQuality(waterQualityCell, tsid, label, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours) {
    if (tsid !== null) {
        // Fetch the time series data from the API using the determined query string
        let urlWaterQuality = null;
        if (cda === "public") {
            urlWaterQuality = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        } else if (cda === "internal") {
            urlWaterQuality = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
        }
        console.log("urlWaterQuality = ", urlWaterQuality);
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
                console.log("waterQuality:", waterQuality);

                // Convert timestamps in the JSON object
                waterQuality.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Output the updated JSON object
                // console.log(JSON.stringify(waterQuality, null, 2));

                console.log("lastNonNullWaterQualityValue = ", waterQuality);

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
                    var myWaterQualityClass = "";
                }
                console.log("myWaterQualityClass = ", myWaterQualityClass);


                // Get the last non-null value from the stage data
                const lastNonNullWaterQualityValue = getLastNonNullValue(waterQuality);

                // Check if a non-null value was found
                if (lastNonNullWaterQualityValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampWaterQualityLast = lastNonNullWaterQualityValue.timestamp;
                    var valueWaterQualityLast = parseFloat(lastNonNullWaterQualityValue.value).toFixed(0);
                    var qualityCodeWaterQualityLast = lastNonNullWaterQualityValue.qualityCode;

                    // Log the extracted valueLasts
                    console.log("timestampWaterQualityLast:", timestampWaterQualityLast);
                    console.log("valueWaterQualityLast:", valueWaterQualityLast);
                    console.log("qualityCodeWaterQualityLast:", qualityCodeWaterQualityLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    console.log("No non-null valueLast found.");
                }


                const c_count = calculateCCount(tsid);


                const lastNonNull24HoursWaterQualityValue = getLastNonNull24HoursValue(waterQuality, c_count);
                console.log("lastNonNull24HoursWaterQualityValue:", lastNonNull24HoursWaterQualityValue);


                // Check if a non-null value was found
                if (lastNonNull24HoursWaterQualityValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampWaterQuality24HoursLast = lastNonNull24HoursWaterQualityValue.timestamp;
                    var valueWaterQuality24HoursLast = parseFloat(lastNonNull24HoursWaterQualityValue.value).toFixed(0);
                    var qualityCodeWaterQuality24HoursLast = lastNonNull24HoursWaterQualityValue.qualityCode;

                    // Log the extracted valueLasts
                    console.log("timestampWaterQuality24HoursLast:", timestampWaterQuality24HoursLast);
                    console.log("valueWaterQuality24HoursLast:", valueWaterQuality24HoursLast);
                    console.log("qualityCodeWaterQuality24HoursLast:", qualityCodeWaterQuality24HoursLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    console.log("No non-null valueLast found.");
                }

                // Calculate the 24 hours change between first and last value
                const delta_24_water_quality = (valueWaterQualityLast - valueWaterQuality24HoursLast).toFixed(0);
                console.log("delta_24_water_quality:", delta_24_water_quality);

                // Format the last valueLast's timestampFlowLast to a string
                const formattedLastValueTimeStamp = formatTimestampToString(timestampWaterQualityLast);
                console.log("formattedLastValueTimeStamp = ", formattedLastValueTimeStamp);

                // Create a Date object from the timestampFlowLast
                const timeStampDateObject = new Date(timestampWaterQualityLast);
                console.log("timeStampDateObject = ", timeStampDateObject);

                // Subtract 24 hours (24 * 60 * 60 * 1000 milliseconds) from the timestampFlowLast date
                const timeStampDateObjectMinus24Hours = new Date(timestampWaterQualityLast - (24 * 60 * 60 * 1000));
                console.log("timeStampDateObjectMinus24Hours = ", timeStampDateObjectMinus24Hours);

                // DATATIME CLASS
                var dateTimeClass = determineDateTimeClass(timeStampDateObject, currentDateTimeMinus2Hours);
                console.log("dateTimeClass:", dateTimeClass);

                if (lastNonNullWaterQualityValue === null) {
                    innerHTMLWaterQuality = "<span class='missing' title='" + waterQuality.name + "'>"
                                    + "-M-"
                                    + "</span>"
                                    + "<span class='" + myWaterQualityClass + "'>"
                                    + label
                                    + "</span>";
                } else {
                    innerHTMLWaterQuality = "<span class='last_max_value' title='" + waterQuality.name + ", Value = " + valueWaterQualityLast + ", Date Time = " + timestampWaterQualityLast + "'>"
                                    + "<a href='https://wm.mvs.ds.usace.army.mil/district_templates/chart/public/chart.html?cwms_ts_id=" + waterQuality.name + "&lookback=96&cda=public' target='_blank'>"
                                    + valueWaterQualityLast
                                    + "</a>"
                                    +"</span>" 
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


// =========================================================================== // 
// ========================== DATA CDA FUNCTIONS ============================= // 
// =========================================================================== //
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
            if (nonNullCount > (c_count/4)) {
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


// ============================================================================== // 
// ========================== CLASSES CDA FUNCTIONS ============================= // 
// ============================================================================== //
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
function determineDateTimeClass(formattedDate, currentDateTimeMinus2Hours) {
    var myDateTimeClass;
    if (formattedDate >= currentDateTimeMinus2Hours) {
        myDateTimeClass = "date_time_current";
        console.log("formattedDate = ", formattedDate);
    } else {
        myDateTimeClass = "date_time_late";
        console.log("formattedDate = ", formattedDate);
        console.log("currentDateTimeMinus2Hours = ", currentDateTimeMinus2Hours);
    }
    console.log("myDateTimeClass = ", myDateTimeClass);
    return myDateTimeClass;
}


// ============================================================================== // 
// ========================== SUPPORT CDA FUNCTIONS ============================= // 
// ============================================================================== //
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
    console.log("forthElement = ", forthElement);

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
    const midnightCentral = new Date(currentDateTime.toLocaleDateString('en-US', {timeZone: 'America/Chicago'}));
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