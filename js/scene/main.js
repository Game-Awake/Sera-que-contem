class Main extends Phaser.Scene
{

    constructor ()
    {
        super('main');
        this.board = {teams:[],questions:[]};
        this.step = 100;
    }

    init(data) {
      this.data = data.data;
      this.teams = data.teams;
      this.currentQuestion = 0;
    }

    preload ()
    {
      this.load.html("input", "html/input.html");
    }

    create ()
    {
      scene = this;
      this.currentPlayer = 0;
      this.currentTurn = 0;
      this.totalQuestion = 0;

      let style = {
        fontSize: 26,
        fontFamily: 'Arial',
        align: "center",
        color:'#ffffff',
        backgroundColor:"#0000ff",
        wordWrap: { width: 100, useAdvancedWrap: true }
      }

      style = {
        fontSize: 40,
        fontFamily: 'Arial',
        align: "center",
        color:'#ff0000',
        wordWrap: { width: width - 200, useAdvancedWrap: true }
      }

      this.questionLabel = this.add.text(this.step+150,10,"",style);
      this.board.answers = [];

      this.element = this.add.dom(850, 200).createFromCache("input");
      this.element.addListener("click");
      this.element.on("click", (event) => {
          if (event.target.name === "playButton") {
              var inputText = this.element.getChildByName("txtResposta");

              //  Have they entered anything?
              if (inputText.value !== "") {

                  this.checkIfExists(inputText.value);

                  inputText.value = "";
              }
          }
      });

      this.showQuestion();
    }
    update() {
      if(notUpdate) {
        return;
      }

      for(let i=0;i<this.board.teams.length;i++) {
        this.board.teams[i].name.destroy();
        this.board.teams[i].score.destroy();
      }

      this.board.teams = []

      for(let i=0;i<this.teams.length*2;i+=2) {
        let id = i/2;
        this.board.teams[id] = {id:id};
        let style = {
          fontSize: 20,
          fontFamily: 'Arial',
          align: "center",
          color:'#000000',
          wordWrap: { width: 120, useAdvancedWrap: true }
        }
        let text = this.teams[id];
        this.board.teams[id].name = this.add.text(80,120+i*80,text,style);
        this.board.teams[id].name.setOrigin(0);
        this.board.teams[id].name.setInteractive();
        this.board.teams[id].score = this.add.text(80,120+(i+1)*80,"0",style);
        this.board.teams[id].score.setOrigin(0);
        this.board.teams[id].points = 0;
        this.board.teams[id].chance = 0;
        this.board.teams[id].chances = []
        for(let j=2;j<5;j++) {
          this.board.teams[id].chances.push(
            this.add.rectangle(40+j*30,100+2*(id)*80,16,16,0xeeeeee)
          );
        }
      }

      this.showQuestion();
      notUpdate = true;
    }
    showQuestion() {
      this.lastChance = false;
      this.isFirst = true;
      this.currentPoints = 0;
      this.lastFound = -1;
      this.shown = 0;
      this.inputs = [];
      this.question = this.data[this.currentQuestion];
      this.questionCount = Object.keys(this.question.answers).length;
      let x = Math.floor((this.questionCount-1)/5);
      width = Math.max(width,450+x*350);
      game.scale.resize(width, height);
      let text = this.question.question;
      this.questionLabel.setText(text);

      x = 0;
      let y = 0;

      for(let i=0;i<this.board.answers.length;i++) {
        this.board.answers[i].optionValue.destroy();
        this.board.answers[i].optionPercentage.destroy();
      }
      this.board.answers = [];

      let i = 0;
      let style = {
        fontSize: 24,
        fontFamily: 'Arial',
        align: "center",
        color:'#ffffff',
        wordWrap: { width: 140, useAdvancedWrap: true }
      }

      for(let j in this.question.answers) {
        this.board.answers[i] = {value:j,percentage:this.question.answers[j]};
        i++;
      }

      for(let i=0;i<this.board.answers.length-1;i++) {
        for(let j=i+1;j<this.board.answers.length;j++) {
          if(this.board.answers[i].percentage < this.board.answers[j].percentage) {
            let temp = this.board.answers[i];
            this.board.answers[i] = this.board.answers[j];
            this.board.answers[j] = temp;
          }
        }
      }

      for(let i=0;i<this.board.answers.length;i++) {
        text = "";
        this.board.answers[i].optionValue = new Option(this.step+300+x*350,150+y*100,150,80,
          0x0000ff,2,0xffffff,
          text, style,
          () => {}, this);
        this.board.answers[i].optionPercentage = new Option(this.step+450+x*350,150+y*100,100,80,
          0x0000ff,2,0xffffff,
          text, style,
          () => {}, this);
        y++;
        if(y == 5) {
          x++;
          y=0;
        }
      }
      if(this.board.teams.length > 0) {
        this.selectTeam(this.currentTurn);
      }
    }

    checkIfExists(input) {
      input = input.toLowerCase();
      this.inputs.push(input);
      let hasMatch = false;
      for(let i=0;i<this.board.answers.length;i++) {
        if(this.board.answers[i].value == input) {
          this.board.answers[i].optionValue.setText(this.board.answers[i].value);
          this.board.answers[i].optionPercentage.setText(this.board.answers[i].percentage);
          this.currentPoints += this.board.answers[i].percentage;
          this.shown++;
          hasMatch = true;
          if(this.inputs.length < 3) {
            if(i == 0) {
              if(this.board.answers.length == 1) {
                this.addPoints();
              } else {
                this.showOption(this.teams[this.currentPlayer] + " acertou\na mais escolhida\nDeseja continuar\njogando?");
              }
            } else {
              if(this.lastFound > -1) {
                if(this.lastFound < i) {
                  this.changePlayer();
                  this.showOption(this.teams[this.currentPlayer] + " acertou\na maior opção\nDeseja continuar\njogando?");
                } else {
                  this.showOption(this.teams[this.currentPlayer] + " acertou\na opção maior\nDeseja continuar\njogando?");
                }
              } else {
                this.changePlayer();
              }
            }
            this.lastFound = i;
            return;
          }
          break;
        }
      }

      if(this.inputs.length < 2) {
        this.changePlayer();
      } else {
        if(this.lastFound == -1) {
          this.changePlayer();
          this.showOption("Como ninguém acertou,\n a vez é de " + this.teams[this.currentPlayer],() => {
            this.back.destroy();
            this.text.destroy();
            this.element.setVisible(true);
          });
          return;
        }
        if(this.lastChance) {
          if(!hasMatch) {
            this.changePlayer();
          }
          this.addPoints();
          return;
        } else {
          if(!hasMatch) {
            let player = this.board.teams[this.currentPlayer];
            player.chances[player.chance].setFillStyle(0xff0000);
            player.chance++;
            if(player.chance == 3) {
              this.changePlayer();
              this.lastChance = true;
            }
          }
        }
      }

      if(this.shown == this.questionCount) {
        this.addPoints();
      } else {
        this.selectTeam(this.currentPlayer);
      }

    }
    nextFunction() {
      return () => {
        this.back.destroy();
        this.text.destroy();
        this.element.setVisible(true);

        if(this.totalQuestion == 4) {
          this.doEnd();
        } else {
          this.showQuestion();
        }
      }
    }
    addPoints() {         
      this.board.teams[this.currentPlayer].points += this.currentPoints;
      this.board.teams[this.currentPlayer].score.setText(this.board.teams[this.currentPlayer].points);
      this.currentTurn++;
      this.currentTurn = this.currentTurn % 2;
      let team = this.teams[this.currentPlayer];
      this.currentPlayer = this.currentTurn;
      this.currentQuestion++;
      this.currentQuestion = this.currentQuestion % this.data.length;
      this.totalQuestion++;

      for(let i=0;i<this.board.teams.length;i++) {
        this.board.teams[i].chance = 0;
        for(let j=0;j<this.board.teams[i].chances.length;j++) {
          this.board.teams[i].chances[j].setFillStyle(0xffffff);
        }
      }
      this.showOption(team+"\nvenceu a rodada",this.nextFunction());
    }
    showOption(message,callback=null) {
      this.element.setVisible(false);
      this.message = message;
      this.showMessage(callback);
    }
    doEnd() {
      this.totalQuestion = 0;
      let first = this.board.teams[0];
      let second = this.board.teams[1];
      if(first.points > second.points) {
        this.showWinner(0);
      } else if(first.points < second.points) {
        this.showWinner(1);
      } else {
        this.showDraw();
      }
    }
    showWinner(index) {
      this.message = "Parábens\n" + this.teams[index];
      this.showMessage(() => {
        this.text.destroy();
        this.back.destroy();
        parent.showNextPhase(index);
      });
    }
    showDraw(index) {
      this.message = "Empate\nSerá sorteado um time";
      this.showMessage(() => {
        this.text.destroy();
        this.back.destroy();
        this.element.setVisible(true);
        this.showWinner(Phaser.Math.Between(0,1));
      });
    }
    showMessage(callback) {
      this.back = this.add.rectangle(100,100,600,400,0x000000);
      this.back.alpha = 0.9;
      this.back.setOrigin(0);

      this.text = this.add.text(150, 150, this.message, { fontFamily: "Arial Black", fontSize: 40 });
      this.text.setOrigin(0);

      this.text.setStroke('#000000', 4);
      //  Apply the gradient fill.
      const gradient = this.text.context.createLinearGradient(0, 0, 0, this.text.height);

      gradient.addColorStop(0, '#009900');
      gradient.addColorStop(.5, '#00ff00');
      gradient.addColorStop(.5, '#00ff00');
      gradient.addColorStop(1, '#009900');

      this.text.setFill(gradient);

      if(callback == null) {
        this.yes = this.add.text(200, 400, "SIM", { fontFamily: "Arial Black", fontSize: 82 });
        this.yes.setOrigin(0);
        this.yes.setInteractive();
        this.yes.on("pointerdown",() => {
          this.doDestroy();
        });
        this.no = this.add.text(400, 400, "NÃO", { fontFamily: "Arial Black", fontSize: 82 });
        this.no.setOrigin(0);
        this.no.setInteractive();
        this.no.on("pointerdown",() => {
          this.changePlayer();
          this.doDestroy();
        });
      } else {
        this.back.setInteractive();
        this.back.on("pointerdown",callback);
      }
    }
    doDestroy() {
      this.back.destroy();
      this.text.destroy();
      this.element.setVisible(true);
      this.yes.destroy();
      this.no.destroy();
    }
    selectTeam(index,color="#ffffff") {
      let team = this.board.teams[1-index].name;
      team.setPadding(16,16);
      team.setStyle({backgroundColor:0});
      team = this.board.teams[index].name;
      team.setPadding(16,16);
      team.setStyle({backgroundColor:color});
    }    
    changePlayer() {
      this.currentPlayer++;
      this.currentPlayer = this.currentPlayer % 2;
      this.selectTeam(this.currentPlayer);      
    }
}