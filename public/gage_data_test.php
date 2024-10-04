<?php 
require_once('../private/initialize.php');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set("xdebug.var_display_max_children", '-1');
ini_set("xdebug.var_display_max_data", '-1');
ini_set("xdebug.var_display_max_depth", '-1');

date_default_timezone_set('America/Chicago');
if (date_default_timezone_get()) {
    //echo 'date_default_timezone_set: ' . date_default_timezone_get() . '<br />';
}
if (ini_get('date.timezone')) {
    //echo 'date.timezone: ' . ini_get('date.timezone');
}

$basin = $_GET['basin'] ?? null;
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gage Data</title>
        <meta name="Description" content="U.S. Army Corps of Engineers St. Louis District Home Page" />
        <link rel="stylesheet" href="../../css/body.css" />
        <link rel="stylesheet" href="stylesheets/style.css" />
        <link rel="stylesheet" href="../../css/breadcrumbs.css" />
        <link rel="stylesheet" href="../../css/jumpMenu.css" />
        <script type="text/javascript" src="../../js/main.js"></script>

        <!-- Add sidebar.css IF NOT LOAD SIDEBAR TEMPLATE -->
        <link rel="stylesheet" href="../../css/sidebar.css"/>
        <!-- Include Moment.js -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
        <!-- Include the Chart.js library -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <!-- Include the Moment.js adapter for Chart.js -->
        <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@1.0.0"></script>
    </head>
    <body>
        <div id="page-container">
            <header id="header">
            <!--Header content populated here by JavaScript Tag at end of body -->
            </header>
            <div class="page-wrap">
                <div class="container-fluid">
                    <div id="breadcrumbs">
                    </div>
                    <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                    <div class="page-content">
						<div id="topPane" class="col-md backend-cp-collapsible">
							<div class="box-usace">
								<h2 class="box-header-striped">
									<span class="titleLabel title">Gage Data PHP</span>
									<span class="rss"></span>
								</h2>
								<div class="box-content" style="background-color:white;margin:auto">
									<div class="content">
										<!-- Box Content Here -->
										<span><h3><a href='gage_data.php?basin=Mississippi'>Switch to PHP</a></h3></span> 
                                        <span><h3><a href='gage_data.html?basin=Mississippi&cda=internal'>Switch to Cloud</a></h3></span>
                                        <!-- <span><h3><a href='gage_data.html?basin=Mississippi&cda=public'>Switch to Cloud Public</a></h3></span> -->
									</div>
								</div>
							</div>
						</div>
					</div>

                    <script>
                        var basin = <?php echo json_encode($_GET['basin'] ?? null); ?>;
                        console.log('basin: ', basin);
                        </script>

                        <div id="container"></div>
                        <script>
                        // Create table element
                        var table = document.createElement('table');
                        table.id = 'basins';
                    
                        // Create tbody element
                        var tbody = document.createElement('tbody');
                        table.appendChild(tbody);
                    
                        // Create tr element
                        var tr = document.createElement('tr');
                        tbody.appendChild(tr);
                    
                        // Create th elements
                        for (var i = 0; i < 3; i++) {
                            var th = document.createElement('th');
                            th.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                            tr.appendChild(th);
                        }
                    
                        // Create th elements with links
                        var basins = ['Mississippi', 'Ohio', 'Salt', 'Cuivre', 'Illinois', 'Missouri', 'Meramec', 'Kaskaskia', 'Big Muddy', 'Castor', 'St Francis'];
                            for (var i = 0; i < basins.length; i++) {
                                var th = document.createElement('th');
                                var link = document.createElement('a');
                                link.href = 'gage_data.php?basin=' + basins[i];
                                link.innerHTML = '<strong>' + basins[i] + '</strong>';
                                var p = document.createElement('p');
                                p.appendChild(link);
                                th.appendChild(p);
                                tr.appendChild(th);
                            }
                        
                        // Create th elements for remaining spaces
                        for (var i = 0; i < 2; i++) {
                            var th = document.createElement('th');
                            th.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                            tr.appendChild(th);
                        }
                    
                        // Append table to the container div<strong>May 2024 - Version V2.1</strong> - gage_control3.json was used <br> 
                        document.getElementById('container').appendChild(table);
                    </script>

                    <!-- <div id="loading_gage_data" style="display: none;"><img src="../../images/loading4.gif" style='height: 50px; width: 50px;' alt="Loading..." /></div>
                    <div id="table_container_gage_data"></div>
                    <script src="gage_data.js"></script> -->
                    <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                    <div class="page-content">
                        <sidebar id="sidebar">
                        <!--Side bar content populated here by JavaScript Tag at end of body -->
                        </sidebar>
                        <div id="topPane" class="col-md backend-cp-collapsible">
                            <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                            <div class="box-usace">
                                <h2 class="box-header-striped">
                                    <span class="titleLabel title">Note</span>
                                    <span class="rss"></span>
                                </h2>
                                <div class="box-content" style="background-color:white;margin:auto">
                                    <div class="content">
                                        <!-- Box Content Here -->
                                    </div>
                                </div>
                            </div>
                            <!--////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
                        </div>
                    </div>
                </div>
            </div>
                <button id="returnTop" title="Return to Top of Page">Top</button>
            </div>
        </div>
        <footer id="footer">
            <!--Footer content populated here by script tag at end of body -->
        </footer>
        <script src="../../js/libraries/jQuery-3.3.6.min.js"></script>
        <script defer>
            // When the document has loaded pull in the page header and footer skins
            $(document).ready(function () {
                // Change the v= to a different number to force clearing the cached version on the client browser
                $('#header').load('../../templates/DISTRICT.header.html');
                //$('#sidebar').load('../../templates/DISTRICT.sidebar.html');
                $('#footer').load('../../templates/DISTRICT.footer.html');
            })
        </script>
    </body>
</html>
<?php db_disconnect($db); ?>