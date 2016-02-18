(function(){
  function CharacterSprite(character) {
    this.initialize(character);
  }

  CharacterSprite.prototype = Object.create(TCHE.Sprite.prototype);
  CharacterSprite.prototype.constructor = CharacterSprite;

  CharacterSprite.prototype.initialize = function(character) {
    TCHE.Sprite.prototype.call(this);
    this._character = character;
    this.createPixiSprite();
  };

  TCHE.reader(CharacterSprite.prototype, 'character');

  CharacterSprite.createPixiSprite = function() {
    if (this._character.dirty || !this._sprite) {
      if (!!this._character.sprite) {
        this.removeChildren();

        this._sprite = TCHE.SpriteManager.loadSprite(this._character);
        var frame = TCHE.SpriteManager.getSpriteFrame(this._character, this._sprite, this._character.sprite);
        if (frame === false) {
          this._useFrame = false;
        } else {
          this._useFrame = true;
          this._frame = frame;
        }
        this.addChild(this._sprite);

        this._character.dirty = false;
      }
    }
  };

  CharacterSprite.update = function() {
    //Makes sure the sprite exists
    this.createPixiSprite();

    if (!this._sprite) return;

    //Syncs the position
    this.position.x = this._character.x + this._character.offsetX;
    this.position.y = this._character.y + this._character.offsetY;

    TCHE.SpriteManager.updateCharacterSprite(this._sprite, this._character);
  };
  
  TCHE.registerClass('CharacterSprite', CharacterSprite);
})();