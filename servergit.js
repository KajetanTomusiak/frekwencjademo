"use strict";

const express = require("express");
const Librus = require("librus-api");
const Absence = require('./lib/resources/absence.js');

const app = express();
const port = 3000;

const path = require('path');

// Używamy ścieżki /public do serwowania statycznych plików
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/attendance", (req, res) => {
  res.sendFile(__dirname + "/attendance.html");
});

app.post("/attendance", (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  let client = new Librus();
  client.authorize(login, password).then(() => {
    const absence = new Absence(client);

    absence.getAbsences().then((absences) => {
      const formattedHTML = formatAbsencesToHTML(absences);
      res.send(formattedHTML);
    }).catch((error) => {
      console.error("Błąd podczas pobierania nieobecności:", error);
      res.status(500).send("Wystąpił błąd podczas pobierania nieobecności");
    });
  });
});

function formatAbsencesToHTML(absences) {
  let html = "<html><head><title>Nieobecności</title>";
  html += "<link rel='stylesheet' type='text/css' href='/public/style.css'>";
  html += "</head><body>";

  for (const key in absences) {
    const absencesList = absences[key];

    if (Array.isArray(absencesList)) {
      for (const absence of absencesList) {
        html += `<h2>${absence.date}</h2>`;
        html += "<ul>";

        if (Array.isArray(absence.table)) {
          for (const item of absence.table) {
            if (item && item !== "-") {
              html += `<li>${item.type}</li>`;
            }
          }
        } else {
          html += "<li>-</li>";
        }

        html += "</ul>";
      }
    }
  }

  html += "</body></html>";
  return html;
}


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});