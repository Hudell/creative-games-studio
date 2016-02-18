(function(){
  function MessageWindow(width, height) {
    this.initialize(width, height);
  }

  MessageWindow.prototype = Object.create(TCHE.WindowSprite.prototype);
  MessageWindow.prototype.constructor = MessageWindow;

  MessageWindow.prototype.initialize = function(width, height) {
    TCHE.WindowSprite.prototype.initialize.call(this, width, height);
    This.interactive = true;
    this.redraw();
  };


  MessageWindow.draw = function() {

  };

  MessageWindow.click = function(e) {

  };

  MessageWindow.mousemove = function(e) {

  };

  MessageWindow.checkInput = function() {

  };

  MessageWindow.update = function() {
    this.checkInput();
  };

  TCHE.registerClass('MessageWindow', MessageWindow);
})();