// console.log("Hello World !")

const express = require('express')

const app = express()
const port = 9000

i = 0
msg = ""
while (i < 10)
{
    msg += "Hello World !";
    i++;
}

app.get('/', (req, res) => {res.send(res)})
console.log(res)

app.listen(port, () => console.log('Notre app demarre sur http://localhost:',port))




//node -v
//npm init (creer un package.json)
//npm install express --save (express sert pour les serveur http)
//npm install --save-dev nodemon (nodemon permet la relance du programme apres chaque modification du code)

//npm run start