(function(){

  function TcheObjectLayerSprite(layerData) {
    this.initialize(layerData);
  }

  TcheObjectLayerSprite.prototype = Object.create(TCHE.Sprite.prototype);
  TcheObjectLayerSprite.prototype.constructor = TcheObjectLayerSprite;

  TcheObjectLayerSprite.prototype.initialize = function(layerData) {
    TCHE.Sprite.prototype.initialize.call(this, layerData);

    this._layerData = layerData;
    this._objectSprites = [];
    this._countdown = 0;
  };

  TCHE.reader(TcheObjectLayerSprite.prototype, 'layerData');

  TcheObjectLayerSprite.prototype.updateSprites = function() {
    this._objectSprites.forEach(function(sprite){
      sprite.update();
    });
  };

  TcheObjectLayerSprite.prototype.update = function() {
    this.updateSprites();

    if (!!this._countdown && this._countdown > 0) {
      this._countdown--;

      return;
    }

    this._countdown = 10;
    this.refreshSprites();
  };

  TcheObjectLayerSprite.prototype.refreshSprites = function() {
    this.removeChildren();

    this._objectSprites.sort(function(obj1, obj2){
      var diffY = obj1.y - obj2.y;

      if (diffY !== 0) {
        return diffY;
      }

      return obj1.x - obj2.x;
    });

    this._objectSprites.forEach(function(obj) {
      this.addChild(obj);
    }.bind(this));
  };

  TcheObjectLayerSprite.prototype.createObjectSprite = function(obj) {
    var objSprite = new TCHE.CharacterSprite(obj);
    this._objectSprites.push(objSprite);
  };
  
  TCHE.registerClass('TcheObjectLayerSprite', TcheObjectLayerSprite);
})();