// Format numbers, byte sizes, and timestamps for display.
//
// Pure functions, no DOM dependency. Source of truth:
// client/humanize.pyj (rapydscript).

const SIZE_LABELS = [
    ['P', Math.pow(2, 50)],
    ['T', Math.pow(2, 40)],
    ['G', 1 << 30],
    ['M', 1 << 20],
];

function normalizePrecision(value, base) {
    value = Math.round(Math.abs(value));
    return Number.isNaN(value) ? base : value;
}

export function toFixed(value, precision) {
    const p = precision ?? normalizePrecision(precision, 0);
    const power = Math.pow(10, p);
    return (Math.round(value * power) / power).toFixed(p);
}

function firstComma(number, position, thousand) {
    return position ? number.substr(0, position) + thousand : '';
}

function commas(number, position, thousand) {
    return number.substr(position).replace(/(\d{3})(?=\d)/g, `$1${thousand}`);
}

function decimals(number, usePrecision, precision, decimal) {
    return usePrecision
        ? decimal + toFixed(Math.abs(number), precision).split('.')[1]
        : '';
}

export function humanizeNumber(number, precision, thousand = ',', decimal = '.') {
    const usePrecision = normalizePrecision(precision, 0);
    const negative = number < 0 ? '-' : '';
    const base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + '';
    const mod = base.length > 3 ? base.length % 3 : 0;
    return (
        negative +
        firstComma(base, mod, thousand) +
        commas(base, mod, thousand) +
        decimals(number, usePrecision, usePrecision, decimal)
    );
}

export function humanizeSize(size) {
    for (const [label, min] of SIZE_LABELS) {
        if (size >= min) {
            return humanizeNumber(size / min, 2, '') + ' ' + label + 'B';
        }
    }
    if (size >= 1024) {
        return humanizeNumber(size / 1024, 0) + ' KB';
    }
    return humanizeNumber(size, 0) + ' B';
}

export function relativeTime(timestamp) {
    const now = Date.now();
    const t = timestamp ?? now;
    const currentTime = now / 1000;
    const timeDiff = currentTime - t / 1000;

    if (timeDiff < 2 && timeDiff > -2) {
        return (timeDiff >= 0 ? 'just' : '') + 'now';
    }
    if (timeDiff < 60 && timeDiff > -60) {
        return timeDiff >= 0
            ? `${Math.floor(timeDiff)} seconds ago`
            : `in ${Math.floor(-timeDiff)} seconds`;
    }
    if (timeDiff < 120 && timeDiff > -120) {
        return timeDiff >= 0 ? 'about a minute ago' : 'in about a minute';
    }
    if (timeDiff < 3600 && timeDiff > -3600) {
        return timeDiff >= 0
            ? `${Math.floor(timeDiff / 60)} minutes ago`
            : `in ${Math.floor(-timeDiff / 60)} minutes`;
    }
    if (timeDiff < 7200 && timeDiff > -7200) {
        return timeDiff >= 0 ? 'about an hour ago' : 'in about an hour';
    }
    if (timeDiff < 86400 && timeDiff > -86400) {
        return timeDiff >= 0
            ? `${Math.floor(timeDiff / 3600)} hours ago`
            : `in ${Math.floor(-timeDiff / 3600)} hours`;
    }
    const days2 = 2 * 86400;
    if (timeDiff < days2 && timeDiff > -days2) {
        return timeDiff >= 0 ? '1 day ago' : 'in 1 day';
    }
    const days29 = 29 * 86400;
    if (timeDiff < days29 && timeDiff > -days29) {
        return timeDiff >= 0
            ? `${Math.floor(timeDiff / 86400)} days ago`
            : `in ${Math.floor(-timeDiff / 86400)} days`;
    }
    const days60 = 60 * 86400;
    if (timeDiff < days60 && timeDiff > -days60) {
        return timeDiff >= 0 ? 'about a month ago' : 'in about a month';
    }

    const currentDate = new Date(currentTime * 1000);
    const tsDate = new Date(t);
    const curMonths = currentDate.getMonth() + 1 + 12 * currentDate.getFullYear();
    const tsMonths = tsDate.getMonth() + 1 + 12 * currentDate.getFullYear();
    const monthDiff = curMonths - tsMonths;
    if (monthDiff < 12 && monthDiff > -12) {
        return monthDiff >= 0
            ? `${monthDiff} months ago`
            : `in ${-monthDiff} months`;
    }
    const yearDiff = currentDate.getFullYear() - tsDate.getFullYear();
    if (yearDiff < 2 && yearDiff > -2) {
        return yearDiff >= 0 ? 'a year ago' : 'in a year';
    }
    return yearDiff >= 0 ? `${yearDiff} years ago` : `in ${-yearDiff} years`;
}
