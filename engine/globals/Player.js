(function(){
  function Player() {
    this.initialize();
  }

  Player.prototype = Object.create(TCHE.Character.prototype);
  Player.prototype.constructor = Player;

  Player.prototype.initialize = function() {
  };

  Player.prototype.update = function() {
    this.processInput();
    TCHE.Character.prototype.update.call(this);
  };

  Player.prototype.processInput = function() {
    var direction = TCHE.InputManager.getDirection();
    if (!!direction) {
      this.clearDestination();
      
      if (!this.move(direction)) {
        this.updateDirection(direction.split('-'));
      }
    }
  };

  Player.prototype.teleport = function(mapName, x, y) {
    TCHE.data.game.player.x = x;
    TCHE.data.game.player.y = y;

    this.clearDestination();
    TCHE.globals.map.changeMap(mapName);
  };

  Player.prototype.requestCollisionMapRefresh = function() {
    //Don't refresh the collision map for movements of the player.
  };
  
  TCHE.registerClass('Player', Player);
})();