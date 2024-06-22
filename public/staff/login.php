<?php
require_once('../../private/initialize.php');

$errors = [];
$username = '';
$password = '';

if(is_post_request()) 
{
  $username = $_POST['username'] ?? '';
  $password = $_POST['password'] ?? '';

  var_dump($username);
  var_dump($password);
	
  // Validations
  if(is_blank($username)) 
  {
	$errors[] = "Username cannot be blank.";
  }
  if(is_blank($password)) 
  {
	$errors[] = "Password cannot be blank.";
  }
  // if there were no errors, try to login
  if(empty($errors))
  {
    // Using one variable ensures that msg is the same
    $login_failure_msg = "Log in was unsuccessful.";

    $admin = find_admin_by_username($db, $username);
    if($admin) 
	{
	  var_dump($admin);
      if(password_verify($password, $admin->HASHED_PASSWORD)) 
	  {
        // password matches
        log_in_admin($db, $admin);
        redirect_to(url_for('/staff/index.php'));
      } 
	  else 
	  {
        // username found, but password does not match
        $errors[] = $login_failure_msg;
		// array_push($errors, $login_failure_msg);
      }
    } 
	else 
	{
      // no username found
      $errors[] = $login_failure_msg;
    }
  }
}

?>

<?php $page_title = 'Log in'; ?>

<?php include(SHARED_PATH . '/staff_header.php'); ?>

<div id="content">
  <h1>Log in</h1>
  <!--< ?php echo display_errors($errors); ?>-->
  <form action="login.php" method="post">
    Username:<br />
    <input type="text" name="username" value="<?php echo h($username); ?>" /><br />
    Password:<br />
    <input type="password" name="password" value="" /><br />
    <input type="submit" name="submit" value="Submit"  />
  </form>
  <pre>
	<?php
		foreach ($errors as $err) 
		{
			echo $err . '\n';
		}			
	?>
  </pre>
</div>
<?php include(SHARED_PATH . '/staff_footer.php'); ?>
