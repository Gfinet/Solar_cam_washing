// console.log("Hello World !")

const express = require('express')
const path = require('path');
const app = express()
const port = 9000

// i = 0
// msg = ""
// while (i < 10)
// {
//     msg += "Hello World !";
//     i++;
// }

// app.get('/', (req, res) => {res.send(res)})
// app.get('/html/index.html', (req, res) => {res.send(res.sendFile('/home/gfinet/Desktop/trans/app/html/index.html'))})

const staticPath = path.join(__dirname, 'html');
app.use(express.static(staticPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

const { exec } = require('child_process');
const pat1 = path.join('python3 ', staticPath);
const pat = path.join(pat1, 'cgi/puissance4.py');

app.get('/cgi', (req, res) => {
    exec(pat, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur d'exécution: ${error.message}`);
            return res.status(500).send(stderr || 'Erreur interne');
        }
        res.send(stdout);
    });
});
// console.log(res)

app.listen(port, () => console.log('Notre app demarre sur http://localhost:',port))




//node -v
//npm init (creer un package.json)
//npm install express --save (express sert pour les serveur http)
//npm install --save-dev nodemon (nodemon permet la relance du programme apres chaque modification du code)

//npm run start