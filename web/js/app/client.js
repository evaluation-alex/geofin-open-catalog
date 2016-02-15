App.Client = App.GFClient.extend();

App.Client.reopenClass({
	make : function(node_path) {
		return new Ember.RSVP.Promise(function(resolve, reject) {
			var client = App.Client.create({ 'node_path' : node_path });
			client.run_fetch_form_types().then(function(response) {
                client.set('form_types', response.form_types);
                Ember.run(this, resolve, client);
			});
		}, function(error) {
			reject(error);
		});
	}
});