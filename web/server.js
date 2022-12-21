console.clear()
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const port = process.env.PORT ||  3000;
app.use(express.static('./'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/play', (req, res) => {
  res.sendFile(__dirname + '/play.html');
});

app.get('/health', (req, res) => {
  res.statusCode = 200;
  res.send("OK")
});


app.post('/preview', (req, res) => {
  console.clear();

  console.log(req.body);
  const html = `
    <style>
    .warn{
        color:darkgoldenrod;
    }

    .error{
        color:red;
    }
  
  
        #result {
            position: absolute;
            bottom: 0;
            left: 0;
            width:100%;
            border-top: 3px solid grey;
            max-height:200px;
            overflow:auto;
          }

    </style>
    <script type="module">
    console.logx = console.log;
    const result = document.getElementById('result')
    console.log = function(message) {
        result.innerHTML +="<div class='log'>" +  JSON.stringify(message , null , ' ') + " </div><hr>";
        result.scrollTop = result.scrollHeight;
        console.logx(message)
    };
    console.warnx = console.warn;
    console.warn = function(message) {
        result.innerHTML += "<div class='warn'>" + JSON.stringify(message , null , ' ') + " </div><hr>";
        result.scrollTop = result.scrollHeight;
        console.warnx(message)
    };

    console.errorx = console.error;
    console.error = function(message) {
        result.innerHTML += "<div class='error'>" + JSON.stringify(message , null , ' ') + " </div><hr>";
        result.scrollTop = result.scrollHeight;
        console.errorx(message)
    };

    ${req.body.wc.replace(";" , ";\n")}

    ${req.body.js}
    
    </script>

        ${req.body.html}


    <div id="result"></div>
    
    `;

  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
