// Downloads page UI: render entries, update progress, handle cancel/open.
//
// Loaded on vise:downloads (vise/data/downloads.html). Exposes
// window.create_download and window.update_download for the host to call.
//
// Source of truth: client/downloads.pyj (rapydscript).

import E from './elementmaker.js';
import { humanizeSize } from './humanize.js';
import { callback } from './communicate.js';

const CALLBACK_NAME = 'vise_downloads_page';

function cancelDownload(dlId) {
    callback(CALLBACK_NAME, { id: parseInt(dlId, 10), cmd: 'cancel' });
}

function openDownload(dlId) {
    callback(CALLBACK_NAME, { id: parseInt(dlId, 10), cmd: 'open' });
}

function formatTimeLeft(seconds) {
    if (seconds < 60) {
        const secs = Math.round(seconds);
        return secs === 1 ? 'in 1 second' : `in ${secs} seconds`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins < 60) {
        if (secs > 0) {
            return `in ${mins} ${mins === 1 ? 'minute' : 'minutes'} ${secs} ${secs === 1 ? 'second' : 'seconds'}`;
        }
        return mins === 1 ? 'in 1 minute' : `in ${mins} minutes`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins2 = Math.round((seconds % 3600) / 60);
    if (mins2 > 0) {
        return `in ${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins2} ${mins2 === 1 ? 'minute' : 'minutes'}`;
    }
    return hours === 1 ? 'in 1 hour' : `in ${hours} hours`;
}

function createDownload(dlId, fname, mimeType, iconUrl, hostname) {
    document.getElementById('init').style.display = 'none';
    const div = E.div(
        { style: 'padding: 3ex; display: table; width: 90%; border-bottom: solid 1px currentColor' },
        E.img({
            src: iconUrl, alt: fname,
            style: 'width: 64px; height: 64px; margin-right: 1em; float:left; display:table-cell',
        }),
        E.div({ style: 'float:left; display:table-cell' },
            E.p(
                E.b({ id: 'fname' + dlId }, fname),
                E.br(),
                E.span('...', {
                    id: 'status' + dlId,
                    style: 'color:gray',
                    'data-hostname': hostname,
                    'data-created': String(Date.now()),
                }),
            ),
        ),
        E.div(
            E.br(),
            E.span('✖ ', {
                class_: 'stop',
                style: 'font-size: x-large; cursor:pointer',
                title: 'Stop download',
            }),
            { id: 'stop' + dlId, style: 'float:right;' },
        ),
    );
    document.body.insertBefore(div, document.body.firstChild);
    updateDownload(dlId, 'running', -1, -1, 0, 0);
    document.getElementById('stop' + dlId)
        .addEventListener('click', () => cancelDownload(dlId));
}

function updateDownload(dlId, state, received, total, rate, avgRate) {
    const status = document.getElementById('status' + dlId);
    const h = humanizeSize;
    if (state === 'running') {
        if (received > -1 && total > -1) {
            if (rate > 0) {
                if (total > 0) {
                    const left = formatTimeLeft((total - received) / avgRate);
                    status.innerText = `${h(received)} of ${h(total)} at ${h(rate)}/s — Will finish ${left}`;
                } else {
                    status.innerText = `${h(received)} at ${h(rate)}/s`;
                }
            } else if (total > 0) {
                status.innerText = `${h(received)} of ${h(total)} — Estimating time remaining`;
            } else {
                status.innerText = h(received);
            }
        } else {
            status.innerText = 'Downloading, please wait...';
        }
    } else if (state === 'completed') {
        const fname = document.getElementById('fname' + dlId);
        if (fname) {
            if (!fname.getAttribute('class')) {
                fname.addEventListener('click', () => openDownload(dlId));
            }
            fname.setAttribute('class', 'fname');
            fname.setAttribute('title', 'Click to open');
        }
        let text = '';
        if (total === 0) total = received;
        if (total > -1) text += `${h(total)} — `;
        text += `${status.getAttribute('data-hostname')} — `;
        text += 'Completed';
        if (total > -1) {
            const finalRate = 1000 * total / (Date.now() - parseInt(status.getAttribute('data-created'), 10));
            text += ` at ${h(finalRate)}/s`;
        }
        status.innerText = text;
    } else {
        text = state === 'canceled' ? 'Canceled' : 'Interrupted';
        text += ` — ${status.getAttribute('data-hostname')}`;
        status.innerText = text;
    }
    const stop = document.getElementById('stop' + dlId);
    stop.style.display = state === 'running' ? 'block' : 'none';
}

export function downloadsMain() {
    window.create_download = createDownload;
    window.update_download = updateDownload;
    document.getElementsByTagName('style')[0].innerText += `
        .stop:hover { color: red }
        .fname { cursor: pointer }
        .fname:hover { color: red; font-style: italic }
    `;
    callback(CALLBACK_NAME, { cmd: 'inited' });
}
