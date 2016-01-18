(function(){
  var path = require("path");

  TCHE.saveSettings = function(){
  };

  TCHE.saveGameSettings = function(){
    TCHE.gameData.initialScene = $('#settings-game-initial-scene').val();
    TCHE.gameData.initialMap = $('#settings-game-initial-map').val();
    TCHE.gameData.mainSkin = $('#settings-game-main-skin').val();
    TCHE.gameData.resolution.width = $('#settings-game-resolution-width').val();
    TCHE.gameData.resolution.height = $('#settings-game-resolution-height').val();
    TCHE.gameData.resolution.screenWidth = $('#settings-game-screen-width').val();
    TCHE.gameData.resolution.screenHeight = $('#settings-game-screen-height').val();

    TCHE.markAsModified();
    TCHE.openWindow('settings');
  };

  TCHE.savePlayerSettings = function(){
    TCHE.gameData.player.sprite = $('#settings-player-sprite').val();
    TCHE.gameData.player.x = $('#settings-player-x').val();
    TCHE.gameData.player.y = $('#settings-player-y').val();
    TCHE.gameData.player.offsetX = $('#settings-player-hitbox-x').val();
    TCHE.gameData.player.offsetY = $('#settings-player-hitbox-y').val();
    TCHE.gameData.player.width = $('#settings-player-hitbox-width').val();
    TCHE.gameData.player.height = $('#settings-player-hitbox-height').val();

    TCHE.markAsModified();
    TCHE.openWindow('settings');
  };

  TCHE.loadGameSettings = function(){
    $('#settings-game-initial-scene').val(TCHE.gameData.initialScene);
    $('#settings-game-initial-map').val(TCHE.gameData.initialMap);
    $('#settings-game-main-skin').val(TCHE.gameData.mainSkin);
    $('#settings-game-resolution-width').val(TCHE.gameData.resolution.width);
    $('#settings-game-resolution-height').val(TCHE.gameData.resolution.height);
    $('#settings-game-screen-width').val(TCHE.gameData.resolution.screenWidth);
    $('#settings-game-screen-height').val(TCHE.gameData.resolution.screenHeight);
  };

  TCHE.loadPlayerSettings = function(){
    $('#settings-player-sprite').val(TCHE.gameData.player.sprite);
    $('#settings-player-x').val(TCHE.gameData.player.x);
    $('#settings-player-y').val(TCHE.gameData.player.y);
    $('#settings-player-hitbox-x').val(TCHE.gameData.player.offsetX);
    $('#settings-player-hitbox-y').val(TCHE.gameData.player.offsetY);
    $('#settings-player-hitbox-width').val(TCHE.gameData.player.width);
    $('#settings-player-hitbox-height').val(TCHE.gameData.player.height);
  };
})();