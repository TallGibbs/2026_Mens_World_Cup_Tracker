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
    "updated": "June 20, 2026"
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
          "status": "upcoming",
          "preview": [
            "After drawing their opener, the Dutch need a win to take control of Group F.",
            "Sweden lead the group and can all but qualify with three points here.",
            "Watch a reshaped Dutch defense with Jurrien Timber out for the tournament."
          ]
        },
        {
          "opp": "Tunisia",
          "when": "Thu Jun 25, 7:00 PM ET",
          "date": "2026-06-25T19:00:00-04:00",
          "venue": "Arrowhead Stadium, Kansas City",
          "tv": "FS1",
          "status": "upcoming",
          "preview": [
            "Group F finale; the Netherlands likely need at least a draw to advance.",
            "Tunisia will be playing to keep a long-shot qualifying hope alive."
          ]
        }
      ],
      "note": "Jurrien Timber ruled out of the tournament with a groin injury; the Dutch drew 2-2 with Japan and must beat Sweden on Jun 20 to stay on track."
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
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 6,
          "pts": 3
        },
        {
          "team": "Ivory Coast",
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 1,
          "pts": 3
        },
        {
          "team": "Ecuador",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -1,
          "pts": 0
        },
        {
          "team": "Curacao",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -6,
          "pts": 0
        }
      ]
    },
    {
      "id": "F",
      "started": true,
      "rows": [
        {
          "team": "Sweden",
          "pld": 1,
          "w": 1,
          "d": 0,
          "l": 0,
          "gd": 4,
          "pts": 3
        },
        {
          "team": "Japan",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Netherlands",
          "pld": 1,
          "w": 0,
          "d": 1,
          "l": 0,
          "gd": 0,
          "pts": 1
        },
        {
          "team": "Tunisia",
          "pld": 1,
          "w": 0,
          "d": 0,
          "l": 1,
          "gd": -4,
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
    "date": "Saturday, June 20, 2026",
    "stageLabel": "Group Stage",
    "tz": "All kickoff times are listed in Eastern Time (ET). US broadcast on FOX / FS1, with Spanish-language coverage on Telemundo; FOX One streams every match.",
    "schedNote": "Three matches today - Matchday 2 across Groups E and F.",
    "kits": {
      "Netherlands": "#F36C21",
      "Sweden": "#FECC02",
      "Germany": "#1C1C1C",
      "Ivory Coast": "#FF8200",
      "Ecuador": "#FFD100",
      "Curacao": "#00209F"
    },
    "games": [
      {
        "group": "F",
        "stage": "Group F - Matchday 2",
        "home": "Netherlands",
        "away": "Sweden",
        "kick": "1:00 PM ET",
        "iso": "2026-06-20T13:00:00-04:00",
        "venue": "NRG Stadium, Houston",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Group F leaders Sweden, 4-0 winners over Tunisia, can move to the brink of the Round of 32 with another result.",
          "The Netherlands, held 2-2 by Japan, need a win to take control of the group after a frustrating opener.",
          "Watch a reshaped Dutch back line with Jurrien Timber ruled out of the tournament."
        ]
      },
      {
        "group": "E",
        "stage": "Group E - Matchday 2",
        "home": "Germany",
        "away": "Ivory Coast",
        "kick": "4:00 PM ET",
        "iso": "2026-06-20T16:00:00-04:00",
        "venue": "BMO Field, Toronto",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Both sides won their openers, so the winner takes a commanding lead at the top of Group E.",
          "Germany arrive on the back of a dominant opening victory and will back their attack at BMO Field.",
          "Ivory Coast, 1-0 winners in their first match, will look to frustrate Germany and hit on the counter."
        ]
      },
      {
        "group": "E",
        "stage": "Group E - Matchday 2",
        "home": "Ecuador",
        "away": "Curacao",
        "kick": "8:00 PM ET",
        "iso": "2026-06-20T20:00:00-04:00",
        "venue": "GEHA Field at Arrowhead Stadium, Kansas City",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Both teams lost their openers, making this effectively a must-win to stay in Round of 32 contention.",
          "Ecuador will back themselves to bounce back at Arrowhead after a narrow opening defeat.",
          "Curacao, beaten heavily by Germany, need a response to revive their qualifying hopes."
        ]
      }
    ]
  }
};
