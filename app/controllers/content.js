import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from '../mixins/analytics';

export default Ember.Controller.extend(Analytics, {
    fullScreenMFR: false,
    expandedAuthors: true,
    twitterHref: Ember.computed('node', function() {
        return encodeURI(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${this.get('node.title')}&via=OSFramework`);
    }),
    facebookHref: Ember.computed('model', function() {
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    }),
    linkedinHref: Ember.computed('node', function() {
        return `https://www.linkedin.com/cws/share?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(this.get('node.title'))}`;
    }),
    emailHref: Ember.computed('node', function() {
        return `mailto:?subject=${encodeURIComponent(this.get('node.title'))}&body=${encodeURIComponent(window.location.href)}`;
    }),
    // The currently selected file (defaults to primary)
    activeFile: null,

    disciplineReduced: Ember.computed('model.subjects', function() {
        return this.get('model.subjects').reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    hasTag: Ember.computed('node.tags', function() {
        return this.get('node.tags').length;
    }),

    getAuthors: Ember.observer('node', function() {
        // Cannot be called until node has loaded!
        const node = this.get('node');
        if (!node) return [];

        const contributors = Ember.A();
        loadAll(node, 'contributors', contributors).then(() =>
            this.set('authors', contributors)
        );
    }),

    doiUrl: Ember.computed('model.doi', function() {
        return `https://dx.doi.org/${this.get('model.doi')}`;
    }),

    actions: {
        expandMFR() {
            // State of fullScreenMFR before the transition (what the user perceives as the action)
            const beforeState = this.toggleProperty('fullScreenMFR') ? 'Expand' : 'Contract';

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Content - MFR ${beforeState}`
                });
        },
        // Unused
        expandAuthors() {
            this.toggleProperty('expandedAuthors');
        },
        // Metrics are handled in the component
        chooseFile(fileItem) {
            this.set('activeFile', fileItem);
        },
        shareLink(href, network, action, label) {
            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');

            const metrics = Ember.get(this, 'metrics');

            if (network === 'email') {
                metrics.trackEvent({
                    category: 'link',
                    action,
                    label
                });
            } else {
                // TODO submit PR to ember-metrics for a trackSocial function for Google Analytics. For now, we'll use trackEvent.
                metrics.trackEvent({
                    category: network,
                    action,
                    label: window.location.href
                });
            }

            return false;
        }
    },
});
