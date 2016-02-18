(function(){
  function CreatureObjectType() {
    this.initialize();
  }

  CreatureObjectType.prototype = Object.create(TCHE.objectTypes.MapObject.prototype);
  CreatureObjectType.prototype.constructor = CreatureObjectType;

  CreatureObjectType.prototype.getName = function() {
    return 'Creature';
  };

  TCHE.objectTypes.Creature = CreatureObjectType;
})();