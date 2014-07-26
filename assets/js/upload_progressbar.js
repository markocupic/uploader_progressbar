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

    requests: [],

    runningRequests: null,

    pendingUploads: null,

    submitButton: null,

    files: null,

    fileInputField: null,

    messages: [],

    init: function (fieldId, options) {
        var self = this;

        // set options
        if (options) {
            Object.keys(options).forEach(function (key) {
                self.options[key] = options[key];

            });
        }

        self.fieldId = fieldId;
        // set the form object
        self.form = self.findParentBySelector(document.getElementById('ctrl_' + self.fieldId), 'form');

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


        if (document.querySelector('#' + self.form.id + ' .submit')) {
            self.submitButton = document.querySelector('#' + self.form.id + ' .submit');
        } else {
            alert('Please add a submit button to your form.');
        }

    },

    fileChange: function (fileInputField) {
        var self = this;

        self.fileInputField = fileInputField;
        var self = this;
        self.abortAllRequests();


        //remove all rows
        var node = document.getElementById('infoBox_' + self.fieldId);
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }

        // hide submit button when files are selected
        if (self.submitButton) {
            self.submitButton.style.visibility = 'visible';
        }

        var fileList = self.fileInputField.files;
        self.files = self._getFiles(fileList);

        if (self.files.length < 1) {
            return;
        }

        self.pendingUploads = self.files.length

        self.files.forEach(function (file, index) {
            var cls = index % 2 == 0 ? 'even' : 'odd';

            var holder = document.createElement('div');
            holder.classList.add(cls);
            holder.classList.add('holder');
            holder.setAttribute('id', 'info_' + self.fieldId + '_' + index);
            document.getElementById('infoBox_' + self.fieldId).appendChild(holder);

            var stateBox = document.createElement('div');
            stateBox.setAttribute('id', 'stateBox_' + self.fieldId + '_' + index);
            stateBox.classList.add('stateBox');
            holder.appendChild(stateBox);

            var fileNameBox = document.createElement('div');
            fileNameBox.setAttribute('id', 'fileNameBox' + self.fieldId + '_' + index);
            fileNameBox.classList.add('fileNameBox');
            fileNameBox.innerHTML = file.name;
            holder.appendChild(fileNameBox);

            var fileSizeBox = document.createElement('div');
            fileSizeBox.setAttribute('id', 'fileSizeBox_' + self.fieldId + '_' + index);
            fileSizeBox.classList.add('fileSizeBox');
            fileSizeBox.innerHTML = file.size + ' bytes';
            holder.appendChild(fileSizeBox);

            var fileTypeBox = document.createElement('div');
            fileTypeBox.setAttribute('id', 'fileTypeBox_' + self.fieldId + '_' + index);
            fileTypeBox.classList.add('fileTypeBox');
            fileTypeBox.innerHTML = 'type: ' + file.type;
            holder.appendChild(fileTypeBox);

            var percentBox = document.createElement('div');
            percentBox.setAttribute('id', 'percentBox_' + self.fieldId + '_' + index);
            percentBox.classList.add('percentBox');
            percentBox.innerHTML = "0%";
            holder.appendChild(percentBox);

            var progressBox = document.createElement('progress');
            progressBox.setAttribute('id', 'progressBarBox_' + self.fieldId + '_' + index);
            progressBox.value = 0;
            progressBox.max = 100;
            holder.appendChild(progressBox);
        });
    },

    initUpload: function () {
        var self = this;
        if (self.requests.length) {
            alert("Don't press the submit button twice");
            return;
        }

        // hide the submit button
        self.submitButton.style.visibility = 'hidden';

        //abort all pending requests
        self.abortAllRequests();
        self.runningRequests = 0;

        self.files.forEach(function (file, index) {
            //create XMLHttpRequest object
            var oReq = new XMLHttpRequest();
            oReq.id = Math.floor(Math.random() * 100000) + 1;
            self.requests[index] = oReq;
            oReq.file = file;
            oReq.index = index;
            oReq.stateBox = document.getElementById('stateBox_' + self.fieldId + '_' + index);
            oReq.stateBox.parentNode.classList.add('onprogress');
            self.uploadFile(index, oReq);
        });

    },

    uploadFile: function (index, oReq) {
        var self = this;
        var file = oReq.file;

        // limit simultaneous requests
        if (self.runningRequests >= self.options.maxSimultaneousRequests) {
            window.setTimeout(function () {
                self.uploadFile(index, oReq);
            }, 500);
            return;
        }

        // increase class var runningRequests by 1
        self.runningRequests++;

        // reset progress-bar and percent value
        self.resetRow(index);

        // create the formData object
        var formData = new FormData();

        //add file object to the formData object
        formData.append(self.fileInputField.name, file);

        //add the requestId to the formData object
        formData.append('reqId', oReq.id);

        // add value of hidden input fields to the formData object -> REQUEST_TOKEN, MAX_FILE_SIZE, FORM_SUBMIT
        document.querySelectorAll('#' + self.form.id + ' .formbody input').forEach(function (el) {
            if (el.type == 'hidden') {
                if (el.name == 'FORM_SUBMIT' || el.name == 'MAX_FILE_SIZE' || el.name == 'REQUEST_TOKEN') {
                    formData.append(el.name, el.value);
                }
            }
        });

        // needed for the formValidate-Hook
        formData.append('FORM_UPLOAD_PROGRESSBAR', 'true');

        // add events to the request object
        oReq.addEventListener("load", function (event) {
            self._transferComplete(event, oReq);
            self.runningRequests--;
            self.pendingUploads--;
            if (self.pendingUploads == 0) {
                self.loadOtherFieldsToServer();
            }
        }, false);

        oReq.addEventListener("error", function () {
            oReq.abort();
            self.resetRow(index);
            self.runningRequests--;
            self.pendingUploads--;
            oReq.stateBox.innerHTML = self.messages['defaultUploadError'];

        });

        oReq.addEventListener("abort", function () {
            var self = this;
            self.runningRequests--;
            oReq.stateBox.innerHTML = self.messages['uploadAborted'];
            oReq.stateBox.classList.add('error');
            self.pendingUploads--;
            if (self.pendingUploads == 0) {
                alert(self.messages['allUploadsAborted']);
            }
        });

        oReq.upload.addEventListener("progress", function (event) {
            var percent = Math.round(100 / event.total * event.loaded);
            self.setProgressBarValue(index, percent);
            self.setPercentValue(index, percent);
        });

        // specify the type of request
        oReq.open("POST", self.form.action + '?isAjax=true', true);

        // send  the request off to the server
        oReq.send(formData);
    },

    _transferComplete: function (event, oReq) {
        var self = this;

        try {
            // get the server-response
            var json = JSON.parse(oReq.responseText);
            var hasError = true;
            // eval server response (formValidateHook)
            if (json.state == 'success') {
                self.setPercentValue(oReq.index, 100);
                self.setProgressBarValue(oReq.index, 100);
                oReq.stateBox.innerHTML = json.serverResponse;
                oReq.stateBox.parentNode.classList.remove('onprogress');
                oReq.stateBox.classList.add('success');
                hasError = false;
            }
            else if (json.state == 'error') {
                oReq.stateBox.innerHTML = json.errorMsg;
                oReq.stateBox.classList.add('error');
                oReq.stateBox.parentNode.classList.remove('onprogress');
                hasError = false;
            }
            else {
                oReq.abort();
                oReq.stateBox.classList.add('error');
                oReq.stateBox.innerHTML = self.messages['defaultUploadError2'];
            }
        }
        catch (err) {
            oReq.abort();
            oReq.stateBox.classList.add('error');
            oReq.stateBox.innerHTML = self.messages['defaultUploadError2'];
        }
        if (hasError) {
            oReq.stateBox.innerHTML = self.messages['defaultUploadError'];
        }

    },

    abortAllRequests: function () {
        var self = this;

        if (self.requests !== null) {
            self.requests.forEach(function (oReq) {
                oReq.abort();
                oReq.stateBox.parentNode.classList.remove('onprogress');
            });
        }
        self.requests = [];
    },

    setProgressBarValue: function (index, value) {
        var self = this;
        document.getElementById("progressBarBox_" + self.fieldId + '_' + index).value = value;
    },

    setPercentValue: function (index, value) {
        var self = this;
        document.getElementById('percentBox_' + self.fieldId + '_' + index).innerHTML = value + '%';
    },
    _getFiles: function (fileList) {

        var files = [];
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


    resetRow: function (index) {
        var self = this;
        self.setProgressBarValue(index, 0);
        self.setPercentValue(index, 0);
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

