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
 * Class ValidateProgressbarUpload
 *
 * @copyright  Leo Feyer 2005-2014
 * @author     Marko Cupic <m.cupic@gmx.ch>
 * @package    upload_progressbar
 */

class ValidateProgressbarUpload extends \System
{

       /**
        * validateFormField-Hook
        * @param \Widget $objWidget
        * @param $intId
        */
       public function validateFormField($objWidget, $formId, $arrData, $objForm)
       {

              if ($_POST['FORM_UPLOAD_PROGRESSBAR'] != '')
              {
                     if(($objPage = \PageModel::findByPk($objForm->jumpTo)) !== null)
                     {
                            $href = $objWidget->generateFrontendUrl($objPage->row());
                            $_SESSION['uploaderProgressbar']['jumpTo'] = $href;
                     }

                     if(!isset($_SESSION['uploaderProgressbar']['form_fields'])){
                            $_SESSION['uploaderProgressbar']['form_fields'] = array();
                     }

                     $_SESSION['uploaderProgressbar']['form_fields'][] = 'ctrl_' . $objWidget->id;
                     $_SESSION['uploaderProgressbar']['ctrl_' . $objWidget->id]['id'] = $objWidget->id;
                     $_SESSION['uploaderProgressbar']['ctrl_' . $objWidget->id]['type'] = $objWidget->type;


                     $_SESSION['uploaderProgressbar']['ctrl_' . $objWidget->id]['name'] = $objWidget->name;
                     if ($objWidget->hasErrors() === true)
                     {
                            $_SESSION['uploaderProgressbar']['ctrl_' . $objWidget->id]['state'] = 'error';
                            $_SESSION['uploaderProgressbar']['ctrl_' . $objWidget->id]['serverResponse'] = $objWidget->getErrorAsString();
                     }
                     else
                     {
                            $_SESSION['uploaderProgressbar']['ctrl_' . $objWidget->id]['state'] = 'validInput';
                            $_SESSION['uploaderProgressbar']['ctrl_' . $objWidget->id]['serverResponse'] = $GLOBALS['TL_LANG']['form_upload_progressbar']['messages']['validInput'];
                     }

              }
              return $objWidget;
       }

       /**
        * @param \PageModel $objPage
        * @param \LayoutModel $objLayout
        * @param \PageRegular $objPageRegular
        * @return mixe
        */
       public function generatePage(\PageModel $objPage, \LayoutModel $objLayout, \PageRegular $objPageRegular)
       {

              if ($_SESSION['uploaderProgressbar'])
              {
                     $json = json_encode($_SESSION['uploaderProgressbar']);
                     echo $json;
                     unset($_SESSION['uploaderProgressbar']);
                     exit;
              }
       }
}