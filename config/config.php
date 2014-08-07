<?php

/**
 * Contao Open Source CMS
 *
 * Copyright (c) 2005-2014 Leo Feyer
 *
 * @package   upload_progressbar
 * @author    Marko Cupic
 * @license   shareware
 * @copyright Marko Cupic 2014
 */


/**
 * Front end form fields
 */
$GLOBALS['TL_FFL']['upload_progressbar'] = 'FormFileUploadProgressbar';


/**
 * Hooks
 */
$GLOBALS['TL_HOOKS']['validateFormField'][] = array('ValidateProgressbarUpload', 'validateFormField');
$GLOBALS['TL_HOOKS']['generatePage'][] = array('ValidateProgressbarUpload', 'generatePage');
