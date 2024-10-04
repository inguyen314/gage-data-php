<?php require_once('../../private/initialize.php'); ?>

<!--< ?php unset($_SESSION['admin_id']); ?>-->

<?php require_login(); ?>

<?php $page_title = 'Staff Menu'; ?>

<?php include(SHARED_PATH . '/staff_header.php'); ?>

<div id="content">
  <div id="main-menu">
    <h2>Main Menu</h2>
    <ul>
      <!--<li><a href="< ?php echo url_for('/staff/subjects/index.php'); ?>">Subjects</a></li>-->
      <!--<li><a href="< ?php echo url_for('/staff/pages/index.php'); ?>">Pages</a></li>-->
	  <!--<li><a href="< ?php echo url_for('/staff/admins/index.php'); ?>">Admins</a></li>-->
	  <li><a href="<?php echo url_for('/datman_data_editing_status.php'); ?>" target="_blank">Datman Data Editing Status</a></li>
	  <li><a href="<?php echo url_for('/min_max.php'); ?>" target="_blank">Min Max</a>
		<ul>
			<li><a href="<?php echo url_for('/min_max_display.php'); ?>" target="_blank">Display</a></li>  
		</ul>
      </li>
	  <li>Rating Tables
		<ul>
			<li><a href="<?php echo url_for('/location_id_rating_coe.php'); ?>" target="_blank">COE</a></li>
			<li><a href="<?php echo url_for('/location_id_rating_usgs.php'); ?>" target="_blank">USGS</a></li> 
		</ul>
      </li>
    </ul>
  </div>

</div>
<br>
<br>

<?php include(SHARED_PATH . '/staff_footer.php'); ?>
