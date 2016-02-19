(function(){
  function Character() {
    this.initialize();
  }

  Character.prototype.initialize = function() {
    this._x = null;
    this._y = null;
    this._xDest = null;
    this._yDest = null;
    this._direction = 'down';
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
    this._xOffset = 0;
    this._yOffset = 0;
    this._ghost = false;
    this._gravityEffects = false;
    this._gravityStrength = 20;
  };

  Character.prototype.setX = function(value) {
    this._x = Math.round(value);
  };
  TCHE.accessor(Character.prototype, 'x', Character.prototype.setX);

  Character.prototype.setY = function(value) {
    this._y = Math.round(value);
  };
  TCHE.accessor(Character.prototype, 'y', Character.prototype.setY);

  Character.prototype.setWidth = function(value) {
    this._width = Math.round(value);
  };

  TCHE.accessor(Character.prototype, 'width', Character.prototype.setWidth);

  Character.prototype.setHeight = function(value) {
    this._height = Math.round(value);
  };
  TCHE.accessor(Character.prototype, 'height', Character.prototype.setHeight);

  TCHE.accessor(Character.prototype, 'xDest');
  TCHE.accessor(Character.prototype, 'yDest');
  TCHE.accessor(Character.prototype, 'direction');
  TCHE.accessor(Character.prototype, 'dirty');
  TCHE.accessor(Character.prototype, 'animationStep');
  TCHE.accessor(Character.prototype, 'animationStepCount');
  TCHE.accessor(Character.prototype, 'animationDelay');
  TCHE.accessor(Character.prototype, 'animationDelayCount');
  TCHE.accessor(Character.prototype, 'xOffset');
  TCHE.accessor(Character.prototype, 'yOffset');
  TCHE.accessor(Character.prototype, 'ghost');
  TCHE.accessor(Character.prototype, 'gravityEffects');
  TCHE.accessor(Character.prototype, 'gravityStrength');

  Character.prototype.setSprite = function(value) {
    this._sprite = value;
    this._dirty = true;
  };

  TCHE.accessor(Character.prototype, 'sprite', Character.prototype.setSprite);

  Character.prototype.setObjectType = function(value) {
    if (typeof value == "string") {
      var objectTypeClass = TCHE.objectTypes[value];
      if (!!objectTypeClass) {
        this._objectType = new (objectTypeClass)();
      } else {
        this._objectType = null;
      }
    } else {
      this._objectType = value;
    }

    this._dirty = true;
  };

  TCHE.accessor(Character.prototype, 'objectType', Character.prototype.setObjectType);

  Character.prototype.getRightX = function(){
    return this.x + this.width;
  };
  TCHE.reader(Character.prototype, 'rightX', Character.prototype.getRightX);

  Character.prototype.getBottomY = function(){
    return this.y + this.height;
  };
  TCHE.reader(Character.prototype, 'bottomY', Character.prototype.getBottomY);

  Character.prototype.getHitboxLeftX = function(){
    return this.x + this.xOffset;
  };
  Character.prototype.getHitboxRightX = function(){
    return this.rightX + this.xOffset;
  };
  Character.prototype.getHitboxTopY = function(){
    return this.y + this.yOffset;
  };
  Character.prototype.getHitboxBottomY = function(){
    return this.bottomY + this.yOffset;
  };

  TCHE.reader(Character.prototype, 'hitboxLeftX', Character.prototype.getHitboxLeftX);
  TCHE.reader(Character.prototype, 'hitboxRightX', Character.prototype.getHitboxRightX);
  TCHE.reader(Character.prototype, 'hitboxTopY', Character.prototype.getHitboxTopY);
  TCHE.reader(Character.prototype, 'hitboxBottomY', Character.prototype.getHitboxBottomY);

  Character.prototype.getStepSize = function(){
    return 4;
  };

  TCHE.reader(Character.prototype, 'stepSize', Character.prototype.getStepSize);


  Character.prototype.getCollisionMap = function() {
    return TCHE.globals.map.collisionMap;
  };

  TCHE.reader(Character.prototype, 'collisionMap', Character.prototype.getCollisionMap);

  Character.prototype.getDirectionToDest = function(){
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
  };

  Character.prototype.respondToMouseMovement = function() {
    if (this._xDest === null || this._yDest === null || isNaN(this._xDest) || isNaN(this._yDest)) return;
    if (this._xDest == this._x && this._yDest == this._y) return;

    var direction = this.getDirectionToDest();
    if (direction !== false) {
      this.performMovement(direction);
    }
  };

  Character.prototype.update = function() {
    this._frameInitialX = this.x;
    this._frameInitialY = this.y;

    this.applyGravity();
    this.respondToMouseMovement();
    this.updateAnimation();
  };

  Character.prototype.setDest = function(x, y) {
    this._xDest = x;
    this._yDest = y;
  };

  Character.prototype.clearDestination = function() {
    this._xDest = null;
    this._yDest = null;
  };

  Character.prototype.canMove = function(direction, triggerEvents) {
    if (triggerEvents === undefined) {
      triggerEvents = false;
    }

    return TCHE.globals.map.canMove(this, direction, triggerEvents);
  };

  Character.prototype.updateDirection = function(directions) {
    if (directions.indexOf(this._direction) >= 0) return false;
    if (directions.length > 0) {
      this._direction = directions[0];
    }
  };

  Character.prototype.updateAnimation = function() {
    TCHE.SpriteManager.updateAnimationStep(this);
  };

  Character.prototype.performLeftMovement = function(stepSize) {
    this._x -= stepSize;
  };

  Character.prototype.performRightMovement = function(stepSize) {
    this._x += this.stepSize;
  };

  Character.prototype.performUpMovement = function(stepSize) {
    this._y -= this.stepSize;
  };

  Character.prototype.performDownMovement = function(stepSize) {
    this._y += this.stepSize;
  };

  Character.prototype.performMovement = function(direction) {
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
  };

  Character.prototype.move = function(direction) {
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
  };

  Character.prototype.requestCollisionMapRefresh = function() {
    TCHE.globals.map.requestCollisionMapRefresh();
  };

  Character.prototype.isMoving = function() {
    if (this._frameInitialX !== this._x || this._frameInitialY !== this._y) return true;
    if (!!this._destX && !!this._destY && (this._x !== this._destX || this._y !== this._destY)) return true;
    return false;
  };

  Character.prototype.executeEvent = function(eventName) {
    if (!this.objectType) return;
    if (!this.objectType.events) return;
    if (!this.objectType.events[eventName]) return;

    TCHE.CodeManager.executeEvent(this.objectType.events[eventName]);
  };

  Character.prototype.onBlockCharacter = function(character) {
    if (this._lastBlockCharacter !== character) {
      this._lastBlockCharacter = character;
      this.fire('blockCharacter', character);

      if (character == TCHE.globals.player) {
        this.executeEvent('On Block Player');
      }
    }
  };

  Character.prototype.onBlockedBy = function(character) {
    if (this._lastBlockedByCharacter !== character) {
      this._lastBlockedByCharacter = character;
      this.fire('blockedBy', character);
    }
  };

  Character.prototype.getAvailableDistance = function(direction, max) {
    var map = TCHE.globals.map;
    
    if (max === undefined) {
      max = map.height;
    }

    if (!!this.ghost) {
      return max;
    }

    var collisionMap = this.collisionMap;

    var x = this.x;
    var y = this.y;

    var distance = 0;
    var speedX = 0;
    var speedY = 0;

    var method;

    switch(direction) {
      case 'left' :
        method = map.canMoveLeftAt;
        speedX = -1;
        break;
      case 'right' :
        method = map.canMoveRightAt;
        speedX = 1;
        break;
      case 'up' :
        method = map.canMoveUpAt;
        speedY = -1;
        break;
      case 'down' :
        method = map.canMoveDownAt;
        speedY = 1;
        break;
      default :
        return 0;
    }

    while (distance < max) {
      if (method.call(map, this, false, collisionMap, x, y)) {
        x += speedX;
        y += speedY;
        distance++;
      } else {
        break;
      }
    }

    return distance;
  };

  Character.prototype.applyGravity = function() {
    if (!this.gravityEffects) return;

    var distance = this.getAvailableDistance('down', this.gravityStrength);

    if (distance > 0) {
      this.y += distance;
    }
  };
  
  TCHE.registerClass('Character', Character);
})();