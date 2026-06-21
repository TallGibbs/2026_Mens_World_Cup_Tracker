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
    "updated": "June 21, 2026"
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
          "status": "upcoming",
          "preview": [
            "England can book a Round of 32 place with a win after their opening victory.",
            "Ghana also won their opener, setting up a Group L heavyweight clash.",
            "Kane will look to build on his brace against Croatia."
          ]
        },
        {
          "opp": "Panama",
          "when": "Sat Jun 27, 5:00 PM ET",
          "date": "2026-06-27T17:00:00-04:00",
          "venue": "MetLife Stadium, East Rutherford",
          "tv": "FOX / ITV1",
          "status": "upcoming",
          "preview": [
            "Group L finale; England will aim to lock up top spot.",
            "Panama need a statement result to keep their qualifying hopes alive."
          ]
        }
      ],
      "note": "England beat Croatia 4-2 in their opener; Kane scored twice and Bellingham added another in a statement win. Next up: Ghana in Foxborough on Jun 23."
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
          "team": "New Zealand",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Iran",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Egypt",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Belgium",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        }
      ]
    },
    {
      "id": "H",
      "started": true,
      "rows": [
        {
          "team": "Saudi Arabia",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Uruguay",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Spain",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Cape Verde",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        }
      ]
    },
    {
      "id": "I",
      "started": true,
      "rows": [
        {
          "team": "Norway",
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 3,
          "pts": 3
        },
        {
          "team": "France",
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 2,
          "pts": 3
        },
        {
          "team": "Senegal",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -2,
          "pts": 0
        },
        {
          "team": "Iraq",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -3,
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
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 3,
          "pts": 3
        },
        {
          "team": "Austria",
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 2,
          "pts": 3
        },
        {
          "team": "Jordan",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -2,
          "pts": 0
        },
        {
          "team": "Algeria",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
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
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 2,
          "pts": 3
        },
        {
          "team": "DR Congo",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Portugal",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Uzbekistan",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -2,
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
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 2,
          "pts": 3
        },
        {
          "team": "Ghana",
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 1,
          "pts": 3
        },
        {
          "team": "Panama",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -1,
          "pts": 0
        },
        {
          "team": "Croatia",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -2,
          "pts": 0
        }
      ]
    }
  ],
  "today": {
    "date": "Sunday, June 21, 2026",
    "stageLabel": "Group Stage",
    "tz": "All kickoff times are listed in Eastern Time (ET). US broadcast on FOX / FS1, with Spanish-language coverage on Telemundo; FOX One streams every match.",
    "schedNote": "Five matches today - Matchday 2 across Groups F, G and H.",
    "kits": {
      "Tunisia": "#E70013",
      "Japan": "#142880",
      "Spain": "#AA151B",
      "Saudi Arabia": "#006C35",
      "Belgium": "#C8102E",
      "Iran": "#239F40",
      "Uruguay": "#5CB8E8",
      "Cape Verde": "#003893",
      "New Zealand": "#1C1C1C",
      "Egypt": "#CE1126"
    },
    "games": [
      {
        "group": "F",
        "stage": "Group F - Matchday 2",
        "home": "Tunisia",
        "away": "Japan",
        "kick": "12:00 AM ET",
        "iso": "2026-06-21T00:00:00-04:00",
        "venue": "Estadio BBVA, Monterrey",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Japan look to back up their opening draw with the Netherlands and climb into the qualifying places.",
          "Winless Tunisia need a result to stay alive in Group F after losing their opener.",
          "A Japan win would tighten an already congested race behind the Dutch."
        ]
      },
      {
        "group": "H",
        "stage": "Group H - Matchday 2",
        "home": "Spain",
        "away": "Saudi Arabia",
        "kick": "12:00 PM ET",
        "iso": "2026-06-21T12:00:00-04:00",
        "venue": "Mercedes-Benz Stadium, Atlanta",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Spain, held in their opener, need three points to take charge of a tight Group H.",
          "Saudi Arabia will look to spring an upset and build on their opening-day draw.",
          "With all four teams level after Matchday 1, a winner here moves clear at the top."
        ]
      },
      {
        "group": "G",
        "stage": "Group G - Matchday 2",
        "home": "Belgium",
        "away": "Iran",
        "kick": "3:00 PM ET",
        "iso": "2026-06-21T15:00:00-04:00",
        "venue": "SoFi Stadium, Los Angeles",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Belgium chase a first win after being held in their Group G opener.",
          "Iran will sit deep and counter, hoping to frustrate the Belgian attack again.",
          "All four Group G teams are level on a point, so a win sends the victor clear."
        ]
      },
      {
        "group": "H",
        "stage": "Group H - Matchday 2",
        "home": "Uruguay",
        "away": "Cape Verde",
        "kick": "6:00 PM ET",
        "iso": "2026-06-21T18:00:00-04:00",
        "venue": "Hard Rock Stadium, Miami",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Uruguay aim to convert their experience into a first win after a cagey opening draw.",
          "World Cup debutants Cape Verde will look to build on a creditable point in their first match.",
          "A result here could vault either side to the top of a wide-open Group H."
        ]
      },
      {
        "group": "G",
        "stage": "Group G - Matchday 2",
        "home": "New Zealand",
        "away": "Egypt",
        "kick": "9:00 PM ET",
        "iso": "2026-06-21T21:00:00-04:00",
        "venue": "BC Place, Vancouver",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "New Zealand seek a statement win in Vancouver after holding firm in their opener.",
          "Egypt, with Salah pulling the strings, want three points to seize control of Group G.",
          "With the group level on points, the winner takes a real step toward the Round of 32."
        ]
      }
    ]
  }
};
