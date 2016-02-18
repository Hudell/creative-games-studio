(function(){
  function NpcObjectType() {

  }

  NpcObjectType.prototype = Object.create(TCHE.objectTypes.Creature.prototype);
  NpcObjectType.prototype.constructor = NpcObjectType;

  NpcObjectType.prototype.getName = function() {
    return 'NPC';
  };

  TCHE.objectTypes.NPC = NpcObjectType;
})();