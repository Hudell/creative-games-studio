(function(){
  function PlayerObjectType() {

  }

  PlayerObjectType.prototype = Object.create(TCHE.objectTypes.Creature.prototype);
  PlayerObjectType.prototype.constructor = PlayerObjectType;

  PlayerObjectType.prototype.getName = function() {
    return 'Player';
  };

  TCHE.objectTypes.Player = PlayerObjectType;
})();