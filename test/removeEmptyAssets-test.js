var vows = require('vows'),
    assert = require('assert'),
    AssetGraph = require('../lib'),
    query = AssetGraph.query;

vows.describe('Remove empty assets').addBatch({
    'After loading a test case': {
        topic: function () {
            new AssetGraph({root: __dirname + '/removeEmptyAssets/'})
                .loadAssets('index.html')
                .populate()
                .run(this.callback);
        },
        'the graph should contain 3 assets': function (assetGraph) {
            assert.equal(assetGraph.findAssets().length, 3);
        },
        'then running the removeEmptyAssets transform on Css and JavaScript assets': {
            topic: function (assetGraph) {
                assetGraph.removeAssets({isEmpty: true, type: query.or('Css', 'JavaScript')}).run(this.callback);
            },
            'the graph should contain 1 asset': function (assetGraph) {
                assert.equal(assetGraph.findAssets().length, 1);
            },
            'the graph should contain no relations': function (assetGraph) {
                assert.equal(assetGraph.findRelations().length, 0);
            }
        }
    }
})['export'](module);
