<?php

/**
 * Contao Open Source CMS
 *
 * Copyright (c) 2005-2014 Leo Feyer
 *
 * @package Core
 * @link    https://contao.org
 * @license http://www.gnu.org/licenses/lgpl-3.0.html LGPL
 */


/**
 * Run in a custom namespace, so the class can be replaced
 */
namespace Contao;


/**
 * Class FormFileUploadProgressbar
 *
 * @copyright  Leo Feyer 2005-2014
 * @author     Marko Cupic <m.cupic@gmx.ch>
 * @package    UploadProgressbar
 */

class FormFileUploadProgressbar extends \FormFileUpload implements \uploadable
{

       /**
        * Template
        * @var string
        */
       protected $strTemplate = 'form_upload_progressbar';

       /**
        * @param null $arrAttributes
        * @return string
        */
       public function parse($arrAttributes=null)
       {
              // add javascript source
              $GLOBALS['TL_JAVASCRIPT'][] = 'system/modules/upload_progressbar/assets/js/upload_progressbar.js';

              // return \Widget::parse($arrAttributes);
              return parent::parse($arrAttributes);
       }


}