(function(){
  function SpriteManager() {

  }

  SpriteManager.getSpriteData = function(spriteName) {
    return TCHE.data.game.sprites[spriteName];
  };

  SpriteManager.getSpriteType = function(spriteData) {
    if (TCHE.spriteTypes[spriteData.type] !== undefined) {
      return TCHE.spriteTypes[spriteData.type];
    } else {
      return TCHE.SpriteType;
    }
  };

  SpriteManager.configureLoadedSprite = function(character, spriteObj, spriteData) {
    this.getSpriteType(spriteData).configureLoadedSprite(character, spriteObj, spriteData);
  };

  SpriteManager.getSpriteFrame = function(character, spriteObj, spriteName) {
    var spriteData = this.getSpriteData(spriteName);

    return this.getSpriteType(spriteData).getSpriteFrame(character, spriteObj, spriteData);
  };

  SpriteManager.getTextureFromCache = function(spriteName) {
    if (this._textureCache === undefined) {
      return undefined;
    }

    return this._textureCache[spriteName];
  };

  SpriteManager.saveTextureCache = function(spriteName, texture) {
    if (this._textureCache === undefined) {
      this._textureCache = {};
    }

    this._textureCache[spriteName] = texture;
  };

  SpriteManager.spriteIsFullImage = function(spriteData) {
    return this.getSpriteType(spriteData).isFullImage(spriteData);
  };

  SpriteManager.loadSpriteTexture = function(spriteName, spriteData) {
    var cached = this.getTextureFromCache(spriteName);

    if (!!cached) {
      return cached;
    }

    var image = PIXI.Texture.fromImage(spriteData.image);

    if (this.spriteIsFullImage(spriteData)) {
      return image;
    }

    return image.clone();
  };

  SpriteManager.getSpriteTexture = function(spriteName) {
    var data = this.getSpriteData(spriteName);
    return this.loadSpriteTexture(spriteName, data);
  };

  SpriteManager.loadSprite = function(character) {
    var data = this.getSpriteData(character.sprite);
    if (!data) {
      return null;
    }

    var texture = this.loadSpriteTexture(character.sprite, data);
    var spriteObj = new PIXI.Sprite(texture);

    if (texture.baseTexture.isLoading) {
      texture.baseTexture.addListener('loaded', function(){
        TCHE.SpriteManager.configureLoadedSprite(character, spriteObj, data);
      });
    } else {
      TCHE.SpriteManager.configureLoadedSprite(character, spriteObj, data);
    }

    return spriteObj;
  };

  SpriteManager.updateCharacterSprite = function(spriteObj, character) {
    var data = this.getSpriteData(character.sprite);
    this.getSpriteType(data).update(character, spriteObj, data);
  };

  SpriteManager.updateAnimationStep = function(character) {
    var data = this.getSpriteData(character.sprite);
    if (!!data) {
      this.getSpriteType(data).updateAnimationStep(character);
    }
  };
  
  TCHE.registerStaticClass('SpriteManager', SpriteManager);
})();