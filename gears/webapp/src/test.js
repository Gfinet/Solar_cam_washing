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

const staticPath = path.join("/usr/local/src", 'html');
app.use(express.static(staticPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

const { exec } = require('child_process');
const { spawn } = require('child_process');
const cgiPat = path.join(staticPath, 'cgi/');

app.use(express.urlencoded({ extended: true }));

app.get('/cgi:scriptName', (req, res) => {
    const scriptName = req.params.scriptName;
    const fullPath = path.join(cgiPat, scriptName);

    // Sécurité : on vérifie que le fichier finit bien par .py
    if (!scriptName.endsWith('.py')) {
        return res.status(403).send("Seuls les scripts .py sont autorisés.");
    }

    res.setHeader('Content-Type', 'text/html');
    exec('python3 ' + fullPath, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur d'exécution: ${error.message}`);
            return res.status(500).send(stderr || 'Erreur interne');
        }
        const parts = stdout.split('\n');
        let htmlContent = "";
        let headerEnded = false;

        parts.forEach(line => {
            if (!headerEnded) {
                if (line.trim() === "") {
                    headerEnded = true; // On a trouvé la fin des en-têtes
                } else if (line.startsWith("Status:")) {
                    const code = parseInt(line.split(":")[1].trim().split(" ")[0]);
                    res.status(code);
                } else if (line.startsWith("Content-Type:")) {
                    res.setHeader("Content-Type", line.split(":")[1].trim());
                } else if (line.startsWith("Set-Cookie:")) {
                    // Express permet d'ajouter plusieurs headers identiques avec res.append
                    res.append("Set-Cookie", line.split(":")[1].trim());
                }
            } else {
                htmlContent += line + "\n";
            }
        });

        // 2. Si le script n'a pas mis de ligne vide, stdout contient peut-être tout
        if (!headerEnded) htmlContent = stdout;
        res.send(htmlContent);
    });
});

app.post('/cgi:scriptName', (req, res) => {
    const scriptName = req.params.scriptName;
    const fullPath = path.join(cgiPat, scriptName);

    // Sécurité : on vérifie que le fichier finit bien par .py
    if (!scriptName.endsWith('.py')) {
        return res.status(403).send("Seuls les scripts .py sont autorisés.");
    }

    const postData = new URLSearchParams(req.body).toString();

    
    // 2. Définir les variables d'environnement CGI
    const env = {
        ...process.env,
        REQUEST_METHOD: 'POST',
        CONTENT_TYPE: req.headers['content-type'],
        CONTENT_LENGTH: postData.length,
        HTTP_COOKIE: req.headers.cookie || '' // On transmet les cookies existants !
    };
    console.log("cook ", req.headers.cookie);
    // res.setHeader('Content-Type', 'text/html');
    const pythonProcess = spawn('python3', [fullPath], { env });
    stdout = '';
    stderr = '';
    pythonProcess.stdin.write(postData);
    pythonProcess.stdin.end();
    pythonProcess.stdout.on('data', (data) => stdout += data);
    pythonProcess.stderr.on('data', (data) => stderr += data);
    pythonProcess.on('close', (code) => 
    {
        if (code !== 0) 
        {
            return res.status(500).send(stderr);
        }
        const parts = stdout.split('\n');
        let htmlContent = "";
        let headerEnded = false;

        // console.log(res, stdout);
        parts.forEach(line => 
        {
            if (!headerEnded) 
            {
                if (line.trim() === "") {
                    headerEnded = true; // On a trouvé la fin des en-têtes
                } else if (line.startsWith("Status:")) {
                    const code = parseInt(line.split(":")[1].trim().split(" ")[0]);
                    res.status(code);
                } else if (line.startsWith("Content-Type:")) {
                    res.setHeader("Content-Type", line.split(":")[1].trim());
                } else if (line.startsWith("Set-Cookie:")) {
                    // Express permet d'ajouter plusieurs headers identiques avec res.append
                    res.append("Set-Cookie", line.split(":")[1].trim());
                    res.setHeader("Set-Cookie", line.split(":")[1].trim());
                    // console.log("head: ", res.getHeader("Set-Cookie"));
                    // console.log(line.split(":")[1].trim());
                }
            } 
            else 
            {
                htmlContent += line + "\n";
            }
        });
        // 2. Si le script n'a pas mis de ligne vide, stdout contient peut-être tout
        if (!headerEnded) htmlContent = stdout;
        // console.log(htmlContent);
        res.send(htmlContent);
    });
});
// console.log(res)

app.listen(port, () => console.log('Notre app demarre sur http://localhost:',port))




//node -v
//npm init (creer un package.json)
//npm install express --save (express sert pour les serveur http)
//npm install --save-dev nodemon (nodemon permet la relance du programme apres chaque modification du code)

//npm run start