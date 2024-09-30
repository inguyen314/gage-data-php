// Function to create and populate the table
function createGageDataTable(allData) {
    // Create a table element
    const table = document.createElement('table');
    table.setAttribute('id', 'gage_data'); // Set the id to "customers"

    // Create a table header row
    const headerRow = document.createElement('tr');

    // Create table headers for the desired columns
    const columns = ["Gage", "Stage (24hr)", "Flow (24hr)", "Precip [6hr] [24hr]", "Water Quality", "Gage Zero", "Flood Level"];

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

    // Subtract two hours from current date and time
    const currentDateTimeMinus8Hours = subtractHoursFromDate(currentDateTime, 8);
    // console.log('currentDateTimeMinus8Hours :', currentDateTimeMinus8Hours);

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
    //         const aAttribute = a.tsid-stage['assigned-time-series'][0].attribute;
    //         const bAttribute = b.tsid-stage['assigned-time-series'][0].attribute;
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
                if (locData[`alias-id`] === office) {
                    // If the owner's ID is "MVS", set the text color to dark blue
                    locationCell.style.color = 'darkblue';

                    locationCell.innerHTML = locData.attribute + " " + locData[`location-id`];
                    // locationCell.innerHTML = locData.attribute + " " + locData.metadata[`public-name`];
                } else {
                    locationCell.innerHTML = locData.attribute + " " + locData[`location-id`];
                }
            }

            // STAGE
            if (2 === 2) {
                // Create a new table cell for displaying stage data
                const stageCell = row.insertCell();
                let tsidStage = null;
                let tsidForecastNws = null;
                if (locData['tsid-stage']) {
                    tsidStage = locData['tsid-stage'][`assigned-time-series`][0][`timeseries-id`];
                    fetchAndUpdateStage(stageCell, tsidStage, flood_level, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                }
                if (office === "MVS") {
                    if (locData['tsid-forecast-nws'] && cda === "internal") {
                        tsidForecastNws = locData['tsid-forecast-nws'][`assigned-time-series`][0][`timeseries-id`];
                        fetchAndUpdateNWS(stageCell, tsidStage, tsidForecastNws, flood_level, currentDateTime, currentDateTimePlus4Days);
                        fetchAndUpdateNWSForecastDate(stageCell, tsidForecastNws);
                    }
                }
            }

            // FLOW
            if (3 === 3) {
                const flowCell = row.insertCell();
                if (locData['tsid-flow']) {
                    const series = locData['tsid-flow']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidFlow, 'alias-id': tsidFlowLabel } = series[i];
                            fetchAndUpdateFlow(flowCell, tsidFlow, tsidFlowLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                        }
                    }
                }
            }

            // PRECIP
            if (4 === 4) {
                const precipCell = row.insertCell();
                if (locData['tsid-precip']) {
                    if (locData['tsid-precip'][`assigned-time-series`][0]) {
                        const tsidPrecip = locData['tsid-precip'][`assigned-time-series`][0][`timeseries-id`];
                        fetchAndUpdatePrecip(precipCell, tsidPrecip, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours);
                    }
                }
            }


            // WATER QUALITY
            if (5 === 5) {
                const waterQualityCell = row.insertCell();
                if (locData['tsid-temp-air']) {
                    const series = locData['tsid-temp-air']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidTempAir, 'alias-id': tsidTempAirLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidTempAir, tsidTempAirLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-temp-water']) {
                    const series = locData['tsid-temp-water']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : Math.min(4, series.length);

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidTempWater, 'alias-id': tsidTempWaterLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidTempWater, tsidTempWaterLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-speed-wind']) {
                    const series = locData['tsid-speed-wind']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : Math.min(4, series.length);

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidSpeedWind, 'alias-id': tsidSpeedWindLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidSpeedWind, tsidSpeedWindLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-dir-wind']) {
                    const series = locData['tsid-dir-wind']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : Math.min(4, series.length);

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidDirWind, 'alias-id': tsidDirWindLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidDirWind, tsidDirWindLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-do']) {
                    const series = locData['tsid-do']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : Math.min(4, series.length);

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidDo, 'alias-id': tsidDoLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidDo, tsidDoLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-depth']) {
                    const series = locData['tsid-depth']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : Math.min(4, series.length);

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidDepth, 'alias-id': tsidDepthLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidDepth, tsidDepthLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-cond']) {
                    const series = locData['tsid-cond']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : Math.min(4, series.length);

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidCond, 'alias-id': tsidCondLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidCond, tsidCondLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-ph']) {
                    const series = locData['tsid-ph']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : Math.min(4, series.length);

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidPh, 'alias-id': tsidPhLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidPh, tsidPhLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-turbf']) {
                    const series = locData['tsid-turbf']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidturbf, 'alias-id': tsidturbfLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidturbf, tsidturbfLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-pressure']) {
                    const series = locData['tsid-pressure']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidpressure, 'alias-id': tsidpressureLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidpressure, tsidpressureLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-nitrate']) {
                    const series = locData['tsid-nitrate']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidnitrate, 'alias-id': tsidnitrateLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidnitrate, tsidnitrateLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-chlorophyll']) {
                    const series = locData['tsid-chlorophyll']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidchlorophyll, 'alias-id': tsidchlorophyllLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidchlorophyll, tsidchlorophyllLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-phycocyanin']) {
                    const series = locData['tsid-phycocyanin']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidphycocyanin, 'alias-id': tsidphycocyaninLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidphycocyanin, tsidphycocyaninLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
                    }
                }
                if (locData['tsid-speed']) {
                    const series = locData['tsid-speed']['assigned-time-series'];
                    if (series.length > 0) {
                        series.sort((a, b) => a.attribute - b.attribute);

                        // Determine how many series to show based on the value of cda
                        const limit = (cda === 'public') ? 1 : series.length;

                        for (let i = 0; i < limit; i++) {
                            const { 'timeseries-id': tsidspeed, 'alias-id': tsidspeedLabel } = series[i];
                            fetchAndUpdateWaterQuality(waterQualityCell, tsidspeed, tsidspeedLabel, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, currentDateTimeMinus8Hours);
                        }
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

// TODO: Nav TW-Kaskaskia Flood level and display parameter