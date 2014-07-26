<?php
/**
 * Created by PhpStorm.
 * User: Marko
 * Date: 22.07.14
 * Time: 15:37
 */

// config.php

/**
 * Front end form fields
 */
$GLOBALS['TL_FFL']['upload_progressbar'] = 'FormFileUploadProgressbar';


/**
 * Hooks
 */
$GLOBALS['TL_HOOKS']['validateFormField'][] = array('ValidateProgressbarUpload', 'validateFormField');
