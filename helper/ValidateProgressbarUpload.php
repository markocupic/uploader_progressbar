<?php
/**
 * Created by PhpStorm.
 * User: Marko
 * Date: 24.07.14
 * Time: 14:54
 */

namespace Contao;


class ValidateProgressbarUpload extends \System
{

       /**
        * validateFormField-Hook
        * @param \Widget $objWidget
        * @param $intId
        */
       public function validateFormField($objWidget, $formId, $arrData, $objForm)
       {
              if ($objWidget instanceof \FormFileUploadProgressbar)
              {
                     if (\Input::post('FORM_UPLOAD_PROGRESSBAR'))
                     {
                            $json = array();
                            if ($objWidget->hasErrors() === true)
                            {
                                   $json['state'] = 'error';
                                   $json['errorMsg'] = $objWidget->getErrorAsString();
                            }
                            else
                            {
                                   $json['state'] = 'success';
                                   $json['serverResponse'] = $GLOBALS['TL_LANG']['form_upload_progressbar']['messages']['uploadedSuccessfully'];
                            }

                            die(json_encode($json));
                     }
              }
              return $objWidget;
       }
}