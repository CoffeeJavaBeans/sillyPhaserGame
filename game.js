var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  audio: {
    disableWebAudio: false
  }
};

let game = new Phaser.Game(config);
let score = 0;
let scoreText;
let platforms;
let player;
let cats;
let gameOver = false;
let enable = false;

function preload() {
  this.load.image('sky', 'https://examples.phaser.io/assets/pics/swirl1.jpg');
  this.load.image('ground', 'platform.png');
  this.load.image('star', 'star.png');
  this.load.image('troll', 'troll.gif', { frameWidth: 32, frameHeight: 48 });
  this.load.image('smallCat', 'smallCat.jpeg');
  this.load.image('faviconCat', 'favicon.ico');
  this.load.image('bomb', 'bomb.png');
  this.load.audio('trollSong', 'troll-song.mov');
}

function create() {
  this.add.image(400, 300, 'sky');
  scoreText = this.add.text(16, 16, 'score: 0', {
    fontSize: '32px',
    fill: '#000'
  });

  platforms = this.physics.add.staticGroup();

  platforms
    .create(400, 600, 'ground')
    .setScale(2)
    .refreshBody();

  platforms.create(500, 400, 'ground');
  platforms.create(50, 300, 'ground');
  platforms.create(400, 100, 'ground').setScale(1 / 2);

  player = this.physics.add.sprite(50, 50, 'troll').setScale(1 / 2);

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(300);

  this.physics.add.collider(player, platforms);

  cats = this.physics.add.group({
    key: 'faviconCat',
    repeat: 20,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  cats.children.iterate(addCats);
  //this.time.repeat(Phaser.Timer.SECOND * 2, addCats);
  this.physics.add.collider(cats, platforms);
  this.physics.add.overlap(player, cats, collectCat, null, this);

  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function addCats(child) {
  child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setScale(1 / 5);
  child.setVelocityX(Phaser.Math.FloatBetween(-50, 50));
}

function update() {
  cursors = this.input.keyboard.createCursorKeys();
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-630);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  gameOver = true;
}

function collectCat(player, cat) {
  cat.disableBody(true, true);

  score += 1;
  scoreText.setText('Score: ' + score);

  if (score % 5 === 0) {
    cats.children.iterate(function(child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    let x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    let bomb = bombs.create(x, 3, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-20, 20), 5);
  }
}
