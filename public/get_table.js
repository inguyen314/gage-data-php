// Make a fetch request to the PHP file
fetch('get_ld_gate_tsid.php')
.then(response => {
    if (!response.ok) {
    throw new Error('Network response was not ok');
    }
    return response.text(); // or response.json() if your PHP file returns JSON
})
.then(data => {
    // Handle the PHP file's response here
    console.log("data: ", data);
    console.log("data: ", typeof data);

    // Parse the JSON-encoded PHP array in JavaScript
    var jsArray = JSON.parse(data);

    // Now, you can use jsArray in JavaScript
    console.log("jsArray: ", jsArray);

    // Assuming jsArray is already defined as your array of objects

    jsArray.forEach(function(item) {
        var project_id = item.project_id;
        var pool = item.pool;
        var tw = item.tw;
        var hinge = item.hinge;
        var taint = item.taint;
        var roll = item.roll;

        // Here, you can run your query or perform any operation you need with the properties of each object.
        // You can use these values to make AJAX requests, display data on a webpage, or perform other tasks.
        
        // Example: Log the data to the console
        console.log("Project ID: " + project_id);
        console.log("Pool: " + pool);
        console.log("TW: " + tw);
        console.log("Hinge: " + hinge);
        console.log("Taint: " + taint);
        
        // Create an object to hold all the properties you want to pass
        const dataToSend = {
            project_id: project_id,
            pool: pool,
            tw: tw,
            hinge: hinge,
            taint: taint,
            roll: roll,
        };
        console.log("dataToSend: " + dataToSend);

        // Convert the object into a query string
        const queryString = Object.keys(dataToSend).map(key => key + '=' + dataToSend[key]).join('&');
        console.log("queryString: " + queryString);

        // Make an AJAX request to the PHP script, passing all the variables
        // Adjust the URL to your server configuration
        const url = `get_ld_gate.php?${queryString}`;
        console.log("url: " + url);
            
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Log the data to the console
                console.log("data: ", data);
                console.log(`Results for Project ID ${project_id}:`, data);
                console.log(`${project_id}`);
                console.log(`${roll}`);

                // Assuming your data is an array of project objects
                const projects = data;

                // Get a reference to the HTML element where you want to insert the table
                const tableContainer = document.getElementById('table-container');

                // Create an HTML table element
                const table = document.createElement('table');
                table.setAttribute('id', 'customers'); // Set the id to "customers"

                // Create a table header with colspan=6
                const thead = document.createElement('thead');
                const headerRowProject = thead.insertRow(0);
                const projectIDCell = document.createElement('th');
                projectIDCell.textContent = project_id;
                projectIDCell.setAttribute('colspan', 6);
                headerRowProject.appendChild(projectIDCell);
                
                // Create a table header
                //const thead = document.createElement('thead');
                const headerRow = thead.insertRow(1); // Add 1 to shift to the second row
                headerRow.insertCell(0).textContent = 'Date & Time';
                headerRow.insertCell(1).textContent = 'Pool';
                headerRow.insertCell(2).textContent = 'TW';
                headerRow.insertCell(3).textContent = 'Hinge';
                headerRow.insertCell(4).textContent = 'Taint';
                headerRow.insertCell(5).textContent = roll !== null ? "Roll" : '--';
                // Add more header cells for additional properties if needed

                // Set a fixed width for all header cells
                const headerCellWidth = '16.6666666667%';
                for (let i = 0; i < 6; i++) {
                    headerRow.cells[i].style.width = headerCellWidth;
                }

                table.appendChild(thead);

                // Create table rows and populate with data
                data.forEach(item => {
                    const row = table.insertRow();
                    // Populate the cell content as before
                    row.insertCell(0).textContent = item.date_time;
                    row.insertCell(1).textContent = item.pool !== null ? parseFloat(item.pool).toFixed(2) : '--';
                    row.insertCell(2).textContent = item.tw !== null ? parseFloat(item.tw).toFixed(2) : '--';
                    row.insertCell(3).textContent = item.hinge !== null ? parseFloat(item.hinge).toFixed(2) : '--';
                    row.insertCell(4).textContent = item.taint !== null ? parseFloat(item.taint).toFixed(2) : '--';
                    row.insertCell(5).textContent = item.roll !== null ? parseFloat(item.roll).toFixed(2) : '--';
                    // Add more cells for additional properties if needed 
                });

                // Add a blank row at the end
                /*
                const lastBlankRow = table.insertRow();
                const lastBlankCell = lastBlankRow.insertCell(0);
                lastBlankCell.setAttribute('colspan', 6);
                */

                // Append the table to the container
                tableContainer.appendChild(table);
                tableContainer.appendChild(table).style.marginBottom = '20px';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
})
.catch(error => {
    // Handle errors here
    console.error('Fetch error:', error);
});