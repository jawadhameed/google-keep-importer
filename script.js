(function () {
    let LP = {
        keepElemTextPlaceholder: '.h1U9Be-YPqjbf[role=textbox]',
        keepElemDone: '.IZ65Hb-iib5kc[role=button]',
        keepElemTitle: '.IZ65Hb-YPqjbf.r4nke-YPqjbf[role=textbox]',
        dom: document
    };

    function createKeepNote(title, content) {
        openNewNote();
        addText(title, content);
        triggerDone();
    }

    function openNewNote() {
        LP.dom.querySelector(LP.keepElemTextPlaceholder).click();
    }

    function addText(title, content) {
        /* if (!title || title === '' || !content || content === '') {
            return;
        }
        let title = extractFirstLine(txt);
        let content = txt.substring(title.length).trim(); */

        let formattedContent = content.replace(/<br ?\/?>/g, "\n");

        let titleArea = LP.dom.querySelector(LP.keepElemTitle);
        let textTitle = LP.dom.createTextNode(title);
        titleArea.appendChild(textTitle);
        fireEvent(titleArea, 'change');
        fireEvent(titleArea, 'mousedown');
        fireEvent(titleArea, 'mouseup');

        let contentArea = LP.dom.querySelector(LP.keepElemTextPlaceholder);
        let textContent = LP.dom.createTextNode(formattedContent);
        contentArea.appendChild(textContent);
        fireEvent(contentArea, 'change');
        fireEvent(contentArea, 'mousedown');
        fireEvent(contentArea, 'mouseup');
        /*
        let text = LP.dom.createTextNode(txt);
        let contentArea = LP.dom.querySelector(LP.keepElemTextPlaceholder).nextSibling;
        contentArea.appendChild(text);
        fireEvent(contentArea, 'change');
        fireEvent(LP.dom.querySelector(LP.keepElemTextPlaceholder).nextSibling, 'mousedown');
        fireEvent(LP.dom.querySelector(LP.keepElemTextPlaceholder).nextSibling, 'mouseup');
         */
    }

    /**
     * Return the first line of the given text (from start till the first occurence of \n or the end of the string).
     * If empty string then return empty string.
     */
    function extractFirstLine(txt) {
        if (!txt || txt === '') {
            return '';
        }
        let newLinePos = txt.indexOf('\n');
        if (newLinePos === -1) {
            return txt;
        }
        return txt.substr(0, newLinePos).trim();
    }

    function triggerDone() {
        fireEvent(LP.dom.querySelector(LP.keepElemDone), 'mousedown');
        fireEvent(LP.dom.querySelector(LP.keepElemDone), 'mouseup');
    }

    /**
     * Fire an event handler to the specified node. Event handlers can detect that the event was fired programatically
     * by testing for a 'synthetic=true' property on the event object
     * @param {HTMLNode} node The node to fire the event handler on.
     * @param {String} eventName The name of the event without the "on" (e.g., "focus")
     */
    function fireEvent(node, eventName) {
        // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
        let doc;
        if (node.ownerDocument) {
            doc = node.ownerDocument;
        } else if (node.nodeType == 9) {
            // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
            doc = node;
        } else {
            throw new Error("Invalid node passed to fireEvent: " + node.id);
        }

        if (node.dispatchEvent) {
            // Gecko-style approach (now the standard) takes more work
            let eventClass = "";

            // Different events have different event classes.
            // If this switch statement can't map an eventName to an eventClass,
            // the event firing is going to fail.
            switch (eventName) {
                case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
                case "mousedown":
                case "mouseup":
                    eventClass = "MouseEvents";
                    break;

                case "focus":
                case "change":
                case "blur":
                case "select":
                    eventClass = "HTMLEvents";
                    break;

                default:
                    throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                    break;
            }
            let event = doc.createEvent(eventClass);

            let bubbles = eventName == "change" ? false : true;
            event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

            event.synthetic = true; // allow detection of synthetic events
            // The second parameter says go ahead with the default action
            node.dispatchEvent(event, true);
        } else if (node.fireEvent) {
            // IE-old school style
            let event = doc.createEventObject();
            event.synthetic = true; // allow detection of synthetic events
            node.fireEvent("on" + eventName, event);
        }
    }

    chrome.storage.local.get('result', function (items) {
        chrome.storage.local.remove('result');
        items.result.forEach(function (note) {
            createKeepNote(note.title, note.content);
        });
        alert('All done, have a good day :)');
    });
})();
