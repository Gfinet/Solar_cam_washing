#!/usr/bin/env python3
# Puissance 4, 7 colonnes, 6 lignes

import warnings
warnings.filterwarnings("ignore", "'cgi' is deprecated", DeprecationWarning)

import cgi
import os

players = ["Rouges", "Bleu"]
colors = ["#05060795","#db2997dd", "#027eafdd"]

form = cgi.FieldStorage()
col = form.getvalue("col")
reset = form.getvalue("reset")


if reset:
    plateau = [[0]*7 for _ in range(6)]
    tour = 1
else:
    cookies = {}
    if "HTTP_COOKIE" in os.environ:
        cookie_str = os.environ["HTTP_COOKIE"]
        for part in cookie_str.split(";"):
            if "=" in part:
                k, v = part.strip().split("=", 1)
                cookies[k] = v

    plateau = []
    for i in range(6):
        row_cookie = cookies.get(f"row{i}")
        if row_cookie:
            plateau.append([int(x) for x in row_cookie.split(",")])
        else:
            plateau.append([0]*7)
    
    tour = int(cookies.get("tour", "1"))

    if col:
        col = int(col) - 1  # bouton 1 → colonne 0
        val = (tour % 2) + 1
        for row in reversed(plateau):
            if row[col] == 0:
                row[col] = val
                tour += 1
                break

# --- Début HTML ---
body = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Puissance 4</title>
  <link rel="stylesheet" href="../style.css" type="text/css">
</head>
<body>
"""

# <link rel="stylesheet" href="../style.css" type="text/css">
player = players[tour % 2]
body += f"""  <header class"p4header">
    <h1>Puissance 4</h1>
    <h2>Au tour des {player}</h2>
    <h3>Choisissez votre colonne</h3>
  </header>

  <main class="p4">
    <section class="controls">
      <form method="POST" action="/cgi/puissance4.py">
        <table class="columns">
          <tr>
"""

# Boutons de colonnes
for num in range(1, 8):
    body += f'<td><button class="column" type="submit" name="col" value="{num}">Colonne {num}</button></td>\n'
body += """</tr>
        </table>
      </form>
    </section>
    <section class="board-wrapper">
      <table class="board">
        <tbody>
"""

for row in plateau:
    body+="<tr>"
    for cell in row:
        color = colors[cell]
        body += '<td class="cell"\n'
        body += f'style="background-color: {color}; width: 50px; height: 50px;"></td>\n'
    body += "</tr>\n"


body += """</tbody>
      </table>
    </section>
    <section class="actions">
      <form method="POST" action="/cgi/puissance4.py">
        <button type="submit" name="reset" value="1">Réinitialiser</button>
      </form>
    </section>
    <p class="text" >Tu peux revenir à <a href="/index.html">la page principale</a>.</p>
  </main>
</body>
</html>
"""

head = """Status: 200 OK\r
Content-Type: text/html; charset=utf-8\r\n"""

for i, row in enumerate(plateau):
    head += f"Set-Cookie: row{i}={','.join(map(str,row))}; Path=/\r\n"
head += f"Set-Cookie: tour={tour}; Path=/\r\n\r"

print(head)
print(body)