/**
 * Tests for the humanize module.
 *
 * These tests validate the behavior extracted from client/humanize.pyj
 * (rapydscript source). They should pass once humanize.js is implemented
 * as an ES module exporting camelCase versions of the rapydscript functions.
 *
 * Source of truth for expected behavior: client/humanize.pyj
 */

import {
    toFixed,
    humanizeNumber,
    humanizeSize,
} from '../../../vise/data/js/humanize.js';

describe('humanize module', () => {
    describe('toFixed', () => {
        test('formats number with precision', () => {
            expect(toFixed(10.567, 2)).toBe('10.57');
        });

        test('handles zero precision', () => {
            expect(toFixed(10.567, 0)).toBe('11');
        });

        test('rounds correctly', () => {
            expect(toFixed(10.555, 2)).toBe('10.56');
        });

        test('defaults precision to 0 when undefined', () => {
            expect(toFixed(10.5)).toBe('11');
        });
    });

    describe('humanizeNumber', () => {
        test('formats thousands with comma', () => {
            expect(humanizeNumber(1234567, 0)).toBe('1,234,567');
        });

        test('formats with custom separators (space + comma)', () => {
            expect(humanizeNumber(1234567.89, 2, ' ', ',')).toBe('1 234 567,89');
        });

        test('handles negative numbers', () => {
            expect(humanizeNumber(-1234, 0)).toBe('-1,234');
        });

        test('handles zero', () => {
            expect(humanizeNumber(0, 0)).toBe('0');
        });

        test('handles small numbers below thousand', () => {
            expect(humanizeNumber(42, 0)).toBe('42');
        });

        test('handles precision', () => {
            expect(humanizeNumber(1234.5678, 2)).toBe('1,234.57');
        });
    });

    describe('humanizeSize', () => {
        test('formats bytes (< 1024)', () => {
            expect(humanizeSize(512)).toBe('512 B');
        });

        test('formats kilobytes (1024-1MB)', () => {
            expect(humanizeSize(2048)).toBe('2 KB');
        });

        test('formats megabytes (1MB-1GB)', () => {
            expect(humanizeSize(1024 * 1024)).toBe('1.00 MB');
        });

        test('formats gigabytes (1GB-1TB)', () => {
            expect(humanizeSize(1024 * 1024 * 1024)).toBe('1.00 GB');
        });

        test('formats terabytes (1TB-1PB)', () => {
            expect(humanizeSize(1024 ** 4)).toMatch(/^1\.00 TB$/);
        });

        test('formats petabytes (>= 1PB)', () => {
            expect(humanizeSize(1024 ** 5)).toMatch(/^1\.00 PB$/);
        });

        test('handles zero bytes', () => {
            expect(humanizeSize(0)).toBe('0 B');
        });
    });
});
