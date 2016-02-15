
App.FormToggleView = Ember.View.extend({
    tagName          : '',
    templateName     : "form-toggle",
    didInsertElement : function() {
        
        this.set('form_type_label', this.get('f.form_type_label'));
        
        // Make sure that color tracks toggle setting from the beginning...
        if(!this.get('f.toggled')) {
            $('#' + this.get('f.form_type')).addClass('inactive-form-type');
        }
    }
});

App.FormTypeModalView = Ember.View.extend({
    templateName     : "form-type-modal",
    didInsertElement : function() {
        var content = this.get('controller.content');
        _.map(content.locus_actors, function(la) {
            if(!la.toggled) {
                $("#" + la.id).addClass('hidden-subfield');
            }
        });
        _.map(content.amount_types, function(at) {
            if(!at.toggled) {
                $("#" + at.id).addClass('hidden-subfield');
            }
        });
    }
});


// -----

App.Select2View = Ember.Select.extend({
  prompt: 'Please select...',

  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
  },

  processChildElements: function() {
    this.$().select2({});
  },
  
    _underlyingSelectionDidChange: Ember.observer((function() {
        this.$().select2('val', this.$().val().toString());
    }), "selection.@each"),

  willDestroyElement: function () {
    this.$().select2("destroy");
  }
});

App.ToggleSwitch = Ember.View.extend({
  classNames: ['toggle-switch'],
  templateName: 'toggle-switch',
  
  init: function() {
    this._super.apply(this, arguments);
    return this.on('change', this, this._updateElementValue);
  },
  
  checkBoxId: (function() {
    return "checker-" + (this.get('elementId'));
  }).property(),
  
  _updateElementValue: function() {
    return this.set('checked', this.$('input').prop('checked'));
  }
});

// ------

Ember.Widgets.ModalComponent.reopenClass({
    popup: function(options) {
        var modal, rootElement;
        if (!options) {
          options = {};
        }
        this.hideAll();
        rootElement = options.rootElement || this.rootElement;
        
        // Phronesis
		if(options.computed){
			this.reopen(options.computed);
		}
        modal = this.create(options.primary);
        
        if (modal.get('targetObject.container')) {
          modal.set('container', modal.get('targetObject.container'));
        }

        modal.appendTo(rootElement);
        return modal;
    }
});
