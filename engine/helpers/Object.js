(function(){
  function defaultSetter(name) {
    return function (value) {
      var prop = '_' + name;
      if ((!this[prop]) || this[prop] !== value) {
        this[prop] = value;
        if (this._refresh) {
          this._refresh();
        }
      }
    };
  }

  function defaultGetter(name) {
    return function () {
      return this['_' + name];
    };
  }  

  function reader(obj, name /*, getter */) {
    Object.defineProperty(obj, name, {
      get: arguments.length > 2 ? arguments[2] : defaultGetter(name),
      configurable: true
    });
  }

  function writer(obj, name /*, setter*/) {
    Object.defineProperty(obj, name, {
      set: arguments.length > 2 ? arguments[2] : defaultSetter(name),
      configurable: true
    });
  }

  function accessor(value, name /* , setter, getter */) {
    Object.defineProperty(value, name, {
      get: arguments.length > 3 ? arguments[3] : defaultGetter(name),
      set: arguments.length > 2 ? arguments[2] : defaultSetter(name),
      configurable: true
    });
  }

  function extend(/*parent , constructor */) {
    var constructor, parent;
    parent = arguments.length > 0 ? arguments[0] : Object;
    constructor = arguments.length > 1 ? arguments[1] : function () {
      parent.apply(this, arguments);
      if(!parent.prototype.initialize && this.initialize) {
        this.initialize.apply(this, arguments);
      }
    };
    constructor.prototype = Object.create(parent.prototype);
    constructor.prototype.constructor = constructor;
    constructor.extend = function (/* constructor*/) {
      if (arguments.length) {
        return $.extend(constructor, arguments[0]);
      }
      return $.extend(constructor, function () {
        constructor.apply(this, arguments);
      });
    };
    return constructor;
  }  

  TCHE.reader = reader;
  TCHE.writer = writer;
  TCHE.accessor = accessor;
  TCHE.extend = extend;
})();