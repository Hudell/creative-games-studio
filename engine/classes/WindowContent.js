(function(){
  function WindowContent(renderer, width, height, skinName) {
    this.initialize(renderer, width, height, skinName);
  }

  var parent = PIXI.RenderTexture.prototype;
  WindowContent.prototype = Object.create(PIXI.RenderTexture.prototype);
  WindowContent.prototype.constructor = WindowContent;

  WindowContent.prototype.initialize = function(renderer, width, height, skinName) {
    PIXI.RenderTexture.call(this, renderer, width, height, skinName);
    this._objects = [];
    this._skinName = skinName;

    this._style = {
      "font" : "12pt Arial",
      "fill" : "black",
      "align" : "left"
    };
  };

  TCHE.reader(WindowContent.prototype, 'style');
  TCHE.accessor(WindowContent.prototype, 'skinName');

  WindowContent.prototype.update = function() {

  };

  WindowContent.prototype.drawSkinFrame = function() {
    if (!this._skinName) {
      return;
    }

    TCHE.SkinManager.drawSkinFrame(this._skinName, this);
  };

  WindowContent.prototype.clear = function() {
    parent.clear.call(this);
    this.drawSkinFrame();
  };

  WindowContent.prototype.renderObjectInContainer = function(object) {
    var container = new PIXI.Container();
    container.addChild(object);
    this.render(container);
  };

  WindowContent.prototype.renderResized = function(sprite, x, y, width, height) {
    var renderTexture = new PIXI.RenderTexture(TCHE.renderer, width, height);
    
    var matrix = new PIXI.Matrix();
    matrix.scale(width / sprite.width, height / sprite.height);

    renderTexture.render(sprite, matrix);

    var newSprite = new PIXI.Sprite(renderTexture);
    newSprite.x = x;
    newSprite.y = y;
    this.renderObjectInContainer(newSprite);
  };

  WindowContent.prototype.drawRect = function(color, x, y, width, height, alpha) {
    var graphics = new PIXI.Graphics();

    graphics.beginFill(color, alpha);
    graphics.drawRect(x, y, width, height);
    graphics.endFill();

    this.render(graphics);
  };

  WindowContent.prototype.mergeStyles = function(style1, style2) {
    if (!style2) {
      return style1;
    }
    if (!style1) {
      return style2;
    }

    var mergedStyle = TCHE.Clone.shallow(style1);
    for (var key in style2) {
      mergedStyle[key] = style2[key];
    }

    return mergedStyle;
  };

  WindowContent.prototype.drawText = function(text, x, y, style) {
    var mergedStyle = this.mergeStyles(this.style, style);
    var textObj = new PIXI.Text(text, mergedStyle);
    textObj.x = x;
    textObj.y = y;

    this.renderObjectInContainer(textObj);
    return textObj;
  };

  WindowContent.prototype.drawRightAlignedText = function(text, x, y, width, style) {
    var mergedStyle = this.mergeStyles(this.style, style);
    var textObj = new PIXI.Text(text, mergedStyle);
    textObj.x = x;
    textObj.y = y;

    if (textObj.width > width) {
      textObj.width = width;
    } else {
      var diffX = width - textObj.width;
      textObj.x += diffX;
    }

    var container = new PIXI.Container();
    container.addChild(textObj);

    container.width = x + width;
    this.render(container);
    return textObj;      
  };

  WindowContent.prototype.drawTextCentered = function(text, x, y, width, style) {
    var mergedStyle = this.mergeStyles(this.style, style);
    var textObj = new PIXI.Text(text, mergedStyle);
    textObj.x = x;
    textObj.y = y;

    if (textObj.width > width) {
      textObj.width = width;
    } else {
      var diffX = width - textObj.width;
      textObj.x += Math.floor(diffX / 2);
    }

    var container = new PIXI.Container();
    container.addChild(textObj);

    container.width = x + width;
    this.render(container);
    return textObj;
  };

  TCHE.registerClass('WindowContent', WindowContent);
})();