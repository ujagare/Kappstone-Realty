/**
* PHP Email Form Validation - v3.11
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function(e) {
    initializeFormMeta(e);
  });

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      initializeFormMeta(thisForm, true);

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    const isServerlessContactEndpoint =
      action === '/api/contact' || action === '/.netlify/functions/contact';
    const requestBody = isServerlessContactEndpoint
      ? new URLSearchParams(formData).toString()
      : formData;
    const requestHeaders = {'X-Requested-With': 'XMLHttpRequest'};

    if (isServerlessContactEndpoint) {
      requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }

    fetch(action, {
      method: 'POST',
      body: requestBody,
      headers: requestHeaders
    })
    .then(response => {
      if( response.ok ) {
        return response.text();
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (data.trim() == 'OK') {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      } else {
        throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

  function initializeFormMeta(thisForm, isSubmit) {
    let submittedAtField = thisForm.querySelector('input[name="submitted_at"]');
    if (submittedAtField) {
      submittedAtField.value = submittedAtField.value || new Date().toISOString();
    }

    let pageUrlField = thisForm.querySelector('input[name="page_url"]');
    if (pageUrlField && (isSubmit || !pageUrlField.value)) {
      pageUrlField.value = window.location.href;
    }
  }

})();
