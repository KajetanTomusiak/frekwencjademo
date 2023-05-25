"use strict";

const express = require("express");
const Librus = require("librus-api");
const Absence = require('./lib/resources/absence.js');

const app = express();
const port = 3000;

const path = require('path');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const error = req.query.error;
  res.sendFile(__dirname + `/index.html${error ? "?error=true" : ""}`);
});

app.get("/attendance", (req, res) => {
  const error = req.query.error;
  res.sendFile(__dirname + `/attendance.html${error ? "?error=true" : ""}`);
});

app.post("/attendance", (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  let client = new Librus();
  client.authorize(login, password).then(() => {
    const absence = new Absence(client);

    absence.getAbsences().then((absences) => {
      if (Object.keys(absences).length === 0) {
        res.redirect("/attendance?error=true");
      } else {
        const formattedHTML = formatAbsencesToHTML(absences);
        res.send(formattedHTML);
      }
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

  html += "<nav>";
  html += "<button onclick=\"showMonth('09')\">Wrzesień</button>";
  html += "<button onclick=\"showMonth('10')\">Październik</button>";
  html += "<button onclick=\"showMonth('11')\">Listopad</button>";
  html += "<button onclick=\"showMonth('12')\">Grudzień</button>";
  html += "<button onclick=\"showMonth('01')\">Styczeń</button>";
  html += "<button onclick=\"showMonth('02')\">Luty</button>";
  html += "<button onclick=\"showMonth('03')\">Marzec</button>";
  html += "<button onclick=\"showMonth('04')\">Kwiecień</button>";
  html += "<button onclick=\"showMonth('05')\">Maj</button>";
  html += "<button onclick=\"showMonth('06')\">Czerwiec</button>";
  html += "</nav>";

  let countU = 0;
  let countNB = 0;

  for (const key in absences) {
    const absencesList = absences[key];

    if (Array.isArray(absencesList)) {
      for (const absence of absencesList) {
        if (absence && absence.date) {
          html += `<h2>${absence.date}</h2>`;
          html += "<ul>";

          if (Array.isArray(absence.table)) {
            for (const item of absence.table) {
              if (item && item !== "-" && item.type) {
                html += `<li>${item.type}</li>`;
                if (item.type === "u") {
                  countU++;
                } else if (item.type === "nb") {
                  countNB++;
                }

              }
            }
          } else {
            html += "<li>-</li>";
          }

          html += "</ul>";
        }
      }
    }
  }

  html += `<p>Godzin usprawiedliwionych: ${countU}</p>`;
  html += `<p>Godzin nieusprawiedliwionych: ${countNB}</p>`;
  html += "</body></html>";
  return html;
}


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
