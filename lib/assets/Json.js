var util = require('util'),
    extendWithGettersAndSetters = require('../util/extendWithGettersAndSetters'),
    errors = require('../errors'),
    Text = require('./Text');

function Json(config) { // Avoid clobbering the global JSON object
    Text.call(this, config);
}

util.inherits(Json, Text);

extendWithGettersAndSetters(Json.prototype, {
    contentType: 'application/json',
    pushType: 'script',

    supportedExtensions: ['.json', '.topojson'],

    isPretty: false,

    get parseTree() {
        if (!this._parseTree) {
            try {
                this._parseTree = JSON.parse(this.text);
            } catch (e) {
                var err = new errors.ParseError({message: 'Json parse error in ' + this.urlOrDescription + ': ' + e.message, asset: this});
                if (this.assetGraph) {
                    this.assetGraph.emit('warn', err);
                } else {
                    throw err;
                }
            }
        }
        return this._parseTree;
    },

    set parseTree(parseTree) {
        this.unload();
        this._parseTree = parseTree;
        this.markDirty();
    },

    get text() {
        if (typeof this._text !== 'string') {
            if (this._parseTree) {
                if (this.isPretty) {
                    this._text = JSON.stringify(this._parseTree, undefined, '    ') + '\n';
                } else {
                    this._text = JSON.stringify(this._parseTree);
                }
            } else {
                this._text = this._getTextFromRawSrc();
            }
        }
        return this._text;
    },

    prettyPrint: function () {
        this.isPretty = true;
        /*eslint-disable*/
        var parseTree = this.parseTree; // So markDirty removes this._text
        /*eslint-enable*/
        this.markDirty();
        return this;
    },

    minify: function () {
        this.isPretty = false;
        /*eslint-disable*/
        var parseTree = this.parseTree; // So markDirty removes this._text
        /*eslint-enable*/
        this.markDirty();
        return this;
    }
});

// Grrr...
Json.prototype.__defineSetter__('text', Text.prototype.__lookupSetter__('text'));

module.exports = Json;
