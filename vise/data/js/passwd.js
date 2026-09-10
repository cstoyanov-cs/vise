// Login form detection and autofill.
//
// Scans <form> elements for username/password fields, exposes them to the
// host for autofill, and reports submissions back. Coordinates across frames
// so the top frame can drive child-frame fills.
//
// Source of truth: client/passwd.pyj (rapydscript).

import {
    sendAction, registerHandler, broadcastAction, frameIter,
} from './frames.js';
import { jsToPython, connectSignal } from './communicate.js';

const INPUT_TYPES = new Set(['text', 'email', 'tel']);
const USERNAME_NAMES = new Set([
    'login', 'user', 'mail', 'email', 'username', 'id', 'identification',
    'login_email', 'login_id', 'login_username', 'txtUsrName', 'acct',
]);

function lower(value) {
    return (value ?? '').toLowerCase();
}

function getLoginInputs(form) {
    let username = null;
    let password = null;
    if (!form.querySelectorAll) return [null, null];
    for (const inp of form.querySelectorAll('input')) {
        if (username && password) break;
        const itype = lower(inp.getAttribute('type'));
        if (itype === 'password') {
            password = inp;
        } else if (INPUT_TYPES.has(itype)) {
            const name = lower(inp.name || inp.id || '');
            if (USERNAME_NAMES.has(name) || name.endsWith('_username')) {
                username = inp;
            }
        }
    }
    return [username, password];
}

function submitForm(form) {
    const buttons = [...form.querySelectorAll('button[type=submit]')];
    const inputs = [...form.querySelectorAll('input[type=submit]')];
    if (buttons.length) buttons.at(-1).click();
    else if (inputs.length) inputs.at(-1).click();
    else form.submit();
}

function isLoginForm(form) {
    const [un, pw] = getLoginInputs(form);
    return un !== null || pw !== null;
}

function passwordChanged(ev) {
    const pw = ev.currentTarget;
    if (pw.value) pw.dataset.viseLastPasswordValue = pw.value;
}

function formSubmitted(ev) {
    const form = ev.target;
    const [u, p] = getLoginInputs(form);
    const username = u?.value;
    const password = p?.dataset.viseLastPasswordValue;
    sendAction(window.top, 'login_form_submitted', document.location.href, username, password);
}

function loginFormFound(currentFrameId, sourceFrameId, sourceFrame, url) {
    jsToPython('login_form_found_in_page', url);
}

function loginFormSubmitted(currentFrameId, sourceFrameId, sourceFrame, url, username, password) {
    jsToPython('login_form_submitted_in_page', url, username, password);
}

function requestFormFieldFill(which, element, url) {
    element.focus();
    element.value = '';
    const br = element.getBoundingClientRect();
    sendAction(window.top, 'request_form_field_fill',
        url, which, br.left, br.top, br.right, br.bottom);
}

function doRequestFormFieldFill(currentFrameId, sourceFrameId, sourceFrame, url, which, left, top, right, bottom) {
    jsToPython('fill_form_field_for', url, which, left, top, right, bottom);
}

function doAutofill(url, autosubmit, isCurrentForm) {
    if (url !== document.location.href) return false;
    const candidates = [];
    if (isCurrentForm) {
        let c = document.activeElement;
        if (c && lower(c.tagName) === 'input') {
            while (c.parentNode) {
                c = c.parentNode;
                if (lower(c.tagName) === 'form') {
                    candidates.push(c);
                    break;
                }
            }
        }
    } else {
        for (const form of document.querySelectorAll('form')) {
            if (isLoginForm(form)) candidates.push(form);
        }
    }
    if (candidates.length === 0) return false;

    candidates.sort((f1, f2) =>
        f1.getBoundingClientRect().width - f2.getBoundingClientRect().width
    );
    const foundForm = candidates.at(-1);
    foundForm.dataset.viseAutosubmit = autosubmit ? '1' : '0';
    const [un, pw] = getLoginInputs(foundForm);
    if (un && un.dataset.viseFilled !== '1') {
        un.dataset.viseFilled = '1';
        requestFormFieldFill('username', un, url);
    } else if (pw) {
        requestFormFieldFill('password', pw, url);
    }
    return true;
}

