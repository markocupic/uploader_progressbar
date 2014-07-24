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
        maxSimultaneousRequests: 6
    },

    fieldId: null,

    action: null,

    form: null,

    requests: [],

    runningRequests: null,

    submitButton: null,

    files: null,

    fileInputField: null,

    init: function (fieldId, options) {

        var self = this;

        // set options
        if (options) {
            Object.keys(options).forEach(function (key) {
                self.options[key] = options[key];

            });
        }

        this.fieldId = fieldId;
        // set the form object
        this.form = this.findParentBySelector(document.getElementById('ctrl_' + self.fieldId), 'form');

        this.form.addEventListener('submit',function (evt) {
            if (evt.preventDefault) {
                evt.preventDefault();
                self.initUpload();
            }
            return false;
        }, false);


        if(document.querySelector('#' + this.form.id + ' .submit'))
        {
            this.submitButton = document.querySelector('#' + this.form.id + ' .submit');
        }else{
            alert('Please add a submit button to your form.');
        }

    },

    fileChange: function (fileInputField) {

        this.fileInputField = fileInputField;
        var self = this;
        this.killAllRequests();


        //remove all rows
        var node = document.getElementById('infoBox_' + self.fieldId);
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }

        // hide submit button when files are selected
        if(this.submitButton){
            this.submitButton.style.visibility = 'visible';
        }

        var fileList = this.fileInputField.files;
        this.files = this._getFiles(fileList);

        if (this.files.length < 1) {
            return;
        }

        this.files.forEach(function (file, index) {
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
        if (this.requests.length) {
            alert("Don't press the submit button twice");
            return;
        }

        // hide the submit button
        this.submitButton.style.visibility = 'hidden';

        //abort all pending requests
        this.killAllRequests();
        this.runningRequests = 0;

        this.files.forEach(function (file, index) {
            //create XMLHttpRequest object
            var oReq = new XMLHttpRequest();
            oReq.id = Math.floor(Math.random()*100000) + 1;
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
        if (this.runningRequests >= this.options.maxSimultaneousRequests) {
            window.setTimeout(function () {
                self.uploadFile(index, oReq);
            }, 5000);
            return;
        }

        // increase class var runningRequests by 1
        this.runningRequests++;

        // reset progress-bar and percent value
        self.resetRow(index);

        // create the formData object
        var formData = new FormData();

        //add file object to the formData object
        formData.append(self.fileInputField.name, file);

        //add the requestId to the formData object
        formData.append('reqId', oReq.id);

        // add value of hidden input fields to the formData object -> REQUEST_TOKEN, MAX_FILE_SIZE, FORM_SUBMIT
        document.querySelectorAll('#' + this.form.id + ' .formbody input').forEach(function (el) {
            //if (el.type == 'hidden') {
                formData.append(el.name, el.value);
            //}
        });

        // needed for the formValidate-Hook
        formData.append('FORM_UPLOAD_PROGRESSBAR', 'true');

        // add events to the request object
        oReq.addEventListener("load", function (event) {
            self._transferComplete(event, oReq);
            self.runningRequests--;
        }, false);

        oReq.addEventListener("error", function () {
            oReq.abort();
            self.resetRow(index);
            self.runningRequests--;
        });

        oReq.upload.addEventListener("progress", function (event) {
            var percent = Math.round(100 / event.total * event.loaded);
            self.setProgressBarValue(index, percent);
            self.setPercentValue(index, percent);
        });

        oReq.addEventListener("abort", function () {
            var self = this;
            self.runningRequests--;
            oReq.stateBox.innerHTML = 'Upload abgebrochen!';
            oReq.stateBox.classList.add('error');
        });

        // specify the type of request
        oReq.open("POST", this.form.action, true);

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
            }
        }
        catch (err) {
            oReq.abort();
            oReq.stateBox.classList.add('error');
            oReq.stateBox.innerHTML = 'Die Datei konnte nicht auf den Server geladen werden.'
            alert(oReq.responseText);
        }
        if(hasError){
            oReq.stateBox.innerHTML = 'Die Datei konnte nicht auf den Server geladen werden.'
        }

    },

    killAllRequests: function () {
        if (this.requests !== null) {
            this.requests.forEach(function (oReq) {
                oReq.abort();
                oReq.stateBox.parentNode.classList.remove('onprogress');
            });
        }
        this.requests = [];
    },

    setProgressBarValue: function (index, value) {
        document.getElementById("progressBarBox_" + this.fieldId + '_' + index).value = value;
    },

    setPercentValue: function (index, value) {
        document.getElementById('percentBox_' + this.fieldId + '_' + index).innerHTML = value + '%';
    },
    _getFiles: function (fileList) {

        var files = [];
        if (typeof fileList == 'object' && fileList !== null) {
            if (fileList.length) {
                for (var key in fileList) {
                    //hasOwnProperty isn't supported by ie11
                    // if(Object.prototype.hasOwnProperty(key)){
                    if (typeof fileList[key] == 'object') {
                        if (fileList[key].name != 'undefined') {
                            files.push(fileList[key]);
                        }
                    }
                    //}
                }
            }
        }
        return files;
    },


    resetRow: function (index) {
        this.setProgressBarValue(index, 0);
        this.setPercentValue(index, 0);
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
    }
};