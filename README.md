# Google Keep Importer

Easily imports your backup file from Google Takeout into Google Keep as notes.

## Notes

* This is a highly **experimental** Chrome extension.
* Since Google Keep does not provide any open API I am using directly the website of the service. Therefore, in order for you to use the extension you **have to** be logged in to your account and be on the Google Keep website. - https://keep.google.com/#home
* **Caution** - The extension might become unusable at any time in case Google updates the website of Google Keep since the structure of the page (class names) is used throughout the extension. I will try to update it whenever I notice something broke.

## How to use

1. First goto https://takeout.google.com/. Click the **Select None** option and then scroll down to select the **Keep** toggle.
2. Click **NEXT**. Select **File Type = zip** (very important). Leave **Archive Size** to default and **Delivery method = Send download link via email**.
3. Click **CREATE ARCHIVE**. Once the archive is created you will get a download link in email. Go ahead and download the backup archive.
4. Install the plugin from Chrome extension store: https://chrome.google.com/webstore/detail/
5. Now visit the Google Keep website and log in, https://keep.google.com/#home
6. Click the **Google Keep Importer** icon on your Chrome extension bar to open the small popup of this extension 
7. Select the file you downloaded earlier from your system. Please be patient as depending on the file size it may take a while.
8. Please dont close the window until the sync function has completed otherwise the notes will be lost.
9. Done ;)

## Todos - Future work

* Handle checkbox items properly.
* Use the backgroud colour of the original note.
* Find a way to import images and drawings.

## Credits

* This extension borrows some of the core functions from https://github.com/lambrospetrou/gmail-keep-importer. So please head there and say hi. I have also shamelessly ripped off some of the documentation as well :).

## Feedback / Suggestions

Please provide some feedback with the errors you get or suggestions you have.

### Debug the extension

* Visit chrome://extensions
* Enable the **Developer Mode**
* Open the **Console** from Chrome's developer tools
    * **Right click** the extension's icon
    * Click **Inspect Popup**
    * Open the **Console** tab in order to see any error message or logging message
* Follow the **How to use** procedure again
