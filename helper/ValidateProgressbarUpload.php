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
       public function validateFeFileupload(\Widget $objWidget, $intId)
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
                                   $json['serverResponse'] = $GLOBALS['TL_LANG']['form_upload_progressbar']['uploaded_successfully'];
                            }

                            $_SESSION['FORM_UPLOAD_PROGRESSBAR'][\Input::post('reqId')] = json_encode($json);
                     }
              }
              return $objWidget;
       }

       public function processFormData($arrSubmitted, $arrData, $arrFiles, $arrLabels, $objForm)
       {
              if (strlen($_SESSION['FORM_UPLOAD_PROGRESSBAR'][\Input::post('reqId')]))
              {
                     echo $_SESSION['FORM_UPLOAD_PROGRESSBAR'][\Input::post('reqId')];
                     unset($_SESSION['FORM_UPLOAD_PROGRESSBAR'][\Input::post('reqId')]);

                     $_SESSION['FILES'] = array(); // DO NOT CHANGE

                     // Add a log entry
                     if (FE_USER_LOGGED_IN)
                     {
                            $this->import('FrontendUser', 'User');
                            $this->log('Form "' . $objForm->title . '" has been submitted by "' . $this->User->username . '".', __METHOD__, TL_FORMS);
                     }
                     else
                     {
                            $this->log('Form "' . $objForm->title . '" has been submitted by ' . \System::anonymizeIp(\Environment::get('ip')) . '.', __METHOD__, TL_FORMS);
                     }
                     exit;
              }
       }

} 