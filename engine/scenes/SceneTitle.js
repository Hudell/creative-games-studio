(function(){
  function SceneTitle() {
    this.initialize();
  }

  var parent = TCHE.SceneWindow;
  SceneTitle.prototype = Object.create(parent.prototype);
  SceneTitle.prototype.constructor = SceneTitle;

  SceneTitle.prototype.initialize = function() {
    parent.prototype.initialize.call(this);

    this._windowSprite = new TCHE.WindowTitleChoices();
    this._windowSprite.x = Math.floor(TCHE.renderer.width / 2) - Math.floor(this._windowSprite.width / 2);
    this._windowSprite.y = TCHE.renderer.height - this._windowSprite.height;

    this.addChild(this._windowSprite);
  };

  SceneTitle.prototype.update = function() {
    parent.prototype.update.call(this);
    this._windowSprite.update();
  };
  
  TCHE.registerClass('SceneTitle', SceneTitle);
})();