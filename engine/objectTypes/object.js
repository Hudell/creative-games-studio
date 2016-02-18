(function(){
  function ObjectObjectType() {

  }

  ObjectObjectType.prototype = Object.create(TCHE.ObjectType.prototype);
  ObjectObjectType.prototype.constructor = TCHE.ObjectType;

  ObjectObjectType.prototype.getName = function() {
    return 'Object';
  };

  TCHE.objectTypes.Object = ObjectObjectType;
})();