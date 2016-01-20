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

  TCHE.addCodeLineToSelect = function(selectId, index, codeLine) {
    var type = '';
    if (!!codeLine) {
      type = codeLine.code;
    }

    var line = '<option value="' + type + '">';
    if (!!codeLine) {
      line += TCHE.getCodeCommandDescription(codeLine);
    }

    line += '</option>';

    $('#' + selectId).append(line);
  };

  TCHE.closeCommandWindowAndRefresh = function(event, increaseSelection) {
    var selectedIndex = $('#edit-code-list')[0].selectedIndex;
    if (selectedIndex < 0) {
      selectedIndex = TCHE._currentCode.codeLines.length;
    }

    $(event.currentTarget).parents('.popup').parent().dialog('close');
    
    if (!!increaseSelection || increaseSelection === undefined) {
      selectedIndex++;
    }

    TCHE.refreshCodeSelectList();

    $('#edit-code-list')[0].selectedIndex = selectedIndex;
  };

  TCHE.addCommandToScreenCode = function(command) {
    var selectedIndex = $('#edit-code-list')[0].selectedIndex;

    if (selectedIndex >= 0 && selectedIndex < TCHE._currentCode.codeLines.length) {
      TCHE._currentCode.codeLines.splice(selectedIndex, 0, command);
    } else {
      TCHE._currentCode.codeLines.push(command);
    }
  };

  TCHE.registerCodeCommandEvents = function() {
    $('#code-command-exit').on('click', function(event){
      event.preventDefault();

      TCHE.addCommandToScreenCode({
        code : 'exit'
      });

      TCHE.closeCommandWindowAndRefresh(event);
    });

    $('#code-command-wait').on('click', function(event){
      event.preventDefault();

      TCHE.addCommandToScreenCode({
        code : 'wait'
      });

      TCHE.closeCommandWindowAndRefresh(event);
    });
  };

  TCHE.checkIfCodeOwnVariableExists = function(ownVariableName) {
    if (!TCHE._currentCode) {
      return false;
    }
  };

  TCHE.removeSelectedCodeCommand = function() {
    var selectedIndex = $('#edit-code-list')[0].selectedIndex;

    if (selectedIndex >= 0 && selectedIndex < TCHE._currentCode.codeLines.length) {
      TCHE._currentCode.codeLines.splice(selectedIndex, 1);
    }

    TCHE.refreshCodeSelectList();
  };

  TCHE.getCodeCommandDescription = function(command) {
    if (!command || !command.code) return '';

    switch (command.code) {
      case 'wait' :
        return 'Wait';
      case 'exit' :
        return 'Exit Code Block';
      default :
        return '';
    }
  };

  TCHE.showCodeOptions = function() {
    TCHE.openPopup('code-command-list', 'Add Command', function(){
      TCHE.registerCodeCommandEvents();
    });
  };

  TCHE.createCodeSelectList = function(selectId, code) {
    $('#' + selectId).html('');

    for (var i = 0; i < code.length; i++) {
      TCHE.addCodeLineToSelect(selectId, i + 1, code[i]);
    }
    
    TCHE.addCodeLineToSelect(selectId, code.length + 1, null);
  };

  TCHE.saveCode = function () {
  };

  TCHE.removeCode = function(codeName) {
    delete TCHE.gameData.codeList[codeName];
    TCHE.markAsModified();
  };

  TCHE.startNewCode = function() {
    TCHE._currentCode = {
      name : '',
      oldName : '',
      initialization : [],
      codeLines : [],
      returnType : 'none'
    };

    TCHE.openWindow('edit-code', function(){
      TCHE.refreshCodeSelectList();
    });
  };

  TCHE.refreshCodeSelectList = function(){
    var selectedIndex = $('#edit-code-list')[0].selectedIndex;
    
    TCHE.createCodeSelectList('edit-code-list', TCHE._currentCode.codeLines);

    if (selectedIndex >= 0) {
      $('#edit-code-list')[0].selectedIndex = selectedIndex;
    }
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