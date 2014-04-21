App = Ember.Application.create();

App.Router.map(function() {
  this.resource('users');
});

App.IndexView = Ember.View.extend({
  shortcuts: {
    a: function() { console.log('index a'); return false;}
  }
});
App.ApplicationView = Ember.View.extend({
  shortcuts: {
    a: function(){ console.log(this);
      console.log(arguments);
      console.log('you pressed a!'); },
  'a+enter': function(){ console.log(this);
    console.log(arguments);
    console.log('you pressed a! enter'); }
  }
});

function Shortcutter() {
  this.allShortcuts = {};
  this.shortcutsByView = {};
}

Shortcutter.prototype = {
  addShortcuts: function(view) {
    var shortcuts = view.get('shortcuts'),
        self = this;
    if(!shortcuts) { return; }
    Ember.keys(shortcuts).forEach(function(shortcutKey) {
    var fn = function() {shortcuts[shortcutKey].apply(view, arguments);};
    this.shortcutsByView[view.get('elementId')] = this.shortcutsByView[view.get('elementId')] || {};
    this.shortcutsByView[view.get('elementId')][shortcutKey] = fn;

    strippedShortcutKey = shortcutKey.replace(/ /g, '');
    if(!this.allShortcuts[strippedShortcutKey]) {
      this.allShortcuts[strippedShortcutKey] = [fn];
      key(shortcutKey, function() { self.callShortcuts.apply(self, arguments)});
    } else {
      this.allShortcuts[strippedShortcutKey].unshift(fn);
    }
    }, this);
  },

  removeShortcuts: function(view) {
    var shortcuts = this.shortcutsByView[view.get('elementId')];
    if(!shortcuts) { return; }
    Ember.keys(shortcuts).forEach(function(shortcutKey) {
      this.allShortcuts[shortcutKey].removeObject(shortcuts[shortcutKey]);
    }, this);
    delete this.shortcutsByView[view.get('elementId')];
  },

  callShortcuts: function(_, keymaster) {
    var fns = this.allShortcuts[keymaster.shortcut];
    for(var i = 0; i < fns.length; i++ ) {
      if(!fns[i](arguments)) {
        break;
      }
    }
  }
}

window.shortcutter = new Shortcutter();

Ember.View.reopen({
  registerKeypresses: function() {
    window.shortcutter.addShortcuts(this);
  }.on('didInsertElement'),

  unregisterKeypresses: function() {
    window.shortcutter.removeShortcuts(this);
  }.on('willDestroyElement')
});
