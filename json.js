document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/location/group?office=MVS&include-assigned=false&location-category-like=Basins';

    // Example configuration; adjust as needed
    const cda = "public"; // or "internal", set based on your needs

    // Store location metadata and flood data
    const locationMetadataMap = new Map();
    const locationFloodMap = new Map();
    const locationStageTsidMap = new Map();

    // Arrays to track promises for metadata and flood data fetches
    const metadataPromises = [];
    const floodPromises = [];
    const stageTsidPromises = [];

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

            const targetCategory = { "office-id": "MVS", "id": "Basins" };

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

            console.log(selectedBasin); // Output: "Mississippi"

            // Array to store all promises from API requests
            const apiPromises = [];
            const combinedData = []; // Array to store combined data

            // Construct the URL for the API request - basin
            const firstApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/location/group/${basin}?office=MVS&category-id=Basins`;

            // Push the fetch promise to the apiPromises array
            apiPromises.push(
                fetch(firstApiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Network response was not ok for basin ${basin}: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(firstData => {
                        if (!firstData) {
                            console.log(`No data for basin: ${basin}`);
                            return;
                        }
                        console.log('firstData:', firstData);
                        // Process and append the fetched data to combinedData
                        combinedData.push(firstData);

                        // Process each location within the basin data
                        if (firstData['assigned-locations']) {
                            firstData['assigned-locations'].forEach(loc => {
                                // console.log('Processing location:', loc['location-id']);

                                // Construct the URL for the location metadata request
                                let locApiUrl = cda === "public"
                                    ? `https://cwms-data.usace.army.mil/cwms-data/locations/${loc['location-id']}?office=MVS`
                                    : `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations/${loc['location-id']}?office=MVS`;

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
                                                    locationMetadataMap.set(loc['location-id'], locData);
                                                }
                                            })
                                            .catch(error => {
                                                console.error(`Problem with the fetch operation for location ${loc['location-id']}:`, error);
                                            })
                                    );
                                }



                                // Construct the URL for the flood data request
                                let floodApiUrl = cda === "public"
                                    ? `https://cwms-data.usace.army.mil/cwms-data/levels/${loc['location-id']}.Stage.Inst.0.Flood?office=MVS&effective-date=2024-01-01T08:00:00&unit=ft`
                                    : `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${loc['location-id']}.Stage.Inst.0.Flood?office=MVS&effective-date=2024-01-01T08:00:00&unit=ft`;

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
                                                    locationFloodMap.set(loc['location-id'], floodData);
                                                }
                                            })
                                            .catch(error => {
                                                console.error(`Problem with the fetch operation for flood data at ${floodApiUrl}:`, error);
                                            })
                                    );
                                }



                                // Construct the URL for the stage tsid data request
                                let stageTsidApiUrl = cda === "public"
                                    ? `https://cwms-data.usace.army.mil/cwms-data/timeseries/group/Stage?office=MVS&category-id=${loc['location-id']}`
                                    : `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries/group/Stage?office=MVS&category-id=${loc['location-id']}`;

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
                                                    locationStageTsidMap.set(loc['location-id'], stageTsidData);
                                                }
                                            })
                                            .catch(error => {
                                                console.error(`Problem with the fetch operation for stage TSID data at ${stageTsidApiUrl}:`, error);
                                            })
                                    );
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
                .then(() => {
                    // Update combinedData with location metadata and flood data
                    combinedData.forEach(basinData => {
                        if (basinData['assigned-locations']) {
                            basinData['assigned-locations'].forEach(loc => {
                                const locData = locationMetadataMap.get(loc['location-id']);
                                if (locData) {
                                    loc['metadata'] = locData; // Append locData to the location object
                                }

                                const locDataFlood = locationFloodMap.get(loc['location-id']);
                                if (locDataFlood) {
                                    loc['flood'] = locDataFlood; // Append locDataFlood to the location object
                                }

                                const tsidStageData = locationStageTsidMap.get(loc['location-id']);
                                if (tsidStageData) {
                                    loc['tsid_stage'] = tsidStageData; // Append tsidStageData to the location object
                                }
                            });
                        }
                    });

                    // Output the combined data
                    console.log('combinedData:', combinedData);

                    // Call the function to create and populate the table
                    // createGageDataTable(selectedBasinData);
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
