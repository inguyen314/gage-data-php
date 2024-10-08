document.addEventListener('DOMContentLoaded', async function () {
    // Display the loading_alarm_mvs indicator
    const loadingIndicator = document.getElementById('loading_json');
    loadingIndicator.style.display = 'block';

    const apiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/location/group?office=${office}&include-assigned=false&location-category-like=Basins`;
    console.log("apiUrl: ", apiUrl);

    // Example configuration; adjust as needed
    const cda = "public"; // or "internal", set based on your needs

    // Store location metadata and flood data
    const metadataMap = new Map();
    const floodMap = new Map();
    const stageTsidMap = new Map();
    const forecastNwsTsidMap = new Map();
    const flowTsidMap = new Map();
    const precipTsidMap = new Map();
    const tempAirTsidMap = new Map();
    const tempWaterTsidMap = new Map();
    const speedWindTsidMap = new Map();
    const dirWindTsidMap = new Map();
    const doTsidMap = new Map();
    const depthTsidMap = new Map();
    const condTsidMap = new Map();
    const phTsidMap = new Map();
    const turbfTsidMap = new Map();
    const pressureTsidMap = new Map();
    const nitrateTsidMap = new Map();
    const chlorophyllTsidMap = new Map();
    const phycocyaninTsidMap = new Map();
    const speedTsidMap = new Map();
    const ownerMap = new Map();
    const riverMileMap = new Map();

    // Arrays to track promises for metadata and flood data fetches
    const metadataPromises = [];
    const floodPromises = [];
    const stageTsidPromises = [];
    const forecastNwsTsidPromises = [];
    const flowTsidPromises = [];
    const precipTsidPromises = [];
    const tempAirTsidPromises = [];
    const tempWaterTsidPromises = [];
    const speedWindTsidPromises = [];
    const dirWindTsidPromises = [];
    const doTsidPromises = [];
    const depthTsidPromises = [];
    const condTsidPromises = [];
    const phTsidPromises = [];
    const turbfTsidPromises = [];
    const pressureTsidPromises = [];
    const nitrateTsidPromises = [];
    const chlorophyllTsidPromises = [];
    const phycocyaninTsidPromises = [];
    const speedTsidPromises = [];
    const ownerPromises = [];
    const riverMilePromises = [];


    // Fetch the initial data
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('No data available from the initial fetch.');
                return;
            }

            console.log('Data fetched:', data);

            const targetCategory = { "office-id": office, "id": "Basins" };

            const filteredArray = filterByLocationCategory(data, targetCategory);
            console.log(filteredArray);

            // Extract the "id" values from each object
            const basins = filteredArray.map(item => item.id);
            if (basins.length === 0) {
                console.warn('No basins found for the given category.');
                return;
            }

            console.log(basins);

            const selectedBasin = basins.includes(basin) ? basin : null;

            console.log("selectedBasin: ", selectedBasin); // Output: "Mississippi"

            // Array to store all promises from API requests
            const apiPromises = [];
            const combinedData = []; // Array to store combined data

            // Construct the URL for the API request - basin
            const basinApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/location/group/${basin}?office=${office}&category-id=Basins`;
            console.log("basinApiUrl: ", basinApiUrl);

            // Push the fetch promise to the apiPromises array
            apiPromises.push(
                fetch(basinApiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Network response was not ok for basin ${basin}: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (!data) {
                            console.log(`No data for basin: ${basin}`);
                            return;
                        }
                        console.log('data:', data);

                        // Ensure 'assigned-locations' is defined and is an array
                        if (Array.isArray(data['assigned-locations'])) {
                            // Create a new array for filtered assigned-locations
                            const filteredLocations = data['assigned-locations'].filter(location => location.attribute <= 900);

                            // Reorder filtered locations based on the "attribute" value
                            filteredLocations.sort((a, b) => a.attribute - b.attribute);
                            console.log('Filtered and sorted locations:', filteredLocations);

                            // If a specific gage is defined, filter further
                            if (gage) {
                                // Filter for the specified gage
                                const gageFilteredLocations = filteredLocations.filter(location => location["location-id"] === gage);
                                console.log('Filtered data for gage:', gageFilteredLocations);

                                // Update the assigned-locations in the original data object
                                data['assigned-locations'] = gageFilteredLocations;
                            } else {
                                // Update the assigned-locations in the original data object
                                data['assigned-locations'] = filteredLocations;
                            }
                        } else {
                            console.log(`No assigned-locations found.`);
                        }


                        // Process and append the fetched data to combinedData
                        combinedData.push(data);

                        // Process each location within the basin data
                        if (data['assigned-locations']) {
                            data['assigned-locations'].forEach(loc => {
                                // console.log('Processing location:', loc['location-id']);

                                if ("metadata" === "metadata") {
                                    // Construct the URL for the location metadata request
                                    let locApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/locations/${loc['location-id']}?office=${office}`;
                                    if (locApiUrl) {
                                        // Push the fetch promise to the metadataPromises array
                                        metadataPromises.push(
                                            fetch(locApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Location metadata not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no metadata is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(locData => {
                                                    if (locData) {
                                                        metadataMap.set(loc['location-id'], locData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for location ${loc['location-id']}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("flood" === "flood") {
                                    // Construct the URL for the flood data request
                                    let floodApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/levels/${loc['location-id']}.Stage.Inst.0.Flood?office=${office}&effective-date=2024-01-01T08:00:00&unit=ft`;
                                    if (floodApiUrl) {
                                        // Push the fetch promise to the floodPromises array
                                        floodPromises.push(
                                            fetch(floodApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        // console.warn(`Flood data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no flood data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(floodData => {
                                                    if (floodData) {
                                                        floodMap.set(loc['location-id'], floodData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for flood data at ${floodApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-stage" === "tsid-stage") {
                                    // Construct the URL for the stage tsid data request
                                    let stageTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Stage?office=${office}&category-id=${loc['location-id']}`;
                                    if (stageTsidApiUrl) {
                                        stageTsidPromises.push(
                                            fetch(stageTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Stage TSID data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(stageTsidData => {
                                                    if (stageTsidData) {
                                                        stageTsidMap.set(loc['location-id'], stageTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${stageTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-flow" === "tsid-flow") {
                                    // Construct the URL for the flow tsid data request
                                    let flowTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Flow?office=${office}&category-id=${loc['location-id']}`;
                                    if (flowTsidApiUrl) {
                                        flowTsidPromises.push(
                                            fetch(flowTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Flow TSID data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(flowTsidData => {
                                                    if (flowTsidData) {
                                                        flowTsidMap.set(loc['location-id'], flowTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${flowTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-precip" === "tsid-precip") {
                                    // Construct the URL for the precip tsid data request
                                    let precipTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Precip?office=${office}&category-id=${loc['location-id']}`;
                                    if (precipTsidApiUrl) {
                                        precipTsidPromises.push(
                                            fetch(precipTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Precip TSID data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(precipTsidData => {
                                                    if (precipTsidData) {
                                                        precipTsidMap.set(loc['location-id'], precipTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${precipTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-temp-air" === "tsid-temp-air") {
                                    // Construct the URL for the temp air tsid data request
                                    let tempAirTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Temp-Air?office=${office}&category-id=${loc['location-id']}`;
                                    if (tempAirTsidApiUrl) {
                                        tempAirTsidPromises.push(
                                            fetch(tempAirTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Air TSID data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(tempAirTsidData => {
                                                    if (tempAirTsidData) {
                                                        tempAirTsidMap.set(loc['location-id'], tempAirTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${tempAirTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-temp-water" === "tsid-temp-water") {
                                    // Construct the URL for the temp water tsid data request
                                    let tempWaterTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Temp-Water?office=${office}&category-id=${loc['location-id']}`;
                                    if (tempWaterTsidApiUrl) {
                                        tempWaterTsidPromises.push(
                                            fetch(tempWaterTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(tempWaterTsidData => {
                                                    if (tempWaterTsidData) {
                                                        tempWaterTsidMap.set(loc['location-id'], tempWaterTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${tempWaterTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-forecast-nws" === "tsid-forecast-nws") {
                                    // Construct the URL for the forecast nws tsid data request
                                    let forecastNwsTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Forecast-NWS?office=${office}&category-id=${loc['location-id']}`;
                                    if (forecastNwsTsidApiUrl) {
                                        tempAirTsidPromises.push(
                                            fetch(forecastNwsTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Stage TSID data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(forecastNwsTsidData => {
                                                    if (forecastNwsTsidData) {
                                                        forecastNwsTsidMap.set(loc['location-id'], forecastNwsTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${forecastNwsTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-speed-wind" === "tsid-speed-wind") {
                                    // Construct the URL for the temp water tsid data request
                                    let speedWindTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Speed-Wind?office=${office}&category-id=${loc['location-id']}`;
                                    if (speedWindTsidApiUrl) {
                                        tempWaterTsidPromises.push(
                                            fetch(speedWindTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null; // Skip processing if no data is found
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(speedWindTsidData => {
                                                    if (speedWindTsidData) {
                                                        speedWindTsidMap.set(loc['location-id'], speedWindTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${speedWindTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-dir-wind" === "tsid-dir-wind") {
                                    let dirWindTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Dir-Wind?office=${office}&category-id=${loc['location-id']}`;
                                    if (dirWindTsidApiUrl) {
                                        tempWaterTsidPromises.push(
                                            fetch(dirWindTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(dirWindTsidData => {
                                                    if (dirWindTsidData) {
                                                        dirWindTsidMap.set(loc['location-id'], dirWindTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${dirWindTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-do" === "tsid-do") {
                                    let doTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Conc-DO?office=${office}&category-id=${loc['location-id']}`;
                                    if (doTsidApiUrl) {
                                        doTsidPromises.push(
                                            fetch(doTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(doTsidData => {
                                                    if (doTsidData) {
                                                        doTsidMap.set(loc['location-id'], doTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${doTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-depth" === "tsid-depth") {
                                    let depthTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Depth?office=${office}&category-id=${loc['location-id']}`;
                                    if (depthTsidApiUrl) {
                                        depthTsidPromises.push(
                                            fetch(depthTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(depthTsidData => {
                                                    if (depthTsidData) {
                                                        depthTsidMap.set(loc['location-id'], depthTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${depthTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-cond" === "tsid-cond") {
                                    let condTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Cond?office=${office}&category-id=${loc['location-id']}`;
                                    if (condTsidApiUrl) {
                                        condTsidPromises.push(
                                            fetch(condTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(condTsidData => {
                                                    if (condTsidData) {
                                                        condTsidMap.set(loc['location-id'], condTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${condTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-ph" === "tsid-ph") {
                                    let phTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/pH?office=${office}&category-id=${loc['location-id']}`;
                                    if (phTsidApiUrl) {
                                        phTsidPromises.push(
                                            fetch(phTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(phTsidData => {
                                                    if (phTsidData) {
                                                        phTsidMap.set(loc['location-id'], phTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${phTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-turbf" === "tsid-turbf") {
                                    let turbfTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/TurbF?office=${office}&category-id=${loc['location-id']}`;
                                    if (turbfTsidApiUrl) {
                                        turbfTsidPromises.push(
                                            fetch(turbfTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(turbfTsidData => {
                                                    if (turbfTsidData) {
                                                        turbfTsidMap.set(loc['location-id'], turbfTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${turbfTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-pressure" === "tsid-pressure") {
                                    let pressureTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Pres?office=${office}&category-id=${loc['location-id']}`;
                                    if (pressureTsidApiUrl) {
                                        pressureTsidPromises.push(
                                            fetch(pressureTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(pressureTsidData => {
                                                    if (pressureTsidData) {
                                                        pressureTsidMap.set(loc['location-id'], pressureTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${pressureTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-nitrate" === "tsid-nitrate") {
                                    let nitrateTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Conc-Nitrate?office=${office}&category-id=${loc['location-id']}`;
                                    if (nitrateTsidApiUrl) {
                                        nitrateTsidPromises.push(
                                            fetch(nitrateTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(nitrateTsidData => {
                                                    if (nitrateTsidData) {
                                                        nitrateTsidMap.set(loc['location-id'], nitrateTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${nitrateTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-chlorophyll" === "tsid-chlorophyll") {
                                    let chlorophyllTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Conc-Chlorophyll?office=${office}&category-id=${loc['location-id']}`;
                                    if (chlorophyllTsidApiUrl) {
                                        chlorophyllTsidPromises.push(
                                            fetch(chlorophyllTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(chlorophyllTsidData => {
                                                    if (chlorophyllTsidData) {
                                                        chlorophyllTsidMap.set(loc['location-id'], chlorophyllTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${chlorophyllTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-phycocyanin" === "tsid-phycocyanin") {
                                    let phycocyaninTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Conc-Phycocyanin?office=${office}&category-id=${loc['location-id']}`;
                                    if (phycocyaninTsidApiUrl) {
                                        phycocyaninTsidPromises.push(
                                            fetch(phycocyaninTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(phycocyaninTsidData => {
                                                    if (phycocyaninTsidData) {
                                                        phycocyaninTsidMap.set(loc['location-id'], phycocyaninTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${phycocyaninTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("tsid-speed" === "tsid-speed") {
                                    let speedTsidApiUrl = `https://coe-${office.toLocaleLowerCase()}uwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/timeseries/group/Speed?office=${office}&category-id=${loc['location-id']}`;
                                    if (speedTsidApiUrl) {
                                        speedTsidPromises.push(
                                            fetch(speedTsidApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(speedTsidData => {
                                                    if (speedTsidData) {
                                                        speedTsidMap.set(loc['location-id'], speedTsidData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${speedTsidApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("owner" === "owner") {
                                    let ownerApiUrl = `https://coe-mvsuwa04${office.toLocaleLowerCase()}.${office.toLocaleLowerCase()}.usace.army.mil:8243/${office.toLocaleLowerCase()}-data/location/group/${office}?office=${office}&category-id=${office}`;
                                    if (ownerApiUrl) {
                                        ownerPromises.push(
                                            fetch(ownerApiUrl)
                                                .then(response => {
                                                    if (response.status === 404) {
                                                        console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                        return null;
                                                    }
                                                    if (!response.ok) {
                                                        throw new Error(`Network response was not ok: ${response.statusText}`);
                                                    }
                                                    return response.json();
                                                })
                                                .then(ownerData => {
                                                    if (ownerData) {
                                                        console.log("ownerData", ownerData);
                                                        ownerMap.set(loc['location-id'], ownerData);
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error(`Problem with the fetch operation for stage TSID data at ${ownerApiUrl}:`, error);
                                                })
                                        );
                                    }
                                }

                                if ("river-mile" === "river-mile") {
                                    // Fetch the JSON file
                                    fetch('json/gage_control_official.json')
                                        .then(response => {
                                            if (!response.ok) {
                                                throw new Error(`Network response was not ok: ${response.statusText}`);
                                            }
                                            return response.json();
                                        })
                                        .then(riverMilesJson => {
                                            // Loop through each basin in the JSON
                                            for (const basin in riverMilesJson) {
                                                const locations = riverMilesJson[basin];

                                                for (const loc in locations) {
                                                    const ownerData = locations[loc];

                                                    // Retrieve river mile and other data
                                                    const riverMile = ownerData.river_mile_hard_coded;

                                                    // Create an output object using the location name as ID
                                                    const outputData = {
                                                        locationId: loc, // Using location name as ID
                                                        basin: basin,
                                                        riverMile: riverMile
                                                    };

                                                    console.log("Output Data:", outputData);
                                                    riverMileMap.set(loc, ownerData); // Store the data in the map
                                                }
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Problem with the fetch operation:', error);
                                        });
                                }
                            });
                        }
                    })
                    .catch(error => {
                        console.error(`Problem with the fetch operation for basin ${basin}:`, error);
                    })
            );

            // Wait for all basin, metadata, and flood fetch promises to complete
            Promise.all(apiPromises)
                .then(() => Promise.all(metadataPromises))
                .then(() => Promise.all(floodPromises))
                .then(() => Promise.all(stageTsidPromises))
                .then(() => Promise.all(forecastNwsTsidPromises))
                .then(() => Promise.all(flowTsidPromises))
                .then(() => Promise.all(precipTsidPromises))
                .then(() => Promise.all(tempAirTsidPromises))
                .then(() => Promise.all(tempWaterTsidPromises))
                .then(() => Promise.all(speedWindTsidPromises))
                .then(() => Promise.all(dirWindTsidPromises))
                .then(() => Promise.all(doTsidPromises))
                .then(() => Promise.all(depthTsidPromises))
                .then(() => Promise.all(condTsidPromises))
                .then(() => Promise.all(phTsidPromises))
                .then(() => Promise.all(turbfTsidPromises))
                .then(() => Promise.all(pressureTsidPromises))
                .then(() => Promise.all(nitrateTsidPromises))
                .then(() => Promise.all(chlorophyllTsidPromises))
                .then(() => Promise.all(phycocyaninTsidPromises))
                .then(() => Promise.all(speedTsidPromises))
                .then(() => Promise.all(ownerPromises))
                .then(() => Promise.all(riverMilePromises))
                .then(() => {
                    // Update combinedData with location metadata and flood data
                    combinedData.forEach(basinData => {
                        if (basinData['assigned-locations']) {
                            basinData['assigned-locations'].forEach(loc => {
                                const metadataMapData = metadataMap.get(loc['location-id']);
                                if (metadataMapData) {
                                    loc['metadata'] = metadataMapData;
                                }

                                const floodMapData = floodMap.get(loc['location-id']);
                                if (floodMapData) {
                                    loc['flood'] = floodMapData;
                                }

                                const stageTsidMapData = stageTsidMap.get(loc['location-id']);
                                if (stageTsidMapData) {
                                    loc['tsid-stage'] = stageTsidMapData;
                                }

                                const flowTsidMapData = flowTsidMap.get(loc['location-id']);
                                if (flowTsidMapData) {
                                    loc['tsid-flow'] = flowTsidMapData;
                                }

                                const precipTsidMapData = precipTsidMap.get(loc['location-id']);
                                if (precipTsidMapData) {
                                    loc['tsid-precip'] = precipTsidMapData;
                                }

                                const tempAirTsidMapData = tempAirTsidMap.get(loc['location-id']);
                                if (tempAirTsidMapData) {
                                    loc['tsid-temp-air'] = tempAirTsidMapData;
                                }

                                const tempWaterTsidMapData = tempWaterTsidMap.get(loc['location-id']);
                                if (tempWaterTsidMapData) {
                                    loc['tsid-temp-water'] = tempWaterTsidMapData;
                                }

                                const forecastNwsTsidMapData = forecastNwsTsidMap.get(loc['location-id']);
                                if (forecastNwsTsidMapData) {
                                    loc['tsid-forecast-nws'] = forecastNwsTsidMapData;
                                }

                                const speedWindTsidMapData = speedWindTsidMap.get(loc['location-id']);
                                if (speedWindTsidMapData) {
                                    loc['tsid-speed-wind'] = speedWindTsidMapData;
                                }

                                const dirWindTsidMapData = dirWindTsidMap.get(loc['location-id']);
                                if (dirWindTsidMapData) {
                                    loc['tsid-dir-wind'] = dirWindTsidMapData;
                                }

                                const doTsidMapData = doTsidMap.get(loc['location-id']);
                                if (doTsidMapData) {
                                    loc['tsid-do'] = doTsidMapData;
                                }

                                const depthTsidMapData = depthTsidMap.get(loc['location-id']);
                                if (depthTsidMapData) {
                                    loc['tsid-depth'] = depthTsidMapData;
                                }

                                const condTsidMapData = condTsidMap.get(loc['location-id']);
                                if (condTsidMapData) {
                                    loc['tsid-cond'] = condTsidMapData;
                                }

                                const phTsidMapData = phTsidMap.get(loc['location-id']);
                                if (phTsidMapData) {
                                    loc['tsid-ph'] = phTsidMapData;
                                }

                                const turbfTsidMapData = turbfTsidMap.get(loc['location-id']);
                                if (turbfTsidMapData) {
                                    loc['tsid-turbf'] = turbfTsidMapData;
                                }

                                const pressureTsidMapData = pressureTsidMap.get(loc['location-id']);
                                if (pressureTsidMapData) {
                                    loc['tsid-pressure'] = pressureTsidMapData;
                                }

                                const nitrateTsidMapData = nitrateTsidMap.get(loc['location-id']);
                                if (nitrateTsidMapData) {
                                    loc['tsid-nitrate'] = nitrateTsidMapData;
                                }

                                const chlorophyllTsidMapData = chlorophyllTsidMap.get(loc['location-id']);
                                if (chlorophyllTsidMapData) {
                                    loc['tsid-chlorophyll'] = chlorophyllTsidMapData;
                                }

                                const phycocyaninTsidMapData = phycocyaninTsidMap.get(loc['location-id']);
                                if (phycocyaninTsidMapData) {
                                    loc['tsid-phycocyanin'] = phycocyaninTsidMapData;
                                }

                                const speedTsidMapData = speedTsidMap.get(loc['location-id']);
                                if (speedTsidMapData) {
                                    loc['tsid-speed'] = speedTsidMapData;
                                }

                                const ownerMapData = ownerMap.get(loc['location-id']);
                                if (ownerMapData) {
                                    loc['owner'] = ownerMapData;
                                }

                                const riverMileMapData = riverMileMap.get(loc['location-id']);
                                if (riverMileMapData) {
                                    loc['river-mile'] = riverMileMapData;
                                }
                            });
                        }
                    });

                    // Output the combined data
                    console.log('combinedData:', combinedData);

                    // Call the function to create and populate the table
                    createGageDataTable(combinedData);
                    loadingIndicator.style.display = 'none';
                })
                .catch(error => {
                    console.error('There was a problem with one or more fetch operations:', error);
                });

        })
        .catch(error => {
            console.error('There was a problem with the initial fetch operation:', error);
        });
});

function filterByLocationCategory(array, category) {
    return array.filter(item =>
        item['location-category'] &&
        item['location-category']['office-id'] === category['office-id'] &&
        item['location-category']['id'] === category['id']
    );
}
