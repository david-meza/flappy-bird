var tic = function () {
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.velocity.y += this.gravity;
  if (this.velocity.y > 15) this.velocity.y = 15;
}

var player = new Bird();

var pipesModel = {

  init: function () {
    this.score = 0;
    this.step = 1500;
    this.timeCounter = 0;
    this.pipes = [];
  },

  generatePipe: function(dt) {
    // if enough time has elapsed
    this.timeCounter += dt;
    if (this.timeCounter > this.step){
      this.timeCounter -= this.step;
      if (this.step > 500) this.step -= 20;
      var topPipeBottom = Math.floor(Math.random() * 200 + 50)
      this.pipes.push(new Pipe(0, topPipeBottom, true));
      this.pipes.push(new Pipe(topPipeBottom + 90, view.canvas.height() - 200, false));
    }
  },

  ticPipes: function(){
    pipesModel.pipes.forEach(function(pipe, index, arr){
      pipe.tic();
      if (pipe.position.x < -pipe.width) {
        arr.splice(index, 1)
        pipesModel.score += 1;
      }
    })
  }
}

var scores = {
  all: [],
  top: function(){
    return this.all.sort(function(a, b){
      return b-a;
    }).slice(0,Math.min(this.all.length, 5));
  }
}

var view = {

  frames: 0,

  init: function () {
    this.setCanvas();
    this.highscores = $("#highscores");
  },

  setCanvas: function () {
    this.canvas = $("#canvas");
  },

  redraw: function(bird, pipes, score){
    this.frames = (this.frames + 1.38) % 42;
    this.canvas.clearCanvas();
    this.drawFloor();
    this.drawBackground();
    this.drawPipes(pipes);
    this.drawBird(bird);
    this.drawScore(score);
  },

  drawBackground: function(){
    this.canvas.drawImage({
      source: 'res/sheet.png',
      repeat: 'repeat',
      x: 0,
      y: 0,
      sWidth: 138,
      sHeight: 114,
      sx: 0,
      sy: 0,
      cropFromCenter: false,
      width: this.canvas.width()/2,
      height: this.canvas.height() - 200,
      fromCenter: false,
    })
    this.canvas.drawImage({
      source: 'res/sheet.png',
      repeat: 'repeat',
      x: this.canvas.width()/2,
      y: 0,
      sWidth: 138,
      sHeight: 114,
      sx: 0,
      sy: 0,
      cropFromCenter: false,
      width: this.canvas.width()/2,
      height: this.canvas.height() - 200,
      fromCenter: false,
    })
  },

  drawScore: function(score){
    this.canvas.drawText({
      strokeStyle: 'black',
      strokeWidth: 2,
      x: 50,
      y: this.canvas.height() - 100,
      fontSize: 72,
      fontFamily: 'Bitter, Verdana, sans-serif',
      text: Math.floor(score/2),
    });
  },

  drawPipes: function(pipes){
    pipes.forEach(function(pipe){
      view.drawPipe(pipe);
    })
  },

  drawFloor: function(){
    this.canvas.drawImage({
      source: 'res/sheet.png',
      repeat: 'repeat',
      x: 0,
      y: this.canvas.height() - 200,
      sWidth: 112,
      sHeight: 56,
      sx: 338 + this.frames,
      sy: 0,
      cropFromCenter: false,
      width: this.canvas.width()/2,
      height: 200,
      fromCenter: false,
    })
    this.canvas.drawImage({
      source: 'res/sheet.png',
      repeat: 'repeat',
      x: this.canvas.width()/2,
      y: this.canvas.height() - 200,
      sWidth: 112,
      sHeight: 56,
      sx: 338 + this.frames,
      sy: 0,
      cropFromCenter: false,
      width: this.canvas.width()/2,
      height: 200,
      fromCenter: false,
    })
  },

  drawPipe: function(pipe){
    this.canvas.drawImage({
      source: 'res/sheet.png',
      sx: 502,
      sy: 30,
      sWidth: 52,
      sHeight: 30,
      x: pipe.position.x,
      y: pipe.startHeight,
      width: pipe.width,
      height: pipe.endHeight - pipe.startHeight,
      fromCenter: false,
    });

    pipe.hanging ? this.drawPipeBottom(pipe) : this.drawPipeTop(pipe);
  },

  drawPipeBottom: function(pipe){
    this.canvas.drawImage({
      source: 'res/sheet.png',
      sx: 502,
      sy: 0,
      sWidth: 52,
      sHeight: 24,
      x: pipe.position.x,
      y: pipe.endHeight - 30,
      width: pipe.width,
      height: 30,
      fromCenter: false,
    });
  },

  drawPipeTop: function(pipe){
    this.canvas.drawImage({
      source: 'res/sheet.png',
      sx: 502,
      sy: 0,
      sWidth: 52,
      sHeight: 30,
      x: pipe.position.x,
      y: pipe.startHeight,
      width: pipe.width,
      height: 30,
      fromCenter: false,
    });
  },

  drawBird: function (bird) {
    var rotation = Math.sin(Math.PI - (Math.PI * bird.velocity.y / 30)) * 90;
    if (rotation < -35) rotation = -35;
    if (rotation > 90) rotation = 90;
    this.canvas.drawImage({
      source: 'res/sheet.png',
      sx: 312,
      sy: 230,
      sWidth: 34,
      sHeight: 24,
      fillStyle: "black",
      x: bird.position.x,
      y: bird.position.y,
      width: 34,
      height: 24,
      fromCenter: false,
      rotate: rotation,
    });
  },

  setListeners: function () {
    $(window).on("mousedown", function(){
      if (controller.gameStart) {
        player.jump.call(player);
      } else {
        controller.gameStart = true;
      };
    })
    $("#gameover").on("click", controller.restartGame);
  },

  toggleGameOver: function() {
    this.updateHighScores(scores.top());
    $("#gameover").toggleClass("hidden");
  },

  updateHighScores: function(scores){
    this.highscores.empty();
    scores.forEach(function(score){
      $(this.highscores).append("<li>" + score + "</li>");
    })
  }

}

