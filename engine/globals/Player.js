(function(){
  function Player() {
    this.initialize();
  }

  Player.prototype = Object.create(TCHE.Character.prototype);
  Player.prototype.constructor = Player;

  Player.prototype.initialize = function() {
    TCHE.Character.prototype.initialize.call(this);
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
    TCHE.data.game.player.x = x - TCHE.data.game.player.xOffset;
    TCHE.data.game.player.y = y - TCHE.data.game.player.yOffset;

    this.clearDestination();
    TCHE.globals.map.changeMap(mapName);
  };

  TCHE.registerClass('Player', Player);
})();