var PWDSN = PWDSN || {};
 
PWDSN.game = new Phaser.Game(544, 480, Phaser.AUTO, 'game-canvas');

PWDSN.menu = function(){};
 
PWDSN.menu.prototype = {
    preload: function() {
    // This function will be executed at the beginning
    // That's where we load the game's assets
        this.game.load.tilemap('state','assets/99shoo9999/state.json',null,Phaser.Tilemap.TILED_JSON);
        this.game.load.image('tile','assets/99shoo9999/tiles.png');
    },
  create: function() {
    this.game.renderer.renderSession.roundPixels = true;
  	//show the space tile, repeated
    this.background = this.game.stage.backgroundColor = "#333";
      
    this.highestScore = 0;
 
    //start game text
    var text = "Game concept 1.0.0 by Auxtopuz";
    var style = { font: "30px Arial", fill: "#fff", align: "center" };
    var t = this.game.add.text(this.game.width/2, this.game.height/2 - 20, text, style);
    t.anchor.set(0.5); 
      
    //highest score
    text = "Highest score: "+this.highestScore;
    style = { font: "15px Arial", fill: "#fff", align: "center" };
  
    var h = this.game.add.text(this.game.width/2, this.game.height/2 + 20, text, style);
    h.anchor.set(0.5);
      
          //continue
    text = "Press spacebar to continue";
    style = { font: "15px Arial", fill: "#fff", align: "center" };
  
    var p = this.game.add.text(this.game.width/2, this.game.height/2 +70, text, style);
    p.anchor.set(0.5); 
  },
  update: function() {
    if(this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).isDown) {
      this.game.state.start('play');
    }
  }
};

PWDSN.play = function(){
    this.map;
    
    this.player;
    this.playerDr = [0,-1]; // Direction Up as default
    this.playerSpeed = 100;
    this.playerNextFire = 0;
    this.playFireRate = 200;
    this.playBulletSpeed = 600;
    this.isMvn = this.mvnDown = this.mvnUp = this.mvnLeft = this.mvnRight = false;
    
    this.coin;
    this.maxCoin = 1;
    
    this.enemy;
    this.enemyPos = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
    this.maxEnemy = 25;
    this.enemyNextFire = 0;
    this.enemyFireRate = 600;
    this.enemyBulletSpeed = 300;
    
    this.score = 0;
    this.showScore;
    this.highestScore = 0;
    
    this.dty = 0;
};
 
PWDSN.play.prototype = {
// We define the 3 default Phaser functions
preload: function() {
    
// This function will be executed at the beginning
// That's where we load the this.game's assets
    this.game.load.tilemap('state','assets/99shoo9999/state.json',null,Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tile','assets/99shoo9999/tiles.png');
    this.game.load.image('player','assets/99shoo9999/player.png');
    this.game.load.image('coin','assets/99shoo9999/coin.png');
    this.game.load.image('enemy','assets/99shoo9999/enemy.png');
    this.game.load.image('enemy_bullet','assets/99shoo9999/enemy_bullet.png');
    this.game.load.image('player_bullet','assets/99shoo9999/player_bullet.png');
},
create: function() {
    this.tileSize = 32;
    // This function is called after the preload function
// Here we set up the this.game, display sprites, etc.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.renderer.renderSession.roundPixels = true;
    this.game.stage.backgroundColor = '#000';
    
    this.map = this.game.add.tilemap('state', 32, 32, 64, 32);
    this.map.addTilesetImage('tiles','tile');
    this.groundLayer = this.map.createLayer('ground');
    this.wallLayer = this.map.createLayer('wall');
    //collision on blockedLayer
    this.map.setCollisionBetween(1, 100000, true, 'wall');
    //  This resizes the this.game world to match the layer dimensions
    this.groundLayer.resizeWorld();
    
    this.showScore = this.add.text(this.game.width/2, this.game.height/2 + 30, '0', { fontSize: '80px', fill: '#ffffff' });
    this.showScore.alpha = 0.2;
    this.showScore.anchor.set(0.5);
    
    var scoreT = this.add.text(this.game.width/2, this.game.height/2 - 35, 'SCORE', { fontSize: '40px', fill: '#ffffff' });
    scoreT.alpha = 0.2;
    scoreT.anchor.set(0.5);
    
    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'object')

    //we know there is just one result
    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.game.physics.arcade.enable(this.player);
    
    this.playerBullets = this.game.add.group();
    this.playerBullets.enableBody = true;
    this.playerBullets.physicsBodyType = Phaser.Physics.ARCADE;

    this.playerBullets.createMultiple(5, 'player_bullet');
    this.playerBullets.setAll('checkWorldBounds', true);
    this.playerBullets.setAll('outOfBoundsKill', true);
    
    this.cursor = this.game.input.keyboard.createCursorKeys();
    
    // Create a group to hold the coin
    this.coinGroup = this.game.add.group();
    this.enemyGroup = this.game.add.group();
    this.enemyGroup.enableBody = true;
    this.enemyGroup.physicsBodyType = Phaser.Physics.ARCADE;
    
    this.enemyBullets = this.game.add.group();
    this.enemyBullets.enableBody = true;
    this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyBullets.createMultiple(50, 'enemy_bullet');
    this.enemyBullets.setAll('checkWorldBounds', true);
    this.enemyBullets.setAll('outOfBoundsKill', true);
},
update: function() {
    //player movement
    this.player.body.velocity.y = 0;
    this.player.body.velocity.x = 0;
 
    this.movePlayer();
    
    if (this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).isDown)
    {
        this.playerFire();
    }
    
    this.physics.arcade.overlap(this.playerBullets, this.enemyGroup, this.killEnemy, null, this);
    
    if (this.coinGroup.countLiving() < this.maxCoin) {
        // Set the launch point to a random location below the bottom edge
        // of the stage
        this.spawnCoin();
    }
    
    this.coinGroup.forEachAlive(function(c) {
        var distance = this.game.math.distance(c.x, c.y,
            this.player.x, this.player.y);
        if (distance < this.tileSize - this.tileSize/2) {
            this.getCoin(c);
        }
    }, this);
    
    this.fireEnemyBullet();
},

