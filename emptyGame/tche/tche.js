'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var BAH = function () {
  function BAH() {
    _classCallCheck(this, BAH);
  }

  _createClass(BAH, null, [{
    key: 'log',
    value: function log(msg) {
      console.log(msg);
    }
  }, {
    key: 'error',
    value: function error(msg) {
      console.error(msg);
    }
  }]);

  return BAH;
}();

var TCHE = {
  globals: {},
  data: {},
  maps: {},
  objectTypes: {},
  spriteTypes: {},
  mapTypes: {},
  skinTypes: {}
};

(function ($) {
  /*jshint validthis: true */
  "use strict";

  $.registerClass = function (className, classDeclaration) {
    TCHE[className] = classDeclaration;
    TCHE.trigger(classDeclaration.prototype);
  };

  $.registerStaticClass = function (className, classDeclaration) {
    TCHE[className] = classDeclaration;
    TCHE.trigger(classDeclaration);
  };

  $.fillSettings = function (settings) {
    settings.screenWidth = settings.screenWidth || 640;
    settings.screenHeight = settings.screenHeight || 360;
    settings.backgroundColor = settings.backgroundColor || 0x1099bb;
    settings.transparent = settings.transparent || true;

    settings.showFps = settings.showFps !== false;
    settings.fpsVisibleOnStartup = settings.fpsVisibleOnStartup === true;

    TCHE.settings = settings;
  };

  $.createGlobals = function () {
    TCHE.globals.player = new TCHE.Player();
    TCHE.globals.map = new TCHE.Map();
  };

  $.setupFpsMeter = function () {
    if (TCHE.settings.showFps) {
      TCHE.meter = new FPSMeter({ theme: 'transparent', graph: 1, decimals: 0 });

      if (!TCHE.settings.fpsVisibleOnStartup) {
        TCHE.meter.hide();
      }

      TCHE.InputManager.on("FPS", function (argument) {
        return TCHE.meter.isPaused ? TCHE.meter.show() : TCHE.meter.hide();
      });
    }
  };

  $.getClientSize = function () {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };

  $.onResize = function (e) {
    var size = TCHE.getClientSize();
    TCHE.renderer.view.style.width = size.width + 'px';
    TCHE.renderer.view.style.height = size.height + 'px';
  };

  $.init = function (settings) {
    TCHE.fillSettings(settings);

    var options = { backgroundColor: settings.backgroundColor, transparent: settings.transparent };
    var width = settings.screenWidth;
    var height = settings.screenHeight;

    if (TCHE.Params.forceCanvas) {
      TCHE.renderer = new PIXI.CanvasRenderer(width, height, options);
    } else if (TCHE.Params.forceWebGl) {
      TCHE.renderer = new PIXI.WebGLRenderer(width, height, options);
    } else {
      TCHE.renderer = PIXI.autoDetectRenderer(width, height, options);
    }

    document.body.appendChild(TCHE.renderer.view);
    TCHE.renderer.view.style.width = "100%";
    TCHE.renderer.view.style.height = "100%";

    window.addEventListener('resize', function (e) {
      TCHE.onResize(e);
    });
    TCHE.onResize();

    TCHE.setupFpsMeter();
    TCHE.createGlobals();

    TCHE.SceneManager.start(TCHE.SceneLaunch);
    TCHE.fire("started");
  };

  $.startFrame = function () {
    if (!!TCHE.meter) {
      TCHE.meter.tickStart();
    }
  };

  $.endFrame = function () {
    if (!!TCHE.meter) {
      TCHE.meter.tick();
    }
  };

  $.trigger = Trigger;
  $.trigger(TCHE);
})(TCHE);
(function () {
  var Ajax = function () {
    function Ajax() {
      _classCallCheck(this, Ajax);
    }

    _createClass(Ajax, null, [{
      key: 'loadFileAsync',
      value: function loadFileAsync(name, filePath, onLoad, onError, mimeType) {
        mimeType = mimeType || "application/json";
        var xhr = new XMLHttpRequest();
        xhr.open('GET', filePath);
        if (mimeType && xhr.overrideMimeType) {
          xhr.overrideMimeType(mimeType);
        }
        if (onLoad === undefined) {
          onLoad = function onLoad(xhr, filePath, name) {
            if (xhr.status < 400) {
              TCHE.data[name] = JSON.parse(xhr.responseText);
            }
          };
        }
        xhr.onload = function () {
          onLoad.call(this, xhr, filePath, name);
        };
        xhr.onerror = onError;
        if (onLoad !== undefined) {
          TCHE.data[name] = null;
        }
        xhr.send();
      }
    }]);

    return Ajax;
  }();

  TCHE.Ajax = Ajax;
})();
(function () {
  var Clone = function () {
    function Clone() {
      _classCallCheck(this, Clone);
    }

    _createClass(Clone, null, [{
      key: 'deep',
      value: function deep(obj) {
        var result;
        if (obj instanceof Array) {
          return obj.map(function (i) {
            return TCHE.clone.deep(i);
          });
        } else if (obj && !obj.prototype && ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object' || obj instanceof Object)) {
          result = {};
          for (var p in obj) {
            result[p] = TCHE.clone.deep(obj[p]);
          }
          return result;
        }
        return obj;
      }
    }, {
      key: 'shallow',
      value: function shallow(obj) {
        var result;
        if (obj instanceof Array) {
          return obj.slice(0);
        } else if (obj && !obj.prototype && ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object' || obj instanceof Object)) {
          result = {};
          for (var p in obj) {
            result[p] = obj[p];
          }
          return result;
        }
        return obj;
      }
    }]);

    return Clone;
  }();

  TCHE.Clone = Clone;
})();
(function () {
  var Params = function () {
    function Params() {
      _classCallCheck(this, Params);
    }

    _createClass(Params, null, [{
      key: 'loadParams',
      value: function loadParams() {
        var params = window.location.search.slice(1).split('&');
        TCHE.Params.params = {};

        params.forEach(function (param) {
          var data = param.split('=');
          var name = data[0].toLowerCase();
          if (data.length > 1) {
            TCHE.Params.params[name] = data[1];
          } else {
            TCHE.Params.params[name] = true;
          }
        });
      }
    }, {
      key: 'param',
      value: function param(paramName) {
        return this.params[paramName.toLowerCase()] || false;
      }
    }, {
      key: 'forceCanvas',
      get: function get() {
        return this.param('canvas');
      }
    }, {
      key: 'forceWebGl',
      get: function get() {
        return this.param('webgl');
      }
    }, {
      key: 'isNwjs',
      get: function get() {
        return typeof require !== "undefined";
      }
    }]);

    return Params;
  }();

  TCHE.Params = Params;
  TCHE.Params.loadParams();
})();
(function () {
  var Resolution = function Resolution() {
    _classCallCheck(this, Resolution);
  };

  TCHE.Resolution = Resolution;
})();
function Trigger(el) {
  el._listeners = {};

  el.on = el.addListener = function (type, listener) {
    if (typeof this._listeners[type] == "undefined") {
      this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
  };

  el.fire = function (event) {
    event = event || {};
    if (typeof event == "string") {
      event = {
        type: event
      };
    }
    if (!event.target) {
      event.target = this;
    }

    if (!event.type) {
      //false
      throw new Error("Event object missing 'type' property.");
    }

    if (this._listeners[event.type] instanceof Array) {
      var listeners = this._listeners[event.type];
      var params = Array.prototype.slice.call(arguments);
      params.shift();

      for (var i = 0, len = listeners.length; i < len; i++) {
        listeners[i].apply(this, params);
      }
    }
  };

  el.removeListener = function (type, listener) {
    if (this._listeners[type] instanceof Array) {
      var listeners = this._listeners[type];
      for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
          break;
        }
      }
    }
  };
  return el;
}

