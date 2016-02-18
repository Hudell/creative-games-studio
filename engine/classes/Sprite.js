(function(){
  function Sprite() {
    this.initialize();
  }

  var parent = PIXI.Container.prototype;

  Sprite.prototype = Object.create(PIXI.Container.prototype);
  Sprite.prototype.constructor = Sprite;

  Sprite.prototype.initialize = function() {
    PIXI.Container.call(this);

    this._sprite = null;
    this._frame = new PIXI.Rectangle(0, 0, 1, 1);
    this._useFrame = false;
  };

  TCHE.accessor(Sprite.prototype, 'sprite');
  TCHE.accessor(Sprite.prototype, 'useFrame');
  TCHE.accessor(Sprite.prototype, 'frame');

  Sprite.prototype.update = function() {
  };

  TCHE.registerClass('Sprite', Sprite);
})();