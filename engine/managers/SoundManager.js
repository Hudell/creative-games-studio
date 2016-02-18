(function(){
  function SoundManager() {

  }

  SoundManager.play = function(soundName) {
    createjs.Sound.play(soundName);
  };

  TCHE.registerStaticClass('SoundManager', SoundManager);
})();