function onAutofillLoginForm(url, autosubmit, isCurrentForm) {
    if (!doAutofill(url, autosubmit, isCurrentForm)) {
        broadcastAction(frameIter(window.self), 'autofill_login_form', url, autosubmit, isCurrentForm);
    }
}

function onFormFieldFilled(url, which) {
    if (!doFormFieldFilled(url, which)) {
        broadcastAction(frameIter(window.self), 'form_field_filled', url, which);
    }
}

function doFormFieldFilled(url, which) {
    let form = null;
    let c = document.activeElement;
    if (c && lower(c.tagName) === 'input') {
        while (c.parentNode) {
            c = c.parentNode;
            if (lower(c.tagName) === 'form') {
                form = c;
                break;
            }
        }
    }
    if (!form) return;
    if (which === 'username') {
        const pw = getLoginInputs(form)[1];
        if (pw && !pw.dataset.viseFilled) {
            pw.dataset.viseFilled = '1';
            requestFormFieldFill('password', pw, url);
        } else {
            doFormFieldFilled(url, 'password');
        }
    } else if (which === 'password') {
        if (form.dataset.viseAutosubmit === '1' && form.getBoundingClientRect().width > 0) {
            submitForm(form);
        }
    }
}

function autofillLoginForm(currentFrameId, sourceFrameId, sourceFrame, url, autosubmit, isCurrentForm) {
    doAutofill(url, autosubmit, isCurrentForm);
}

function formFieldFilled(currentFrameId, sourceFrameId, sourceFrame, url, which) {
    doFormFieldFilled(url, which);
}

let currentLoginFormRequestId = 0;

function onGetUrlForCurrentLoginForm() {
    currentLoginFormRequestId += 1;
    if (document.activeElement && lower(document.activeElement.tagName) === 'input') {
        sendAction(window.top, 'send_url_for_current_login_form',
            currentLoginFormRequestId, document.location.href);
    } else {
        broadcastAction(frameIter(window.self),
            'get_url_for_current_login_form_in_subframe', currentLoginFormRequestId);
    }
}

function getUrlForCurrentLoginFormInSubframe(currentFrameId, sourceFrameId, sourceFrame, requestId) {
    if (document.activeElement && lower(document.activeElement.tagName) === 'input') {
        sendAction(window.top, 'send_url_for_current_login_form', requestId, document.location.href);
    }
}

function sendUrlForCurrentLoginForm(currentFrameId, sourceFrameId, sourceFrame, requestId, url) {
    if (requestId !== currentLoginFormRequestId) return;
    currentLoginFormRequestId += 1;
    jsToPython('url_for_current_login_form', url);
}

function formFocused(evt) {
    if (evt.target.dataset.viseFormAutofilled === '1') return;
    evt.target.dataset.viseFormAutofilled = '1';
    window.setTimeout(
        () => sendAction(window.top, 'login_form_found', document.location.href),
        10,
    );
}

function setupLoginForms() {
    for (const form of document.querySelectorAll('form')) {
        if (!isLoginForm(form)) continue;
        const pw = getLoginInputs(form)[1];
        if (pw) pw.addEventListener('input', passwordChanged, true);
        form.addEventListener('submit', formSubmitted, true);
        form.addEventListener('focus', formFocused, true);
    }
}

export function passwdOnload() {
    if (window === window.top) {
        registerHandler('login_form_found', loginFormFound);
        registerHandler('login_form_submitted', loginFormSubmitted);
        registerHandler('send_url_for_current_login_form', sendUrlForCurrentLoginForm);
        registerHandler('request_form_field_fill', doRequestFormFieldFill);
        connectSignal('autofill_login_form', onAutofillLoginForm);
        connectSignal('form_field_filled', onFormFieldFilled);
        connectSignal('get_url_for_current_login_form', onGetUrlForCurrentLoginForm);
    } else {
        registerHandler('autofill_login_form', autofillLoginForm);
        registerHandler('form_field_filled', formFieldFilled);
        registerHandler('get_url_for_current_login_form_in_subframe', getUrlForCurrentLoginFormInSubframe);
    }
    setupLoginForms();
}
