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
        if(parent.teams) {
            this.callMain(
                parent.urlSera,
                parent.teams
            );
        } else {
            let element = this.add.dom(width/2, 150).createFromCache("start");
            element.addListener("click");
            element.setVisible(true);
            element.on("click", function (event) {
                if (event.target.name === "playButton") {
                    let txtURL = this.getChildByName("txtURL");
                    let txtPlayers = this.getChildByName("txtPlayers");

                    try {
                        skip = parseInt(this.getChildByName("txtSkipColumn").value);
                    } catch {

                    }
                    
                    let url = txtURL.value;
                    //  Have they entered anything?
                    if (url == "") {
                        url = "data/1.csv";
                    }
                    //  Turn off the click events
                    this.removeListener("click");
                    //  Hide the login element
                    this.setVisible(false);

                }
            });
        }
    }

    callMain(url,teams) {
        $.ajax({
            type: "GET",
            url: url,
            dataType: "text",
            success: (data) => {
                data = processData(data);
                this.scene.start("main", {
                    data:data,
                    teams:teams
                });
                parent.loadedGame();
            }
        });
    }

}

let width = screen.availWidth - 64;
const height = screen.availHeight - 64;

const config = {
    backgroundColor: '#555555',
    scale: {
      parent:"divCanvas",
      width: width,
      height: height
    },
    dom: {
        createContainer: true
    },
    scene: [Game, Main]
};

let question = null;
let url = new URL(window.location.href);
const jogo = url.searchParams.get("jogo");

let skip = 1;
let game = new Phaser.Game(config);
let tutorial = 0;

function processData(allText) {
    let allTextLines = allText.split(/\r\n|\n/);
    let total = [];
    let entries = allTextLines[0].split('\t');
    let lines = [];

    let record_num = entries.length;
    let columns = [];
    let tarr = [];
    let k = 0;
    let onlyQuestion = true;
    for (var j=0; j<record_num; j++) {
        if(entries[j].startsWith("#")) {
            onlyQuestion = false;
            tarr[k] = j;
            columns[k] = {question:entries[j].substring(1),answers:{}};
            total[k] = 0;
            k++;
        }
    }
    if(onlyQuestion) {
        for (var j=skip; j<record_num; j++) {
            onlyQuestion = false;
            tarr[k] = j;
            columns[k] = {question:entries[j],answers:{}};
            total[k] = 0;
            k++;
        }
    }
    let i = 1;
    while (allTextLines.length>i) {
        entries = allTextLines[i].split('\t');
        for (var j=0; j<tarr.length; j++) {
            try {
                let answer = entries[tarr[j]].trim();
                if(answer == "") {
                    continue;
                }
                answer = answer.replace("."," ").replace(/\s+/g, ' ').toLowerCase();
                if(columns[j].answers[answer]) {
                    columns[j].answers[answer]++
                } else {
                    columns[j].answers[answer] = 1;
                }
                total[j]++;
            } catch(ex) {

            }
        }
        i++;
    }
    for(let i=0;i<columns.length;i++) {
        let tot = 0;
        for(let j in columns[i].answers) {
            if(total[i] == 0) {
                delete columns[i].answers[j];
            } else {
                let percentage = columns[i].answers[j] / total[i] * 100;
                if(percentage >= 1) {
                    columns[i].answers[j] = Math.floor(percentage);
                    tot += columns[i].answers[j];
                } else {
                    delete columns[i].answers[j];
                }
            }
        }
        for(let j in columns[i].answers) {
            columns[i].answers[j] += 100 - tot;
            break;
        }
    }
    return columns;
}