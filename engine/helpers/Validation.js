(function(){
  function Validation() {

  }

  Validation.hasAnySkin = function() {
    if (!TCHE.data.game.skins) {
      return false;
    }

    for (var key in TCHE.data.game.skins) {
      return true;
    }

    return false;
  };

  Validation.hasAnySprite = function() {
    if (!TCHE.data.game.sprites) {
      return false;
    }

    for (var key in TCHE.data.game.sprites) {
      return true;
    }

    return false;
  };

  Validation.hasPlayerSprite = function() {
    if (!TCHE.data.game.player.sprite) {
      return false;
    }

    if (!TCHE.data.game.sprites[TCHE.data.game.player.sprite]) {
      return false;
    }

    return true;
  };

  Validation.checkBasicFiles = function() {
    try{
      // if (!this.hasAnySkin()) {
      //   throw new Error("There's no skin configured.");
      // }

      if (!this.hasAnySprite()) {
        throw new Error("There's no sprite configured.");
      }

      if (!this.hasPlayerSprite()) {
        throw new Error("The player's sprite doesn't exist.");
      }
    }
    catch(e) {
      alert(e);
      TCHE.SceneManager.end();
    }
  };

  TCHE.Validation = Validation;
})();