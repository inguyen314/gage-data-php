// Function to create and populate the table
function createGageDataTable(allData) {
    // Create a table element
    const table = document.createElement('table');
    table.setAttribute('id', 'gage_data'); // Set the id to "customers"

    // Create a table header row
    const headerRow = document.createElement('tr');

    // Create table headers for the desired columns
    const columns = ["Gage", "Stage (24hr)", "Flow (24hr)", "Precip (6hr - 24hr)", "Water Quality", "Gage Zero", "Flood Level"];

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
    // console.log('currentDateTime:', currentDateTime);

    // Subtract two hours from current date and time
    const currentDateTimeMinus2Hours = subtractHoursFromDate(currentDateTime, 2);
    // console.log('currentDateTimeMinus2Hours :', currentDateTimeMinus2Hours);

    // Subtract thirty hours from current date and time
    const currentDateTimeMinus30Hours = subtractHoursFromDate(currentDateTime, 64);
    // console.log('currentDateTimeMinus30Hours :', currentDateTimeMinus30Hours);

    // Add thirty hours to current date and time
    const currentDateTimePlus30Hours = plusHoursFromDate(currentDateTime, 30);
    // console.log('currentDateTimePlus30Hours :', currentDateTimePlus30Hours);

    // Add four days to current date and time
    const currentDateTimePlus4Days = addDaysToDate(currentDateTime, 4);
    // console.log('currentDateTimePlus4Days :', currentDateTimePlus4Days);

    // Sort assigned-locations by the attribute in assigned-time-series
    // allData.forEach(item => {
    //     item[`assigned-locations`].sort((a, b) => {
    //         const aAttribute = a.tsid_stage['assigned-time-series'][0].attribute;
    //         const bAttribute = b.tsid_stage['assigned-time-series'][0].attribute;
    //         return aAttribute - bAttribute;
    //     });
    // });

    // Log sorted allData
    // console.log("Sorted allData:", JSON.stringify(allData, null, 2));

    // Iterate through the mergedData to populate the table
    for (const locData of allData[0][`assigned-locations`]) {
        console.log("locData:", locData);

        // HIDE LOCATION BASED ON VISIBLE
        if (locData.visible !== false) {
            const row = table.insertRow(); // Insert a new row for each loc

            let flood_level = null;
            // Check if locData has the 'flood' property and if its 'constant-value' is not null
            if (locData.flood && locData.flood[`constant-value`] !== null) {
                // Check conditions for flood level value and format it to two decimal places if it falls within range
                if (
                    locData.flood[`constant-value`] === null ||
                    locData.flood[`constant-value`].toFixed(2) == 0.00 ||
                    locData.flood[`constant-value`].toFixed(2) > 900
                ) {
                    flood_level = null; // If flood level is null or outside range, set flood_level to an empty string
                } else {
                    flood_level = parseFloat(locData.flood[`constant-value`]).toFixed(2); // Otherwise, format flood level to two decimal places
                }
            } else {
                flood_level = null;
            }
            // console.log("flood_level:", flood_level);

            // LOCATION
            if (1 === 1) {
                // Create a new table cell for displaying location data
                const locationCell = row.insertCell();
                locationCell.style.textAlign = 'left';
                locationCell.style.fontWeight = 'bold';
                locationCell.innerHTML = locData.attribute + " " + locData[`location-id`];
                // locationCell.innerHTML = locData.attribute + " " + locData.metadata[`public-name`];
            }

            // STAGE
            if (2 === 2) {
                // Create a new table cell for displaying stage data
                const stageCell = row.insertCell();
                if (locData.tsid_stage) {
                    const tsidStage = locData.tsid_stage[`assigned-time-series`][0][`timeseries-id`];
                    fetchAndUpdateStage(stageCell, tsidStage, flood_level, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                }
            }

            // FLOW
            if (3 === 3) {
                const flowCell = row.insertCell();
                if (locData.tsid_flow) {
                    // Sort the assigned-time-series by attribute
                    locData.tsid_flow["assigned-time-series"].sort((a, b) => a.attribute - b.attribute);

                    if (locData.tsid_flow[`assigned-time-series`][0]) {
                        const tsidFlow = locData.tsid_flow[`assigned-time-series`][0][`timeseries-id`];
                        fetchAndUpdateFlow(flowCell, tsidFlow, tsidFlow.split('.').pop(), currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                    }
                    // if (locData.tsid_flow[`assigned-time-series`][1]) {
                    //     const tsidFlow = locData.tsid_flow[`assigned-time-series`][1][`timeseries-id`];
                    //     fetchAndUpdateFlow(flowCell, tsidFlow, tsidFlow.split('.').pop(), currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                    // }
                }
            }

            // PRECIP
            if (4 === 4) {
                const precipCell = row.insertCell();
                if (locData.tsid_precip) {
                    if (locData.tsid_precip[`assigned-time-series`][0]) {
                        const tsidPrecip = locData.tsid_precip[`assigned-time-series`][0][`timeseries-id`];
                        fetchAndUpdatePrecip(precipCell, tsidPrecip, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                    }
                }
            }


            // WATER QUALITY
            if (5 === 5) {
                const waterQualityCell = row.insertCell();
                if (locData.tsid_temp_air) {
                    if (locData.tsid_temp_air[`assigned-time-series`][0]) {
                        const tsidTempAir = locData.tsid_temp_air[`assigned-time-series`][0][`timeseries-id`];
                        fetchAndUpdateWaterQuality(waterQualityCell, tsidTempAir, tsidTempAir.split('.').pop(), currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                    }
                }
            }


            // GAGE ZERO
            if (6 === 6) {
                const riverMileCell = row.insertCell();
                if (locData.metadata[`vertical-datum`] !== null && locData.metadata.elevation !== undefined && locData.metadata.elevation < 900) {
                    riverMileCell.innerHTML = (locData.metadata.elevation).toFixed(2) + " (" + locData.metadata[`vertical-datum`] + ")";
                } else {
                    riverMileCell.innerHTML = "--";
                }
            }

            // FLOOD LEVEL
            if (7 === 7) {
                const floodCell = row.insertCell();
                floodCell.innerHTML = flood_level;
            }
        }
    };

    // Append the table to the document or a specific container
    const tableContainer = document.getElementById('table_container_gage_data_cda');
    // console.log("Table container:", tableContainer); // Check if the container element is found
    if (tableContainer) {
        tableContainer.appendChild(table);
    }
}