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
    let queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        let tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        let url = tab.url;

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
    // let url;
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
    let promiseArray = [];
    let entryLength = entries.length;
    for (i = 0; i < entryLength; i++) {
        let entry = entries[i];
        // if inside folder
        let fileName = entry.filename.substring(entry.filename.lastIndexOf("/") + 1);

        if (fileName != null && fileName !== '' && fileName !== 'index.html') {
            // alert(fileName);
            promiseArray.push(extractNoteData(entry));
        }
    }

    Promise.all(promiseArray).then(values => {
        let notesArray = [];
        values.forEach(function (text) {
            // text contains the entry data as a String
            let el = new DOMParser().parseFromString(text, "text/html");
            let archived = el.getElementsByClassName("archived");
            let time = el.getElementsByClassName("heading");
            let title = el.getElementsByClassName("title");
            let content = el.getElementsByClassName("content");

            let noteContent = {
                time: '',
                archived: false,
                title: '',
                content: ''
            };
            if (archived[0]) noteContent.archived = true;
            if (time[0]) noteContent.time = new Date(time[0].textContent);
            if (title[0]) noteContent.title = title[0].innerHTML;
            if (content[0]) {
                let listItem = content[0].getElementsByClassName("listitem");
                if (listItem[0]) {
                    for (let i = 0; i < listItem.length; i++) {
                        let bullet = listItem[i].getElementsByClassName("bullet");
                        if (bullet[0]) noteContent.content += bullet[0].textContent;
                        let text = listItem[i].getElementsByClassName("text");
                        if (text[0]) noteContent.content += text[0].textContent + '<br>';
                    }
                } else {
                    noteContent.content = content[0].innerHTML;
                }
            }
            notesArray.push(noteContent);
        });
        notesArray.sort(function compare(a, b) {
            return a.time - b.time;
        });
        addKeepNote(notesArray);
        callback();
    }).catch(reason => {
        alert("Something went wrong please inform the developer.");
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

document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {
        zip.workerScriptsPath = "/lib/";
        let fileSelector = document.getElementById('file_select');

        fileSelector.onchange = function () {
            let file = fileSelector.files[0];

            let reader = new FileReader();
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
