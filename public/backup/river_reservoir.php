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

$now =  date('Y-m-d H:i');
$time   = strtotime($now);
$current_date =  date('m-d-Y');
$current_date_time_format =  date('m-d-Y H:i');
$current_date_time   = date("Y-m-d H:i", $time);
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>River Reservoir</title>
        <meta name="Description" content="U.S. Army Corps of Engineers St. Louis District Home Page" />
        <link rel="stylesheet" href="../../css/body.css" />
        <link rel="stylesheet" href="../../css/public.css" />
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
									<span class="titleLabel title">River Reservoir PHP V2.0</span>
									<span class="rss"></span>
								</h2>
								<div class="box-content" style="background-color:white;margin:auto">
									<div class="content">
										<!-- Box Content Here -->
                                        <span>Last Modified:<?php echo " " . $current_date_time //. " " . date_default_timezone_get(); ?></span><br>
										<span><h3><a href='river_reservoir.php'>Switch to PHP</a></h3></span> 
                                        <span><h3><a href='river_reservoir.html?cda=internal'>Switch to CDA Internal</a></h3></span>
                                        <span><h3><a href='river_reservoir.html?cda=public'>Switch to CDA Public</a></h3></span>
									</div>
                                    <div class="alert">
                                        <strong>May 2024 - Version V2.0</strong> - This report was build using PHP, CWMS and JavaScript, no coldfusion schema was used <br>
                                    </div>
								</div>
							</div>
						</div>
					</div>
                    <div id="loading_river_reservoir" style="display: none;"><img src="../../../images/gif/loading4.gif" style='height: 50px; width: 50px;' alt="Loading..." /></div>
                    <div id="table_container_river_reservoir"></div>
                    <script src="river_reservoir.js"></script>

                    <!-- <div id="table-container"></div>
                    <script src="get_table.js"></script> -->
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