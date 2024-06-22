<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>St. Louis District Home Page</title>
        <meta name="Description" content="U.S. Army Corps of Engineers St. Louis District Home Page" />
        <link rel="stylesheet" href="../../../css/body.css" />
        <link rel="stylesheet" href="../../../css/breadcrumbs.css" />
        <link rel="stylesheet" href="../../../css/jumpMenu.css" />
        <script type="text/javascript" src="../../../js/main.js"></script>

        <!-- Additional CSS -->
        <link rel="stylesheet" href="../../../css/rebuild.css" />

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
                    <div class="page-content">
                        <sidebar id="sidebar">
                            <!--Side bar content populated here by JavaScript Tag at end of body -->
                        </sidebar>
                        <div id="topPane" class="col-md backend-cp-collapsible">
                        <?php
                            $time = microtime();
                            $time = explode(' ', $time);
                            $time = $time[1] + $time[0];
                            $start = $time;
                        ?>