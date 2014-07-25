<?php
/**
 * Created by PhpStorm.
 * User: Marko
 * Date: 22.07.14
 * Time: 15:37
 */

// config.php
//if(Input::post('FORM_UPLOAD_PROGRESSBAR')){
       $GLOBALS['TL_HOOKS']['validateFormField'][] = array('ValidateProgressbarUpload', 'validateFeFileupload');
       $GLOBALS['TL_HOOKS']['processFormData'][] = array('ValidateProgressbarUpload', 'processFormData');
///}
/**
 * Front end form fields
 */
$GLOBALS['TL_FFL']['upload_progressbar'] = 'FormFileUploadProgressbar';
