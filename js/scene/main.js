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
      this.currentPlayer = 0;

      let style = {
        fontSize: 26,
        fontFamily: 'Arial',
        align: "center",
        color:'#ffffff',
        backgroundColor:"#0000ff",
        wordWrap: { width: 100, useAdvancedWrap: true }
      }

      let next = this.add.text(10,10,"Próxima",style);
      next.setPadding(16,16);
      next.setInteractive();
      next.on("pointerdown",() => {
        this.currentPlayer = 0;
        this.currentQuestion++;
        this.showQuestion();
      }); 


      for(let i=0;i<this.teams*2;i+=2) {
        let id = i/2;
        this.board.teams[id] = {id:id};
        let style = {
          fontSize: 30,
          fontFamily: 'Arial',
          align: "center",
          color:'#ff0000',
          wordWrap: { width: 100, useAdvancedWrap: true }
        }
        let text = "Team " + id;
        this.board.teams[id].name = this.add.text(this.step+80,120+i*40,text,style);
        this.board.teams[id].name.setOrigin(0);
        this.board.teams[id].name.setInteractive();
        this.board.teams[id].score = this.add.text(this.step+80,120+(i+1)*40,"0",style);
        this.board.teams[id].score.setOrigin(0);
        this.board.teams[id].points = 0;
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

      this.element = this.add.dom(150, 650).createFromCache("input");
      this.element.addListener("click");
      this.element.on("click", (event) => {
          if (event.target.name === "playButton") {
              var inputText = this.element.getChildByName("txtResposta");

              //  Have they entered anything?
              if (inputText.value !== "") {

                  this.checkIfExists(inputText.value);
                  this.currentPlayer++;
                  this.currentPlayer = this.currentPlayer % this.teams;

                  inputText.value = "";
              }
          }
      });

      this.showQuestion();
    }
    showQuestion() {
      this.question = this.data[this.currentQuestion];
      let x = Math.floor((Object.keys(this.question.answers).length-1)/5);
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
    }

    checkIfExists(input) {
      input = input.toLowerCase();
      for(let i=0;i<this.board.answers.length;i++) {
        if(this.board.answers[i].value == input) {
          this.board.answers[i].optionValue.setText(this.board.answers[i].value);
          this.board.answers[i].optionPercentage.setText(this.board.answers[i].percentage);
          this.board.teams[this.currentPlayer].points += this.board.answers[i].percentage;
          this.board.teams[this.currentPlayer].score.setText(this.board.teams[this.currentPlayer].points);
          break;
        }
      }
    }
}