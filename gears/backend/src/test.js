// console.log("Hello World !")

const express = require('express')
const path = require('path');
const app = express()
const port = 3000

i = 0
msg = ""
while (i < 10)
{
    msg += "Hello World !";
    i++;
}

app.get('/api', (req, res) => {
    res.json({ 
        status: "success", 
        message: "Hello World" 
    });
    // res.send("Hello World")}
})
// app.get('/html/index.html', (req, res) => {res.send(res.sendFile('/home/gfinet/Desktop/trans/app/html/index.html'))})

const staticPath = path.join("/usr/local/src", 'html');
app.use(express.static(staticPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

const { exec } = require('child_process');
const { spawn } = require('child_process');
const cgiPat = path.join(staticPath, 'cgi/');




app.use(express.urlencoded({ extended: true }));

app.listen(port, () => console.log('Notre app demarre sur http://localhost:',port))




//node -v
//npm init (creer un package.json)
//npm install express --save (express sert pour les serveur http)
//npm install --save-dev nodemon (nodemon permet la relance du programme apres chaque modification du code)

//npm run start