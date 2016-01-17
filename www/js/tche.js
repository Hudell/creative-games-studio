$(function(){
  window.onerror = function(msg, url, line, col, error) {
    TCHE.openDialog($("<div></div>").html(error.message));
    return false;
  };
});

var TCHE = {};
(function(){
  var path = require("path");
  var fs = require("fs");

  TCHE.gameData = undefined;
  TCHE.loadedGame = {
    folder : "",
    modified : false
  };
  TCHE.currentGamePath = path.join(path.resolve("."), 'currentGame');

  TCHE.requestPage = function(pageName, onSuccess, onError) {
    var mimeType = "text/html";
    var filePath = './pages/' + pageName;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', filePath);
    if (mimeType && xhr.overrideMimeType) {
      xhr.overrideMimeType(mimeType);
    }
    xhr.onload = function(result){
      if (xhr.status < 400) {
        onSuccess.call(this, result, xhr);
      } else {
        if (!!onError) {
          onError.call(this);
        }
      }
    };
    xhr.onerror = onError;
    xhr.send();
  };

  TCHE.openDialog = function(element, title) {
    element.dialog({
      title : title || "Information",
      width : 'auto',
      modal : true,
      close: function () {
        $(this).dialog('destroy').remove ();
      },
      buttons: [
        {
          text: "Ok",
          click: function() {
            $( this ).dialog( "close" );
          }
        }
      ]      
    });
  }

  TCHE.showMessage = function(message) {
    TCHE.openDialog($("<div></div>").html(message));
  };

  TCHE.loadJson = function(fileName) {
    if (!fs.existsSync(fileName)) {
      console.log("File not found: ", fileName);
      throw new Error("File not found");
    }

    var content = fs.readFileSync(fileName, {encoding : 'utf8'});

    return JSON.parse(content);
  };

  TCHE.saveJson = function(fileName, json) {
    var content = JSON.stringify(json, null, '  ');
    fs.writeFileSync(fileName, content, {encoding : 'utf8'});
  };

  TCHE.clearTableRows = function(tableId) {
    $('#' + tableId).children('tbody').html('');
  }

  TCHE.addRowToTable = function(tableId, data, className, id) {
    var row = '<tr>';

    data.forEach(function(col){
      row += '<td>';
      row += col;
      row += '</td>';
    });

    row += '<td>';
    row += '<a href="#" class="' + className + '-edit" data-element-id="' + id + '"><i class="fa fa-edit fa-fw"></i></a>';
    row += '<a href="#" class="' + className + '-delete" data-element-id="' + id + '"><i class="fa fa-remove fa-fw"></i></a>';
    row += '</td>';
    row += '</tr>';

    $('#' + tableId).children('tbody').append(row);
  };

  TCHE.openWindow = function(windowName) {
    $('.menu-option').parent().removeClass('active');
    
    if (windowName !== 'index') {
      if (!TCHE.isGameLoaded()) {
        TCHE.openWindow('index');
        throw new Error("There's no game loaded.");
      }
    }

    TCHE.requestPage(windowName + '.html', function(result, xhr){
      $('#page-wrapper').html(xhr.responseText);
    });

    $('#' + windowName + '-btn').addClass('active');
  };

  TCHE.changeLoadedPath = function(newPath) {
    if (!TCHE.loadedGame) {
      TCHE.loadedGame = TCHE.loadJson('loadedGame.json');
    }

    TCHE.loadedGame.folder = newPath;
    TCHE.saveJson('loadedGame.json', TCHE.loadedGame);

    TCHE.changeGamePath(newPath);
  };

  TCHE.eventOpenWindow = function(event, windowName) {
    event.preventDefault();
    TCHE.openWindow(windowName);
  };

  TCHE.openProject = function(folderPath) {
    if (!fs.existsSync(path.join(folderPath, "game.json"))) {
      throw new Error("Game Data not found");
    }
    if (!fs.existsSync(path.join(folderPath, 'index.html'))) {
      throw new Error("Game Index not found");
    }
    if (!fs.existsSync(path.join(folderPath, 'main.js'))) {
      throw new Error("Main Game not found");
    }

    TCHE.loadProject(folderPath);
  };

  TCHE.saveProject = function() {
    TCHE.copyFolderSync('currentGame', TCHE.loadedGame.folder);
  };

  TCHE.playProject = function() {
    window.open('file://' + TCHE.currentGamePath + '/index.html?debug');
  };

  TCHE.removeFolderContent = function(folderPath) {
    var files;

    try {
      files = fs.readdirSync(folderPath);
    }
    catch(e) {
      console.log("Failed to clean folder content", folderPath);
      throw new Error("Failed clean folder content");
    }

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var filePath = path.join(folderPath, files[i]);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        } else {
          TCHE.removeFolderContent(filePath);
          fs.rmdirSync(filePath);
        }
      }
    }
  };

  TCHE.copyFolderSync = function(folderPath, destinationPath) {
    var files = [];

    //check if folder needs to be created or integrated
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath);
    }

    //copy
    if (fs.lstatSync(folderPath).isDirectory() ) {
      files = fs.readdirSync(folderPath);
      files.forEach(function(file) {
        var curSource = path.join(folderPath, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          TCHE.copyFolderSync(curSource, path.join(destinationPath, file));
        } else {
          TCHE.copyFileSync(curSource, destinationPath);
        }
      });
    }
  };

  TCHE.forceDirSync = function(dirPath) {
    var dirname = path.dirname(dirPath);
    if (!fs.existsSync(dirname)) {
      TCHE.forceDirSync(dirname);
    }

    fs.mkdirSync(dirPath);
  };

  TCHE.copyFileSync = function(source, target) {
    var targetFile = target;

    var dirname = path.dirname(target);
    if (!fs.existsSync(dirname)) {
      TCHE.forceDirSync(dirname);
    }

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  };

  TCHE.loadProject = function(folderPath) {
    TCHE.changeLoadedPath('');
    
    TCHE.removeFolderContent('currentGame');
    TCHE.copyFolderSync(folderPath, 'currentGame');
    TCHE.loadGameData();

    TCHE.changeLoadedPath(folderPath);
  };

  TCHE.openProjectDialog = function() {
    var dialog = $("<input type='file' nwdirectory>");

    dialog.on('change', function(){
      TCHE.openProject(dialog.val());
    });

    dialog.click();
  };

  TCHE.changeGameTitle = function(newTitle) {
    $('#gameName').html(newTitle);
  };

  TCHE.changeGamePath = function(newPath) {
    $('#gamePath').html(newPath);
  };

  TCHE.loadLoadedGameInfo = function() {
    try {
      TCHE.loadedGame = TCHE.loadJson('loadedGame.json');
    }
    catch(e) {
      TCHE.changeGamePath("");
      throw e;
    }

    TCHE.changeGamePath(TCHE.loadedGame.folder);
  };

  TCHE.loadGameData = function() {
    try {
      TCHE.gameData = TCHE.loadJson('currentGame/game.json');
    }
    catch(e) {
      TCHE.changeGameTitle('No Game Loaded');
      throw e;
    }

    if (!!TCHE.gameData && !!TCHE.gameData.name) {
      TCHE.changeGameTitle(TCHE.gameData.name);
    }

    TCHE.openWindow('index');
  };

  TCHE.saveGameData = function() {
    TCHE.saveJson('currentGame/game.json', TCHE.gameData);
  }

  TCHE.isFileImported = function(filePath) {
    var currentGame = TCHE.currentGamePath;
    var loadedPath = TCHE.loadedGame.folder;

    return filePath.indexOf(currentGame) === 0 || filePath.indexOf(loadedPath) === 0;
  };

  TCHE.isGameLoaded = function(){
    return !!TCHE.loadedGame.folder && !!TCHE.gameData;
  };


})();

$(function(){
  $('#index-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'index'); });
  $('#sprites-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'sprites'); });
  $('#skins-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'skins'); });
  $('#settings-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings'); });

  $('#open-btn').on('click', function(event) {
    TCHE.openProjectDialog();
  });
  $('#save-btn').on('click', function(event) {
    TCHE.saveProject();
  });
  $('#play-btn').on('click', function(event) {
    TCHE.playProject();
  });

  TCHE.openWindow('index');

  TCHE.loadLoadedGameInfo();
  if (!!TCHE.loadedGame.folder) {
    TCHE.loadGameData();
  }

  var gui = require('nw.gui');
  var win = gui.Window.get();
  win.maximize();
});