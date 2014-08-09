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
 * Run in a custom namespace, so the class can be replaced
 */
namespace Contao;


/**
 * Class FormFileUploadProgressbar
 *
 * @copyright  Leo Feyer 2005-2014
 * @author     Marko Cupic <m.cupic@gmx.ch>
 * @package    upload_progressbar
 */

class FormFileUploadProgressbar extends \FormFileUpload implements \uploadable
{

       /**
        * Template
        * @var string
        */
       protected $strTemplate = 'form_upload_progressbar';

       /**
        *
        */
       public function generateAjax()
       {
              if (strlen($_SESSION['FORM_UPLOAD_PROGRESSBAR'][\Input::get('reqId')] && $_GET['isAjax'] == 'true'))
              {
                     echo $_SESSION['FORM_UPLOAD_PROGRESSBAR'][\Input::post('reqId')];
                     unset($_SESSION['FORM_UPLOAD_PROGRESSBAR'][\Input::post('reqId')]);
                     exit;
              }
       }

       /**
        * @param null $arrAttributes
        * @return string
        */
       public function parse($arrAttributes=null)
       {
              // add javascript source
              $GLOBALS['TL_JAVASCRIPT'][] = 'system/modules/upload_progressbar/assets/js/upload_progressbar.js';

              // add css source
              $GLOBALS['TL_CSS'][] = 'system/modules/upload_progressbar/assets/css/upload_progressbar.css';

              $strMsg = '';
              foreach($GLOBALS['TL_LANG']['form_upload_progressbar']['messages'] as $k => $v)
              {
                     $strMsg .=
"uploader.messages['" . $k . "'] =  '" . $v . "';" . "\n";
              }

              $this->errMessages = $strMsg;
              return parent::parse($arrAttributes);
       }




}