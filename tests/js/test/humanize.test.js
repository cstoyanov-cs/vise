describe('humanize functions', () => {
    const LABELS = [
        ["P", Math.pow(2, 50)],
        ["T", Math.pow(2, 40)],
        ["G", 1 << 30],
        ["M", 1 << 20],
    ];

    function normalize_precision(value, base) {
        value = Math.round(Math.abs(value));
        return isNaN(value) ? base : value;
    }

    function to_fixed(value, precision) {
        precision = precision || normalize_precision(precision, 0);
        const power = Math.pow(10, precision);
        return (Math.round(value * power) / power).toFixed(precision);
    }

    function humanize_number(number, precision, thousand, decimal) {
        precision = precision || 0;
        thousand = thousand || ',';
        decimal = decimal || '.';

        function first_comma(number, position) {
            return position ? number.substr(0, position) + thousand : '';
        }

        function commas(number, position) {
            return number.substr(position).replace(/(\d{3})(?=\d)/g, "$1" + thousand);
        }

        function decimals(number, use_precision) {
            return use_precision ? decimal + to_fixed(Math.abs(number), use_precision).split(".")[1] : '';
        }

        const use_precision = normalize_precision(precision);
        const negative = number < 0 ? '-' : '';
        const base = parseInt(to_fixed(Math.abs(number || 0), use_precision), 10) + "";
        const mod = base.length > 3 ? base.length % 3 : 0;
        return negative + first_comma(base, mod) + commas(base, mod) + decimals(number, use_precision);
    }

    function humanize_size(size) {
        for (const [label, minnum] of LABELS) {
            if (size >= minnum) {
                return humanize_number(size / minnum, 2, "") + " " + label + "B";
            }
        }
        if (size >= 1024) {
            return humanize_number(size / 1024, 0) + " KB";
        }
        return humanize_number(size, 0) + ' B';
    }

    test('normalize_precision returns base for NaN', () => {
        expect(normalize_precision(NaN, 5)).toBe(5);
    });

    test('normalize_precision returns rounded value for valid input', () => {
        expect(normalize_precision(10.5, 5)).toBe(11);
    });

    test('normalize_precision handles negative numbers', () => {
        expect(normalize_precision(-10.5, 5)).toBe(11);
    });

    test('to_fixed formats number with precision', () => {
        expect(to_fixed(10.567, 2)).toBe('10.57');
    });

    test('to_fixed handles zero precision', () => {
        expect(to_fixed(10.567, 0)).toBe('11');
    });

    test('to_fixed rounds correctly', () => {
        expect(to_fixed(10.555, 2)).toBe('10.56');
    });

    test('humanize_number formats thousands with comma', () => {
        expect(humanize_number(1234567, 0)).toBe('1,234,567');
    });

    test('humanize_number formats with custom separators', () => {
        const result = humanize_number(1234567.89, 2, ' ', ',');
        expect(result).toBe('1 234 567,89');
    });

    test('humanize_number handles negative numbers', () => {
        const result = humanize_number(-1234, 0);
        expect(result).toBe('-1,234');
    });

    test('humanize_number handles zero', () => {
        const result = humanize_number(0, 0);
        expect(result).toBe('0');
    });

    test('humanize_size formats bytes', () => {
        expect(humanize_size(512)).toBe('512 B');
    });

    test('humanize_size formats KB', () => {
        expect(humanize_size(2048)).toBe('2 KB');
    });

    test('humanize_size formats MB', () => {
        expect(humanize_size(1024 * 1024)).toBe('1.00 MB');
    });

    test('humanize_size formats GB', () => {
        expect(humanize_size(1024 * 1024 * 1024)).toBe('1.00 GB');
    });
});
