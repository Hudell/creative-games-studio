(function(){
  function ObjectType() {
    this.initialize();
  }

  ObjectType.prototype.initialize = function() {
    this._properties = {};
  };

  ObjectType.prototype.getName = function(){
    return '';
  };

  TCHE.reader(ObjectType.prototype, 'name', ObjectType.prototype.getName);
  TCHE.reader(ObjectType.prototype, 'properties');

  TCHE.ObjectType = ObjectType;
})();