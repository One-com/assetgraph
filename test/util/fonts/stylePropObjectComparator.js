var expect = require('unexpected');
var comparator = require('../../../lib/util/fonts/stylePropObjectComparator');

describe('util/fonts/stylePropObjectComparator', function () {
    it('should sort important objects before non-important objects', function () {
        var a = {
            important: true
        };
        var b = {
            important: false
        };

        var compare = comparator([a, b]);

        expect(compare(a, b), 'to be', -1);
    });

    it('should sort styleAttribute objects before non-styleAttribute', function () {
        var a = {
            important: false,
            specificityArray: [1, 0, 0, 0]
        };
        var b = {
            important: false,
            specificityArray: [0, 1, 0, 0]
        };

        var compare = comparator([a, b]);

        expect(compare(a, b), 'to be', -1);
    });


    it('should sort higher specificity objects before lower specificity objects', function () {
        var a = {
            important: false,
            specificityArray: [0, 0, 1, 0]
        };
        var b = {
            important: false,
            specificityArray: [0, 0, 0, 1]
        };

        var compare = comparator([a, b]);

        expect(compare(a, b), 'to be', -1);
    });

    it('should reverse source order when all else is equal (higher specificity first)', function () {
        var a = {
            important: false,
            specificityArray: [0, 0, 0, 1]
        };
        var b = {
            important: false,
            specificityArray: [0, 0, 0, 1]
        };

        var compare = comparator([a, b]);

        expect(compare(a, b), 'to be', 1);
    });

    it('should sort a big array of different cases correctly', function () {
        var a = {
            id: 'a',
            important: false,
            specificityArray: [0, 0, 0, 1]
        };
        var b = {
            id: 'b',
            important: false,
            specificityArray: [0, 0, 0, 1]
        };
        var c = {
            id: 'c',
            important: false,
            specificityArray: [0, 1, 0, 1]
        };
        var d = {
            id: 'd',
            important: false,
            specificityArray: [0, 0, 1, 1]
        };
        var e = {
            id: 'e',
            important: false,
            specificityArray: [0, 1, 0, 1]
        };
        var f = {
            id: 'f',
            important: false,
            specificityArray: [0, 0, 1, 0]
        };
        var g = {
            id: 'g',
            important: true,
            specificityArray: [0, 0, 0, 1]
        };
        var h = {
            id: 'h',
            important: false,
            specificityArray: [0, 0, 0, 1]
        };
        var i = {
            id: 'i',
            important: false,
            specificityArray: [1, 0, 0, 1]
        };
        var j = {
            id: 'j',
            important: true,
            specificityArray: [1, 0, 0, 1]
        };
        var k = {
            id: 'k',
            important: false,
            specificityArray: [0, 1, 0, 1]
        };

        var array = [a, b, c, d, e, f, g, h, i, j, k];

        expect(array.sort(comparator(array)), 'to satisfy', [
            j, g, i, k, e, c, d, f, h, b, a
        ]);
    });
});
