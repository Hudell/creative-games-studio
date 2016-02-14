STUDIO.Picker = {};

(function(Picker){
  var path = require('path');
  var fs = require('fs');

  var searchTimeoutHandler = 0;
  var currentColumns = [];
  var currentData = [];
  var maxRows = 10;
  var lastFilter = false;
  var keyColumn = 0;

  Picker.onPick = null;

  Picker.requestPicker = function(pickerName, onSuccess, onError) {
    var fileName = path.join('pickers', pickerName + '.html');
    STUDIO.requestPage(fileName, onSuccess, onError);
  };

  Picker.addRowToTable = function(row, key) {
    var rowStr = '<tr>';

    for (var i = 0; i < currentColumns.length; i++) {
      var column = currentColumns[i];
      if (i >= row.length) break;

      rowStr += '<td>';

      var value = row[i];
      if (value === undefined || value === null) {
        value = '';
      }
      if (typeof(value) !== "string") {
        if (!!value.toString) {
          value = value.toString();
        } else {
          value = '';
        }
      }

      if (column.type == "image") {
        value = '<img src="' + value + '"/>';
      }

      rowStr += value;
      rowStr += '</td>';
    }

    rowStr += '<td><a href="#" data-key="' + key + '"><i class="fa fw fa-sign-in"></i></a></td>';

    rowStr += '</tr>';

    $('#picker-table').find('tbody').append(rowStr);
  };

  Picker.checkIfRowMatchesFilter = function(row, filter) {
    if (filter.trim() === '') return true;
    filter = filter.toLowerCase();

    for (var i = 0; i < row.length; i++) {
      var value = row[i];
      if (value === undefined || value === null) continue;

      if (typeof(value) !== "string") {
        if (!value.toString) continue;

        value = value.toString();
      }

      value = value.toLowerCase();

      if (value.indexOf(filter) >= 0) {
        return true;
      }
    }

    return false;
  };

  Picker.applyFilter = function(filter) {
    if (filter === lastFilter) return;
    lastFilter = filter;

    var body = $('#picker-table').find('tbody');
    body.html('');
    var addedRows = 0;

    for (var i = 0; i < currentData.length; i++) {
      if (addedRows >= maxRows) break;

      if (Picker.checkIfRowMatchesFilter(currentData[i], filter)) {
        addedRows++;
        Picker.addRowToTable(currentData[i], currentData[i][keyColumn]);
      }
    }

    body.find('a').on('click', function(event){
      event.preventDefault();

      var key = event.currentTarget.dataset.key;
      Picker.onPick(key);
      $('#picker-div').dialog("close");
    });
  };

  Picker.onChangeFilter = function() {
    if (searchTimeoutHandler > 0) {
      clearTimeout(searchTimeoutHandler);
    }

    searchTimeoutHandler = setTimeout(function(){
      searchTimeoutHandler = 0;
      
      var filter = $('#picker-search').val();
      if (filter === undefined) return;

      Picker.applyFilter(filter);
    }, 400);
  };

  Picker.openSimplePicker = function(pickerType, title, onPick, onLoad) {
    Picker.onPick = onPick;

    Picker.requestPicker(pickerType, function(result, xhr){
      var div = $('<div id="picker-div"></div>');
      div.html(xhr.responseText);
      $(document.body).append(div);
      div = $('#picker-div');

      STUDIO.fixLinks();
      STUDIO.applyTranslation();

      if (!!onLoad) {
        onLoad();
      }

      STUDIO.openDialog(div, title, [
        {
          text : t("Confirm"),
          click : function(){
            var value = $('#picker-value').val();
            $(this).dialog("close");
            onPick(value);
          }
        },
        {
          text : t("Close"),
          click : function(){
            $(this).dialog("close");
          }
        }
      ], 600);

    });
  };

  Picker.openPicker = function(pickerType, title, onPick, columns, data, keyColumn, onLoad) {
    Picker.onPick = onPick;

    Picker.requestPicker(pickerType, function(result, xhr){
      var div = $('<div id="picker-div"></div>');
      div.html(xhr.responseText);
      $(document.body).append(div);
      div = $('#picker-div');

      currentData = data;
      currentColumns = columns;

      var tr = $('#picker-table').find('thead').find('tr');
      for (var i = 0; i < columns.length; i++) {
        tr.append('<th>' + columns[i].name + '</th>')
      }
      tr.append('<th>' + t("Pick") + '</th>');

      $('#picker-search').on('keypress', Picker.onChangeFilter);
      $('#picker-search').on('keydown', Picker.onChangeFilter);
      $('#picker-search').on('change', Picker.onChangeFilter);

      lastFilter = false;
      Picker.applyFilter('');

      STUDIO.fixLinks();
      STUDIO.applyTranslation();

      STUDIO.openDialog(div, title, [
        {
          text : t("Clear"),
          click : function(){
            onPick('');
            $(this).dialog("close");
          }
        },
        {
          text : t("Close"),
          click : function(){
            $(this).dialog("close");
          }
        }
      ], 600);

      if (!!onLoad) {
        onLoad();
      }
    });
  };

  Picker.pickSprite = function(onPick) {
    var sprites = STUDIO.gameData.sprites;
    var columns = [];
    var data = [];
    var keyColumn = 0;

    columns.push({ name : t("Name"), type : "string"});
    columns.push({ name : t("Type"), type : "string"});
    columns.push({ name : t("Image"), type : "image"});
    columns.push({ name : t("Width"), type : "number"});
    columns.push({ name : t("Height"), type : "number"});
    columns.push({ name : t("Index"), type : "number"});

    for (var key in sprites) {
      var sprite = sprites[key];
      var newSprite = [];

      newSprite.push(key);
      newSprite.push(sprite.type);

      var fullImagePath = path.join(STUDIO.settings.folder, sprite.image);

      newSprite.push(fullImagePath);
      newSprite.push(sprite.width);
      newSprite.push(sprite.height);
      newSprite.push(sprite.index);

      data.push(newSprite);
    }

    Picker.openPicker('picker', t("Sprite Picker"), onPick, columns, data, keyColumn, function(){
      // On Load
    });
  };

  Picker.pickType = function(baseType, onPick) {
    var types = STUDIO.ObjectManager.getFilteredObjectList(baseType);
    var columns = [];
    var data = [];
    var keyColumn = 0;

    columns.push({ name : t("Name"), type : "string"});
    columns.push({ name : t("Based On"), type : "string"});

    for (var key in types) {
      var typeData = types[key];
      var newType = [];

      newType.push(key);
      newType.push(typeData.inherits);

      data.push(newType);
    }

    Picker.openPicker('picker', t("Object Picker"), onPick, columns, data, keyColumn, function(){
      // On Load
    });
  };

  Picker.pickString = function(currentValue, label, onPick) {
    Picker.openSimplePicker('string', t("Type a String"), onPick, function(){
      $('#picker-value').val(currentValue);
      $('#picker-label').html(label);
    });
  };

  Picker.pickBoolean = function(currentValue, label, onPick) {
    Picker.openSimplePicker('boolean', t("Enable / Disable"), function(){
      onPick($('#picker-value')[0].checked);
    }, function(){
      $('#picker-value')[0].checked = currentValue;
      $('#picker-label').html(label);
    });
  };

  Picker.pickNumber = function(currentValue, label, onPick) {
    Picker.openSimplePicker('number', t("Type a Number"), onPick, function(){
      $('#picker-value').val(currentValue);
      $('#picker-label').html(label);
    });
  };

  Picker.pickEvent = function(currentCodeLines, onPick) {
    Picker.onPick = onPick;

    Picker.requestPicker('event', function(result, xhr){
      var div = $('<div id="picker-div"></div>');
      div.html(xhr.responseText);
      $(document.body).append(div);
      div = $('#picker-div');

      STUDIO.fixLinks();
      STUDIO.applyTranslation();

      var codeLines = STUDIO.deepClone(currentCodeLines);

      STUDIO.ObjectManager.editCodeLines(codeLines);
      STUDIO.ObjectManager.attachCodeEditionEvents();
      STUDIO.ObjectManager.refreshObjectSelectList();

      STUDIO.openDialog(div, t("Write Event"), [
        {
          text : t("Apply"),
          click : function(){
            onPick(codeLines);
          }
        },
        {
          text : t("OK"),
          click : function(){
            $(this).dialog("close");
            onPick(codeLines);
          }
        },
        {
          text : t("Close"),
          click : function(){
            $(this).dialog("close");
          }
        }
      ], 600);
    });
  };
})(STUDIO.Picker);