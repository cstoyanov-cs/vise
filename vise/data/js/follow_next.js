// Follow the "Next" / "Previous" link on the current page.
//
// Source of truth: client/follow_next.pyj (rapydscript).

import { connectSignal } from './communicate.js';
import {
    frameIter, broadcastAction, sendAction, registerHandler,
} from './frames.js';
import { iterVisibleLinks } from './links.js';
import { followLink, isVisible } from './utils.js';

const NEXT_REGEXPS = [
    /^\s*Next Page\s*$/i, /^\s*Next [>»]/i, /\bNext\b/i,
    /^>$/, /^(>>|»)$/, /^(>|»)/, /(>|»)$/, /\bMore\b/i,
];

const PREV_REGEXPS = [
    /^\s*Prev(ious)? Page\s*$/i, /[<«] Prev\s*$/i, /\bprev(ious)?\b/i,
    /^<$/, /^(<<|«)$/, /^(<|«)/, /(<|«)$/,
];

let requestId = 0;
let requestServiced = false;

function findLinkInWin(win, forward) {
    const regexps = forward ? NEXT_REGEXPS : PREV_REGEXPS;
    for (const elem of iterVisibleLinks(win, regexps)) {
        return elem;
    }
    return null;
}

function followNext(forward) {
    const elem = findLinkInWin(window.self, forward);
    if (elem) {
        followLink(elem);
    } else {
        requestId += 1;
        requestServiced = false;
        broadcastAction(
            frameIter(window.self, isVisible),
            'follow_next_search', requestId, forward,
        );
    }
}

function followNextFound(currentFrameId, sourceFrameId, sourceFrame, remoteRequestId, wasFound) {
    if (!wasFound) return;
    const doIt = remoteRequestId === requestId && !requestServiced;
    sendAction(sourceFrame, 'follow_next_execute', remoteRequestId, doIt);
    if (doIt) requestServiced = true;
}

// Child-frame state
let currentFollowNextCandidate = null;

function followNextSearch(currentFrameId, sourceFrameId, sourceFrame, rid, forward) {
    const elem = findLinkInWin(window.self, forward);
    if (elem) currentFollowNextCandidate = [elem, rid];
    sendAction(sourceFrame, 'follow_next_found', rid, Boolean(elem));
}

function followNextExecute(currentFrameId, sourceFrameId, sourceFrame, rid, doIt) {
    if (!currentFollowNextCandidate) return;
    const [elem, candidateRid] = currentFollowNextCandidate;
    currentFollowNextCandidate = null;
    if (doIt && candidateRid === rid) followLink(elem);
}

export function followNextOnload() {
    if (window.self === window.top) {
        connectSignal('follow_next', followNext);
        registerHandler('follow_next_found', followNextFound);
    } else {
        registerHandler('follow_next_search', followNextSearch);
        registerHandler('follow_next_execute', followNextExecute);
    }
}