(function () {
  var Validation = function () {
    function Validation() {
      _classCallCheck(this, Validation);
    }

    _createClass(Validation, null, [{
      key: 'hasAnySkin',
      value: function hasAnySkin() {
        if (!TCHE.data.game.skins) {
          return false;
        }

        for (var key in TCHE.data.game.skins) {
          return true;
        }

        return false;
      }
    }, {
      key: 'hasAnySprite',
      value: function hasAnySprite() {
        if (!TCHE.data.game.sprites) {
          return false;
        }

        for (var key in TCHE.data.game.sprites) {
          return true;
        }

        return false;
      }
    }, {
      key: 'hasPlayerSprite',
      value: function hasPlayerSprite() {
        if (!TCHE.data.game.player.sprite) {
          return false;
        }

        if (!TCHE.data.game.sprites[TCHE.data.game.player.sprite]) {
          return false;
        }

        return true;
      }
    }, {
      key: 'checkBasicFiles',
      value: function checkBasicFiles() {
        try {
          // if (!this.hasAnySkin()) {
          //   throw new Error("There's no skin configured.");
          // }

          if (!this.hasAnySprite()) {
            throw new Error("There's no sprite configured.");
          }

          if (!this.hasPlayerSprite()) {
            throw new Error("The player's sprite doesn't exist.");
          }
        } catch (e) {
          alert(e);
          TCHE.SceneManager.end();
        }
      }
    }]);

    return Validation;
  }();

  TCHE.Validation = Validation;
})();
(function () {
  var Character = function () {
    function Character() {
      _classCallCheck(this, Character);

      this._x = null;
      this._y = null;
      this._xDest = null;
      this._yDest = null;
      this._direction = "down";
      this._sprite = null;
      this._objectType = null;
      this._dirty = false;
      this._height = null;
      this._width = null;
      this._lastBlockedByCharacter = null;
      this._lastBlockCharacter = null;
      this._frameInitialX = null;
      this._frameInitialY = null;
      this._animationStep = 0;
      this._animationStepCount = 0;
      this._animationDelay = 13;
      this._animationDelayCount = 0;
      this._offsetX = 0;
      this._offsetY = 0;
      this._ghost = false;
    }

    _createClass(Character, [{
      key: 'getDirectionToDest',
      value: function getDirectionToDest() {
        var directions = [];

        if (this._xDest == this._x && this._yDest == this._y) {
          this.clearDestination();
          return false;
        }

        if (this._xDest >= this._x + this.stepSize) {
          directions.push('right');
        } else if (this._xDest <= this._x - this.stepSize) {
          directions.push('left');
        }

        if (this._yDest >= this._y + this.stepSize) {
          directions.push('down');
        } else if (this._yDest <= this._y - this.stepSize) {
          directions.push('up');
        }

        if (directions.length > 0) {
          return directions.join(" ");
        } else {
          this.clearDestination();
          return false;
        }
      }
    }, {
      key: 'respondToMouseMovement',
      value: function respondToMouseMovement() {
        if (this._xDest === null || this._yDest === null || isNaN(this._xDest) || isNaN(this._yDest)) return;
        if (this._xDest == this._x && this._yDest == this._y) return;

        var direction = this.getDirectionToDest();
        if (direction !== false) {
          this.performMovement(direction);
        }
      }
    }, {
      key: 'update',
      value: function update() {
        this._frameInitialX = this.x;
        this._frameInitialY = this.y;

        this.respondToMouseMovement();
        this.updateAnimation();
      }
    }, {
      key: 'setDest',
      value: function setDest(x, y) {
        this._xDest = x;
        this._yDest = y;
      }
    }, {
      key: 'clearDestination',
      value: function clearDestination() {
        this._xDest = null;
        this._yDest = null;
      }
    }, {
      key: 'canMove',
      value: function canMove(direction) {
        var triggerEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return TCHE.globals.map.canMove(this, direction, triggerEvents);
      }
    }, {
      key: 'updateDirection',
      value: function updateDirection(directions) {
        if (directions.indexOf(this._direction) >= 0) return false;
        if (directions.length > 0) {
          this._direction = directions[0];
        }
      }
    }, {
      key: 'updateAnimation',
      value: function updateAnimation() {
        TCHE.SpriteManager.updateAnimationStep(this);
      }
    }, {
      key: 'performLeftMovement',
      value: function performLeftMovement(stepSize) {
        this._x -= stepSize;
      }
    }, {
      key: 'performRightMovement',
      value: function performRightMovement(stepSize) {
        this._x += this.stepSize;
      }
    }, {
      key: 'performUpMovement',
      value: function performUpMovement(stepSize) {
        this._y -= this.stepSize;
      }
    }, {
      key: 'performDownMovement',
      value: function performDownMovement(stepSize) {
        this._y += this.stepSize;
      }
    }, {
      key: 'performMovement',
      value: function performMovement(direction) {
        var actualDirections = [];

        if (direction.indexOf('left') >= 0 && this.canMove('left', true)) {
          this.performLeftMovement(this.stepSize);
          actualDirections.push('left');
        } else if (direction.indexOf('right') >= 0 && this.canMove('right', true)) {
          this.performRightMovement(this.stepSize);
          actualDirections.push('right');
        }

        if (direction.indexOf('up') >= 0 && this.canMove('up', true)) {
          this.performUpMovement(this.stepSize);
          actualDirections.push('up');
        } else if (direction.indexOf('down') >= 0 && this.canMove('down', true)) {
          this.performDownMovement('down');
          actualDirections.push('down');
        }

        if (this.isMoving()) {
          this._lastBlockCharacter = null;
          this._lastBlockedByCharacter = null;
          this.requestCollisionMapRefresh();
        }

        this.updateDirection(actualDirections);
      }
    }, {
      key: 'move',
      value: function move(direction) {
        var anyDirection = false;
        this._xDest = this._x;
        this._yDest = this._y;

        var leftPressed = direction.indexOf('left') >= 0;
        var rightPressed = direction.indexOf('right') >= 0;

        if (leftPressed && this.canMove('left')) {
          this._xDest = this._x - this.stepSize;
          anyDirection = true;
        } else if (rightPressed && this.canMove('right')) {
          this._xDest = this._x + this.stepSize;
          anyDirection = true;
        } else {
          if (leftPressed) {
            this.canMove('left', true);
          }
          if (rightPressed) {
            this.canMove('right', true);
          }
        }

        var upPressed = direction.indexOf('up') >= 0;
        var downPressed = direction.indexOf('down') >= 0;

        if (upPressed && this.canMove('up')) {
          this._yDest = this._y - this.stepSize;
          anyDirection = true;
        } else if (downPressed && this.canMove('down')) {
          this._yDest = this._y + this.stepSize;
          anyDirection = true;
        } else {
          if (upPressed) {
            this.canMove('up', true);
          }
          if (downPressed) {
            this.canMove('down', true);
          }
        }

        return anyDirection;
      }
    }, {
      key: 'requestCollisionMapRefresh',
      value: function requestCollisionMapRefresh() {
        TCHE.globals.map.requestCollisionMapRefresh();
      }
    }, {
      key: 'isMoving',
      value: function isMoving() {
        if (this._frameInitialX !== this._x || this._frameInitialY !== this._y) return true;
        if (!!this._destX && !!this._destY && (this._x !== this._destX || this._y !== this._destY)) return true;
        return false;
      }
    }, {
      key: 'executeEvent',
      value: function executeEvent(eventName) {
        if (!this.objectType) return;
        if (!this.objectType.events) return;
        if (!this.objectType.events[eventName]) return;

        TCHE.CodeManager.executeEvent(this.objectType.events[eventName]);
      }
    }, {
      key: 'onBlockCharacter',
      value: function onBlockCharacter(character) {
        if (this._lastBlockCharacter !== character) {
          this._lastBlockCharacter = character;
          this.fire('blockCharacter', character);

          if (character == TCHE.globals.player) {
            this.executeEvent('On Block Player');
          }
        }
      }
    }, {
      key: 'onBlockedBy',
      value: function onBlockedBy(character) {
        if (this._lastBlockedByCharacter !== character) {
          this._lastBlockedByCharacter = character;
          this.fire('blockedBy', character);
        }
      }
    }, {
      key: 'x',
      get: function get() {
        return this._x;
      },
      set: function set(value) {
        this._x = Math.round(value);
      }
    }, {
      key: 'y',
      get: function get() {
        return this._y;
      },
      set: function set(value) {
        this._y = Math.round(value);
      }
    }, {
      key: 'xDest',
      get: function get() {
        return this._xDest;
      },
      set: function set(value) {
        this._xDest = value;
      }
    }, {
      key: 'yDest',
      get: function get() {
        return this._yDest;
      },
      set: function set(value) {
        this._yDest = value;
      }
    }, {
      key: 'direction',
      get: function get() {
        return this._direction;
      },
      set: function set(value) {
        this._direction = value;
      }
    }, {
      key: 'dirty',
      get: function get() {
        return this._dirty;
      },
      set: function set(value) {
        this._dirty = value;
      }
    }, {
      key: 'width',
      get: function get() {
        return this._width;
      },
      set: function set(value) {
        this._width = Math.round(value);
      }
    }, {
      key: 'height',
      get: function get() {
        return this._height;
      },
      set: function set(value) {
        this._height = Math.round(value);
      }
    }, {
      key: 'animationStep',
      get: function get() {
        return this._animationStep;
      },
      set: function set(value) {
        this._animationStep = value;
      }
    }, {
      key: 'animationStepCount',
      get: function get() {
        return this._animationStepCount;
      },
      set: function set(value) {
        this._animationStepCount = value;
      }
    }, {
      key: 'animationDelay',
      get: function get() {
        return this._animationDelay;
      },
      set: function set(value) {
        this._animationDelay = value;
      }
    }, {
      key: 'animationDelayCount',
      get: function get() {
        return this._animationDelayCount;
      },
      set: function set(value) {
        this._animationDelayCount = value;
      }
    }, {
      key: 'offsetX',
      get: function get() {
        return this._offsetX;
      },
      set: function set(value) {
        this._offsetX = value;
      }
    }, {
      key: 'offsetY',
      get: function get() {
        return this._offsetY;
      },
      set: function set(value) {
        this._offsetY = value;
      }
    }, {
      key: 'ghost',
      get: function get() {
        return this._ghost;
      },
      set: function set(value) {
        this._ghost = value;
      }
    }, {
      key: 'rightX',
      get: function get() {
        return this.x + this.width;
      }
    }, {
      key: 'bottomY',
      get: function get() {
        return this.y + this.height;
      }
    }, {
      key: 'sprite',
      get: function get() {
        return this._sprite;
      },
      set: function set(value) {
        this._sprite = value;
        this._dirty = true;
      }
    }, {
      key: 'objectType',
      get: function get() {
        return this._objectType;
      },
      set: function set(value) {
        if (typeof value == "string") {
          var objectTypeClass = TCHE.objectTypes[value];
          if (!!objectTypeClass) {
            this._objectType = new objectTypeClass();
          } else {
            this._objectType = null;
          }
        } else {
          this._objectType = value;
        }

        this._dirty = true;
      }
    }, {
      key: 'stepSize',
      get: function get() {
        return 4;
      }
    }]);

    return Character;
  }();

  TCHE.registerClass('Character', Character);
})();
(function () {
  var CodeInterpreter = function () {
    function CodeInterpreter() {
      _classCallCheck(this, CodeInterpreter);

      this._codeBlock = null;
      this._index = 0;
    }

    _createClass(CodeInterpreter, [{
      key: 'runCodeBlock',
      value: function runCodeBlock(codeBlock) {
        this._codeBlock = codeBlock;
        this._index = 0;

        while (this._index < this._codeBlock.length) {
          this.executeLine();

          this._index++;
        }
      }
    }, {
      key: 'executeLine',
      value: function executeLine() {
        var line = this.currentLine;

        switch (line.code) {
          case 'exit':
            this._index = this._codeBlock.length;
            break;
          case 'teleport':
            TCHE.globals.player.teleport(line.params.mapName, line.params.x, line.params.y);
            break;
        }
      }
    }, {
      key: 'codeBlock',
      get: function get() {
        return this._codeBlock;
      }
    }, {
      key: 'currentLine',
      get: function get() {
        return this._codeBlock[this._index];
      }
    }, {
      key: 'nextLine',
      get: function get() {
        return this._codeBlock[this._index + 1];
      }
    }]);

    return CodeInterpreter;
  }();

  TCHE.CodeInterpreter = CodeInterpreter;
})();
(function () {
  var MapType = function () {
    function MapType() {
      _classCallCheck(this, MapType);
    }

    _createClass(MapType, null, [{
      key: 'getMapWidth',
      value: function getMapWidth(mapData) {
        return mapData.width;
      }
    }, {
      key: 'getMapHeight',
      value: function getMapHeight(mapData) {
        return mapData.height;
      }
    }, {
      key: 'getSpriteClass',
      value: function getSpriteClass(mapData) {
        return TCHE.Map2d;
      }
    }, {
      key: 'getMapObjects',
      value: function getMapObjects(mapData) {
        return [];
      }
    }, {
      key: 'loadMapFiles',
      value: function loadMapFiles(mapData) {}
    }]);

    return MapType;
  }();

  TCHE.MapType = MapType;
})();
(function () {
  var ObjectType = function () {
    function ObjectType() {
      _classCallCheck(this, ObjectType);

      this._events = {};
    }

    _createClass(ObjectType, [{
      key: 'name',
      get: function get() {
        return '';
      }
    }, {
      key: 'events',
      get: function get() {
        return this._events;
      }
    }]);

    return ObjectType;
  }();

  TCHE.ObjectType = ObjectType;
})();
(function () {
  var SkinType = function () {
    function SkinType() {
      _classCallCheck(this, SkinType);
    }

    _createClass(SkinType, null, [{
      key: 'loadSkinTexture',
      value: function loadSkinTexture(skinData) {
        return PIXI.Texture.fromImage(skinData.image);
      }
    }, {
      key: 'drawSkinFrame',
      value: function drawSkinFrame(content) {}
    }, {
      key: 'addSkinBackground',
      value: function addSkinBackground(window, container, skinData) {}
    }, {
      key: 'drawCursor',
      value: function drawCursor(skinData, contents, x, y) {}
    }]);

    return SkinType;
  }();

  TCHE.SkinType = SkinType;
})();
(function () {
  var Sprite = function (_PIXI$Container) {
    _inherits(Sprite, _PIXI$Container);

    function Sprite() {
      _classCallCheck(this, Sprite);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Sprite).call(this));

      _this._sprite = null;
      _this._frame = new PIXI.Rectangle(0, 0, 1, 1);
      _this._useFrame = false;
      return _this;
    }

    //The sprite property of the Sprite class is a PIXI sprite.

    _createClass(Sprite, [{
      key: 'update',
      value: function update() {}
    }, {
      key: 'sprite',
      get: function get() {
        return this._sprite;
      },
      set: function set(value) {
        this._sprite = value;
      }
    }, {
      key: 'useFrame',
      get: function get() {
        return this._useFrame;
      },
      set: function set(value) {
        this._useFrame = value;
      }
    }, {
      key: 'frame',
      get: function get() {
        return this._frame;
      },
      set: function set(value) {
        this._frame = value;
      }
    }]);

    return Sprite;
  }(PIXI.Container);

  TCHE.registerClass('Sprite', Sprite);
})();
(function () {
  var SpriteType = function () {
    function SpriteType() {
      _classCallCheck(this, SpriteType);
    }

    _createClass(SpriteType, null, [{
      key: 'isFullImage',
      value: function isFullImage() {
        return true;
      }
    }, {
      key: 'configureLoadedSprite',
      value: function configureLoadedSprite(character, spriteObj, spriteData) {}
    }, {
      key: 'getSpriteFrame',
      value: function getSpriteFrame(character, spriteObj, spriteName) {
        return false;
      }
    }, {
      key: 'update',
      value: function update(character, spriteObj, spriteData) {}
    }, {
      key: 'updateAnimationStep',
      value: function updateAnimationStep(character) {}
    }]);

    return SpriteType;
  }();

  TCHE.SpriteType = SpriteType;
})();
(function () {
  var WindowContent = function (_PIXI$RenderTexture) {
    _inherits(WindowContent, _PIXI$RenderTexture);

    function WindowContent(renderer, width, height, skinName) {
      _classCallCheck(this, WindowContent);

      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(WindowContent).call(this, renderer, width, height));

      _this2._objects = [];
      _this2._skinName = skinName;

      _this2._style = {
        "font": "12pt Arial",
        "fill": "black",
        "align": "left"
      };
      return _this2;
    }

    _createClass(WindowContent, [{
      key: 'update',
      value: function update() {}
    }, {
      key: 'drawSkinFrame',
      value: function drawSkinFrame() {
        if (!this._skinName) {
          return;
        }

        TCHE.SkinManager.drawSkinFrame(this._skinName, this);
      }
    }, {
      key: 'clear',
      value: function clear() {
        _get(Object.getPrototypeOf(WindowContent.prototype), 'clear', this).call(this);
        this.drawSkinFrame();
      }
    }, {
      key: 'renderObjectInContainer',
      value: function renderObjectInContainer(object) {
        var container = new PIXI.Container();
        container.addChild(object);
        this.render(container);
      }
    }, {
      key: 'renderResized',
      value: function renderResized(sprite, x, y, width, height) {
        var renderTexture = new PIXI.RenderTexture(TCHE.renderer, width, height);

        var matrix = new PIXI.Matrix();
        matrix.scale(width / sprite.width, height / sprite.height);

        renderTexture.render(sprite, matrix);

        var newSprite = new PIXI.Sprite(renderTexture);
        newSprite.x = x;
        newSprite.y = y;
        this.renderObjectInContainer(newSprite);
      }
    }, {
      key: 'drawRect',
      value: function drawRect(color, x, y, width, height, alpha) {
        var graphics = new PIXI.Graphics();

        graphics.beginFill(color, alpha);
        graphics.drawRect(x, y, width, height);
        graphics.endFill();

        this.render(graphics);
      }
    }, {
      key: 'mergeStyles',
      value: function mergeStyles(style1, style2) {
        if (!style2) {
          return style1;
        }
        if (!style1) {
          return style2;
        }

        var mergedStyle = TCHE.Clone.shallow(style1);
        for (var key in style2) {
          mergedStyle[key] = style2[key];
        }

        return mergedStyle;
      }
    }, {
      key: 'drawText',
      value: function drawText(text, x, y, style) {
        var mergedStyle = this.mergeStyles(this.style, style);
        var textObj = new PIXI.Text(text, mergedStyle);
        textObj.x = x;
        textObj.y = y;

        this.renderObjectInContainer(textObj);
        return textObj;
      }
    }, {
      key: 'drawRightAlignedText',
      value: function drawRightAlignedText(text, x, y, width, style) {
        var mergedStyle = this.mergeStyles(this.style, style);
        var textObj = new PIXI.Text(text, mergedStyle);
        textObj.x = x;
        textObj.y = y;

        if (textObj.width > width) {
          textObj.width = width;
        } else {
          var diffX = width - textObj.width;
          textObj.x += diffX;
        }

        var container = new PIXI.Container();
        container.addChild(textObj);

        container.width = x + width;
        this.render(container);
        return textObj;
      }
    }, {
      key: 'drawTextCentered',
      value: function drawTextCentered(text, x, y, width, style) {
        var mergedStyle = this.mergeStyles(this.style, style);
        var textObj = new PIXI.Text(text, mergedStyle);
        textObj.x = x;
        textObj.y = y;

        if (textObj.width > width) {
          textObj.width = width;
        } else {
          var diffX = width - textObj.width;
          textObj.x += Math.floor(diffX / 2);
        }

        var container = new PIXI.Container();
        container.addChild(textObj);

        container.width = x + width;
        this.render(container);
        return textObj;
      }
    }, {
      key: 'style',
      get: function get() {
        return this._style;
      }
    }, {
      key: 'skinName',
      get: function get() {
        return this._skinName;
      },
      set: function set(value) {
        this._skinName = value;
      }
    }]);

    return WindowContent;
  }(PIXI.RenderTexture);

  TCHE.registerClass('WindowContent', WindowContent);
})();
(function () {
  var ImageSpriteType = function (_TCHE$SpriteType) {
    _inherits(ImageSpriteType, _TCHE$SpriteType);

    function ImageSpriteType() {
      _classCallCheck(this, ImageSpriteType);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(ImageSpriteType).apply(this, arguments));
    }

    return ImageSpriteType;
  }(TCHE.SpriteType);

  TCHE.spriteTypes.image = ImageSpriteType;
})();
(function () {
  var RpgMakerSpriteType = function (_TCHE$SpriteType2) {
    _inherits(RpgMakerSpriteType, _TCHE$SpriteType2);

    function RpgMakerSpriteType() {
      _classCallCheck(this, RpgMakerSpriteType);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(RpgMakerSpriteType).apply(this, arguments));
    }

    _createClass(RpgMakerSpriteType, null, [{
      key: 'isFullImage',
      value: function isFullImage() {
        return false;
      }
    }, {
      key: 'configureLoadedSprite',
      value: function configureLoadedSprite(character, spriteObj, spriteData) {
        spriteObj.texture.frame = RpgMakerSpriteType.getSpriteFrame(character, spriteObj, spriteData);
        character.animationStep = 1;
        character.animationStepCount = 3;
        character.animationDelayCount = character.animationDelay;
      }
    }, {
      key: 'getSpriteFrame',
      value: function getSpriteFrame(character, spriteObj, spriteData) {
        var spriteWidth = spriteData.imageWidth / 4;
        var spriteHeight = spriteData.imageHeight / 2;
        var index = spriteData.index;
        var spriteY = 0;
        var spriteX = index * spriteWidth;
        if (spriteX > spriteData.imageWidth) {
          spriteX -= spriteData.imageWidth;
          spriteY = spriteData.imageHeight;
        }

        var frame = {
          x: spriteX,
          y: spriteY,
          width: spriteWidth,
          height: spriteHeight
        };

        var directionIndex = Math.max(0, ["down", "left", "right", "up"].indexOf(character.direction));
        var step = character.animationStep % character.animationStepCount;

        var width = frame.width / 3;
        var height = frame.height / 4;
        var x = frame.x + step * width;
        var y = frame.y + directionIndex * height;

        return {
          x: x,
          y: y,
          width: width,
          height: height
        };
      }
    }, {
      key: 'update',
      value: function update(character, spriteObj, spriteData) {
        if (!spriteObj.texture.baseTexture.isLoading) {
          spriteObj.texture.frame = RpgMakerSpriteType.getSpriteFrame(character, spriteObj, spriteData);
        }
      }
    }, {
      key: 'updateAnimationStep',
      value: function updateAnimationStep(character) {
        if (character.isMoving()) {
          character.animationDelayCount++;

          if (character.animationDelayCount >= character.animationDelay) {
            character.animationDelayCount = 0;
            character.animationStep++;
          }

          if (character.animationStep >= character.animationStepCount) {
            character.animationStep = 0;
          }
        } else {
          character.animationStep = 1;
        }
      }
    }]);

    return RpgMakerSpriteType;
  }(TCHE.SpriteType);

  TCHE.spriteTypes.rpgmaker = RpgMakerSpriteType;
})();
(function () {
  var Default2DMapType = function (_TCHE$MapType) {
    _inherits(Default2DMapType, _TCHE$MapType);

    function Default2DMapType() {
      _classCallCheck(this, Default2DMapType);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(Default2DMapType).apply(this, arguments));
    }

    _createClass(Default2DMapType, null, [{
      key: 'getMapObjects',
      value: function getMapObjects(mapData) {
        return mapData.objects;
      }
    }, {
      key: 'getImportantObjectData',
      value: function getImportantObjectData(mapData, obj) {
        return {
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          sprite: obj.sprite || '',
          objectType: obj.objectType || '',
          ghost: !!obj.ghost && obj.ghost !== "false" && obj.ghost !== "0"
        };
      }
    }]);

    return Default2DMapType;
  }(TCHE.MapType);

  TCHE.mapTypes["2d"] = Default2DMapType;
})();
(function () {
  var TiledMapType = function (_TCHE$MapType2) {
    _inherits(TiledMapType, _TCHE$MapType2);

    function TiledMapType() {
      _classCallCheck(this, TiledMapType);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(TiledMapType).apply(this, arguments));
    }

    _createClass(TiledMapType, null, [{
      key: 'getMapWidth',
      value: function getMapWidth(mapData) {
        return mapData.width * mapData.tilewidth;
      }
    }, {
      key: 'getMapHeight',
      value: function getMapHeight(mapData) {
        return mapData.height * mapData.tileheight;
      }
    }, {
      key: 'getSpriteClass',
      value: function getSpriteClass(mapData) {
        return TCHE.TiledMap;
      }
    }, {
      key: 'getMapObjects',
      value: function getMapObjects(mapData) {
        var objects = [];

        mapData.layers.forEach(function (layer) {
          if (layer.type == "objectgroup") {
            layer.objects.forEach(function (object) {
              object.layerName = layer.name;
            });

            objects = objects.concat(layer.objects);
          }
        });

        return objects;
      }
    }, {
      key: 'loadMapFiles',
      value: function loadMapFiles(mapData) {
        TCHE.FileManager.loadTiledMapFiles(mapData);
      }
    }, {
      key: 'getImportantObjectData',
      value: function getImportantObjectData(mapData, obj) {
        return {
          x: Math.round(obj.x),
          y: Math.round(obj.y),
          width: Math.round(obj.width),
          height: Math.round(obj.height),
          sprite: obj.properties.sprite || '',
          class: obj.properties.class || undefined,
          objectType: obj.properties.objectType || '',
          offsetX: Number(obj.properties.offsetX) || 0,
          offsetY: Number(obj.properties.offsetY) || 0,
          ghost: !!obj.properties.ghost && obj.properties.ghost != "false" && obj.properties.ghost !== "0",
          layerName: obj.layerName
        };
      }
    }]);

    return TiledMapType;
  }(TCHE.MapType);

  TCHE.mapTypes.tiled = TiledMapType;
})();
(function () {
  var RpgMakerSkinType = function (_TCHE$SkinType) {
    _inherits(RpgMakerSkinType, _TCHE$SkinType);

    function RpgMakerSkinType() {
      _classCallCheck(this, RpgMakerSkinType);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(RpgMakerSkinType).apply(this, arguments));
    }

    _createClass(RpgMakerSkinType, null, [{
      key: 'drawTopLeftCorner',
      value: function drawTopLeftCorner(content, texture) {
        //The top left corner is at y 0, x = 50%, width and height = 12,5%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 2),
          y: 0,
          width: Math.floor(texture.baseTexture.width / 8),
          height: Math.floor(texture.baseTexture.height / 8)
        };

        var sprite = new PIXI.Sprite(texture);
        content.render(sprite);
      }
    }, {
      key: 'drawTopRightCorner',
      value: function drawTopRightCorner(content, texture) {
        //The top right corner is at y 0, x = 87,5%, width and height = 12,5%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 8 * 7),
          y: 0,
          width: Math.floor(texture.baseTexture.width / 8),
          height: Math.floor(texture.baseTexture.height / 8)
        };

        var sprite = new PIXI.Sprite(texture);
        sprite.x = content.width - texture.frame.width;
        sprite.y = 0;

        content.renderObjectInContainer(sprite);
      }
    }, {
      key: 'drawBottomLeftCorner',
      value: function drawBottomLeftCorner(content, texture) {
        //The bottom left corner is at y = 37,5%, x = 50%, width and height = 12,5%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 2),
          y: Math.floor(texture.baseTexture.height / 8 * 3),
          width: Math.floor(texture.baseTexture.width / 8),
          height: Math.floor(texture.baseTexture.height / 8)
        };

        var sprite = new PIXI.Sprite(texture);
        sprite.x = 0;
        sprite.y = content.height - texture.frame.height;

        content.renderObjectInContainer(sprite);
      }
    }, {
      key: 'drawBottomRightCorner',
      value: function drawBottomRightCorner(content, texture) {
        //The bottom right corner is at y = 37,5%, x = 87,5%, width and height = 12,5%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 8 * 7),
          y: Math.floor(texture.baseTexture.height / 8 * 3),
          width: Math.floor(texture.baseTexture.width / 8),
          height: Math.floor(texture.baseTexture.height / 8)
        };

        var sprite = new PIXI.Sprite(texture);
        sprite.x = content.width - texture.frame.width;
        sprite.y = content.height - texture.frame.height;

        content.renderObjectInContainer(sprite);
      }
    }, {
      key: 'drawLeftSide',
      value: function drawLeftSide(content, texture) {
        //The left side is at y = 12,5%, x = 50%, width = 12,5% height = 25%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 2),
          y: Math.floor(texture.baseTexture.height / 8),
          width: Math.floor(texture.baseTexture.width / 8),
          height: Math.floor(texture.baseTexture.height / 4)
        };

        var sprite = new PIXI.Sprite(texture);
        var x = 0;
        var y = texture.frame.height / 2;
        var width = texture.frame.width;
        var height = content.height - y * 2;

        content.renderResized(sprite, x, y, width, height);
      }
    }, {
      key: 'drawRightSide',
      value: function drawRightSide(content, texture) {
        //The right side is at y = 12,5%, x = 87,5%, width = 12,5% height = 25%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 8 * 7),
          y: Math.floor(texture.baseTexture.height / 8),
          width: Math.floor(texture.baseTexture.width / 8),
          height: Math.floor(texture.baseTexture.height / 4)
        };

        var sprite = new PIXI.Sprite(texture);
        var x = content.width - texture.frame.width;
        var y = texture.frame.height / 2;
        var width = texture.frame.width;
        var height = content.height - y * 2;

        content.renderResized(sprite, x, y, width, height);
      }
    }, {
      key: 'drawTopSide',
      value: function drawTopSide(content, texture) {
        //The top side is at y = 0, x = 62,5%, width = 25% height = 12,5%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 8 * 5),
          y: 0,
          width: Math.floor(texture.baseTexture.width / 4),
          height: Math.floor(texture.baseTexture.height / 8)
        };

        var sprite = new PIXI.Sprite(texture);
        var x = texture.frame.width / 2;
        var y = 0;
        var width = content.width - x * 2;
        var height = texture.frame.height;

        content.renderResized(sprite, x, y, width, height);
      }
    }, {
      key: 'drawBottomSide',
      value: function drawBottomSide(content, texture) {
        //The top side is at y = 37,5%, x = 62,5%, width = 25% height = 12,5%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 8 * 5),
          y: Math.floor(texture.baseTexture.height / 8 * 3),
          width: Math.floor(texture.baseTexture.width / 4),
          height: Math.floor(texture.baseTexture.height / 8)
        };

        var sprite = new PIXI.Sprite(texture);
        var x = texture.frame.width / 2;
        var width = content.width - x * 2;
        var height = texture.frame.height;
        var y = content.height - height;

        content.renderResized(sprite, x, y, width, height);
      }
    }, {
      key: 'addBackground',
      value: function addBackground(windowObj, container, texture) {
        //The rpg maker skin file has the background on the first 50% of the file, both vertically and horizontally
        texture.frame = {
          x: 0,
          y: 0,
          width: Math.floor(texture.baseTexture.width / 2),
          height: Math.floor(texture.baseTexture.height / 2)
        };

        var sprite = new PIXI.Sprite(texture);
        sprite.scale.x = windowObj.width / texture.frame.width;
        sprite.scale.y = windowObj.height / texture.frame.height;
        container.addChild(sprite);
      }
    }, {
      key: 'drawFrame',
      value: function drawFrame(content, texture) {
        this.drawLeftSide(content, texture);
        this.drawRightSide(content, texture);
        this.drawTopSide(content, texture);
        this.drawBottomSide(content, texture);
        this.drawTopLeftCorner(content, texture);
        this.drawTopRightCorner(content, texture);
        this.drawBottomLeftCorner(content, texture);
        this.drawBottomRightCorner(content, texture);
      }
    }, {
      key: 'drawSkinFrame',
      value: function drawSkinFrame(content, skinData) {
        var texture = TCHE.SkinManager.loadSkinFrameTexture(skinData);

        if (texture.baseTexture.isLoading) {
          texture.baseTexture.addListener('loaded', function () {
            RpgMakerSkinType.drawFrame(content, texture);
          });
        } else {
          this.drawFrame(content, texture);
        }
      }
    }, {
      key: 'addSkinBackground',
      value: function addSkinBackground(windowObj, container, skinData) {
        var texture = TCHE.SkinManager.loadSkinBackgroundTexture(skinData);

        if (texture.baseTexture.isLoading) {
          texture.baseTexture.addListener('loaded', function () {
            RpgMakerSkinType.addBackground(windowObj, container, texture);
          });
        } else {
          this.addBackground(windowObj, container, texture);
        }
      }
    }, {
      key: 'drawCursor',
      value: function drawCursor(content, texture, x, y) {
        //The rpg maker cursor is at x = 81,25%, y = 18,75%, width = 6,25%, height = 12,5%
        texture.frame = {
          x: Math.floor(texture.baseTexture.width / 16 * 13),
          y: Math.floor(texture.baseTexture.height / 16 * 3),
          width: Math.floor(texture.baseTexture.width / 16),
          height: Math.floor(texture.baseTexture.height / 8)
        };

        var sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        content.renderObjectInContainer(sprite);
      }
    }, {
      key: 'drawSkinCursor',
      value: function drawSkinCursor(skinData, content, x, y) {
        var texture = TCHE.SkinManager.loadSkinFrameTexture(skinData);

        if (texture.baseTexture.isLoading) {
          texture.baseTexture.addListener('loaded', function () {
            RpgMakerSkinType.drawCursor(content, texture, x, y);
          });
        } else {
          this.drawCursor(content, texture, x, y);
        }
      }
    }, {
      key: 'getSkinCursorSize',
      value: function getSkinCursorSize(skinData) {
        var texture = TCHE.SkinManager.loadSkinFrameTexture(skinData);

        if (texture.baseTexture.isLoading) {
          return { width: 12, height: 24 };
        } else {
          var width = texture.baseTexture.width / 16;
          var height = texture.baseTexture.height / 8;

          return { width: width, height: height };
        }
      }
    }]);

    return RpgMakerSkinType;
  }(TCHE.SkinType);

  TCHE.skinTypes.rpgmaker = RpgMakerSkinType;
})();
(function () {
  var ObjectObjectType = function (_TCHE$ObjectType) {
    _inherits(ObjectObjectType, _TCHE$ObjectType);

    function ObjectObjectType() {
      _classCallCheck(this, ObjectObjectType);

      var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectObjectType).call(this));

      _this8._events['On Block Player'] = {
        codeLines: []
      };
      return _this8;
    }

    _createClass(ObjectObjectType, [{
      key: 'name',
      get: function get() {
        return 'Object';
      }
    }]);

    return ObjectObjectType;
  }(TCHE.ObjectType);

  TCHE.objectTypes.Object = ObjectObjectType;
})();
(function () {
  var CreatureObjectType = function (_TCHE$objectTypes$Obj) {
    _inherits(CreatureObjectType, _TCHE$objectTypes$Obj);

    function CreatureObjectType() {
      _classCallCheck(this, CreatureObjectType);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(CreatureObjectType).call(this));
      // this._events['On Block Player'] = [];
    }

    _createClass(CreatureObjectType, [{
      key: 'name',
      get: function get() {
        return 'Creature';
      }
    }]);

    return CreatureObjectType;
  }(TCHE.objectTypes.Object);

  TCHE.objectTypes.Creature = CreatureObjectType;
})();
(function () {
  var NpcObjectType = function (_TCHE$objectTypes$Cre) {
    _inherits(NpcObjectType, _TCHE$objectTypes$Cre);

    function NpcObjectType() {
      _classCallCheck(this, NpcObjectType);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(NpcObjectType).call(this));
      // this._events['On Block Player'] = [];
    }

    _createClass(NpcObjectType, [{
      key: 'name',
      get: function get() {
        return 'NPC';
      }
    }]);

    return NpcObjectType;
  }(TCHE.objectTypes.Creature);

  TCHE.objectTypes.NPC = NpcObjectType;
})();
(function () {
  var PlayerObjectType = function (_TCHE$objectTypes$Cre2) {
    _inherits(PlayerObjectType, _TCHE$objectTypes$Cre2);

    function PlayerObjectType() {
      _classCallCheck(this, PlayerObjectType);

      //Removes this event, as it is invalid

      var _this11 = _possibleConstructorReturn(this, Object.getPrototypeOf(PlayerObjectType).call(this));

      delete _this11._events['On Block Player'];
      return _this11;
    }

    _createClass(PlayerObjectType, [{
      key: 'name',
      get: function get() {
        return 'Player';
      }
    }]);

    return PlayerObjectType;
  }(TCHE.objectTypes.Creature);

  TCHE.objectTypes.Player = PlayerObjectType;
})();
(function () {
  var CharacterSprite = function (_TCHE$Sprite) {
    _inherits(CharacterSprite, _TCHE$Sprite);

    function CharacterSprite(character) {
      _classCallCheck(this, CharacterSprite);

      var _this12 = _possibleConstructorReturn(this, Object.getPrototypeOf(CharacterSprite).call(this));

      _this12._character = character;
      _this12.createPixiSprite();
      return _this12;
    }

    _createClass(CharacterSprite, [{
      key: 'createPixiSprite',
      value: function createPixiSprite() {
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
      }
    }, {
      key: 'update',
      value: function update() {
        //Makes sure the sprite exists
        this.createPixiSprite();

        if (!this._sprite) return;

        //Syncs the position
        this.position.x = this._character.x + this._character.offsetX;
        this.position.y = this._character.y + this._character.offsetY;

        TCHE.SpriteManager.updateCharacterSprite(this._sprite, this._character);
      }
    }, {
      key: 'character',
      get: function get() {
        return this._character;
      },
      set: function set(value) {
        this._character = value;
      }
    }]);

    return CharacterSprite;
  }(TCHE.Sprite);

  TCHE.registerClass('CharacterSprite', CharacterSprite);
})();
(function () {
  var MapSprite = function (_TCHE$Sprite2) {
    _inherits(MapSprite, _TCHE$Sprite2);

    function MapSprite(map) {
      _classCallCheck(this, MapSprite);

      var _this13 = _possibleConstructorReturn(this, Object.getPrototypeOf(MapSprite).call(this));

      _this13._map = map;
      return _this13;
    }

    _createClass(MapSprite, [{
      key: 'map',
      get: function get() {
        return this._map;
      },
      set: function set(value) {
        this._map = value;
      }
    }]);

    return MapSprite;
  }(TCHE.Sprite);

  TCHE.registerClass('MapSprite', MapSprite);
})();
(function () {
  var TiledLayerSprite = function (_TCHE$Sprite3) {
    _inherits(TiledLayerSprite, _TCHE$Sprite3);

    function TiledLayerSprite(layerData) {
      _classCallCheck(this, TiledLayerSprite);

      var _this14 = _possibleConstructorReturn(this, Object.getPrototypeOf(TiledLayerSprite).call(this));

      _this14._layerData = layerData;
      _this14._texture = null;
      _this14._sprite = null;
      _this14.createPixiSprite();
      return _this14;
    }

    _createClass(TiledLayerSprite, [{
      key: 'addSprite',
      value: function addSprite(texture, x, y, tileId) {
        var tileX = x * texture.frame.width;
        var tileY = y * texture.frame.height;

        var sprite = new PIXI.Sprite(texture);
        sprite.x = tileX;
        sprite.y = tileY;
        sprite.tileId = tileId;

        var container = new PIXI.Container();
        container.addChild(sprite);

        this._texture.render(container);
      }
    }, {
      key: 'onLoadTexture',
      value: function onLoadTexture() {
        var x = this.x;
        var y = this.y;
        var texture = this.texture;
        var layerSprite = this.layerSprite;
        var tileId = this.tileId;

        layerSprite.addSprite(texture, x, y, tileId);
      }
    }, {
      key: 'createPixiSprite',
      value: function createPixiSprite() {
        var layerData = this._layerData;
        var mapName = TCHE.globals.map.mapName;

        this._texture = TCHE.TileManager.getLayerTextureFromCache(mapName, layerData.name);
        if (!this._texture) {
          var layerSprite = this;
          var mapData = TCHE.MapManager.getMapData(mapName);

          var width = mapData.width * mapData.tilewidth;
          var height = mapData.height * mapData.tileheight;

          this._texture = new PIXI.RenderTexture(TCHE.renderer, width, height);

          var index = -1;
          for (var y = 0; y < layerData.height; y++) {
            for (var x = 0; x < layerData.width; x++) {
              index++;
              var tileId = layerData.data[index];
              if (tileId === 0) continue;

              var texture = TCHE.TileManager.loadTileTexture(mapName, tileId);

              if (texture.baseTexture.isLoading) {
                texture.baseTexture.addListener('loaded', layerSprite.onLoadTexture.bind({
                  x: x,
                  y: y,
                  tileId: tileId,
                  texture: texture,
                  layerSprite: layerSprite
                }));
              } else {
                layerSprite.addSprite(texture, x, y, tileId);
              }
            }
          }

          TCHE.TileManager.saveLayerTextureCache(mapName, layerData.name, this._texture);
        }

        this._sprite = new PIXI.Sprite(this._texture);
        this.addChild(this._sprite);
      }
    }, {
      key: 'update',
      value: function update() {}
    }, {
      key: 'layerData',
      get: function get() {
        return this._layerData;
      },
      set: function set(value) {
        this._layerData = value;
      }
    }]);

    return TiledLayerSprite;
  }(TCHE.Sprite);

  TCHE.registerClass('TiledLayerSprite', TiledLayerSprite);
})();
(function () {
  var TiledObjectLayerSprite = function (_TCHE$Sprite4) {
    _inherits(TiledObjectLayerSprite, _TCHE$Sprite4);

    function TiledObjectLayerSprite(layerData) {
      _classCallCheck(this, TiledObjectLayerSprite);

      var _this15 = _possibleConstructorReturn(this, Object.getPrototypeOf(TiledObjectLayerSprite).call(this));

      _this15._layerData = layerData;
      _this15._objectSprites = [];
      _this15._countdown = 0;
      return _this15;
    }

    _createClass(TiledObjectLayerSprite, [{
      key: 'updateSprites',
      value: function updateSprites() {
        this._objectSprites.forEach(function (sprite) {
          sprite.update();
        });
      }
    }, {
      key: 'update',
      value: function update() {
        this.updateSprites();

        if (!!this._countdown && this._countdown > 0) {
          this._countdown--;

          return;
        }

        this._countdown = 10;
        this.refreshSprites();
      }
    }, {
      key: 'refreshSprites',
      value: function refreshSprites() {
        this.removeChildren();

        this._objectSprites.sort(function (obj1, obj2) {
          var diffY = obj1.y - obj2.y;

          if (diffY !== 0) {
            return diffY;
          }

          return obj1.x - obj2.x;
        });

        this._objectSprites.forEach(function (obj) {
          this.addChild(obj);
        }.bind(this));
      }
    }, {
      key: 'createObjectSprite',
      value: function createObjectSprite(obj) {
        var objSprite = new TCHE.CharacterSprite(obj);
        this._objectSprites.push(objSprite);
      }
    }, {
      key: 'layerData',
      get: function get() {
        return this._layerData;
      },
      set: function set(value) {
        this._layerData = value;
      }
    }]);

    return TiledObjectLayerSprite;
  }(TCHE.Sprite);

  TCHE.registerClass('TiledObjectLayerSprite', TiledObjectLayerSprite);
})();
(function () {
  var WindowSprite = function (_TCHE$Sprite5) {
    _inherits(WindowSprite, _TCHE$Sprite5);

    function WindowSprite(width, height, skinName) {
      _classCallCheck(this, WindowSprite);

      var _this16 = _possibleConstructorReturn(this, Object.getPrototypeOf(WindowSprite).call(this));

      if (skinName === undefined) {
        if (!!TCHE.data.game.mainSkin) {
          skinName = TCHE.data.game.mainSkin;
        }
      }

      _this16.createBackground(skinName);

      _this16.createContents(width, height, skinName);
      _this16.createSprite();
      _this16.refresh();
      return _this16;
    }

    _createClass(WindowSprite, [{
      key: 'createBackground',
      value: function createBackground(skinName) {
        if (!!this._backgroundContainer) {
          this._backgroundContainer.removeChildren();
        } else {
          this._backgroundContainer = new PIXI.Container();
          this.addChild(this._backgroundContainer);
        }

        TCHE.SkinManager.addSkinBackground(skinName, this, this._backgroundContainer);
      }
    }, {
      key: 'drawCursor',
      value: function drawCursor(x, y) {
        TCHE.SkinManager.drawSkinCursor(this.skinName, this._contents, x, y);
      }
    }, {
      key: 'createContents',
      value: function createContents(width, height, skinName) {
        this._contents = new TCHE.WindowContent(TCHE.renderer, width, height, skinName);
      }
    }, {
      key: 'createSprite',
      value: function createSprite() {
        this._sprite = new PIXI.Sprite(this._contents);
        this.addChild(this._sprite);
      }
    }, {
      key: 'drawFrame',
      value: function drawFrame() {
        if (!!this.skinName) {
          this._contents.drawSkinFrame();
        }
      }
    }, {
      key: 'refresh',
      value: function refresh() {
        this.clear();
        // this.drawFrame();
        this.draw();

        this._contents.update();
      }
    }, {
      key: 'clear',
      value: function clear() {
        this._contents.clear();
      }
    }, {
      key: 'draw',
      value: function draw() {}
    }, {
      key: 'redraw',
      value: function redraw() {
        this.clear();
        this.draw();
        this._contents.update();
      }
    }, {
      key: 'update',
      value: function update() {
        // this.refresh();
      }
    }, {
      key: 'style',
      get: function get() {
        return this._contents.style;
      }
    }, {
      key: 'width',
      get: function get() {
        return this._contents.width;
      }
    }, {
      key: 'height',
      get: function get() {
        return this._contents.height;
      }
    }, {
      key: 'contents',
      get: function get() {
        return this._contents;
      }
    }, {
      key: 'lineHeight',
      get: function get() {
        var text = new PIXI.Text("Testing", this.style);
        return text.height;
      }
    }, {
      key: 'margin',
      get: function get() {
        return 16;
      }
    }, {
      key: 'skinName',
      get: function get() {
        return this._contents.skinName;
      }
    }]);

    return WindowSprite;
  }(TCHE.Sprite);

  TCHE.registerClass('WindowSprite', WindowSprite);
})();
(function () {
  var TiledMap = function (_TCHE$MapSprite) {
    _inherits(TiledMap, _TCHE$MapSprite);

    function TiledMap(map) {
      _classCallCheck(this, TiledMap);

      var _this17 = _possibleConstructorReturn(this, Object.getPrototypeOf(TiledMap).call(this, map));

      _this17._layers = [];

      _this17.createLayers();
      return _this17;
    }

    _createClass(TiledMap, [{
      key: 'createTileLayer',
      value: function createTileLayer(layer) {
        var layerSprite = new TCHE.TiledLayerSprite(layer);
        this._layers.push(layerSprite);
        this.addChild(layerSprite);
      }
    }, {
      key: 'createLayers',
      value: function createLayers() {
        var mapSprite = this;

        //Iterate over every layer to make sure there's a layer for the player
        var lastObjectLayer;
        var foundPlayerLayer = false;

        this._map.mapData.layers.forEach(function (layer) {
          if (layer.type == 'objectgroup') {
            lastObjectLayer = layer;

            if (layer.properties !== undefined && layer.properties.playerLayer !== undefined) {
              foundPlayerLayer = true;
            }
          }
        });

        //If no playerLayer was found, set the last object layer as the player layer
        if (!foundPlayerLayer && !!lastObjectLayer) {
          lastObjectLayer.properties = lastObjectLayer.properties || {};
          lastObjectLayer.properties.playerLayer = true;
        }

        this._map.mapData.layers.forEach(function (layer) {
          switch (layer.type) {
            case 'tilelayer':
              mapSprite.createTileLayer(layer);
              break;
            case 'objectgroup':
              mapSprite.creatObjectLayer(layer);
              break;
          }
        });
      }
    }, {
      key: 'creatObjectLayer',
      value: function creatObjectLayer(layer) {
        var layerSprite = new TCHE.TiledObjectLayerSprite(layer);
        this._layers.push(layerSprite);
        this.addChild(layerSprite);

        this._map.objects.forEach(function (obj) {
          if (obj.layerName == layer.name) {
            layerSprite.createObjectSprite(obj);
          }
        }.bind(this));

        if (layer.properties !== undefined && layer.properties.playerLayer !== undefined) {
          layerSprite.createObjectSprite(TCHE.globals.player);
        }

        layerSprite.update();
      }
    }, {
      key: 'updateLayers',
      value: function updateLayers() {
        this._layers.forEach(function (layer) {
          layer.update();
        });
      }
    }, {
      key: 'update',
      value: function update() {
        _get(Object.getPrototypeOf(TiledMap.prototype), 'update', this).call(this);

        this.updateLayers();

        this.x = TCHE.globals.map.offsetX;
        this.y = TCHE.globals.map.offsetY;
      }
    }]);

    return TiledMap;
  }(TCHE.MapSprite);

  TCHE.registerClass('TiledMap', TiledMap);
})();
(function () {
  var Map2d = function (_TCHE$MapSprite2) {
    _inherits(Map2d, _TCHE$MapSprite2);

    function Map2d(map) {
      _classCallCheck(this, Map2d);

      var _this18 = _possibleConstructorReturn(this, Object.getPrototypeOf(Map2d).call(this, map));

      _this18._objectSprites = [];

      _this18.createBackground();
      _this18.createObjects();

      _this18.createPlayer();
      return _this18;
    }

    _createClass(Map2d, [{
      key: 'createBackground',
      value: function createBackground() {
        this._backgroundGraphic = new PIXI.Graphics();
        this._backgroundGraphic.beginFill(this._map._mapData["background-color"]);
        this._backgroundGraphic.drawRect(0, 0, TCHE.renderer.width, TCHE.renderer.height);
        this._backgroundGraphic.endFill();

        this._backgroundTexture = new PIXI.RenderTexture(TCHE.renderer, this._map.width, this._map.height);
        this._backgroundTexture.render(this._backgroundGraphic);

        this._backgroundSprite = new PIXI.Sprite(this._backgroundTexture);

        this.addChild(this._backgroundSprite);
      }
    }, {
      key: 'createPlayer',
      value: function createPlayer() {
        this._playerSprite = new TCHE.CharacterSprite(TCHE.globals.player);
        this.addChild(this._playerSprite);
      }
    }, {
      key: 'createObjects',
      value: function createObjects() {
        this._objectSprites = [];

        this._map.objects.forEach(function (obj) {
          var objSprite = new TCHE.CharacterSprite(obj);
          this._objectSprites.push(objSprite);
          this.addChild(objSprite);
        }.bind(this));
      }
    }, {
      key: 'updatePlayer',
      value: function updatePlayer() {
        this._playerSprite.update();
      }
    }, {
      key: 'updateObjects',
      value: function updateObjects() {
        this._objectSprites.forEach(function (objSprite) {
          objSprite.update();
        });
      }
    }, {
      key: 'update',
      value: function update() {
        _get(Object.getPrototypeOf(Map2d.prototype), 'update', this).call(this);

        this.x = TCHE.globals.map.offsetX;
        this.y = TCHE.globals.map.offsetY;

        this.updateObjects();
        this.updatePlayer();
      }
    }]);

    return Map2d;
  }(TCHE.MapSprite);

  TCHE.registerClass('Map2d', Map2d);
})();
(function () {
  var ChoiceWindow = function (_TCHE$WindowSprite) {
    _inherits(ChoiceWindow, _TCHE$WindowSprite);

    function ChoiceWindow(width, height) {
      _classCallCheck(this, ChoiceWindow);

      var _this19 = _possibleConstructorReturn(this, Object.getPrototypeOf(ChoiceWindow).call(this, width, height));

      _this19.interactive = true;
      _this19._index = 0;

      _this19.redraw();
      return _this19;
    }

    _createClass(ChoiceWindow, [{
      key: 'draw',
      value: function draw() {
        this.drawChoices();
      }
    }, {
      key: 'drawChoice',
      value: function drawChoice(index) {
        var choice = this._choices[index];
        var position = this.getChoicePosition(index);
        var y = position.y;
        var x = position.x;
        var width = this.itemWidth;
        var style = {};

        var align = this.choiceAlign;

        if (index == this.index) {
          style.dropShadow = true;
          style.dropShadowColor = this.highlightColor;
          style.dropShadowDistance = 1;

          var dimension = TCHE.SkinManager.getSkinCursorSize(this.skinName);
          var cursorY = y + (this.lineHeight - dimension.height) / 2;
          this.drawCursor(x + this.cursorPadding, cursorY);

          if (align == 'left') {
            x += this.cursorMargin;
            width -= this.cursorMargin;
          }
        } else if (align == 'left' && this.makeSpaceForCursor) {
          x += this.cursorMargin;
          width -= this.cursorMargin;
        }

        switch (align) {
          case 'left':
            this._contents.drawText(choice.displayName, x, y, style);
            break;
          case 'center':
            this._contents.drawTextCentered(choice.displayName, x, y, width, style);
            break;
          case 'right':
            this._contents.drawRightAlignedText(choice.displayName, x, y, width, style);
            break;
        }
      }
    }, {
      key: 'getChoiceAtGlobal',
      value: function getChoiceAtGlobal(x, y) {
        var globalX = x;
        var globalY = y;
        var myGlobalX = this.worldTransform.tx;
        var myGlobalY = this.worldTransform.ty;

        var localX = globalX - myGlobalX;
        var localY = globalY - myGlobalY;

        return this.getChoiceAt(localX, localY);
      }
    }, {
      key: 'getChoiceAt',
      value: function getChoiceAt(x, y) {
        for (var i = 0; i < this._choices.length; i++) {
          var pos = this.getChoicePosition(i);

          if (x >= pos.x && y >= pos.y && y <= pos.y + this.lineHeight && x <= pos.x + this.itemWidth) {
            return i;
          }
        }

        return -1;
      }
    }, {
      key: 'triggerChoiceAtGlobal',
      value: function triggerChoiceAtGlobal(x, y) {
        var choice = this.getChoiceAtGlobal(x, y);
        return this.triggerChoice(choice);
      }
    }, {
      key: 'selectChoiceAtGlobal',
      value: function selectChoiceAtGlobal(x, y) {
        var choice = this.getChoiceAtGlobal(x, y);
        this.selectChoice(choice);
      }
    }, {
      key: 'triggerChoice',
      value: function triggerChoice(index) {
        if (index >= 0) {
          this.onChoice(index);
        }
      }
    }, {
      key: 'selectChoice',
      value: function selectChoice(index) {
        if (index >= 0) {
          this.index = index;
        }
      }
    }, {
      key: 'selectChoiceAt',
      value: function selectChoiceAt(x, y) {
        var choice = this.getChoiceAt(x, y);
        this.selectChoice(choice);
      }
    }, {
      key: 'triggerChoiceAt',
      value: function triggerChoiceAt(x, y) {
        var choice = this.getChoiceAt(x, y);
        return this.triggerChoice(choice);
      }
    }, {
      key: 'click',
      value: function click(e) {
        this.triggerChoiceAtGlobal(e.data.global.x, e.data.global.y);
      }
    }, {
      key: 'mousemove',
      value: function mousemove(e) {
        this.selectChoiceAtGlobal(e.data.global.x, e.data.global.y);
      }
    }, {
      key: 'drawChoices',
      value: function drawChoices() {
        for (var i = 0; i < this._choices.length; i++) {
          this.drawChoice(i);
        }
      }
    }, {
      key: 'onChoice',
      value: function onChoice(index) {

        console.log('onChoice', index);
      }
    }, {
      key: 'refresh',
      value: function refresh() {
        this.makeChoiceList();
        _get(Object.getPrototypeOf(ChoiceWindow.prototype), 'refresh', this).call(this);
      }
    }, {
      key: 'makeChoiceList',
      value: function makeChoiceList() {
        this._choices = [];
      }
    }, {
      key: 'addChoice',
      value: function addChoice(code, displayName) {
        this._choices.push({ code: code, displayName: displayName });
      }
    }, {
      key: 'getChoicePosition',
      value: function getChoicePosition(index) {
        var y = index * this.lineHeight + this.margin;
        var x = this.margin;

        if (this.startFromTheBottom) {
          var reverseIndex = this._choices.length - index;
          y = this.height - this.margin - reverseIndex * this.lineHeight;
        }

        return { x: x, y: y };
      }
    }, {
      key: 'moveUp',
      value: function moveUp() {
        if (this._index < 0) {
          this._index = this._choices.length;
        }

        this._index--;

        if (this._index < 0) {
          this._index = this._choices.length - 1;
        }

        this.redraw();
      }
    }, {
      key: 'moveDown',
      value: function moveDown() {
        if (this._index < 0) {
          this._index = -1;
        }

        this._index++;

        if (this._index >= this._choices.length) {
          this._index = 0;
        }

        this.redraw();
      }
    }, {
      key: 'triggerCurrentChoice',
      value: function triggerCurrentChoice() {
        if (this._index >= 0) {
          this.triggerChoice(this._index);
        }
      }
    }, {
      key: 'checkInput',
      value: function checkInput() {
        if (!!this._inputDelay) {
          this._inputDelay--;
          return;
        }

        var direction = TCHE.InputManager.getDirection();
        if (direction.indexOf('up') >= 0) {
          this._inputDelay = this.inputDelayCount;
          this.moveUp();
        } else if (direction.indexOf('down') >= 0) {
          this._inputDelay = this.inputDelayCount;
          this.moveDown();
        } else if (TCHE.InputManager.isKeyNamePressed('ok')) {
          this._inputDelay = this.inputDelayCount;
          this.triggerCurrentChoice();
        }
      }
    }, {
      key: 'update',
      value: function update() {
        this.checkInput();
      }
    }, {
      key: 'startFromTheBottom',
      get: function get() {
        return false;
      }
    }, {
      key: 'makeSpaceForCursor',
      get: function get() {
        return false;
      }
    }, {
      key: 'cursorPadding',
      get: function get() {
        return 4;
      }
    }, {
      key: 'inputDelayCount',
      get: function get() {
        return 10;
      }
    }, {
      key: 'cursorMargin',
      get: function get() {
        var dimension = TCHE.SkinManager.getSkinCursorSize(this.skinName);
        return dimension.width + this.cursorPadding * 2;
      }
    }, {
      key: 'index',
      get: function get() {
        return this._index;
      },
      set: function set(value) {
        if (value < this._choices.length) {
          this._index = value;
        }

        if (this._index < 0 || this._index >= this._choices.length) {
          this._index = 0;
        }

        this.redraw();
      }
    }, {
      key: 'choiceAlign',
      get: function get() {
        return "left";
      }
    }, {
      key: 'itemWidth',
      get: function get() {
        return this.width - this.margin * 2;
      }
    }, {
      key: 'highlightColor',
      get: function get() {
        return 'grey';
      }
    }]);

    return ChoiceWindow;
  }(TCHE.WindowSprite);

  TCHE.registerClass('ChoiceWindow', ChoiceWindow);
})();
(function () {
  var MessageWindow = function (_TCHE$WindowSprite2) {
    _inherits(MessageWindow, _TCHE$WindowSprite2);

    function MessageWindow(width, height) {
      _classCallCheck(this, MessageWindow);

      var _this20 = _possibleConstructorReturn(this, Object.getPrototypeOf(MessageWindow).call(this, width, height));

      _this20.interactive = true;

      _this20.redraw();
      return _this20;
    }

    _createClass(MessageWindow, [{
      key: 'draw',
      value: function draw() {}
    }, {
      key: 'click',
      value: function click(e) {}
    }, {
      key: 'mousemove',
      value: function mousemove(e) {}
    }, {
      key: 'checkInput',
      value: function checkInput() {}
    }, {
      key: 'update',
      value: function update() {
        this.checkInput();
      }
    }]);

    return MessageWindow;
  }(TCHE.WindowSprite);

  TCHE.registerClass('MessageWindow', MessageWindow);
})();
(function () {
  var WindowTitleChoices = function (_TCHE$ChoiceWindow) {
    _inherits(WindowTitleChoices, _TCHE$ChoiceWindow);

    function WindowTitleChoices() {
      _classCallCheck(this, WindowTitleChoices);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(WindowTitleChoices).call(this, 224, 68));
    }

    _createClass(WindowTitleChoices, [{
      key: 'makeChoiceList',
      value: function makeChoiceList() {
        this._choices = [];
        this.addChoice('startGame', 'Start Game');
        this.addChoice('quitGame', 'Quit Game');
      }
    }, {
      key: 'onChoice',
      value: function onChoice(index) {
        switch (index) {
          case 0:
            TCHE.globals.map.changeMap(TCHE.data.game.initialMap);
            break;
          case 1:
            console.log("There's no quitting. You're here FOREVER.");
            // TCHE.SceneManager.end();
            break;
        }
      }
    }, {
      key: 'draw',
      value: function draw() {
        this.drawChoices();
      }
    }, {
      key: 'startFromTheBottom',
      get: function get() {
        return true;
      }
    }, {
      key: 'choiceAlign',
      get: function get() {
        return "center";
      }
    }]);

    return WindowTitleChoices;
  }(TCHE.ChoiceWindow);

  TCHE.registerClass('WindowTitleChoices', WindowTitleChoices);
})();
(function () {
  var CodeManager = function () {
    function CodeManager() {
      _classCallCheck(this, CodeManager);
    }

    _createClass(CodeManager, null, [{
      key: 'executeEvent',
      value: function executeEvent(event) {
        this.runCodeBlock(event.codeLines);
      }
    }, {
      key: 'runCodeBlock',
      value: function runCodeBlock(codeBlock) {
        var interpreter = new TCHE.CodeInterpreter();
        return interpreter.runCodeBlock(codeBlock);
      }
    }]);

    return CodeManager;
  }();

  TCHE.registerStaticClass('CodeManager', CodeManager);
})();
(function () {
  var startedLoadingMaps = false;
  var startedLoadingSprites = false;
  var filesToLoad = 0;

  var FileManager = function () {
    function FileManager() {
      _classCallCheck(this, FileManager);
    }

    _createClass(FileManager, null, [{
      key: 'loadGameSettings',
      value: function loadGameSettings() {
        var path = './game.json';

        TCHE.Ajax.loadFileAsync('game', path);
      }
    }, {
      key: 'loadAllMaps',
      value: function loadAllMaps() {
        if (!TCHE.data.game) return;

        startedLoadingMaps = true;
        var maps = TCHE.data.game.maps;

        for (var mapName in maps) {
          this.loadMapData(mapName, maps[mapName]);
        }
      }
    }, {
      key: 'loadAllSprites',
      value: function loadAllSprites() {
        if (!TCHE.data.game) return;

        startedLoadingSprites = true;
        var sprites = TCHE.data.game.sprites;

        for (var spriteName in sprites) {
          this.loadSpriteTexture(sprites[spriteName].image);
        }
      }
    }, {
      key: 'loadSpriteTexture',
      value: function loadSpriteTexture(imageName) {
        var texture = PIXI.Texture.fromImage(imageName);
        if (texture.baseTexture.isLoading) {
          filesToLoad++;
          texture.baseTexture.addListener('loaded', function () {
            filesToLoad--;
          });
        }
      }
    }, {
      key: 'loadMapData',
      value: function loadMapData(mapName, mapType) {
        var path = './maps/' + mapName;
        filesToLoad++;

        TCHE.maps[mapName] = null;
        TCHE.Ajax.loadFileAsync(mapName, path, function (xhr, filePath, name) {
          if (xhr.status < 400) {
            TCHE.maps[name] = JSON.parse(xhr.responseText);
            TCHE.maps[name].mapType = mapType;
            filesToLoad--;
          } else {
            console.log(arguments);
            throw new Error("Failed to load map.");
          }
        }, function () {
          console.log(arguments);
          throw new Error("Failed to load map.");
        });
      }
    }, {
      key: 'update',
      value: function update() {
        if (!TCHE.data.game) {
          if (TCHE.data.game === undefined) {
            this.loadGameSettings();
          }

          return;
        }

        if (!startedLoadingMaps) {
          this.loadAllMaps();
        }

        if (!startedLoadingSprites) {
          this.loadAllSprites();
        }
      }
    }, {
      key: 'loadTiledMapFiles',
      value: function loadTiledMapFiles(mapData) {
        mapData.tilesets.forEach(function (tileset) {
          var texture = PIXI.Texture.fromImage('./maps/' + tileset.image);
          if (texture.baseTexture.isLoading) {
            filesToLoad++;
            texture.baseTexture.addListener('loaded', function () {
              filesToLoad--;
            });
          }
        });
      }
    }, {
      key: 'loadMapFiles',
      value: function loadMapFiles(mapName) {
        var mapData = TCHE.maps[mapName];

        if (!mapData) {
          throw new Error("Invalid map name: " + mapName);
        }

        TCHE.MapManager.loadMapFiles(mapData);
      }

      //Sound files are loaded by the sound lib

    }, {
      key: 'loadSoundFile',
      value: function loadSoundFile(name, path) {
        createjs.Sound.registerSound({ src: path, id: name });
      }
    }, {
      key: 'loadSoundList',
      value: function loadSoundList(list) {
        var path = arguments.length <= 1 || arguments[1] === undefined ? "./assets/" : arguments[1];

        createjs.Sound.createjs.Sound.registerSounds(list, path);
      }
    }, {
      key: 'isLoaded',
      value: function isLoaded() {
        if (!TCHE.data.game) return false;
        if (!startedLoadingMaps) return false;
        if (filesToLoad > 0) return false;

        return true;
      }
    }]);

    return FileManager;
  }();

  TCHE.registerStaticClass('FileManager', FileManager);
})();
(function () {
  var keyAliases = {};
  var keyStates = {};
  var previousKeyStates = {};
  var triggeredKeys = [];
  var releasedKeys = [];
  var mouseClicked = [];
  var mousePos = { x: 0, y: 0 };
  var keyCodes = null;

  var keys = {
    9: 'tab', // tab
    13: 'ok', // enter
    16: 'shift', // shift
    17: 'control', // control
    18: 'control', // alt
    27: 'escape', // escape
    32: 'ok', // space
    33: 'pageup', // pageup
    34: 'pagedown', // pagedown
    37: 'left', // left arrow
    38: 'up', // up arrow
    39: 'right', // right arrow
    40: 'down', // down arrow
    45: 'escape', // insert

    65: 'left', // A
    83: 'down', // S
    68: 'right', // D
    87: 'up', // W

    74: 'ok', // J
    75: 'shift', // K
    85: 'tool', // U
    // 73: 'I', // I

    81: 'pageup', // Q
    69: 'pagedown', // E

    // 76: 'L', // L,
    // 79: 'O', // O,

    // 88: 'escape', // X
    // 90: 'ok', // Z
    96: 'escape', // numpad 0
    98: 'down', // numpad 2
    100: 'left', // numpad 4
    102: 'right', // numpad 6
    104: 'up', // numpad 8

    113: 'F2'
  };

  var InputManager = function () {
    function InputManager() {
      _classCallCheck(this, InputManager);
    }

    _createClass(InputManager, null, [{
      key: 'update',
      value: function update() {
        triggeredKeys = [];
        releasedKeys = [];

        for (var key in keyStates) {
          if (keyStates[key] === previousKeyStates[key]) continue;

          if (keyStates[key]) {
            triggeredKeys.push(key);
          } else {
            releasedKeys.push(key);
          }
        }

        previousKeyStates = TCHE.Clone.shallow(keyStates);

        for (var i = 0; i < triggeredKeys.length; i++) {
          var names = this.getKeyNames(triggeredKeys[i]);

          for (var j = 0; j < names.length; j++) {
            this.fire(names[j], {});
          }
        }
      }
    }, {
      key: 'addKeyCode',
      value: function addKeyCode(code, name) {
        keys[code] = name;
        keyCodes = null;
      }
    }, {
      key: 'addKeyAlias',
      value: function addKeyAlias(keyName, keyAlias) {
        keyAliases[keyName] = keyAliases[keyName] || [];
        keyAliases[keyName].push(keyAlias);

        keyCodes = null;
      }
    }, {
      key: 'isKeyCodePressed',
      value: function isKeyCodePressed(keyCode) {
        return !!keyStates[keyCode];
      }
    }, {
      key: 'isKeyCodeTriggered',
      value: function isKeyCodeTriggered(keyCode) {
        return triggeredKeys.indexOf(keyCode) >= 0;
      }
    }, {
      key: 'isKeyCodeReleased',
      value: function isKeyCodeReleased(keyCode) {
        return releasedKeys.indexOf(keyCode) >= 0;
      }
    }, {
      key: 'generateKeyCodes',
      value: function generateKeyCodes(keyName) {
        var codes = [];

        for (var key in keys) {
          if (keys.hasOwnProperty(key)) {
            if (keys[key].toUpperCase() == keyName.toUpperCase()) {
              codes.push(key);
              continue;
            }

            var thisKeyName = keys[key];
            if (!!keyAliases[thisKeyName] && keyAliases[thisKeyName].indexOf(keyName) >= 0) {
              codes.push(key);
            }
          }
        }

        keyCodes = keyCodes || {};
        keyCodes[keyName] = codes;

        return codes;
      }
    }, {
      key: 'getKeyCodes',
      value: function getKeyCodes(keyName) {
        if (!!keyCodes && !!keyCodes[keyName]) {
          return keyCodes[keyName];
        }

        return this.generateKeyCodes(keyName);
      }
    }, {
      key: 'getKeyNames',
      value: function getKeyNames(keyCode) {
        var names = [];

        if (!!keys[keyCode]) {
          var name = keys[keyCode];

          names.push(name);
          if (!!keyAliases[name]) {
            names = names.concat(keyAliases[name]);
          }
        }

        return names;
      }
    }, {
      key: 'isKeyNamePressed',
      value: function isKeyNamePressed(keyName) {
        var codes = this.getKeyCodes(keyName);

        return codes.find(function (key) {
          return this.isKeyCodePressed(key);
        }.bind(this)) || false;
      }
    }, {
      key: 'isKeyNameReleased',
      value: function isKeyNameReleased(keyName) {
        var codes = this.getKeyCodes(keyName);

        return codes.find(function (key) {
          return this.isKeyCodeReleased(key);
        }.bind(this)) || false;
      }
    }, {
      key: 'isKeyNameTriggered',
      value: function isKeyNameTriggered(keyName) {
        var codes = this.getKeyCodes(keyName);

        return codes.find(function (key) {
          return this.isKeyCodeTriggered(key);
        }.bind(this)) || false;
      }
    }, {
      key: 'isKeyPressed',
      value: function isKeyPressed(keyCodeOrName) {
        if (typeof keyCodeOrName == "string") {
          return this.isKeyNamePressed(keyCodeOrName);
        } else {
          return this.isKeyCodePressed(keyCodeOrName);
        }
      }
    }, {
      key: 'isKeyTriggered',
      value: function isKeyTriggered(keyCodeOrName) {
        if (typeof keyCodeOrName == "string") {
          return this.isKeyNameTriggered(keyCodeOrName);
        } else {
          return this.isKeyCodeTriggered(keyCodeOrName);
        }
      }
    }, {
      key: 'isKeyReleased',
      value: function isKeyReleased(keyCodeOrName) {
        if (typeof keyCodeOrName == "string") {
          return this.isKeyNameReleased(keyCodeOrName);
        } else {
          return this.isKeyCodeReleased(keyCodeOrName);
        }
      }
    }, {
      key: 'getPressedKeys',
      value: function getPressedKeys(keys) {
        return Object.keys(keys).filter(function (key) {
          return this.isKeyCodePressed(key);
        }.bind(this));
      }
    }, {
      key: 'getFirstDirection',
      value: function getFirstDirection() {
        return ['left', 'right', 'up', 'down'].find(function (direction) {
          return this.isKeyNamePressed(direction);
        }.bind(this)) || '';
      }
    }, {
      key: 'getDirection',
      value: function getDirection() {
        return ['left', 'right', 'up', 'down'].filter(function (direction) {
          return this.isKeyNamePressed(direction);
        }.bind(this)).join('-');
      }
    }, {
      key: 'onKeyDown',
      value: function onKeyDown(event) {
        if (this.isBlockedKey(event.keyCode)) {
          event.preventDefault();
        }

        keyStates[event.keyCode] = true;
      }
    }, {
      key: 'onKeyUp',
      value: function onKeyUp(event) {
        keyStates[event.keyCode] = false;
      }
    }, {
      key: 'onWindowBlur',
      value: function onWindowBlur() {
        this.clear();
      }
    }, {
      key: 'clear',
      value: function clear() {
        keyStates = {};
        for (var i = 0; i < mouseClicked.length; i++) {
          mouseClicked[i] = false;
        }
        mousePos = { x: 0, y: 0 };
      }
    }, {
      key: 'isBlockedKey',
      value: function isBlockedKey(keyCode) {
        switch (keyCode) {
          case 8: // backspace
          case 33: // pageup
          case 34: // pagedown
          case 37: // left arrow
          case 38: // up arrow
          case 39: // right arrow
          case 40:
            // down arrow
            return true;
          default:
            return false;
        }
      }
    }, {
      key: 'isMouseClicked',
      value: function isMouseClicked(button) {
        return mouseClicked[button];
      }
    }, {
      key: 'isLeftMouseClicked',
      value: function isLeftMouseClicked() {
        return mouseClicked[0];
      }
    }, {
      key: 'isMiddleMouseClicked',
      value: function isMiddleMouseClicked() {
        return mouseClicked[1];
      }
    }, {
      key: 'isRightMouseClicked',
      value: function isRightMouseClicked() {
        return mouseClicked[2];
      }
    }, {
      key: 'currentMousePos',
      value: function currentMousePos() {
        return mousePos;
      }
    }, {
      key: 'processMouseDown',
      value: function processMouseDown(pos, button) {
        mouseClicked[button] = true;
        mousePos = pos;
      }
    }, {
      key: 'processMouseOut',
      value: function processMouseOut() {
        for (var i = 0; i < mouseClicked.length; i++) {
          mouseClicked[i] = false;
        }
      }
    }, {
      key: 'processMouseUp',
      value: function processMouseUp(pos, button) {
        mouseClicked[button] = false;
        mousePos = pos;
      }
    }, {
      key: 'processMouseMove',
      value: function processMouseMove(pos) {
        mousePos = pos;
      }
    }]);

    return InputManager;
  }();

  document.addEventListener('keydown', InputManager.onKeyDown.bind(InputManager));
  document.addEventListener('keyup', InputManager.onKeyUp.bind(InputManager));
  window.addEventListener('blur', InputManager.onWindowBlur.bind(InputManager));

  TCHE.on("started", function () {
    TCHE.renderer.view.addEventListener("click", function (evt) {
      var pos = getMousePos(this, evt);

      TCHE.SceneManager.processClick(pos);
    });

    TCHE.renderer.view.addEventListener("mousedown", function (evt) {
      var pos = getMousePos(this, evt);

      TCHE.InputManager.processMouseDown(pos, evt.button);
    });

    TCHE.renderer.view.addEventListener("mousemove", function (evt) {
      var pos = getMousePos(this, evt);

      TCHE.InputManager.processMouseMove(pos);
    });

    TCHE.renderer.view.addEventListener("mouseout", function (evt) {
      TCHE.InputManager.processMouseOut();
    });

    TCHE.renderer.view.addEventListener("mouseup", function (evt) {
      var pos = getMousePos(this, evt);

      TCHE.InputManager.processMouseUp(pos, evt.button);
    });
  });

  function getMousePos(canvas, evt) {
    return TCHE.renderer.plugins.interaction.eventData.data.global;
  }

  TCHE.registerStaticClass('InputManager', InputManager);
})();
(function () {
  var MapManager = function () {
    function MapManager() {
      _classCallCheck(this, MapManager);
    }

    _createClass(MapManager, null, [{
      key: 'getMapData',
      value: function getMapData(mapName) {
        return TCHE.maps[mapName];
      }
    }, {
      key: 'getMapType',
      value: function getMapType(mapData) {
        if (TCHE.mapTypes[mapData.mapType] !== undefined) {
          return TCHE.mapTypes[mapData.mapType];
        } else {
          return TCHE.SpriteType;
        }
      }
    }, {
      key: 'getMapWidth',
      value: function getMapWidth(mapData) {
        return this.getMapType(mapData).getMapWidth(mapData);
      }
    }, {
      key: 'getMapHeight',
      value: function getMapHeight(mapData) {
        return this.getMapType(mapData).getMapHeight(mapData);
      }
    }, {
      key: 'getSpriteClass',
      value: function getSpriteClass(mapData) {
        return this.getMapType(mapData).getSpriteClass(mapData);
      }
    }, {
      key: 'getMapObjects',
      value: function getMapObjects(mapData) {
        return this.getMapType(mapData).getMapObjects(mapData);
      }
    }, {
      key: 'loadMapFiles',
      value: function loadMapFiles(mapData) {
        this.getMapType(mapData).loadMapFiles(mapData);
      }
    }, {
      key: 'getImportantObjectData',
      value: function getImportantObjectData(mapData, obj) {
        return this.getMapType(mapData).getImportantObjectData(mapData, obj);
      }
    }]);

    return MapManager;
  }();

  TCHE.registerStaticClass('MapManager', MapManager);
})();
(function () {
  var MessageManager = function () {
    function MessageManager() {
      _classCallCheck(this, MessageManager);
    }

    _createClass(MessageManager, null, [{
      key: 'showMessage',
      value: function showMessage() {}
    }]);

    return MessageManager;
  }();

  TCHE.registerStaticClass('MessageManager', MessageManager);
})();
(function () {
  var ObjectTypeManager = function () {
    function ObjectTypeManager() {
      _classCallCheck(this, ObjectTypeManager);
    }

    _createClass(ObjectTypeManager, null, [{
      key: 'loadObjectType',
      value: function loadObjectType(objectName) {
        if (!!TCHE.objectTypes[objectName]) return TCHE.objectTypes[objectName];

        var objects = TCHE.data.game.objects || {};
        var object = objects[objectName];
        var events = object.events || {};

        var parentName = object.inherits;
        if (!parentName || !parentName.trim()) {
          parentName = 'Object';
        } else {
          parentName = parentName.trim();
        }

        var parentObject = TCHE.objectTypes[parentName];
        if (!parentObject) {
          parentObject = TCHE.ObjectTypeManager.loadObjectType(parentName);
        }

        var customObjectType = function customObjectType() {
          parentObject.call(this);
          for (var eventName in events) {
            this._events[eventName] = TCHE.Clone.shallow(events[eventName]);
          }
        };
        customObjectType.prototype = Object.create(parentObject.prototype);
        customObjectType.prototype.constructor = customObjectType;

        TCHE.objectTypes[objectName] = customObjectType;
        return TCHE.objectTypes[objectName];
      }
    }, {
      key: 'loadCustomObjectTypes',
      value: function loadCustomObjectTypes() {
        var objects = TCHE.data.game.objects || {};
        for (var objectName in objects) {
          TCHE.ObjectTypeManager.loadObjectType(objectName);
        }
      }
    }]);

    return ObjectTypeManager;
  }();

  TCHE.registerStaticClass('ObjectTypeManager', ObjectTypeManager);
})();
(function () {
  var ResolutionManager = function () {
    function ResolutionManager() {
      _classCallCheck(this, ResolutionManager);
    }

    _createClass(ResolutionManager, null, [{
      key: 'updateResolution',
      value: function updateResolution() {
        if (!TCHE.data.game.resolution) return;

        var dynamic = TCHE.data.game.resolution.useDynamicResolution || false;

        if (dynamic) {
          TCHE.onResize = function (e) {
            var size = TCHE.getClientSize();

            TCHE.renderer.resize(size.width, size.height);

            TCHE.renderer.view.style.width = size.width + 'px';
            TCHE.renderer.view.style.height = size.height + 'px';
          };

          TCHE.onResize();
        } else {
          var width = TCHE.data.game.resolution.width;
          var height = TCHE.data.game.resolution.height;

          TCHE.renderer.resize(width, height);

          if (TCHE.Params.isNwjs) {
            var gui = require('nw.gui');
            var win = gui.Window.get();

            var screenWidth = TCHE.data.game.resolution.screenWidth;
            var screenHeight = TCHE.data.game.resolution.screenHeight;

            win.resizeTo(screenWidth, screenHeight);
            win.setPosition("center");
          }
        }
      }
    }]);

    return ResolutionManager;
  }();

  TCHE.registerStaticClass('ResolutionManager', ResolutionManager);
})();
(function () {
  var scene;
  var newScene;
  var newSceneParams;

  var SceneManager = function () {
    function SceneManager() {
      _classCallCheck(this, SceneManager);
    }

    _createClass(SceneManager, null, [{
      key: 'requestAnimationFrame',
      value: function requestAnimationFrame() {
        window.requestAnimationFrame(this.update.bind(this));
      }
    }, {
      key: '_doSceneChange',
      value: function _doSceneChange() {
        if (newScene !== undefined) {
          if (!!scene) {
            scene.terminate();
            scene = undefined;
          }

          if (!!newScene) {
            scene = new newScene(newSceneParams);
          }
        }

        newScene = undefined;
      }
    }, {
      key: 'update',
      value: function update() {
        TCHE.startFrame();

        this._doSceneChange();

        TCHE.FileManager.update();
        TCHE.InputManager.update();

        if (!!scene) {
          scene.update();

          TCHE.renderer.render(scene);
        }

        TCHE.endFrame();

        //If there's no active scene, then end the game
        if (!!scene) {
          this.requestAnimationFrame();
        }
      }
    }, {
      key: 'changeScene',
      value: function changeScene(newSceneClass, params) {
        newScene = newSceneClass;
        newSceneParams = params || {};
      }
    }, {
      key: 'start',
      value: function start(initialScene) {
        this.changeScene(initialScene);
        this.requestAnimationFrame();
      }
    }, {
      key: 'end',
      value: function end() {
        this.changeScene(null);
      }
    }, {
      key: 'processClick',
      value: function processClick(pos) {
        this.scene.processClick(pos);
      }
    }, {
      key: 'scene',
      get: function get() {
        return scene;
      },
      set: function set(value) {
        scene = value;
      }
    }, {
      key: 'newScene',
      get: function get() {
        return newScene;
      }
    }]);

    return SceneManager;
  }();

  TCHE.registerStaticClass('SceneManager', SceneManager);
})();
(function () {
  var SkinManager = function () {
    function SkinManager() {
      _classCallCheck(this, SkinManager);
    }

    _createClass(SkinManager, null, [{
      key: 'getSkinData',
      value: function getSkinData(skinName) {
        var data = TCHE.data.game.skins[skinName];
        if (!!data) {
          data.skinName = skinName;
        }
        return data;
      }
    }, {
      key: 'getSkinType',
      value: function getSkinType(skinData) {
        if (TCHE.skinTypes[skinData.type] !== undefined) {
          return TCHE.skinTypes[skinData.type];
        } else {
          return TCHE.SkinType;
        }
      }
    }, {
      key: 'loadSkinTexture',
      value: function loadSkinTexture(skinData) {
        var type = this.getSkinType(skinData.skinName);
        return type.loadSkinTexture(skinData);
      }
    }, {
      key: 'getTextureFromCache',
      value: function getTextureFromCache(skinName, identifier) {
        if (this._textureCache === undefined) {
          return undefined;
        }

        return this._textureCache[skinName + '/' + identifier];
      }
    }, {
      key: 'saveTextureCache',
      value: function saveTextureCache(skinName, identifier, texture) {
        if (this._textureCache === undefined) {
          this._textureCache = {};
        }

        this._textureCache[skinName + '/' + identifier] = texture;
      }
    }, {
      key: 'loadSkinBackgroundTexture',
      value: function loadSkinBackgroundTexture(skinData) {
        var texture = this.getTextureFromCache(skinData.name, 'background');
        if (!texture) {
          texture = new PIXI.Texture(this.loadSkinTexture(skinData));
          this.saveTextureCache(skinData.name, 'background', texture);
        }

        return texture;
      }
    }, {
      key: 'loadSkinFrameTexture',
      value: function loadSkinFrameTexture(skinData) {
        var texture = this.getTextureFromCache(skinData.name, 'frame');
        if (!texture) {
          texture = new PIXI.Texture(this.loadSkinTexture(skinData));
          this.saveTextureCache(skinData.name, 'frame', texture);
        }

        return texture;
      }
    }, {
      key: 'drawSkinFrame',
      value: function drawSkinFrame(skinName, content) {
        var data = this.getSkinData(skinName);
        if (!!data) {
          this.getSkinType(data).drawSkinFrame(content, data);
        }
      }
    }, {
      key: 'addSkinBackground',
      value: function addSkinBackground(skinName, windowObj, container) {
        var data = this.getSkinData(skinName);
        if (!!data) {
          this.getSkinType(data).addSkinBackground(windowObj, container, data);
        }
      }
    }, {
      key: 'drawSkinCursor',
      value: function drawSkinCursor(skinName, content, x, y) {
        var data = this.getSkinData(skinName);
        if (!!data) {
          this.getSkinType(data).drawSkinCursor(data, content, x, y);
        }
      }
    }, {
      key: 'getSkinCursorSize',
      value: function getSkinCursorSize(skinName) {
        var data = this.getSkinData(skinName);
        if (!!data) {
          return this.getSkinType(data).getSkinCursorSize(data);
        } else {
          return 0;
        }
      }
    }]);

    return SkinManager;
  }();

  TCHE.registerStaticClass('SkinManager', SkinManager);
})();
(function () {
  var SoundManager = function () {
    function SoundManager() {
      _classCallCheck(this, SoundManager);
    }

    _createClass(SoundManager, null, [{
      key: 'play',
      value: function play(soundName) {
        createjs.Sound.play(soundName);
      }
    }]);

    return SoundManager;
  }();

  TCHE.registerStaticClass('SoundManager', SoundManager);
})();
(function () {
  var SpriteManager = function () {
    function SpriteManager() {
      _classCallCheck(this, SpriteManager);
    }

    _createClass(SpriteManager, null, [{
      key: 'getSpriteData',
      value: function getSpriteData(spriteName) {
        return TCHE.data.game.sprites[spriteName];
      }
    }, {
      key: 'getSpriteType',
      value: function getSpriteType(spriteData) {
        if (TCHE.spriteTypes[spriteData.type] !== undefined) {
          return TCHE.spriteTypes[spriteData.type];
        } else {
          return TCHE.SpriteType;
        }
      }
    }, {
      key: 'configureLoadedSprite',
      value: function configureLoadedSprite(character, spriteObj, spriteData) {
        this.getSpriteType(spriteData).configureLoadedSprite(character, spriteObj, spriteData);
      }
    }, {
      key: 'getSpriteFrame',
      value: function getSpriteFrame(character, spriteObj, spriteName) {
        var spriteData = this.getSpriteData(spriteName);

        return this.getSpriteType(spriteData).getSpriteFrame(character, spriteObj, spriteData);
      }
    }, {
      key: 'getTextureFromCache',
      value: function getTextureFromCache(spriteName) {
        if (this._textureCache === undefined) {
          return undefined;
        }

        return this._textureCache[spriteName];
      }
    }, {
      key: 'saveTextureCache',
      value: function saveTextureCache(spriteName, texture) {
        if (this._textureCache === undefined) {
          this._textureCache = {};
        }

        this._textureCache[spriteName] = texture;
      }
    }, {
      key: 'spriteIsFullImage',
      value: function spriteIsFullImage(spriteData) {
        return this.getSpriteType(spriteData).isFullImage(spriteData);
      }
    }, {
      key: 'loadSpriteTexture',
      value: function loadSpriteTexture(spriteName, spriteData) {
        var cached = this.getTextureFromCache(spriteName);

        if (!!cached) {
          return cached;
        }

        var image = PIXI.Texture.fromImage(spriteData.image);

        if (this.spriteIsFullImage(spriteData)) {
          return image;
        }

        return image.clone();
      }
    }, {
      key: 'getSpriteTexture',
      value: function getSpriteTexture(spriteName) {
        var data = this.getSpriteData(spriteName);
        return this.loadSpriteTexture(spriteName, data);
      }
    }, {
      key: 'loadSprite',
      value: function loadSprite(character) {
        var data = this.getSpriteData(character.sprite);
        var texture = this.loadSpriteTexture(character.sprite, data);
        var spriteObj = new PIXI.Sprite(texture);

        if (texture.baseTexture.isLoading) {
          texture.baseTexture.addListener('loaded', function () {
            TCHE.SpriteManager.configureLoadedSprite(character, spriteObj, data);
          });
        } else {
          TCHE.SpriteManager.configureLoadedSprite(character, spriteObj, data);
        }

        return spriteObj;
      }
    }, {
      key: 'updateCharacterSprite',
      value: function updateCharacterSprite(spriteObj, character) {
        var data = this.getSpriteData(character.sprite);
        this.getSpriteType(data).update(character, spriteObj, data);
      }
    }, {
      key: 'updateAnimationStep',
      value: function updateAnimationStep(character) {
        var data = this.getSpriteData(character.sprite);
        this.getSpriteType(data).updateAnimationStep(character);
      }
    }]);

    return SpriteManager;
  }();

  TCHE.registerStaticClass('SpriteManager', SpriteManager);
})();
(function () {
  var TileManager = function () {
    function TileManager() {
      _classCallCheck(this, TileManager);
    }

    _createClass(TileManager, null, [{
      key: 'getTileTextureFromCache',
      value: function getTileTextureFromCache(mapName, tileId) {
        if (this._tileCache === undefined) {
          return undefined;
        }

        return this._tileCache[mapName + tileId];
      }
    }, {
      key: 'saveTileTextureCache',
      value: function saveTileTextureCache(mapName, tileId, texture) {
        if (this._tileCache === undefined) {
          this._tileCache = {};
        }

        this._tileCache[mapName + tileId] = texture;
      }
    }, {
      key: 'loadTileTexture',
      value: function loadTileTexture(mapName, tileId) {
        var texture = this.getTileTextureFromCache(mapName, tileId);
        if (!!texture) {
          return texture;
        }

        var mapData = TCHE.maps[mapName];
        var tilesets = mapData.tilesets;
        var theTileset;

        tilesets.forEach(function (tileset) {
          if (tileId < tileset.firstgid) return;
          if (tileId > tileset.firstgid + tileset.tilecount) return;
          theTileset = tileset;

          return false;
        });

        var columns = theTileset.imagewidth / theTileset.tilewidth;

        var subTileId = tileId - theTileset.firstgid;
        var column = subTileId % columns;
        var line = Math.floor(subTileId / columns);

        var frame = {
          width: theTileset.tilewidth,
          height: theTileset.tileheight,
          x: column * theTileset.tilewidth,
          y: line * theTileset.tileheight
        };

        var baseTexture = PIXI.Texture.fromImage('./map/' + theTileset.image);
        texture = new PIXI.Texture(baseTexture);
        if (texture.baseTexture.isLoading) {
          texture.baseTexture.addListener('loaded', function () {
            texture.frame = frame;
          });
        } else {
          texture.frame = frame;
        }

        this.saveTileTextureCache(mapName, tileId, texture);

        return texture;
      }
    }, {
      key: 'getLayerTextureFromCache',
      value: function getLayerTextureFromCache(mapName, layerName) {
        if (this._layerCache === undefined) {
          return undefined;
        }

        return this._layerCache[mapName + '/' + layerName];
      }
    }, {
      key: 'saveLayerTextureCache',
      value: function saveLayerTextureCache(mapName, layerName, texture) {
        if (this._layerCache === undefined) {
          this._layerCache = {};
        }

        this._layerCache[mapName + '/' + layerName] = texture;
      }
    }]);

    return TileManager;
  }();

  TCHE.registerStaticClass('TileManager', TileManager);
})();
(function () {
  var Scene = function (_PIXI$Container2) {
    _inherits(Scene, _PIXI$Container2);

    function Scene() {
      _classCallCheck(this, Scene);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(Scene).call(this));
    }

    _createClass(Scene, [{
      key: 'update',
      value: function update() {}
    }, {
      key: 'terminate',
      value: function terminate() {}
    }, {
      key: 'processClick',
      value: function processClick(pos) {}
    }]);

    return Scene;
  }(PIXI.Container);

  TCHE.registerClass('Scene', Scene);
})();
(function () {
  var SceneLoading = function (_TCHE$Scene) {
    _inherits(SceneLoading, _TCHE$Scene);

    function SceneLoading() {
      _classCallCheck(this, SceneLoading);

      var _this23 = _possibleConstructorReturn(this, Object.getPrototypeOf(SceneLoading).call(this));

      _this23.createBackground();
      _this23.createMessage();
      return _this23;
    }

    _createClass(SceneLoading, [{
      key: 'update',
      value: function update() {
        this.updateBackground();
        this.updateMessage();
      }
    }, {
      key: 'createBackground',
      value: function createBackground() {
        this._backgroundGraphic = new PIXI.Graphics();
        this._backgroundGraphic.beginFill("0xCCCCCC");
        this._backgroundGraphic.drawRect(0, 0, TCHE.renderer.width, TCHE.renderer.height);
        this._backgroundGraphic.endFill();

        this._backgroundTexture = new PIXI.RenderTexture(TCHE.renderer, TCHE.renderer.width, TCHE.renderer.height);
        this._backgroundTexture.render(this._backgroundGraphic);

        this._backgroundSprite = new PIXI.Sprite(this._backgroundTexture);

        this.addChild(this._backgroundSprite);
      }
    }, {
      key: 'createMessage',
      value: function createMessage() {
        this._messageText = "Loading";

        this._messageSprite = new PIXI.Text("");
        this._messageSprite.anchor.x = 0.5;
        this._messageSprite.anchor.y = 0.5;
        this._messageSprite.position.y = Math.floor(TCHE.renderer.height / 2);
        this._messageSprite.position.x = Math.floor(TCHE.renderer.width / 2);

        this.addChild(this._messageSprite);

        this._dots = 0;
        this._counter = 0;
        this._initialCounter = 10;
      }
    }, {
      key: 'updateBackground',
      value: function updateBackground() {}
    }, {
      key: 'updateMessage',
      value: function updateMessage() {
        if (!!this._initialCounter && this._initialCounter > 0) {
          this._initialCounter--;
          return;
        }

        this._counter++;

        if (this._counter > 20) {
          this._counter = 0;
          this._dots++;

          if (this._dots > 3) {
            this._dots = 0;
          }

          var string = this._messageText;
          for (var i = 0; i < this._dots; i++) {
            string += ".";
          }

          this._messageSprite.text = string;
        }
      }
    }]);

    return SceneLoading;
  }(TCHE.Scene);

  TCHE.registerClass('SceneLoading', SceneLoading);
})();
(function () {
  var SceneLaunch = function (_TCHE$SceneLoading) {
    _inherits(SceneLaunch, _TCHE$SceneLoading);

    function SceneLaunch() {
      _classCallCheck(this, SceneLaunch);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(SceneLaunch).call(this));
    }

    _createClass(SceneLaunch, [{
      key: 'update',
      value: function update() {
        _get(Object.getPrototypeOf(SceneLaunch.prototype), 'update', this).call(this);

        if (TCHE.FileManager.isLoaded()) {
          TCHE.ResolutionManager.updateResolution();
          TCHE.ObjectTypeManager.loadCustomObjectTypes();

          if (TCHE.Params.param('debug')) {
            TCHE.Validation.checkBasicFiles();
          }

          TCHE.fire("ready");

          var initialScene = TCHE.data.game.initialScene;
          if (!TCHE[initialScene]) {
            initialScene = TCHE.SceneTitle;
          } else {
            initialScene = TCHE[initialScene];
          }

          var params = {};

          if (initialScene == TCHE.SceneMap || initialScene.prototype instanceof TCHE.SceneMap) {
            params.mapName = TCHE.data.game.initialMap;
          }

          TCHE.SceneManager.changeScene(initialScene, params);
        }
      }
    }]);

    return SceneLaunch;
  }(TCHE.SceneLoading);

  TCHE.registerClass('SceneLaunch', SceneLaunch);
})();
(function () {
  var SceneMapLoading = function (_TCHE$SceneLoading2) {
    _inherits(SceneMapLoading, _TCHE$SceneLoading2);

    function SceneMapLoading(params) {
      _classCallCheck(this, SceneMapLoading);

      var _this25 = _possibleConstructorReturn(this, Object.getPrototypeOf(SceneMapLoading).call(this));

      _this25._mapName = params.mapName;

      TCHE.FileManager.loadMapFiles(params.mapName);
      return _this25;
    }

    _createClass(SceneMapLoading, [{
      key: 'update',
      value: function update() {
        _get(Object.getPrototypeOf(SceneMapLoading.prototype), 'update', this).call(this);

        if (TCHE.FileManager.isLoaded()) {
          TCHE.fire("mapLoaded");
          TCHE.SceneManager.changeScene(TCHE.SceneMap, { mapName: this._mapName });
        }
      }
    }]);

    return SceneMapLoading;
  }(TCHE.SceneLoading);

  TCHE.registerClass('SceneMapLoading', SceneMapLoading);
})();
(function () {
  var SceneMap = function (_TCHE$Scene2) {
    _inherits(SceneMap, _TCHE$Scene2);

    function SceneMap(params) {
      _classCallCheck(this, SceneMap);

      var _this26 = _possibleConstructorReturn(this, Object.getPrototypeOf(SceneMap).call(this));

      TCHE.globals.player.x = Number(TCHE.data.game.player.x || 0);
      TCHE.globals.player.y = Number(TCHE.data.game.player.y || 0);
      TCHE.globals.player.width = Number(TCHE.data.game.player.width || 0);
      TCHE.globals.player.height = Number(TCHE.data.game.player.height || 0);
      TCHE.globals.player.offsetX = Number(TCHE.data.game.player.offsetX || 0);
      TCHE.globals.player.offsetY = Number(TCHE.data.game.player.offsetY || 0);
      TCHE.globals.player.sprite = TCHE.data.game.player.sprite;

      TCHE.globals.map.loadMap(params.mapName);

      var mapData = TCHE.globals.map.mapData;
      var spriteClass = TCHE.MapManager.getSpriteClass(mapData);

      _this26._mapSprite = new spriteClass(TCHE.globals.map);
      _this26.addChild(_this26._mapSprite);
      return _this26;
    }

    _createClass(SceneMap, [{
      key: 'update',
      value: function update() {
        _get(Object.getPrototypeOf(SceneMap.prototype), 'update', this).call(this);

        TCHE.globals.map.update();
        TCHE.globals.player.update();

        this._mapSprite.update();
      }
    }, {
      key: 'processClick',
      value: function processClick(pos) {
        TCHE.globals.player.setDest(pos.x - TCHE.globals.map.offsetX, pos.y - TCHE.globals.map.offsetY);
      }
    }]);

    return SceneMap;
  }(TCHE.Scene);

  TCHE.registerClass('SceneMap', SceneMap);
})();
(function () {
  var SceneWindow = function (_TCHE$Scene3) {
    _inherits(SceneWindow, _TCHE$Scene3);

    function SceneWindow(params) {
      _classCallCheck(this, SceneWindow);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(SceneWindow).call(this));
    }

    _createClass(SceneWindow, [{
      key: 'update',
      value: function update() {
        _get(Object.getPrototypeOf(SceneWindow.prototype), 'update', this).call(this);
      }
    }]);

    return SceneWindow;
  }(TCHE.Scene);

  TCHE.registerClass('SceneWindow', SceneWindow);
})();
(function () {
  var SceneTitle = function (_TCHE$SceneWindow) {
    _inherits(SceneTitle, _TCHE$SceneWindow);

    function SceneTitle(params) {
      _classCallCheck(this, SceneTitle);

      var _this28 = _possibleConstructorReturn(this, Object.getPrototypeOf(SceneTitle).call(this));

      _this28._windowSprite = new TCHE.WindowTitleChoices();
      _this28._windowSprite.x = Math.floor(TCHE.renderer.width / 2) - Math.floor(_this28._windowSprite.width / 2);
      _this28._windowSprite.y = TCHE.renderer.height - _this28._windowSprite.height;

      _this28.addChild(_this28._windowSprite);
      return _this28;
    }

    _createClass(SceneTitle, [{
      key: 'update',
      value: function update() {
        _get(Object.getPrototypeOf(SceneTitle.prototype), 'update', this).call(this);

        this._windowSprite.update();
      }
    }]);

    return SceneTitle;
  }(TCHE.SceneWindow);

  TCHE.registerClass('SceneTitle', SceneTitle);
})();
(function () {
  var collisionMapDirty = true;
  var shouldCreateCollisionMap = true;

  var Map = function () {
    function Map() {
      _classCallCheck(this, Map);

      this._mapData = {};
      this._objects = [];
      this._collisionMap = [];
      this._mapName = null;
      this._offsetX = 0;
      this._offsetY = 0;
    }

    _createClass(Map, [{
      key: 'requestCollisionMapRefresh',
      value: function requestCollisionMapRefresh() {
        collisionMapDirty = true;
      }
    }, {
      key: 'getImportantObjectData',
      value: function getImportantObjectData(mapData, obj) {
        var data = TCHE.MapManager.getImportantObjectData(mapData, obj);

        data.x = data.x || 0;
        data.y = data.y || 0;
        data.width = data.width || 0;
        data.height = data.height || 0;
        data.sprite = data.sprite || '';
        data.objectType = data.objectType || '';
        data.offsetY = data.offsetY || 0;
        data.offsetX = data.offsetX || 0;
        data.ghost = !!data.ghost;

        return data;
      }
    }, {
      key: 'updateOffset',
      value: function updateOffset() {
        var diffX = this.width - TCHE.renderer.width;
        var diffY = this.height - TCHE.renderer.height;
        var middleX = Math.floor(TCHE.renderer.width / 2);
        var middleY = Math.floor(TCHE.renderer.height / 2);
        var mapMiddleX = Math.floor(this.width / 2);
        var mapMiddleY = Math.floor(this.height / 2);
        var playerX = TCHE.globals.player.x;
        var playerY = TCHE.globals.player.y;

        if (diffX < 0) {
          this._offsetX = Math.abs(Math.floor(diffX / 2));
        } else if (diffX > 0) {
          if (playerX > middleX) {
            if (playerX < this.width - middleX) {
              this._offsetX = middleX - playerX;
            } else {
              this._offsetX = TCHE.renderer.width - this.width;
            }
          } else {
            this._offsetX = 0;
          }
        } else {
          this._offsetX = 0;
        }

        if (diffY < 0) {
          this._offsetY = Math.abs(Math.floor(diffY / 2));
        } else if (diffY > 0) {
          if (playerY > middleY) {
            if (playerY < this.height - middleY) {
              this._offsetY = middleY - playerY;
            } else {
              this._offsetY = TCHE.renderer.height - this.height;
            }
          } else {
            this._offsetY = 0;
          }
        } else {
          this._offsetY = 0;
        }
      }
    }, {
      key: 'createObjects',
      value: function createObjects() {
        var objectList = [];
        var map = this;

        if (!!this._mapData) {
          objectList = TCHE.MapManager.getMapObjects(this._mapData) || objectList;
        }

        objectList.forEach(function (obj) {
          var data = map.getImportantObjectData(this._mapData, obj);
          var characterClass = TCHE.Character;

          if (data.class && TCHE[data.class] && typeof TCHE[data.class] == "function") {
            characterClass = TCHE[data.class];
          }

          var objCharacter = new characterClass();
          for (var key in data) {
            objCharacter[key] = data[key];
          }

          this._objects.push(objCharacter);
        }.bind(this));

        collisionMapDirty = true;
        shouldCreateCollisionMap = true;
      }
    }, {
      key: 'addCharacterToCollisionMap',
      value: function addCharacterToCollisionMap(character) {
        for (var x = character.x; x < character.rightX; x++) {
          for (var y = character.y; y < character.bottomY; y++) {
            if (this._collisionMap.length < x || !this._collisionMap[x]) {
              this._collisionMap[x] = {};
            }
            if (this._collisionMap[x].length < y || !this._collisionMap[x][y]) {
              this._collisionMap[x][y] = [];
            }

            this._collisionMap[x][y].push(character);
          }
        }
      }
    }, {
      key: 'getMapObjects',
      value: function getMapObjects() {
        return TCHE.MapManager.getMapObjects(this._mapData);
      }

      // Go over all objects to form a list of blocked pixels

    }, {
      key: 'createCollisionMap',
      value: function createCollisionMap() {
        this._collisionMap = {};

        for (var i = 0; i < this._objects.length; i++) {
          var obj = this._objects[i];

          this.addCharacterToCollisionMap(obj);
        }

        //The player is not added to the collision map, collisions with it should be tested directly
        // this.addCharacterToCollisionMap(TCHE.globals.player);
        collisionMapDirty = false;
        shouldCreateCollisionMap = false;
      }
    }, {
      key: 'update',
      value: function update() {
        if (collisionMapDirty) {
          shouldCreateCollisionMap = true;
        }

        this.updateOffset();
      }
    }, {
      key: 'isValid',
      value: function isValid(x, y) {
        if (x >= this.width) return false;
        if (y >= this.height) return false;
        if (x < 0) return false;
        if (y < 0) return false;

        return true;
      }
    }, {
      key: 'validateCollision',
      value: function validateCollision(x, y) {
        if (x > this.collisionMap.length) return false;
        if (!this.collisionMap[x]) return false;
        if (y > this.collisionMap[x].length) return false;
        if (!this.collisionMap[x][y]) return false;
        return true;
      }
    }, {
      key: 'isCollided',
      value: function isCollided(x, y, character) {
        var triggerEvents = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        if (this.validateCollision(x, y) !== true) {
          return false;
        }

        var blockingCharacter = this.collisionMap[x][y].find(function (item) {
          return item != character && !item.ghost;
        });

        if (blockingCharacter === undefined) {
          return false;
        }

        if (triggerEvents) {
          blockingCharacter.onBlockCharacter(character);
          character.onBlockedBy(blockingCharacter);
        }

        return true;
      }
    }, {
      key: 'collidedObjects',
      value: function collidedObjects(x, y, character) {
        if (this.validateCollision(x, y) !== true) {
          return [];
        }

        var blockingCharacters = this.collisionMap[x][y].filter(function (item) {
          return item != character;
        });

        return blockingCharacters;
      }
    }, {
      key: 'canMoveLeft',
      value: function canMoveLeft(character) {
        var triggerEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        for (var y = character.y; y < character.bottomY; y++) {
          if (!this.isValid(character.x - character.stepSize, y)) return false;

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(character.x - i, y, character, triggerEvents)) {
              return false;
            }
          }
        }

        return true;
      }
    }, {
      key: 'canMoveRight',
      value: function canMoveRight(character) {
        var triggerEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        for (var y = character.y; y < character.bottomY; y++) {
          if (!this.isValid(character.rightX + character.stepSize, y)) return false;

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(character.rightX + i, y, character, triggerEvents)) {
              return false;
            }
          }
        }

        return true;
      }
    }, {
      key: 'canMoveUp',
      value: function canMoveUp(character) {
        var triggerEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        for (var x = character.x; x < character.rightX; x++) {
          if (!this.isValid(x, character.y - character.stepSize)) return false;

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(x, character.y - i, character, triggerEvents)) {
              return false;
            }
          }
        }

        return true;
      }
    }, {
      key: 'canMoveDown',
      value: function canMoveDown(character) {
        var triggerEvents = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        for (var x = character.x; x < character.rightX; x++) {
          if (!this.isValid(x, character.bottomY + character.stepSize)) return false;

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(x, character.bottomY + i, character, triggerEvents)) {
              return false;
            }
          }
        }

        return true;
      }
    }, {
      key: 'reasonNotToMoveUp',
      value: function reasonNotToMoveUp(character) {
        for (var x = character.x; x < character.rightX; x++) {
          if (!this.isValid(x, character.y - character.stepSize)) return [];

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(x, character.y - i, character)) {
              return this.collidedObjects(x, y, character);
            }
          }
        }

        return [];
      }
    }, {
      key: 'reasonNotToMoveDown',
      value: function reasonNotToMoveDown(character) {
        for (var x = character.x; x < character.rightX; x++) {
          if (!this.isValid(x, character.bottomY + character.stepSize)) return undefined;

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(x, character.bottomY + i, character)) {
              return this.collidedObjects(x, y, character);
            }
          }
        }

        return [];
      }
    }, {
      key: 'reasonNotToMoveLeft',
      value: function reasonNotToMoveLeft(character) {
        for (var y = character.y; y < character.bottomY; y++) {
          if (!this.isValid(character.x - character.stepSize, y)) return undefined;

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(character.x - i, y, character)) {
              return this.collidedObjects(x, y, character);
            }
          }
        }

        return [];
      }
    }, {
      key: 'reasonNotToMoveRight',
      value: function reasonNotToMoveRight(character) {
        for (var y = character.y; y < character.bottomY; y++) {
          if (!this.isValid(character.rightX + character.stepSize, y)) return undefined;

          for (var i = character.stepSize; i > 0; i--) {
            if (this.isCollided(character.rightX + i, y, character)) {
              return this.collidedObjects(x, y, character);
            }
          }
        }

        return [];
      }
    }, {
      key: 'canMove',
      value: function canMove(character, direction) {
        var triggerEvents = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        if (direction.indexOf('left') >= 0) {
          if (!this.canMoveLeft(character, triggerEvents)) {
            return false;
          }
        } else if (direction.indexOf('right') >= 0) {
          if (!this.canMoveRight(character, triggerEvents)) {
            return false;
          }
        }

        if (direction.indexOf('up') >= 0) {
          if (!this.canMoveUp(character, triggerEvents)) {
            return false;
          }
        } else if (direction.indexOf('down') >= 0) {
          if (!this.canMoveDown(character, triggerEvents)) {
            return false;
          }
        }

        return true;
      }
    }, {
      key: 'reasonNotToMove',
      value: function reasonNotToMove(character, direction) {
        if (direction.indexOf('left') >= 0) {
          return this.reasonNotToMoveLeft(character);
        } else if (direction.indexOf('right') >= 0) {
          return this.reasonNotToMoveRight(character);
        }

        if (direction.indexOf('up') >= 0) {
          return this.reasonNotToMoveUp(character);
        } else if (direction.indexOf('down') >= 0) {
          return this.reasonNotToMoveDown(character);
        }

        return [];
      }
    }, {
      key: 'loadMap',
      value: function loadMap(mapName) {
        this._mapName = mapName;
        this.mapData = TCHE.maps[mapName];
      }
    }, {
      key: 'changeMap',
      value: function changeMap(newMapName) {
        TCHE.SceneManager.changeScene(TCHE.SceneMapLoading, { mapName: newMapName });
      }
    }, {
      key: 'mapName',
      get: function get() {
        return this._mapName;
      }
    }, {
      key: 'mapData',
      get: function get() {
        return this._mapData;
      },
      set: function set(value) {
        this._mapData = value;
        this._objects = [];
        this.createObjects();
      }
    }, {
      key: 'width',
      get: function get() {
        return TCHE.MapManager.getMapWidth(this._mapData);
      }
    }, {
      key: 'height',
      get: function get() {
        return TCHE.MapManager.getMapHeight(this._mapData);
      }
    }, {
      key: 'offsetX',
      get: function get() {
        return this._offsetX;
      },
      set: function set(value) {
        this._offsetX = value;
      }
    }, {
      key: 'offsetY',
      get: function get() {
        return this._offsetY;
      },
      set: function set(value) {
        this._offsetY = value;
      }
    }, {
      key: 'objects',
      get: function get() {
        return this._objects;
      }
    }, {
      key: 'collisionMap',
      get: function get() {
        if (shouldCreateCollisionMap) {
          this.createCollisionMap();
        }

        return this._collisionMap;
      }
    }]);

    return Map;
  }();

  TCHE.registerClass('Map', Map);
})();
(function () {
  var Player = function (_TCHE$Character) {
    _inherits(Player, _TCHE$Character);

    function Player() {
      _classCallCheck(this, Player);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(Player).call(this));
    }

    _createClass(Player, [{
      key: 'update',
      value: function update() {
        this.processInput();
        _get(Object.getPrototypeOf(Player.prototype), 'update', this).call(this);
      }
    }, {
      key: 'processInput',
      value: function processInput() {
        var direction = TCHE.InputManager.getDirection();
        if (!!direction) {
          this.clearDestination();

          if (!this.move(direction)) {
            this.updateDirection(direction.split('-'));
          }
        }
      }
    }, {
      key: 'teleport',
      value: function teleport(mapName, x, y) {
        TCHE.data.game.player.x = x;
        TCHE.data.game.player.y = y;

        this.clearDestination();
        TCHE.globals.map.changeMap(mapName);
      }
    }, {
      key: 'requestCollisionMapRefresh',
      value: function requestCollisionMapRefresh() {
        //Don't refresh the collision map for movements of the player.

      }
    }]);

    return Player;
  }(TCHE.Character);

  TCHE.registerClass('Player', Player);
})();
