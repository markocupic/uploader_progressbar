<?php

/**
 * Contao Open Source CMS
 *
 * Copyright (c) 2005-2014 Leo Feyer
 *
 * @package Upload_progressbar
 * @link    https://contao.org
 * @license http://www.gnu.org/licenses/lgpl-3.0.html LGPL
 */


/**
 * Register the classes
 */
ClassLoader::addClasses(array
(
	// Forms
	'Contao\FormFileUploadProgressbar' => 'system/modules/upload_progressbar/forms/FormFileUploadProgressbar.php',

	// Helper
	'Contao\ValidateProgressbarUpload' => 'system/modules/upload_progressbar/helper/ValidateProgressbarUpload.php',
));


/**
 * Register the templates
 */
TemplateLoader::addFiles(array
(
	'form_upload_progressbar' => 'system/modules/upload_progressbar/templates',
));
