import OsfSerializer from 'ember-osf/serializers/osf-serializer';

export default OsfSerializer.extend({
    serialize(snapshot) {
        // Normal OSF serializer strips out relationships. We need to add back primaryFile for this endpoint
        let res = this._super(...arguments);
        res.data.relationships = {
            primary_file: {
                data: {
                    id: snapshot.belongsTo('primaryFile', { id: true }),
                    type: 'file'
                }
            }
        };
        return res;
    }

});
