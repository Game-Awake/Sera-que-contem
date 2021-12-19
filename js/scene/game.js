class Game extends Phaser.Scene
{
    constructor ()
    {
        super('game');
    }

    preload ()
    {
        this.load.html("start", "html/start.html");
    }

    create ()
    {
        let scene = this;
        
        let element = this.add.dom(width/2, 150).createFromCache("start");
                element.addListener("click");
                console.log(element);
                element.setVisible(true);
                element.on("click", function (event) {
                    if (event.target.name === "playButton") {
                        let txtURL = this.getChildByName("txtURL");
                        let txtPlayers = this.getChildByName("txtPlayers");
    
                        let url = txtURL.value;
                        //  Have they entered anything?
                        if (url == "") {
                            url = "data/1.csv";
                        }
                        //  Turn off the click events
                        this.removeListener("click");
                        //  Hide the login element
                        this.setVisible(false);

                        $.ajax({
                            type: "GET",
                            url: url,
                            dataType: "text",
                            success: (data) => {
                                data = processData(data);
                                scene.scene.start("main", {
                                    data:data,
                                    teams:parseInt(txtPlayers.value)
                                });
                            }
                        });
                    }
                });
    }
}

let width = screen.availWidth * 0.8;
const height = screen.availHeight * 0.8;

const config = {
    type: Phaser.CANVAS,
    backgroundColor: '#125555',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent:"divCanvas",
      width: width,
      height: height
    },
    canvas: document.getElementById('myCustomCanvas'),
    dom: {
        createContainer: true
    },
    scene: [Game, Main]
};

let question = null;
let url = new URL(window.location.href);
const jogo = url.searchParams.get("jogo");

let game = new Phaser.Game(config);
let tutorial = 0;

function processData(allText) {
    let allTextLines = allText.split(/\r\n|\n/);
    let total = allTextLines.length - 1;
    let entries = allTextLines[0].split(',');
    let lines = [];

    let record_num = entries.length;
    let columns = [];
    let tarr = [];
    let k = 0;
    for (var j=0; j<record_num; j++) {
        if(entries[j].startsWith("#")) {
            tarr[k] = j;
            columns[k] = {question:entries[j].substring(1),answers:{}};
            k++;
        }
    }
    let i = 1;
    while (allTextLines.length>i) {
        entries = allTextLines[i].split(',');
        for (var j=0; j<tarr.length; j++) {
            try {
                let answer = entries[tarr[j]].toLowerCase();
                if(columns[j].answers[answer]) {
                    columns[j].answers[answer]++
                } else {
                    columns[j].answers[answer] = 1;
                }
            } catch(ex) {

            }
        }
        i++;
    }
    for(let i=0;i<columns.length;i++) {
        for(let j in columns[i].answers) {
            let percentage = columns[i].answers[j] / total * 100;
            if(percentage >= 1) {
                columns[i].answers[j] = Math.floor(percentage);
            } else {
                columns[i].answers.splice(j,1);
            }
        }
    }
    return columns;
}