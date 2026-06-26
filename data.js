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
    "updated": "June 26, 2026"
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
          "status": "final",
          "us": 2,
          "them": 3
        }
      ],
      "note": "With a Round of 32 place already secured, a rotated USA slipped to a 3-2 loss against Turkiye in the finale, but the two earlier wins were enough to win Group D outright on six points. They now await their Round of 32 opponent."
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
          "status": "final",
          "us": 3,
          "them": 1
        }
      ],
      "note": "The Dutch beat Tunisia 3-1 to finish top of Group F on seven points, sealing first place and a Round of 32 berth. They now await their knockout opponent."
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
          "pld": 3,
          "w": 3,
          "d": 0,
          "l": 0,
          "gd": 6,
          "pts": 9
        },
        {
          "team": "South Africa",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gd": -1,
          "pts": 4
        },
        {
          "team": "South Korea",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gd": -1,
          "pts": 3
        },
        {
          "team": "Czechia",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gd": -4,
          "pts": 1
        }
      ]
    },
    {
      "id": "B",
      "started": true,
      "rows": [
        {
          "team": "Switzerland",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gd": 4,
          "pts": 7
        },
        {
          "team": "Canada",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gd": 5,
          "pts": 4
        },
        {
          "team": "Bosnia and Herzegovina",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gd": -1,
          "pts": 4
        },
        {
          "team": "Qatar",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gd": -8,
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
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gd": 6,
          "pts": 7
        },
        {
          "team": "Morocco",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gd": 3,
          "pts": 7
        },
        {
          "team": "Scotland",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gd": -3,
          "pts": 3
        },
        {
          "team": "Haiti",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gd": -6,
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
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gd": 4,
          "pts": 6
        },
        {
          "team": "Australia",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Paraguay",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gd": -2,
          "pts": 4
        },
        {
          "team": "Turkiye",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gd": -2,
          "pts": 3
        }
      ]
    },
    {
      "id": "E",
      "started": true,
      "rows": [
        {
          "team": "Germany",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gd": 6,
          "pts": 6
        },
        {
          "team": "Ivory Coast",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gd": 2,
          "pts": 6
        },
        {
          "team": "Ecuador",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Curacao",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gd": -8,
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
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gd": 6,
          "pts": 7
        },
        {
          "team": "Japan",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gd": 4,
          "pts": 5
        },
        {
          "team": "Sweden",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Tunisia",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gd": -10,
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
    "date": "Friday, June 26, 2026",
    "stageLabel": "Group Stage",
    "tz": "All kickoff times are listed in Eastern Time (ET). US broadcast on FOX / FS1, with Spanish-language coverage on Telemundo; FOX One streams every match.",
    "schedNote": "Six matches today - the Matchday 3 finales for Groups G, H and I, with each group's pair kicking off simultaneously.",
    "kits": {
      "Norway": "#BA0C2F",
      "France": "#002654",
      "Senegal": "#00853F",
      "Iraq": "#007A3D",
      "Cape Verde": "#003893",
      "Saudi Arabia": "#006C35",
      "Uruguay": "#5CBFEB",
      "Spain": "#C60B1E",
      "Egypt": "#CE1126",
      "Iran": "#239F40",
      "New Zealand": "#111111",
      "Belgium": "#E30613"
    },
    "games": [
      {
        "group": "I",
        "stage": "Group I - Matchday 3",
        "home": "Norway",
        "away": "France",
        "kick": "3:00 PM ET",
        "iso": "2026-06-26T15:00:00-04:00",
        "venue": "Gillette Stadium, Foxborough",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "France and Norway are both already through on six points, so this finale decides first place in Group I.",
          "Goal difference favours France, meaning Norway likely need a win to top the group outright.",
          "Watch whether Haaland and Mbappe are both unleashed or rested with the knockouts in mind."
        ]
      },
      {
        "group": "I",
        "stage": "Group I - Matchday 3",
        "home": "Senegal",
        "away": "Iraq",
        "kick": "3:00 PM ET",
        "iso": "2026-06-26T15:00:00-04:00",
        "venue": "BMO Field, Toronto",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Both sides are pointless and already eliminated, so this is a battle to avoid finishing bottom of Group I.",
          "Senegal will want a first win to salvage some pride from a disappointing campaign.",
          "Expect both coaches to look at fringe players with nothing left to play for."
        ]
      },
      {
        "group": "H",
        "stage": "Group H - Matchday 3",
        "home": "Cape Verde",
        "away": "Saudi Arabia",
        "kick": "8:00 PM ET",
        "iso": "2026-06-26T20:00:00-04:00",
        "venue": "NRG Stadium, Houston",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Cape Verde, on two points, can seal a place in the Round of 32 with a win in their final group game.",
          "Saudi Arabia sit bottom on one point and must win and hope results elsewhere go their way.",
          "A draw would leave Cape Verde sweating on the Uruguay-Spain result running alongside."
        ]
      },
      {
        "group": "H",
        "stage": "Group H - Matchday 3",
        "home": "Uruguay",
        "away": "Spain",
        "kick": "8:00 PM ET",
        "iso": "2026-06-26T20:00:00-04:00",
        "venue": "Estadio Akron, Guadalajara",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Spain top Group H on four points and a draw would be enough to guarantee first place.",
          "Uruguay, on two points, likely need a win to be certain of advancing from a tight group.",
          "A meeting of two possession-minded sides should decide who tops the section heading into the knockouts."
        ]
      },
      {
        "group": "G",
        "stage": "Group G - Matchday 3",
        "home": "Egypt",
        "away": "Iran",
        "kick": "11:00 PM ET",
        "iso": "2026-06-26T23:00:00-04:00",
        "venue": "Lumen Field, Seattle",
        "tv": "FOX",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Egypt lead Group G on four points and a draw would likely be enough to seal top spot.",
          "Iran, on two points, need a positive result to be sure of reaching the Round of 32.",
          "Salah will be central to Egypt's hopes of finishing the group stage unbeaten."
        ]
      },
      {
        "group": "G",
        "stage": "Group G - Matchday 3",
        "home": "New Zealand",
        "away": "Belgium",
        "kick": "11:00 PM ET",
        "iso": "2026-06-26T23:00:00-04:00",
        "venue": "BC Place, Vancouver",
        "tv": "FS1",
        "stream": "FOX One / Telemundo (ES)",
        "bullets": [
          "Belgium, on two points, can clinch a knockout place with a win over the tournament's surprise package.",
          "New Zealand sit on one point but a victory could send them through in a wide-open Group G.",
          "Expect Belgium to push for goals knowing goal difference may decide the qualifying order."
        ]
      }
    ]
  }
};
