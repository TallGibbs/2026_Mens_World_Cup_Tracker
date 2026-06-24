/*
 * data.js - the single source of truth for the Men's World Cup 2026 tracker.
 *
 * Both pages load this file (as a classic <script>, before their render script),
 * so the tournament data lives in exactly ONE place:
 *   - world_cup_tracker.html uses WC as its DATA (meta, teams, groups)
 *   - today.html uses WC.today for the day's games and derives each game's
 *     standings table from the shared WC.groups - there is no second copy.
 *
 * The daily routine edits ONLY this file's data. After editing, run
 * "node scripts/validate.mjs" (must pass) and "node scripts/snapshot.mjs".
 * See CLAUDE.md.
 *
 * Shape:
 *   meta   - tournament/meta strings incl. updated (today's date)
 *   teams  - featured teams (USA, Netherlands, England) + their fixtures
 *   groups - all 12 groups with standings rows (GD must sum to zero per group)
 *   today  - the Today's Games page: date, stageLabel, tz, schedNote, kits, games
 */
const WC = {
  "meta": {
    "tournament": "FIFA Men's World Cup 2026",
    "host": "Hosted across the USA, Canada and Mexico",
    "stage": "Group Stage",
    "where": "Group stage runs Jun 11 - Jun 27. Round of 32 begins Jun 28. Final Jul 19 at MetLife Stadium, New Jersey.",
    "standNote": "All 12 groups. Our teams' groups are pinned to the top.",
    "updated": "June 24, 2026"
  },
  "teams": [
    {
      "name": "USA",
      "group": "D",
      "kit": "linear-gradient(90deg,var(--usa-a),var(--usa-b))",
      "fixtures": [
        {
          "opp": "Paraguay",
          "when": "Fri Jun 12, 9:00 PM ET",
          "date": "2026-06-12T21:00:00-04:00",
          "venue": "SoFi Stadium, Los Angeles",
          "tv": "FOX",
          "status": "final",
          "us": 4,
          "them": 1
        },
        {
          "opp": "Australia",
          "when": "Fri Jun 19, 3:00 PM ET",
          "date": "2026-06-19T15:00:00-04:00",
          "venue": "Lumen Field, Seattle",
          "tv": "FOX",
          "status": "final",
          "us": 2,
          "them": 0
        },
        {
          "opp": "Turkiye",
          "when": "Thu Jun 25, 10:00 PM ET",
          "date": "2026-06-25T22:00:00-04:00",
          "venue": "SoFi Stadium, Los Angeles",
          "tv": "FOX",
          "status": "upcoming",
          "preview": [
            "The USA have already clinched a Round of 32 place, so this Group D finale is about seeding and top spot.",
            "Turkiye, still without a point, must win to keep any qualifying hope alive.",
            "Pochettino may rotate and manage minutes with progress already secured."
          ]
        }
      ],
      "note": "Back-to-back wins: a 4-1 opener over Paraguay and a 2-0 shutout of Australia have the USA on six points and already into the Round of 32 with a group game to spare."
    },
    {
      "name": "Netherlands",
      "group": "F",
      "kit": "var(--ned-a)",
      "fixtures": [
        {
          "opp": "Japan",
          "when": "Sun Jun 14, 4:00 PM ET",
          "date": "2026-06-14T16:00:00-04:00",
          "venue": "AT&T Stadium, Arlington",
          "tv": "FOX",
          "status": "final",
          "us": 2,
          "them": 2
        },
        {
          "opp": "Sweden",
          "when": "Sat Jun 20, 1:00 PM ET",
          "date": "2026-06-20T13:00:00-04:00",
          "venue": "NRG Stadium, Houston",
          "tv": "FOX",
          "status": "final",
          "us": 5,
          "them": 1
        },
        {
          "opp": "Tunisia",
          "when": "Thu Jun 25, 7:00 PM ET",
          "date": "2026-06-25T19:00:00-04:00",
          "venue": "Arrowhead Stadium, Kansas City",
          "tv": "FS1",
          "status": "upcoming",
          "preview": [
            "Group F finale; a win would clinch top spot for the Netherlands, while a draw should be enough to advance.",
            "Tunisia, beaten in both group games so far, are already eliminated and playing for pride.",
            "Expect the Dutch to manage minutes with a Round of 32 place all but secured."
          ]
        }
      ],
      "note": "The Dutch bounced back from a 2-2 draw with Japan to rout Sweden 5-1, climbing to four points and the top of Group F on goals scored. They close the group against Tunisia on Jun 25."
    },
    {
      "name": "England",
      "group": "L",
      "kit": "linear-gradient(90deg,var(--eng-a),var(--eng-b))",
      "fixtures": [
        {
          "opp": "Croatia",
          "when": "Wed Jun 17, 4:00 PM ET",
          "date": "2026-06-17T16:00:00-04:00",
          "venue": "AT&T Stadium, Arlington",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 4,
          "them": 2
        },
        {
          "opp": "Ghana",
          "when": "Tue Jun 23, 4:00 PM ET",
          "date": "2026-06-23T16:00:00-04:00",
          "venue": "Gillette Stadium, Foxborough",
          "tv": "FOX / BBC One",
          "status": "final",
          "us": 0,
          "them": 0
        },
        {
          "opp": "Panama",
          "when": "Sat Jun 27, 5:00 PM ET",
          "date": "2026-06-27T17:00:00-04:00",
          "venue": "MetLife Stadium, East Rutherford",
          "tv": "FOX / ITV1",
          "status": "upcoming",
          "preview": [
            "Group L finale: England sit top on goal difference, so a win locks up first place and could be enough to seal a Round of 32 spot.",
            "Panama, beaten twice already, are all but eliminated and need a heavy win plus other results to keep faint hopes alive.",
            "Watch whether Tuchel rotates with England in control of the group; Kane is still chasing his first goal since the opener."
          ]
        }
      ],
      "note": "England were held to a goalless draw by Ghana in Foxborough, leaving them top of Group L on goal difference with four points. They close the group against Panama at MetLife on Jun 27."
    }
  ],
  "groups": [
    {
      "id": "A",
      "started": true,
      "rows": [
        {
          "team": "Mexico",
          "pld": 2,
          "w": 2,
          "d": 0,
          "l": 0,
          "gd": 3,
          "pts": 6
        },
        {
          "team": "South Korea",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Czechia",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -1,
          "pts": 1
        },
        {
          "team": "South Africa",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -2,
          "pts": 1
        }
      ]
    },
    {
      "id": "B",
      "started": true,
      "rows": [
        {
          "team": "Canada",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 6,
          "pts": 4
        },
        {
          "team": "Switzerland",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 3,
          "pts": 4
        },
        {
          "team": "Bosnia and Herzegovina",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -3,
          "pts": 1
        },
        {
          "team": "Qatar",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -6,
          "pts": 1
        }
      ]
    },
    {
      "id": "C",
      "started": true,
      "rows": [
        {
          "team": "Brazil",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 3,
          "pts": 4
        },
        {
          "team": "Morocco",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 1,
          "pts": 4
        },
        {
          "team": "Scotland",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Haiti",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -4,
          "pts": 0
        }
      ]
    },
    {
      "id": "D",
      "started": true,
      "rows": [
        {
          "team": "USA",
          "pld": 2,
          "w": 2,
          "d": 0,
          "l": 0,
          "gd": 5,
          "pts": 6
        },
        {
          "team": "Australia",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Paraguay",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": -2,
          "pts": 3
        },
        {
          "team": "Turkiye",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -3,
          "pts": 0
        }
      ]
    },
    {
      "id": "E",
      "started": true,
      "rows": [
        {
          "team": "Germany",
          "pld": 2,
          "w": 2,
          "d": 0,
          "l": 0,
          "gd": 7,
          "pts": 6
        },
        {
          "team": "Ivory Coast",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Ecuador",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -1,
          "pts": 1
        },
        {
          "team": "Curacao",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -6,
          "pts": 1
        }
      ]
    },
    {
      "id": "F",
      "started": true,
      "rows": [
        {
          "team": "Netherlands",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 4,
          "pts": 4
        },
        {
          "team": "Japan",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 4,
          "pts": 4
        },
        {
          "team": "Sweden",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Tunisia",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -8,
          "pts": 0
        }
      ]
    },
    {
      "id": "G",
      "started": true,
      "rows": [
        {
          "team": "Egypt",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 2,
          "pts": 4
        },
        {
          "team": "Iran",
          "pld": 2,
          "w": 0,
          "d": 2,
          "l": 0,
          "gd": 0,
          "pts": 2
        },
        {
          "team": "Belgium",
          "pld": 2,
          "w": 0,
          "d": 2,
          "l": 0,
          "gd": 0,
          "pts": 2
        },
        {
          "team": "New Zealand",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -2,
          "pts": 1
        }
      ]
    },
    {
      "id": "H",
      "started": true,
      "rows": [
        {
          "team": "Spain",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 4,
          "pts": 4
        },
        {
          "team": "Uruguay",
          "pld": 2,
          "w": 0,
          "d": 2,
          "l": 0,
          "gd": 0,
          "pts": 2
        },
        {
          "team": "Cape Verde",
          "pld": 2,
          "w": 0,
          "d": 2,
          "l": 0,
          "gd": 0,
          "pts": 2
        },
        {
          "team": "Saudi Arabia",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -4,
          "pts": 1
        }
      ]
    },
    {
      "id": "I",
      "started": true,
      "rows": [
        {
          "team": "France",
          "pld": 2,
          "w": 2,
          "d": 0,
          "l": 0,
          "gd": 5,
          "pts": 6
        },
        {
          "team": "Norway",
          "pld": 2,
          "w": 2,
          "d": 0,
          "l": 0,
          "gd": 4,
          "pts": 6
        },
        {
          "team": "Senegal",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -3,
          "pts": 0
        },
        {
          "team": "Iraq",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -6,
          "pts": 0
        }
      ]
    },
    {
      "id": "J",
      "started": true,
      "rows": [
        {
          "team": "Argentina",
          "pld": 2,
          "w": 2,
          "d": 0,
          "l": 0,
          "gd": 5,
          "pts": 6
        },
        {
          "team": "Austria",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Algeria",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": -2,
          "pts": 3
        },
        {
          "team": "Jordan",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -3,
          "pts": 0
        }
      ]
    },
    {
      "id": "K",
      "started": true,
      "rows": [
        {
          "team": "Colombia",
          "pld": 2,
          "w": 2,
          "d": 0,
          "l": 0,
          "gd": 3,
          "pts": 6
        },
        {
          "team": "Portugal",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 5,
          "pts": 4
        },
        {
          "team": "DR Congo",
          "pld": 2,
          "w": 0,
          "d": 1,
          "l": 1,
          "gd": -1,
          "pts": 1
        },
        {
          "team": "Uzbekistan",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -7,
          "pts": 0
        }
      ]
    },
    {
      "id": "L",
      "started": true,
      "rows": [
        {
          "team": "England",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 2,
          "pts": 4
        },
        {
          "team": "Ghana",
          "pld": 2,
          "w": 1,
          "d": 1,
          "l": 0,
          "gd": 1,
          "pts": 4
        },
        {
          "team": "Croatia",
          "pld": 2,
          "w": 1,
          "d": 0,
          "l": 1,
          "gd": -1,
          "pts": 3
        },
        {
          "team": "Panama",
          "pld": 2,
          "w": 0,
          "d": 0,
          "l": 2,
          "gd": -2,
          "pts": 0
        }
      ]
    }
  ],
  "today": {
    "date": "Wednesday, June 24, 2026",
    "stageLabel": "Group Stage",
    "tz": "All kickoff times are listed in Eastern Time (ET). US broadcast on FOX / FS1, with Spanish-language coverage on Telemundo; FOX One streams every match.",
    "schedNote": "Six matches today - Matchday 3 across Groups A, B and C, with each group's pair kicking off simultaneously.",
    "kits": {
      "Bosnia and Herzegovina": "#002395",
      "Qatar": "#8A1538",
      "Switzerland": "#FF0000",
      "Canada": "#D52B1E",
      "Morocco": "#C1272D",
      "Haiti": "#00209F",
      "Scotland": "#005EB8",
      "Brazil": "#FEDF00",
      "Czechia": "#11457E",
      "Mexico": "#006847",
      "South Africa": "#007A4D",
      "South Korea": "#CD2E3A"
    },
    "games": [
      {
        "group": "B",
        "stage": "Group B - Matchday 3",
        "home": "Bosnia and Herzegovina",
        "away": "Qatar",
        "kick": "3:00 PM ET",
        "iso": "2026-06-24T15:00:00-04:00",
        "venue": "Lumen Field, Seattle",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Both sides sit on a single point and need a win to have any chance of sneaking through as a best third-place team.",
          "With Canada and Switzerland well clear, this is effectively a play-off for pride and goal difference.",
          "Expect an open game as neither can afford to settle for a draw."
        ]
      },
      {
        "group": "B",
        "stage": "Group B - Matchday 3",
        "home": "Switzerland",
        "away": "Canada",
        "kick": "3:00 PM ET",
        "iso": "2026-06-24T15:00:00-04:00",
        "venue": "BC Place, Vancouver",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Level on four points, the winner tops Group B and a draw should see both advance.",
          "Co-hosts Canada carry a healthy goal difference, so even a narrow defeat may not knock them out.",
          "Switzerland will fancy their organisation against Canada's quick transitions in Vancouver."
        ]
      },
      {
        "group": "C",
        "stage": "Group C - Matchday 3",
        "home": "Morocco",
        "away": "Haiti",
        "kick": "6:00 PM ET",
        "iso": "2026-06-24T18:00:00-04:00",
        "venue": "Mercedes-Benz Stadium, Atlanta",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "A win guarantees Morocco a place in the Round of 32 and could secure top spot in Group C.",
          "Haiti, still without a point, are already eliminated and playing for a first goal of the tournament.",
          "Morocco will want to protect a positive goal difference with the group still tight at the top."
        ]
      },
      {
        "group": "C",
        "stage": "Group C - Matchday 3",
        "home": "Scotland",
        "away": "Brazil",
        "kick": "6:00 PM ET",
        "iso": "2026-06-24T18:00:00-04:00",
        "venue": "Hard Rock Stadium, Miami Gardens",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Brazil can clinch first place in Group C with a victory over Scotland.",
          "Scotland, on three points, likely need at least a draw to keep their qualifying hopes alive.",
          "A Scotland upset would blow Group C wide open on the final day."
        ]
      },
      {
        "group": "A",
        "stage": "Group A - Matchday 3",
        "home": "Czechia",
        "away": "Mexico",
        "kick": "9:00 PM ET",
        "iso": "2026-06-24T21:00:00-04:00",
        "venue": "Estadio Banorte, Guadalajara",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Co-hosts Mexico are already through on six points and play for top spot and momentum in front of a home crowd.",
          "Czechia must win to have any chance of advancing as a best third-place side.",
          "Watch whether Mexico rotate with qualification secured ahead of the knockouts."
        ]
      },
      {
        "group": "A",
        "stage": "Group A - Matchday 3",
        "home": "South Africa",
        "away": "South Korea",
        "kick": "9:00 PM ET",
        "iso": "2026-06-24T21:00:00-04:00",
        "venue": "Estadio BBVA, Monterrey",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "South Korea can seal a Round of 32 spot with a win after collecting three points so far.",
          "South Africa, on one point, must win to keep their qualifying hopes alive.",
          "Goal difference could decide second place, so both sides will chase a decisive result."
        ]
      }
    ]
  }
};
