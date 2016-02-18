(function(){
  function ChoiceWindow(width, height) {
    this.initialize(width, height);
  }

  ChoiceWindow.prototype = Object.create(TCHE.WindowSprite.prototype);
  ChoiceWindow.prototype.constructor = ChoiceWindow;

  ChoiceWindow.prototype.initialize = function(width, height) {
    TCHE.WindowSprite.prototype.initialize.call(this, width, height);
    this.interactive = true;
    this._index = 0;

    this.redraw();
  };

  ChoiceWindow.prototype.getStartFromTheBotton = function() {
    return false;
  };
  TCHE.reader(ChoiceWindow.prototype, 'startFromTheBottom', ChoiceWindow.prototype.getStartFromTheBotton);

  ChoiceWindow.prototype.getMakeSpaceForCursor = function() {
    return false;
  };
  TCHE.reader(ChoiceWindow.prototype, 'makeSpaceForCursor', ChoiceWindow.prototype.getMakeSpaceForCursor);

  ChoiceWindow.prototype.getCursorPadding = function() {
    return 4;
  };
  TCHE.reader(ChoiceWindow.prototype, 'cursorPadding', ChoiceWindow.prototype.getCursorPadding);

  ChoiceWindow.prototype.getInputDelayCount = function() {
    return 10;
  };

  TCHE.reader(ChoiceWindow.prototype, 'inputDelayCount', ChoiceWindow.prototype.getInputDelayCount);

  ChoiceWindow.prototype.getCursorMargin = function() {
    var dimension = TCHE.SkinManager.getSkinCursorSize(this.skinName);
    return dimension.width + (this.cursorPadding * 2);  
  };

  TCHE.reader(ChoiceWindow.prototype, 'cursorMargin', ChoiceWindow.prototype.getCursorMargin);

  ChoiceWindow.prototype.setIndex = function(value) {
    if (value < this._choices.length) {
      this._index = value;
    }

    if (this._index < 0 || this._index >= this._choices.length) {
      this._index = 0;
    }

    this.redraw();
  };

  TCHE.accessor(ChoiceWindow.prototype, 'index', ChoiceWindow.prototype.setIndex);

  ChoiceWindow.prototype.getChoiceAlign = function() {
    return 'left';
  };
  TCHE.reader(ChoiceWindow.prototype, 'choiceAlign', ChoiceWindow.prototype.getChoiceAlign);

  ChoiceWindow.prototype.getItemWidth = function() {
    return this.width - (this.margin * 2);  
  };

  TCHE.reader(ChoiceWindow.prototype, 'itemWidth', ChoiceWindow.prototype.getItemWidth);

  ChoiceWindow.prototype.getHighlightColor = function() {
    return 'grey';
  };

  TCHE.reader(ChoiceWindow.prototype, 'highlightColor', ChoiceWindow.getHighlightColor);

  ChoiceWindow.prototype.draw = function() {
    this.drawChoices();
  };

  ChoiceWindow.prototype.drawChoice = function(index) {
    var choice = this._choices[index];
    var position = this.getChoicePosition(index);
    var y = position.y;
    var x = position.x;
    var width = this.itemWidth;
    var style = {};

    var align = this.choiceAlign;

    if (index == this.index) {
      style.dropShadow = true;
      style.dropShadowColor = this.highlightColor;
      style.dropShadowDistance = 1;

      var dimension = TCHE.SkinManager.getSkinCursorSize(this.skinName);
      var cursorY = y + (this.lineHeight - dimension.height) / 2;
      this.drawCursor(x + this.cursorPadding, cursorY);

      if (align == 'left') {
        x += this.cursorMargin;
        width -= this.cursorMargin;
      }
    } else if (align == 'left' && this.makeSpaceForCursor) {
      x += this.cursorMargin;
      width -= this.cursorMargin;
    }

    switch(align) {
      case 'left' :
        this._contents.drawText(choice.displayName, x, y, style);
        break;
      case 'center' : 
        this._contents.drawTextCentered(choice.displayName, x, y, width, style);
        break;
      case 'right' :
        this._contents.drawRightAlignedText(choice.displayName, x, y, width, style);
        break;
    }
  };

  ChoiceWindow.prototype.getChoiceAtGlobal = function(x, y) {
    var globalX = x;
    var globalY = y;
    var myGlobalX = this.worldTransform.tx;
    var myGlobalY = this.worldTransform.ty;

    var localX = globalX - myGlobalX;
    var localY = globalY - myGlobalY;

    return this.getChoiceAt(localX, localY);
  };

  ChoiceWindow.prototype.getChoiceAt = function(x, y) {
    for (var i = 0; i < this._choices.length; i++) {
      var pos = this.getChoicePosition(i);

      if (x >= pos.x && y >= pos.y && y <= pos.y + this.lineHeight && x <= pos.x + this.itemWidth) {
        return i;
      }
    }

    return -1;
  };

  ChoiceWindow.prototype.triggerChoiceAtGlobal = function(x, y) {
    var choice = this.getChoiceAtGlobal(x, y);
    return this.triggerChoice(choice);
  };

  ChoiceWindow.prototype.selectChoiceAtGlobal = function(x, y) {
    var choice = this.getChoiceAtGlobal(x, y);
    this.selectChoice(choice);
  };

  ChoiceWindow.prototype.triggerChoice = function(index) {
    if (index >= 0) {
      this.onChoice(index);
    }
  };

  ChoiceWindow.prototype.selectChoice = function(index) {
    if (index >= 0) {
      this.index = index;
    }
  };

  ChoiceWindow.prototype.selectChoiceAt = function(x, y) {
    var choice = this.getChoiceAt(x, y);
    this.selectChoice(choice);
  };

  ChoiceWindow.prototype.triggerChoiceAt = function(x, y) {
    var choice = this.getChoiceAt(x, y);
    return this.triggerChoice(choice);
  };

  ChoiceWindow.prototype.click = function(e) {
    this.triggerChoiceAtGlobal(e.data.global.x, e.data.global.y);
  };

  ChoiceWindow.prototype.mousemove = function(e) {
    this.selectChoiceAtGlobal(e.data.global.x, e.data.global.y);
  };

  ChoiceWindow.prototype.drawChoices = function() {
    for (var i = 0; i < this._choices.length; i++) {
      this.drawChoice(i);
    }
  };

  ChoiceWindow.prototype.onChoice = function(index) {
    
    console.log('onChoice', index);
  };

  ChoiceWindow.prototype.refresh = function() {
    this.makeChoiceList();
    TCHE.WindowSprite.prototype.refresh.call(this);
  };

  ChoiceWindow.prototype.makeChoiceList = function() {
    this._choices = [];
  };

  ChoiceWindow.prototype.addChoice = function(code, displayName) {
    this._choices.push({code : code, displayName : displayName});
  };

  ChoiceWindow.prototype.getChoicePosition = function(index) {
    var y = index * this.lineHeight + this.margin;
    var x = this.margin;

    if (this.startFromTheBottom) {
      var reverseIndex = this._choices.length - index;
      y = this.height - this.margin - (reverseIndex * this.lineHeight);
    }

    return { x : x, y : y };
  };

  ChoiceWindow.prototype.moveUp = function() {
    if (this._index < 0) {
      this._index = this._choices.length;
    }

    this._index--;

    if (this._index < 0) {
      this._index = this._choices.length - 1;
    }

    this.redraw();
  };

  ChoiceWindow.prototype.moveDown = function() {
    if (this._index < 0) {
      this._index = -1;
    }

    this._index++;

    if (this._index >= this._choices.length) {
      this._index = 0;
    }

    this.redraw();
  };

  ChoiceWindow.prototype.triggerCurrentChoice = function() {
    if (this._index >= 0) {
      this.triggerChoice(this._index);
    }
  };

  ChoiceWindow.prototype.checkInput = function() {
    if (!!this._inputDelay) {
      this._inputDelay--;
      return;
    }

    var direction = TCHE.InputManager.getDirection();
    if (direction.indexOf('up') >= 0) {
      this._inputDelay = this.inputDelayCount;
      this.moveUp();
    } else if (direction.indexOf('down') >= 0) {
      this._inputDelay = this.inputDelayCount;
      this.moveDown();
    } else if (TCHE.InputManager.isKeyNamePressed('ok')) {
      this._inputDelay = this.inputDelayCount;
      this.triggerCurrentChoice();
    }
  };

  ChoiceWindow.prototype.update = function() {
    this.checkInput();
  };

  TCHE.registerClass('ChoiceWindow', ChoiceWindow);
})();