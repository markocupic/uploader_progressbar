// makes it possible to iterate trough a node list
// https://gist.github.com/DavidBruant/1016007
NodeList.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.forEach = Array.prototype.forEach;

/**
 * Class to handle fileuploads
 * no javascript framework needed
 * @type {Class}
 * @author Marko Cupic
 */

// constructor
function ProgressBarUpload() {
    //
}


ProgressBarUpload.prototype = {

    options: {
        // simultaneous requests
        maxSimultaneousRequests: 1
    },

    fieldId: null,

    action: null,

    form: null,

    submitButton: null,

    files: null,

    fileInputField: null,

    messages: [],

    statusContainer: null,

    progressBox: null,

    percentBox: null,

    messageBox: null,

    reloadLink: null,

    redirectWarning: null,

    init: function (fieldId, options) {
        var self = this;
        self.fieldId = fieldId;
        // set options
        if (options) {
            Object.keys(options).forEach(function (key) {
                self.options[key] = options[key];

            });
        }

        // set the form object
        self.form = self.findParentBySelector(document.getElementById('ctrl_' + self.fieldId), 'form');
        self.fileInputField = document.querySelector('#' + self.form.id + ' .formbody input[type=file]');

        // get files
        self.files = self.fileInputField.files;

        // prevent http request
        self.form.classList.add('dont_submit');

        self.form.addEventListener('submit', function (evt) {
            if (!self.files) {
                return;
            }
            if (self.files.length == 0) {
                return;
            }
            if (self.form.classList.contains('dont_submit')) {
                if (evt.preventDefault) {
                    evt.preventDefault();
                    self.initUpload();
                }
                return false;
            }

        }, false);

        var statusContainer = document.createElement('div');
        statusContainer.classList.add('statusContainer');
        statusContainer.setAttribute('id', 'info_' + self.form.id);
        document.querySelector('#' + self.form.id + ' .formbody').appendChild(statusContainer);
        self.statusContainer = statusContainer;
        self.statusContainer.classList.add('visibilityHidden');

        var messageBox = document.createElement('div');
        messageBox.setAttribute('id', 'messageBox_' + self.form.id);
        messageBox.classList.add('messageBox');
        self.messageBox = messageBox;
        statusContainer.appendChild(messageBox);

        var percentBox = document.createElement('div');
        percentBox.setAttribute('id', 'percentBox_' + self.form.id);
        percentBox.classList.add('percentBox');
        percentBox.innerHTML = "0%";
        self.percentBox = percentBox;
        statusContainer.appendChild(percentBox);

        var progressBox = document.createElement('progress');
        progressBox.setAttribute('id', 'progressBarBox_' + self.form.id);
        progressBox.value = 0;
        progressBox.max = 100;
        self.progressBox = progressBox;
        statusContainer.appendChild(progressBox);

        if (document.querySelector('#' + self.form.id + ' .submit')) {
            self.submitButton = document.querySelector('#' + self.form.id + ' .submit');
        } else {
            alert('Please add a submit button to your form.');
        }

    },

    fileChange: function () {
        var self = this;
        self.files = self._getFiles(self.fileInputField);
    },

    initUpload: function () {
        var self = this;

        // hide the submit button
        self.toggleSubmitButton('hidden');

        //create XMLHttpRequest object
        var oReq = new XMLHttpRequest();

        // create the formData object
        var formData = new FormData(self.form);

        // needed for the formValidate-Hook
        formData.append('FORM_UPLOAD_PROGRESSBAR', 'true');

        // add events to the request object
        oReq.addEventListener("load", function (event) {
            self._transferComplete(event, oReq);
        }, false);

        oReq.addEventListener("error", function () {
            oReq.abort();
        });

        oReq.addEventListener("abort", function () {
            var self = this;

        });

        oReq.upload.addEventListener("progress", function (event) {
            self.statusContainer.classList.remove('visibilityHidden');
            self.progressBox.classList.remove('visibilityHidden');
            self.percentBox.classList.remove('visibilityHidden');
            self.messageBox.innerHTML = self.messages['formSent'];
            var percent = Math.round(100 / event.total * event.loaded);
            self.setProgressBarValue(percent);
            self.setPercentValue(percent);
        });

        // specify the type of request
        oReq.open("POST", self.form.action + '?isAjax=true', true);

        // send the ajax header
        oReq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        oReq.setRequestHeader("Accept","text/html, application/xml, text/xml, */*");

        // send  the request off to the server
        oReq.send(formData);

    },

    _transferComplete: function (event, oReq) {
        var self = this;
        try {
            // get the server-response
            var json = JSON.parse(oReq.responseText);

            // remove error messages
            var nodeList = document.querySelectorAll('p.error, p.validInput');
            nodeList.forEach(function (node) {
                node.parentNode.removeChild(node);
            });

            // check for a jumpTo page
            var jumpTo = false;
            if (json['jumpTo']) {
                if (json['jumpTo'] != '') {
                    var jumpTo = true;
                }
            }

            var error = false;
            for (var key in json) {
                var errorBox = document.createElement('p');
                if (!json[key]['type']) continue;
                if (json[key]['type'] != 'submit') {
                    // add/remove css classes
                    if (json[key]['state'] == 'error') {
                        errorBox.classList.remove('validInput');
                        errorBox.classList.add('error');
                        error = true;
                    }
                    if (json[key]['state'] == 'validInput') {
                        errorBox.classList.remove('error');
                        errorBox.classList.add('validInput');
                    }
                    // display a short message below each form field
                    errorBox.innerHTML = json[key]['serverResponse'];
                    var parent = document.getElementById(key).parentElement;

                    // insert response after the input field
                    insertedElement = parent.insertBefore(errorBox, document.getElementById(key).nextSibling);
                }

            }
            // if there is invalid input
            if (error === true) {
                self.toggleSubmitButton('visible');
                self.messageBox.innerHTML = self.messages['defaultUploadError'];
            } else { // if all ok
                // display message
                self.messageBox.innerHTML = self.messages['uploadedSuccessfully'];

                if (jumpTo === false) {
                    // display reload-form-link
                    var reloadLink = document.createElement('a');
                    self.reloadLink = reloadLink;
                    reloadLink.setAttribute('id', 'reloadLink_' + self.form.id);
                    reloadLink.classList.add('reloadLink');
                    reloadLink.setAttribute('href', self.form.action);
                    reloadLink.innerHTML = self.messages['reloadForm'];
                    self.statusContainer.appendChild(reloadLink);
                } else {
                    var redirectWarning = document.createElement('p');
                    self.redirectWarning = redirectWarning;
                    redirectWarning.setAttribute('id', 'redirectWarning' + self.form.id);
                    redirectWarning.classList.add('redirectWarning');
                    redirectWarning.innerHTML = self.messages['redirectWarning'];
                    self.statusContainer.appendChild(redirectWarning);
                }


                // hide form fields, if all ok
                var formFieldsIds = json['form_fields'];
                if (formFieldsIds.length) {
                    formFieldsIds.forEach(function (elId) {
                        if (document.getElementById(elId)) {
                            document.getElementById(elId).style.display = 'none';
                        }
                    });
                }
            }
            errorBox.classList.add('validInput');
            self.progressBox.classList.add('visibilityHidden');
            self.percentBox.classList.add('visibilityHidden');

            // redirect to jumpTo page
            if (jumpTo === true && error !== true) {
                window.setTimeout(function () {
                    window.location = window.location.protocol + '//' + window.location.hostname + '/' + json['jumpTo'];
                }, 2500);
            }
        }
        catch (err) {
            alert(err.message + err.stack);
            alert(self.messages['serverError']);
            //alert(oReq.responseTex);
        }
    },

    setProgressBarValue: function (value) {
        var self = this;
        document.getElementById("progressBarBox_" + self.form.id).value = value;
    },

    setPercentValue: function (value) {
        var self = this;
        document.getElementById('percentBox_' + self.form.id).innerHTML = value + '%';
    },

    _getFiles: function (fileInput) {

        var files = [];
        fileList = fileInput.files;
        if (typeof fileList == 'object' && fileList !== null) {
            if (fileList.length) {
                for (var key in fileList) {
                    if (typeof fileList[key] == 'object') {
                        if (fileList[key].name != 'undefined') {
                            files.push(fileList[key]);
                        }
                    }
                }
            }
        }
        return files;
    },

    toggleSubmitButton: function (state) {
        var self = this;

        if (state == 'visible') {
            if (self.submitButton) {
                self.submitButton.classList.remove('visibilityHidden');
            }
            return;
        }
        if (state == 'hidden') {
            if (self.submitButton) {
                self.submitButton.classList.add('visibilityHidden');
            }
            return;
        }

        if (self.submitButton) {
            self.submitButton.classList.toggle('visibilityHidden');
        }
    },

    //helper function for findParentBySelector(see below)
    _collectionHas: function (a, b) {
        for (var i = 0, len = a.length; i < len; i++) {
            if (a[i] == b) return true;
        }
        return false;
    },

    findParentBySelector: function (elm, selector) {
        var self = this;
        var all = document.querySelectorAll(selector);
        var cur = elm.parentNode;
        while (cur && !self._collectionHas(all, cur)) { //keep going up until you find a match
            cur = cur.parentNode; //go up
        }
        return cur; //will return null if not found
    },

    loadOtherFieldsToServer: function () {
        var self = this;
        var list = document.querySelectorAll('#' + self.form.id + ' .formbody input');
        var inputs = 0;
        list.forEach(function (el) {
            if (el.type != 'file' && el.type != 'submit' && el.type != 'hidden') {
                inputs++;
            }
        });
        if (inputs > 0) {
            if (confirm(self.messages['confirmSendByHttp'])) {
                self.form.classList.remove('dont_submit');
                // remove file input
                self.fileInputField.parentNode.removeChild(self.fileInputField);
                // send form by http
                setTimeout(function () {
                    self.form.submit()
                }, 500);
            }
        }

    }
};