//find objects in a Tiled layer that containt a property called "type" equal to a certain value
findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
},
    
mDown: function() {
    var t, newPos;

    if (this.player.y < this.game.height/2 + 48 ) {
        newPos = this.player.y + this.tileSize;
        t = this.game.add.tween(this.player).to({y: newPos}, this.playerSpeed).start();
    }
    else {
        newPos = this.player.y + this.tileSize/3;
        t = this.game.add.tween(this.player).to({y: newPos}, this.playerSpeed/2).to({y: this.player.y}, this.playerSpeed/2).start();
    }

    //this.moveSound.play();
    this.isMvn = true;  
    t.onComplete.add(this.mvnOver, this);     
},

mUp: function() {
    var t, newPos;

    if (this.player.y > this.game.height/2 - 80 ) {
        newPos = this.player.y - this.tileSize;
        t = this.game.add.tween(this.player).to({y: newPos}, this.playerSpeed).start();
    }
    else {
        newPos = this.player.y - this.tileSize/3;
        t = this.game.add.tween(this.player).to({y: newPos}, this.playerSpeed/2).to({y: this.player.y}, this.playerSpeed/2).start();
    }

    //this.moveSound.play();
    this.isMvn = true;
    t.onComplete.add(this.mvnOver, this); 
},

mRight: function() {
    var t, newPos;

    if (this.player.x < this.game.width/2 + 48) {
        newPos = this.player.x + this.tileSize;
        t = this.game.add.tween(this.player).to({x: newPos}, this.playerSpeed).start();
    }
    else {
        newPos = this.player.x + this.tileSize/3;
        t = this.game.add.tween(this.player).to({x: newPos}, this.playerSpeed/2).to({x: this.player.x}, this.playerSpeed/2).start();
    }

    //this.moveSound.play();
    this.isMvn = true;
    t.onComplete.add(this.mvnOver, this);  
},

mLeft: function() {
    var t, newPos;

    if (this.player.x > this.game.width/2 - 80) {
        newPos = this.player.x - this.tileSize;
        t = this.game.add.tween(this.player).to({x: newPos}, this.playerSpeed).start();
    }
    else {
        newPos = this.player.x - this.tileSize/3;
        t = this.game.add.tween(this.player).to({x: newPos}, this.playerSpeed/2).to({x: this.player.x}, this.playerSpeed/2).start();
    }

    //this.moveSound.play();
    this.isMvn = true;
    t.onComplete.add(this.mvnOver, this); 
},

movePlayer: function() {
    var speed = 150;
    var t;

    if (this.isMvn)
        return;

    if (this.cursor.down.isDown && !this.mvnDown) {
        this.mvnDown = true;
        this.mDown();
        this.playerDr = [0,1];
        return;
    }
    else if (this.cursor.down.isUp) {
        this.mvnDown = false;
    }

    if (this.cursor.up.isDown && !this.mvnUp) {
        this.mvnUp = true;
        this.mUp();
        this.playerDr = [0,-1];
        return;
    }
    else if (this.cursor.up.isUp) {
        this.mvnUp = false;
    }

    if (this.cursor.left.isDown && !this.mvnLeft) {
        this.mvnLeft = true;
        this.mLeft();
        this.playerDr = [-1,0];
        return;
    }
    else if (this.cursor.left.isUp) {
        this.mvnLeft = false;
    }

    if (this.cursor.right.isDown && !this.mvnRight) {
        this.mvnRight = true;
        this.mRight();
        this.playerDr = [1,0];
        return;
    }
    else if (this.cursor.right.isUp) {
        this.mvnRight = false;
    }
},

mvnOver: function() {
    this.isMvn = false;
},

