(function(){
  var path = require("path");

  STUDIO.saveSettings = function(){
  };

  STUDIO.saveGameSettings = function(){
    STUDIO.gameData.initialScene = $('#settings-game-initial-scene').val();
    STUDIO.gameData.initialMap = $('#settings-game-initial-map').val();
    STUDIO.gameData.mainSkin = $('#settings-game-main-skin').val();
    STUDIO.gameData.resolution.width = $('#settings-game-resolution-width').val();
    STUDIO.gameData.resolution.height = $('#settings-game-resolution-height').val();
    STUDIO.gameData.resolution.screenWidth = $('#settings-game-screen-width').val();
    STUDIO.gameData.resolution.screenHeight = $('#settings-game-screen-height').val();
    STUDIO.gameData.resolution.useDynamicResolution = $('#settings-game-resolution-use-dynamic-resolution')[0].checked;

    STUDIO.markAsModified();
    STUDIO.openWindow('settings');
  };

  STUDIO.savePlayerSettings = function(){
    STUDIO.gameData.player.sprite = $('#settings-player-sprite').val();
    STUDIO.gameData.player.x = $('#settings-player-x').val();
    STUDIO.gameData.player.y = $('#settings-player-y').val();
    STUDIO.gameData.player.offsetX = $('#settings-player-hitbox-x').val();
    STUDIO.gameData.player.offsetY = $('#settings-player-hitbox-y').val();
    STUDIO.gameData.player.width = $('#settings-player-hitbox-width').val();
    STUDIO.gameData.player.height = $('#settings-player-hitbox-height').val();

    STUDIO.markAsModified();
    STUDIO.openWindow('settings');
  };

  STUDIO.loadGameSettings = function(){
    $('#settings-game-initial-scene').val(STUDIO.gameData.initialScene);
    $('#settings-game-initial-map').val(STUDIO.gameData.initialMap);
    $('#settings-game-main-skin').val(STUDIO.gameData.mainSkin);
    $('#settings-game-resolution-width').val(STUDIO.gameData.resolution.width);
    $('#settings-game-resolution-height').val(STUDIO.gameData.resolution.height);
    $('#settings-game-screen-width').val(STUDIO.gameData.resolution.screenWidth);
    $('#settings-game-screen-height').val(STUDIO.gameData.resolution.screenHeight);
    $('#settings-game-resolution-use-dynamic-resolution')[0].checked = STUDIO.gameData.resolution.useDynamicResolution;
  };

  STUDIO.loadPlayerSettings = function(){
    $('#settings-player-sprite').val(STUDIO.gameData.player.sprite);
    $('#settings-player-x').val(STUDIO.gameData.player.x);
    $('#settings-player-y').val(STUDIO.gameData.player.y);
    $('#settings-player-hitbox-x').val(STUDIO.gameData.player.offsetX);
    $('#settings-player-hitbox-y').val(STUDIO.gameData.player.offsetY);
    $('#settings-player-hitbox-width').val(STUDIO.gameData.player.width);
    $('#settings-player-hitbox-height').val(STUDIO.gameData.player.height);
  };
})();