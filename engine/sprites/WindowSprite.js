(function(){
  function WindowSprite(width, height, skinName) {
    this.initialize(width, height, skinName);
  }

  WindowSprite.prototype = Object.create(TCHE.Sprite.prototype);
  WindowSprite.prototype.constructor = WindowSprite;

  WindowSprite.prototype.initialize = function(width, height, skinName) {
    TCHE.Sprite.prototype.initialize.call(this);

    if (skinName === undefined) {
      if (!!TCHE.data.game.mainSkin) {
        skinName = TCHE.data.game.mainSkin;
      }
    }

    this.createBackground(skinName);

    this.createContents(width, height, skinName);
    this.createSprite();
    this.refresh();    
  };

  WindowSprite.prototype.getStyle = function() {
    return this._contents.style;
  };
  TCHE.reader(WindowSprite.prototype, 'style', WindowSprite.prototype.getStyle);

  WindowSprite.prototype.getWidth = function() {
    return this._contents.width;
  };
  TCHE.reader(WindowSprite.prototype, 'width', WindowSprite.prototype.getWidth);

  WindowSprite.prototype.getHeight = function() {
    return this._contents.height;
  };
  TCHE.reader(WindowSprite.prototype, 'height', WindowSprite.prototype.getHeight);
  TCHE.reader(WindowSprite.prototype, 'contents');

  WindowSprite.prototype.getLineHeight = function() {
    var text = new PIXI.Text("Testing", this.style);
    return text.height;
  };

  TCHE.reader(WindowSprite.prototype, 'lineHeight', WindowSprite.prototype.getLineHeight);

  WindowSprite.prototype.getMargin = function() {
    return 16;
  };
  TCHE.reader(WindowSprite.prototype, 'margin', WindowSprite.prototype.getMargin);

  WindowSprite.prototype.getSkinName = function() {
    return this._contents.skinName;
  };
  TCHE.reader(WindowSprite.prototype, 'skinName', WindowSprite.prototype.getSkinName);

  WindowSprite.prototype.createBackground = function(skinName) {
    if (!!this._backgroundContainer) {
      this._backgroundContainer.removeChildren();
    } else {
      this._backgroundContainer = new PIXI.Container();
      this.addChild(this._backgroundContainer);
    }

    TCHE.SkinManager.addSkinBackground(skinName, this, this._backgroundContainer);
  };

  WindowSprite.prototype.drawCursor = function(x, y) {
    TCHE.SkinManager.drawSkinCursor(this.skinName, this._contents, x, y);
  };

  WindowSprite.prototype.createContents = function(width, height, skinName) {
    this._contents = new TCHE.WindowContent(TCHE.renderer, width, height, skinName);
  };

  WindowSprite.prototype.createSprite = function() {
    this._sprite = new PIXI.Sprite(this._contents);
    this.addChild(this._sprite);      
  };

  WindowSprite.prototype.drawFrame = function() {
    if (!!this.skinName) {
      this._contents.drawSkinFrame();
    }
  };

  WindowSprite.prototype.refresh = function() {
    this.clear();
    // this.drawFrame();
    this.draw();

    this._contents.update();
  };

  WindowSprite.prototype.clear = function() {
    this._contents.clear();
  };

  WindowSprite.prototype.draw = function() {
  };

  WindowSprite.prototype.redraw = function() {
    this.clear();
    this.draw();
    this._contents.update();
  };

  WindowSprite.prototype.update = function() {
    // this.refresh();
  };
  
  TCHE.registerClass('WindowSprite', WindowSprite);
})();