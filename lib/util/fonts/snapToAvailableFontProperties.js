// This implementation follows the font matching algorithm from https://www.w3.org/TR/css-fonts-3/#font-style-matching
var _ = require('lodash');
var unquote = require('./unquote');
var resolveFontWeight = require('./resolveFontWeight');

var fontStretchValues = [
    'ultra-condensed',
    'extra-condensed',
    'condensed',
    'semi-condensed',
    'normal',
    'semi-expanded',
    'expanded',
    'extra-expanded',
    'ultra-expanded'
];

// font-style lookup order
var styleLookupOrder = {
    normal: ['normal', 'oblique', 'italic'],
    italic: ['italic', 'oblique', 'normal'],
    oblique: ['oblique', 'italic', 'normal']
};

var INITIAL_VALUES = {
    'font-family': undefined,
    'font-stretch': 'normal',
    'font-weight': 400,
    'font-style': 'normal'
};

function ascending(a, b) {
    return a - b;
}

function snapToAvailableFontProperties(fontFaceDeclarations, propsToSnap) {
    if (!Array.isArray(fontFaceDeclarations)) {
        throw new TypeError('fontFaceDeclarations must be an array');
    }

    if (typeof propsToSnap !== 'object' || Array.isArray(propsToSnap) || propsToSnap === null) {
        throw new TypeError('propsToSnap must be an object');
    }


    // Fill in initial values for missing properties
    fontFaceDeclarations = fontFaceDeclarations.map(function (fontFaceDeclaration) {
        return _.defaults({}, fontFaceDeclaration, INITIAL_VALUES);
    });
    propsToSnap = _.defaults({}, propsToSnap, INITIAL_VALUES);

    // System font, we can't know about the full properties. Early exit
    if (typeof propsToSnap['font-family'] === 'undefined') {
        return undefined;
    }

    // Match font-family first
    var fontFamilies = propsToSnap['font-family'].split(/, */).map(unquote);
    // Naively assume that the first defined font family is the one we are looking for. If it's a webfont it should be likely
    var familyMatches = _.filter(fontFaceDeclarations, { 'font-family': fontFamilies[0] });

    // No match for font-family. Probably not a web font. Early exit
    if (familyMatches.length === 0) {
        return undefined;
    }

    // Find the best font-stretch
    var stretchStartIndex = fontStretchValues.indexOf(propsToSnap['font-stretch']);
    var stretchGroups = _.groupBy(familyMatches, 'font-stretch');

    var firstHalf, lastHalf, stretchSearchOrder;
    var stretchMatches = [];

    if (stretchStartIndex <= fontStretchValues.indexOf('normal')) {
        // When value is 'normal' or lower, check denser values first, then less dense
        firstHalf = fontStretchValues.slice(0, stretchStartIndex + 1);
        lastHalf  = fontStretchValues.slice((stretchStartIndex + 1) - fontStretchValues.length);

        stretchSearchOrder = firstHalf.reverse().concat(lastHalf);
    } else {
        // When value is less dense than 'normal', check expanded values first, then denser ones
        firstHalf = fontStretchValues.slice(stretchStartIndex - fontStretchValues.length);
        lastHalf  = fontStretchValues.slice(0, stretchStartIndex);

        stretchSearchOrder = firstHalf.concat(lastHalf.reverse());
    }

    stretchSearchOrder.some(function (value) {
        if (stretchGroups[value]) {
            stretchMatches = stretchGroups[value];
            return true;
        }
    });

    // Find the best font-style
    var styleMatches = styleLookupOrder[propsToSnap['font-style']]
        .map(function (style) {
            return _.filter(stretchMatches, { 'font-style': style });
        })
        .find(function (list) {
            return list.length > 0;
        });


    // Find the best font-weight
    var desiredWeight = propsToSnap['font-weight'];
    var availableFontWeights = _.map(styleMatches, 'font-weight').sort(ascending);
    var resolvedWeight;

    if (typeof desiredWeight === 'string') {
        // Non-standard syntax from Assetgraph font tooling:
        // '400+lighter+lighter'
        // '200+bolder+bolder'
        var operations = desiredWeight.split('+');
        var startWeight = resolveFontWeight(operations.shift(), availableFontWeights);

        resolvedWeight = operations.reduce(function (result, current) {
            var indexModifier = current === 'lighter' ? -1 : +1;
            var nextIndex = availableFontWeights.indexOf(result) + indexModifier;

            return availableFontWeights[nextIndex] || result;
        }, startWeight);
    } else {
        resolvedWeight = resolveFontWeight(desiredWeight, availableFontWeights);
    }

    return _.find(styleMatches, { 'font-weight': resolvedWeight });
}

module.exports = snapToAvailableFontProperties;
