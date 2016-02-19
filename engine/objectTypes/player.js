(function(){
  function PlayerObjectType() {
    this.initialize();
  }

  PlayerObjectType.prototype = Object.create(TCHE.objectTypes.MapObject.prototype);
  PlayerObjectType.prototype.constructor = PlayerObjectType;

  PlayerObjectType.prototype.getName = function() {
    return 'Player';
  };

  TCHE.objectTypes.Player = PlayerObjectType;
})();