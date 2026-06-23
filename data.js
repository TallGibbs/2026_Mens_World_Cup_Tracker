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
    "updated": "June 23, 2026"
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
    "date": "Tuesday, June 23, 2026",
    "stageLabel": "Group Stage",
    "tz": "All kickoff times are listed in Eastern Time (ET). US broadcast on FOX / FS1, with Spanish-language coverage on Telemundo; FOX One streams every match.",
    "schedNote": "Four matches today - Matchday 2 across Groups K and L.",
    "kits": {
      "Portugal": "#006600",
      "Uzbekistan": "#0099B5",
      "England": "#CF142B",
      "Ghana": "#006B3F",
      "Panama": "#DA121A",
      "Croatia": "#FF0000",
      "Colombia": "#FCD116",
      "DR Congo": "#007FFF"
    },
    "games": [
      {
        "group": "K",
        "stage": "Group K - Matchday 2",
        "home": "Portugal",
        "away": "Uzbekistan",
        "kick": "1:00 PM ET",
        "iso": "2026-06-23T13:00:00-04:00",
        "venue": "NRG Stadium, Houston",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Portugal, held to a draw in their opener, need a win to take charge of Group K.",
          "Uzbekistan are chasing their first points of the tournament after an opening defeat.",
          "Ronaldo's side will look to turn possession into goals against a compact Uzbek block."
        ]
      },
      {
        "group": "L",
        "stage": "Group L - Matchday 2",
        "home": "England",
        "away": "Ghana",
        "kick": "4:00 PM ET",
        "iso": "2026-06-23T16:00:00-04:00",
        "venue": "Gillette Stadium, Foxborough",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "A win would send England into the Round of 32 with a match to spare after their opening victory.",
          "Ghana also won their opener, so first place in Group L is on the line.",
          "Kane will aim to build on the brace he scored against Croatia."
        ]
      },
      {
        "group": "L",
        "stage": "Group L - Matchday 2",
        "home": "Panama",
        "away": "Croatia",
        "kick": "7:00 PM ET",
        "iso": "2026-06-23T19:00:00-04:00",
        "venue": "BMO Field, Toronto",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Both Panama and Croatia lost their openers, making this close to a must-win in Group L.",
          "Croatia need a response after falling to England on Matchday 1.",
          "Panama will look to spring a surprise and revive their qualifying hopes."
        ]
      },
      {
        "group": "K",
        "stage": "Group K - Matchday 2",
        "home": "Colombia",
        "away": "DR Congo",
        "kick": "10:00 PM ET",
        "iso": "2026-06-23T22:00:00-04:00",
        "venue": "Estadio Akron, Guadalajara",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Group K leaders Colombia can move to the brink of qualification with another win.",
          "DR Congo, who drew their opener, need points to stay in the hunt.",
          "Expect Colombia to press for an early goal in Guadalajara."
        ]
      }
    ]
  }
};
