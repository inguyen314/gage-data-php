<?php require_once('../private/initialize.php'); 
//require_login();
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

$set_options = set_options($db); 

// Get all the variables from the query parameters
$cwms_ts_id = $_GET['cwms_ts_id'];

$record_stage = get_record_stage($db, $cwms_ts_id);
echo json_encode($record_stage);
?>