playerFire: function() {

    if (this.game.time.now > this.playerNextFire && this.playerBullets.countDead() > 0)
    {
        this.playerNextFire = this.game.time.now + this.playFireRate;

        var bullet = this.playerBullets.getFirstDead();

        bullet.reset(this.player.x + this.tileSize / 4 + this.playerDr[0] * this.tileSize, this.player.y + this.tileSize / 4 + this.playerDr[1] * this.tileSize);
        
        bullet.body.velocity.x = this.playerDr[0] * this.playBulletSpeed;
        bullet.body.velocity.y = this.playerDr[1] * this.playBulletSpeed;
    }
},    
    
spawnCoin: function() {
    // // Get the first dead missile from the missileGroup
    var coin = this.coinGroup.getFirstDead();
    // If there aren't any available, create a new one
    var playerX = this.player.x / this.tileSize;
    var playerY = this.player.y / this.tileSize;
    
    var rndX = this.game.rnd.integerInRange(6,10);
    var rndY = this.game.rnd.integerInRange(5,9);
    while(this.game.math.difference(rndX, playerX) <= 1 && this.game.math.difference(rndY, playerY) <= 1){
        rndX = this.game.rnd.integerInRange(6,10);
        rndY = this.game.rnd.integerInRange(5,9);
    }
    
    //console.log(rndX+" "+rndY+" "+playerX+" "+playerY);
    
    if (coin === null) {
        coin = this.game.add.sprite(200, 240, 'coin');
        this.coinGroup.add(coin);
    }

    // Revive the missile (set it's alive property to true)
    // You can also define a onRevived event handler in your explosion objects
    // to do stuff when they are revived.
    coin.revive();
    
    // Move the missile to the given coordinates
    coin.x = rndX * this.tileSize + 6;
    coin.y = rndY * this.tileSize + 6;
    
    return coin;
},

getCoin: function(c) {
    c.kill();
    if(this.score < 999) {
        this.score += 1;
        this.showScore.setText(this.score);
    }
    this.spawnEnemy();
    this.dfculty(1.4);
    
},
    
spawnEnemy: function() {
    var enemy = this.enemyGroup.getFirstDead();
    var pos;
    
    if (enemy === null) {
        enemy = this.game.add.sprite(200, 240, 'enemy');
        this.enemyGroup.add(enemy);
    }
    
    enemy.revive();
    
    var rndSide = this.game.rnd.integerInRange(1,4);
    switch (rndSide){
        case 1 : enemy.x = this.game.rnd.integerInRange(6,10) * this.tileSize; enemy.y = 0; pos = ( enemy.x / this.tileSize ) - 6; break; //top
        case 2 : enemy.x = this.game.rnd.integerInRange(6,10) * this.tileSize; enemy.y = (this.game.height / this.tileSize - 1) * this.tileSize; pos = ( enemy.x / this.tileSize )  - 6; break; //bottom
        case 3 : enemy.x = 0; enemy.y = this.game.rnd.integerInRange(5,9) * this.tileSize; pos = ( enemy.y / this.tileSize ) - 5; break; //left
        case 4 : enemy.x = (this.game.width / this.tileSize - 1) * this.tileSize; enemy.y = this.game.rnd.integerInRange(5,9) * this.tileSize; pos = ( enemy.y / this.tileSize ) - 5; break; //right
    }
    this.enemyPos[rndSide - 1][pos] = 1;
    console.log(this.enemyPos);
    console.log(this.enemyGroup.length);
},
    
killEnemy: function (bullet, enemy) {
    // in here, 'player' is the player, and 'enemy' is the enemy the player collided with
    enemy.kill();
    enemy.destroy();
    // this.enemies still refers to the group, so we can remove the enemy from the group
    this.enemyGroup.remove(enemy);
},

fireEnemyBullet: function() {
    
    /*var livingEnemies.length = 0; 
    this.enemyGroup.forEachAlive(function(enemy){
        livingEnemies.push(enemy)
    });
    
    if(this.time.now > this.enemyFireRate) { 
        var bullet = this.enemyBullets.getFirstExists(false);
        if(bullet && livingEnemies.length > 0) {
            var random = this.rnd.integerInRange(0, livingEnemies.length - 1);
            var shooter = livingEnemies[random];
            this.enemyBullets.reset(shooter.body.x, shooter.body.y);
            this.enemyFireRate = this.time.now + this.enemyFireRate;
            this.physics.arcade.moveToObject(this.enemyBullets,this.player,600);
        }
    }   */
},
    
dfculty: function(dr) {
    this.dty = this.dty + dr;
    console.log('dificulty : ' + this.dty);
},

    
};

//uncomment these as we create them through the tutorial
//PWDSN.game.state.add('Preload', PWDSN.Preload);
PWDSN.game.state.add('menu', PWDSN.menu);
PWDSN.game.state.add('play', PWDSN.play);
 
PWDSN.game.state.start('menu');