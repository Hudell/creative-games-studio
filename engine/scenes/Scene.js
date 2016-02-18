(function(){
  function Scene() {
    this.initialize();
  }

  Scene.prototype = Object.create(PIXI.Container.prototype);
  Scene.prototype.constructor = Scene;

  Scene.prototype.initialize = function() {
    PIXI.Container.call(this);
  };

  Scene.prototype.update = function() {

  };

  Scene.prototype.terminate = function() {

  };

  Scene.prototype.processClick = function(pos) {

  };
  
  TCHE.registerClass('Scene', Scene);
})();