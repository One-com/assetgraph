/**
 *  Implementation of https://www.w3.org/TR/resource-hints/#prefetch
 */

const HtmlResourceHint = require('./HtmlResourceHint');

class HtmlPrefetchLink extends HtmlResourceHint {
    attach(position, adjacentRelation) {
        this.node = this.from.parseTree.createElement('link');
        this.node.setAttribute('rel', 'prefetch');

        if (this.contentType && this.contentType !== 'application/octet-stream') {
            this.node.setAttribute('type', this.contentType);
        }

        if (this.as) {
            this.node.setAttribute('as', this.as);
            if (this.as === 'font') {
                this.node.setAttribute('crossorigin', 'anonymous');
            }
        }


        return super.attach(position, adjacentRelation);
    }
};

module.exports = HtmlPrefetchLink;
