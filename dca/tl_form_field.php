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
 * Table tl_form_field
 */
$GLOBALS['TL_DCA']['tl_form_field']['palettes']['upload_progressbar'] = '{type_legend},type,name,label;{fconfig_legend},mandatory,multifile,extensions,maxlength;{store_legend:hide},storeFile;{expert_legend:hide},class,accesskey,tabindex,fSize;{template_legend:hide},customTpl;{submit_legend},addSubmit';
$GLOBALS['TL_DCA']['tl_form_field']['fields']['multifile'] = array
(
       'label'                   => &$GLOBALS['TL_LANG']['tl_form_field']['multifile'],
       'exclude'                 => true,
       'inputType'               => 'checkbox',
       'eval'                    => array('submitOnChange'=>true, 'tl_class'=>'clr'),
       'sql'                     => "char(1) NOT NULL default ''"
);