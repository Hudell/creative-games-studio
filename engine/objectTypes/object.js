(function(){
  function ObjectObjectType() {

  }

  ObjectObjectType.prototype = Object.create(TCHE.ObjectType.prototype);
  ObjectObjectType.prototype.constructor = TCHE.ObjectType;

  ObjectObjectType.prototype.getName = function() {
    return 'Object';
  };

  ObjectObjectType.prototype.getPropertyRawValue = function(obj, propName) {
    if (obj.hasOwnProperty(propName)) {
      return obj[propName];
    } else {
      return (obj.properties || {})[propName];
    }
  };

  ObjectObjectType.prototype.extractProperties = function(obj) {
    var props = {};

    for (var key in this.properties) {
      var property = this.properties[key];
      var value = this.getPropertyRawValue(obj, key);

      switch(property.type) {
        case 'number' :
          value = Number(value || 0);
          break;
        default :
          break;
      }

      props[key] = value;
    }

    props.layerName = obj.layerName;

    return props;
  };

  TCHE.objectTypes.Object = ObjectObjectType;
})();