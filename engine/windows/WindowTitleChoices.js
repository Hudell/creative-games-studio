(function(){
  function WindowTitleChoices() {
    this.initialize();
  }

  WindowTitleChoices.prototype = Object.create(TCHE.ChoiceWindow.prototype);
  WindowTitleChoices.prototype.constructor = WindowTitleChoices;

  WindowTitleChoices.prototype.initialize = function() {
    TCHE.ChoiceWindow.prototype.initialize.call(this, 224, 68);
  };

  WindowTitleChoices.prototype.getStartFromTheBottom = function() {
    return true;
  };

  WindowTitleChoices.prototype.makeChoiceList = function() {
    this._choices = [];
    this.addChoice('startGame', 'Start Game');
    this.addChoice('quitGame', 'Quit Game');
  };

  WindowTitleChoices.prototype.onChoice = function(index) {
    switch(index) {
      case 0 :
        TCHE.globals.map.changeMap(TCHE.data.game.initialMap);
        break;
      case 1 :
        console.log("There's no quitting. You're here FOREVER.");
        // TCHE.SceneManager.end();
        break;
    }
  };

  WindowTitleChoices.prototype.getChoiceAlign = function() {
    return "center";
  };

  WindowTitleChoices.prototype.draw = function() {
    this.drawChoices();
  };

  TCHE.registerClass('WindowTitleChoices', WindowTitleChoices);
})();