var controller = {

  init: function () {
    pipesModel.init();
    view.init();
  },

  currentTime: Date.now(),
  gameStart: false,

  play: function(){
    this.playLoop = setInterval(function(){
      if (controller.gameStart) {
        controller.generatePipes(Math.min(Date.now() - controller.currentTime, 100));
        player.tic();
        pipesModel.ticPipes();
      }
      player.dead.call(player);
      view.redraw.call(view, player, pipesModel.pipes, pipesModel.score);
      controller.currentTime = Date.now();
    }, 1000 / 60);
  },

  generatePipes: function(dt){
    pipesModel.generatePipe(dt);
  },

  gameOver: function() {
    clearInterval(this.playLoop);
    this.playLoop = null;
    scores.all.push(pipesModel.score/2);
    view.toggleGameOver();
  },

  restartGame: function() {
    player = new Bird();
    view.toggleGameOver();
    controller.init();
    controller.play();
  }

}


function Bird () {
  this.bounding = {
    x: 20,
    y: 20,
  }
  this.velocity = {
    x: 0,
    y: 0,
  };
  this.position = {
    x: 100,
    y: 100
  };
  this.gravity = .25;
  this.tic = tic;
}

Bird.prototype.jump = function () {
  this.velocity.y = -5;
};

Bird.prototype.dead = function(){
  if (player.outOfBounds() || player.hitPipe()) controller.gameOver();
}

Bird.prototype.hitPipe = function(){
  var result = false;
  pipesModel.pipes.forEach(function(pipe){
    if (player.collides(pipe)) result = true;
  })
  return result;
}

Bird.prototype.collides = function(pipe){
  return  !((this.position.x + this.bounding.x <= pipe.position.x) ||
            (pipe.position.x + pipe.width <= this.position.x) ||
            (this.position.y + this.bounding.y <= pipe.startHeight) ||
            (pipe.endHeight <= this.position.y))
}

Bird.prototype.outOfBounds = function() {
  return (this.position.y + this.bounding.y > view.canvas.height() - 200 || this.position.y + this.bounding.y < 0 )
}

function Pipe (top, bottom, hanging) {
  this.velocity = {
    x: -5,
    y: 0
  };
  this.hanging = hanging;
  this.position = {
    x: view.canvas.width(),
    y: 0
  };
  this.gravity = 0;
  this.tic = tic;
  this.startHeight = top;
  this.endHeight = bottom;
  this.width = 70;
}

$(document).ready(function(){
  controller.init();
  view.setListeners();
  controller.play();
});
