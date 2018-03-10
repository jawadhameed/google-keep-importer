// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, (tabs) => {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function addKeepNote(result) {
    /* chrome.tabs.executeScript({
    file: 'script.js'
    }); */

    chrome.storage.local.set({
        result: result
    }, function () {
        chrome.tabs.executeScript({
            file: 'script.js'
        });
    });
}

function readEntries(entries, callback) {
    var promiseArray = [];
    var entryLength = entries.length;
    for (i = 0; i < entryLength; i++) {
        var entry = entries[i];
        // if inside folder
        var fileName = entry.filename.substring(entry.filename.lastIndexOf("/") + 1);

        if (fileName != null && fileName !== '' && fileName !== 'index.html') {
            // alert(fileName);
            promiseArray.push(extractNoteData(entry));
        }
    }

    Promise.all(promiseArray).then(values => {
        var notesArray = [];
        values.forEach(function (text) {
            // text contains the entry data as a String
            var el = new DOMParser().parseFromString(text, "text/html");
            var time = el.getElementsByClassName("heading");
            var title = el.getElementsByClassName("title");
            var content = el.getElementsByClassName("content");

            var noteContent = {
                time: '',
                title: '',
                content: ''
            };
            if (time[0]) noteContent.time = new Date(time[0].textContent);
            if (title[0]) noteContent.title = title[0].innerHTML;
            if (content[0]) noteContent.content = content[0].innerHTML;
            notesArray.push(noteContent);
        });
        notesArray.sort(function compare(a, b) {
            return a.time - b.time;
        });
        addKeepNote(notesArray);
        callback();
    }).catch(reason => {
        console.log(JSON.stringify(reason));
    });
}

function extractNoteData(entry) {
    return new Promise((resolve, reject) => {
        // get first entry content as text
        entry.getData(new zip.TextWriter(), function (text) {
            resolve(text);
        }, function (current, total) {
            // onprogress callback
        });
    });
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {
        zip.workerScriptsPath = "/lib/";
        var fileSelector = document.getElementById('file_select');

        fileSelector.onchange = function () {
            var file = fileSelector.files[0];

            var reader = new FileReader();
            reader.onload = function (e) {
                // alert(e.target.result);
                // addKeepNote(e.target.result);
            };
            reader.readAsText(file);

            // use a BlobReader to read the zip from a Blob object
            zip.createReader(new zip.BlobReader(file), function (reader) {
                // get all entries from the zip
                reader.getEntries(function (entries) {
                    if (entries.length) {
                        readEntries(entries, function () {
                            // close the zip reader
                            reader.close(function () {
                                // onclose callback
                            });
                        });
                    }
                });
            }, function (error) {
                // onerror callback
            });
        };
    });
});
