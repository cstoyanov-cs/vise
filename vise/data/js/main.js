// Client entry point. Detects which page we are on (downloads vs welcome vs
// regular browsing) and wires up the right module set.
//
// Source of truth: client/main.pyj (rapydscript).

import { initCrypto } from './crypto.js';
import { registerFrames } from './frames.js';
import { focusOnload } from './focus.js';
import { downloadsMain } from './downloads.js';
import { followNextOnload } from './follow_next.js';
import { passwdOnload } from './passwd.js';
import { hintsOnload } from './hints.js';
import { editOnload } from './edit.js';

function onDocumentLoaded() {
    const isDownloadsPage = document.location.href === 'vise:downloads';
    if (isDownloadsPage) {
        downloadsMain();
        hintsOnload();
    } else {
        focusOnload();
        followNextOnload();
        passwdOnload();
        hintsOnload();
        editOnload();
    }
}

initCrypto(registerFrames).then(() => {
    document.addEventListener('DOMContentLoaded', onDocumentLoaded);
});
