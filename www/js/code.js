(function(){
  var path = require("path");

  TCHE.addCode = function(selector, name, codeData) {
    var data = [];
    data.push(name);

    TCHE.addRowToTable(selector, data, 'code', name);
  };

  TCHE.loadCodeList = function(selector) {
    if (!TCHE.gameData.codeList) {
      return;
    }

    for (var name in TCHE.gameData.codeList) {
      TCHE.addCode(selector, name, TCHE.gameData.codeList[name]);
    }
  };

  TCHE.addCodeLineToTable = function(tableId, index, codeLine) {
    var line = '<tr><td>';
    if (!!codeLine) {

    }

    line += '<a href="#" class="code-add" data-index="' + index + '" style="float:right"><i class="fa fa-plus fa-fw"></i></a>';
    line += '</td></tr>';

    $('#' + tableId).children('tbody').append(line);
  };

  TCHE.showCodeOptionsForInitialization = function() {
    TCHE.openPopup('code-command-list', 'Add Command');
  };

  TCHE.showCodeOptions = function() {

  };

  TCHE.createCodeTable = function(tableId, code, init) {
    $('#' + tableId).children('tbody').html('');

    TCHE.addCodeLineToTable(tableId, 0, null);
    for (var i = 0; i < code.length; i++) {
      TCHE.addCodeLineToTable(tableId, i + 1, code[i]);
    }
    if (code.length > 0) {
      TCHE.addCodeLineToTable(tableId, code.length + 1, null);
    }

    if (init) {
      $('#' + tableId).find('.code-add').on('click', function(event){
        event.preventDefault();
        TCHE.showCodeOptionsForInitialization();
      });
    } else {
      $('#' + tableId).find('.code-add').on('click', function(event){
        event.preventDefault();
        TCHE.showCodeOptions();
      });      
    }
  };

  TCHE.saveNewCode = function () {
  };

  TCHE.removeCode = function(codeName) {
    delete TCHE.gameData.codeList[codeName];
    TCHE.markAsModified();
  };

  TCHE.editCode = function(codeName) {
    if (!TCHE.gameData.codeList[codeName]) {
      throw new Error("Code " + codeName + " not found.");
    }

    
  };

  TCHE.fillCodes = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    var codeList = TCHE.gameData.codeList;
    for (var key in codeList) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };
})();