(function(){
  function SkinManager() {

  }

  SkinManager.getSkinData = function(skinName) {
    var data = TCHE.data.game.skins[skinName];
    if (!!data) {
      data.skinName = skinName;
    }
    return data;
  };

  SkinManager.getSkinType = function(skinData) {
    if (TCHE.skinTypes[skinData.type] !== undefined) {
      return TCHE.skinTypes[skinData.type];
    } else {
      return TCHE.SkinType;
    }
  };

  SkinManager.loadSkinTexture = function(skinData) {
    var type = this.getSkinType(skinData.skinName);
    return type.loadSkinTexture(skinData);
  };

  SkinManager.getTextureFromCache = function(skinName, identifier) {
    if (this._textureCache === undefined) {
      return undefined;
    }

    return this._textureCache[skinName + '/' + identifier];
  };

  SkinManager.saveTextureCache = function(skinName, identifier, texture) {
    if (this._textureCache === undefined) {
      this._textureCache = {};
    }

    this._textureCache[skinName + '/' + identifier] = texture;
  };

  SkinManager.loadSkinBackgroundTexture = function(skinData) {
    var texture = this.getTextureFromCache(skinData.name, 'background');
    if (!texture) {
      texture = new PIXI.Texture(this.loadSkinTexture(skinData));
      this.saveTextureCache(skinData.name, 'background', texture);
    }

    return texture;
  };

  SkinManager.loadSkinFrameTexture = function(skinData) {
    var texture = this.getTextureFromCache(skinData.name, 'frame');
    if (!texture) {
      texture = new PIXI.Texture(this.loadSkinTexture(skinData));
      this.saveTextureCache(skinData.name, 'frame', texture);
    }

    return texture;
  };

  SkinManager.drawSkinFrame = function(skinName, content) {
    var data = this.getSkinData(skinName);
    if (!!data) {
      this.getSkinType(data).drawSkinFrame(content, data);
    }
  };

  SkinManager.addSkinBackground = function(skinName, windowObj, container) {
    var data = this.getSkinData(skinName);
    if (!!data) {
      this.getSkinType(data).addSkinBackground(windowObj, container, data);
    }
  };

  SkinManager.drawSkinCursor = function(skinName, content, x, y) {
    var data = this.getSkinData(skinName);
    if (!!data) {
      this.getSkinType(data).drawSkinCursor(data, content, x, y);
    }
  };

  SkinManager.getSkinCursorSize = function(skinName) {
    var data = this.getSkinData(skinName);
    if (!!data) {
      return this.getSkinType(data).getSkinCursorSize(data);
    } else {
      return {width : 0, height : 0};
    }
  };
  
  TCHE.registerStaticClass('SkinManager', SkinManager);
})();