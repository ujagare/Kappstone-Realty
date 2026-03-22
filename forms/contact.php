<?php
  /**
  * Requires the "PHP Email Form" library
  * The "PHP Email Form" library is available only in the pro version of the template
  * The library should be uploaded to: vendor/php-email-form/php-email-form.php
  * For more info and help: https://bootstrapmade.com/php-email-form/
  */

  // Replace contact@example.com with your real receiving email address
  $receiving_email_address = 'contact@example.com';

  if( file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php' )) {
    include( $php_email_form );
  } else {
    die( 'Unable to load the "PHP Email Form" Library!');
  }

  $contact = new PHP_Email_Form;
  $contact->ajax = true;
  
  $contact->to = $receiving_email_address;
  $contact->from_name = $_POST['name'];
  $contact->from_email = !empty($_POST['email']) ? $_POST['email'] : 'no-reply@kappstonerealty.com';
  $contact->subject = !empty($_POST['subject']) ? $_POST['subject'] : 'Contact Inquiry';

  // Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
  /*
  $contact->smtp = array(
    'host' => 'example.com',
    'username' => 'example',
    'password' => 'pass',
    'port' => '587'
  );
  */

  $contact->add_message( $_POST['name'], 'From');
  if(isset($_POST['email']) && $_POST['email'] !== '') {
    $contact->add_message( $_POST['email'], 'Email');
  }
  if(isset($_POST['phone'])) {
    $contact->add_message( $_POST['phone'], 'Phone');
  }
  if(isset($_POST['budget']) && $_POST['budget'] !== '') {
    $contact->add_message( $_POST['budget'], 'Budget');
  }
  if(isset($_POST['property_type']) && $_POST['property_type'] !== '') {
    $contact->add_message( $_POST['property_type'], 'Property Type');
  }
  $contact->add_message( $_POST['message'], 'Message', 10);

  echo $contact->send();
?>
