export const users=[
    {
        id: 0,
        username:"Marko Markić",
        email:"marko@gmail.com", 
        trenutniSplit_id: 0, 
        slobodni_dani:["ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"],
        user_splitovi: [0, 2, 3],
        custom_vjezbe: [0, 5, 7]
    },

    {
        id: 1,
        username: "Ivan Horvat",
        email: "ivan.horvat@example.com",
        trenutniSplit_id: 2,
        slobodni_dani: ["nedjelja", "utorak"],
        user_splitovi: [1, 2],     
        custom_vjezbe: [8, 9]      
    },

    {
        id: 2,
        username: "Ana Kovač",
        email: "ana.kovac@example.com",
        trenutniSplit_id: 6,
        slobodni_dani: ["petak"],
        user_splitovi: [3, 6, 7],  
        custom_vjezbe: [2, 10, 11] 
    }
]

export const user_splits=[
    {
        id: 0,
        naziv: 'Upper-Lower',
        broj_dana: 4,
        opis: "Podjela splita na gornje i donje mišiće, gdje se mišići 'udaraju' dvaput tjedno",
        dani:[
            {
                dan: 1,
                nativ: 'Upper 1',
                vjezbe: [
                    {
                        id: 1,
                        broj_setova: 3
                    },
                    {
                        id: 5,
                        broj_setova: 3
                    },
                    {
                        id: 0,
                        broj_setova: 3
                    }
                ]
            },
            {
                dan: 2,
                nativ: 'Lower 1',
                vjezbe: [
                    {
                        id: 6,
                        broj_setova: 3
                    },
                    {
                        id: 7,
                        broj_setova: 3
                    },
                    {
                        id: 4,
                        broj_setova: 3
                    }
                ]
            },
            {
                dan: 3,
                nativ: 'Upper 2',
                vjezbe: [
                    {
                        id: 1,
                        broj_setova: 3
                    },
                    {
                        id: 4,
                        broj_setova: 3
                    },
                    {
                        id: 0,
                        broj_setova: 3
                    }
                ]
            },
            {
                dan: 4,
                nativ: 'Lower 2',
                vjezbe: [
                    {
                        id: 10,
                        broj_setova: 3
                    },
                    {
                        id: 9,
                        broj_setova: 3
                    },
                    {
                        id: 7,
                        broj_setova: 3
                    }
                ]
            }
        ],
        kalendar: [
            {
                dan: '2025-11-26',
                split_dan: 1
            },
            {
                dan: '2025-11-27',
                split_dan: 2
            },
            {
                dan: '2025-11-28',
                split_dan: 3
            },
            {
                dan: '2025-11-29',
                split_dan: 4
            },
            {
                dan: '2025-11-30',
                split_dan: null
            },
            {
                dan: '2025-12-01',
                split_dan: 1
            },
            {
                dan: '2025-12-02',
                split_dan: 2
            },
            {
                dan: '2025-12-03',
                split_dan: 3
            },
            {
                dan: '2025-12-04',
                split_dan: 4
            },
            {
                dan: '2025-12-05',
                split_dan: 1
            },
            {
                dan: '2025-12-06',
                split_dan: 2
            },
            {
                dan: '2025-12-07',
                split_dan: null
            },
            {
                dan: '2025-12-08',
                split_dan: 3
            },
            {
                dan: '2025-12-09',
                split_dan: 4
            }
        ]
    },
     {
        id: 1,
        naziv: 'PPL',
        broj_dana: 3,
        opis: "Push–Pull–Legs rutina pogodna za 3–6 dana tjedno, s naglaskom na sve glavne mišićne skupine.",
        dani: [
            {
                dan: 1,
                nativ: 'Push',
                vjezbe: [
                    { id: 0, broj_setova: 4 },  
                    { id: 1, broj_setova: 3 },  
                    { id: 5, broj_setova: 3 }   
                ]
            },
            {
                dan: 2,
                nativ: 'Pull',
                vjezbe: [
                    { id: 7, broj_setova: 4 },  
                    { id: 9, broj_setova: 3 },  
                    { id: 4, broj_setova: 3 }   
                ]
            },
            {
                dan: 3,
                nativ: 'Legs',
                vjezbe: [
                    { id: 6, broj_setova: 4 },  
                    { id: 10, broj_setova: 3 }, 
                    { id: 11, broj_setova: 3 }  
                ]
            }
        ],
        kalendar: [
            { dan: '2025-11-26', split_dan: 1 },
            { dan: '2025-11-27', split_dan: 2 },
            { dan: '2025-11-28', split_dan: 3 },
            { dan: '2025-11-29', split_dan: 1 },
            { dan: '2025-11-30', split_dan: null },
            { dan: '2025-12-01', split_dan: 2 },
            { dan: '2025-12-02', split_dan: 3 },
            { dan: '2025-12-03', split_dan: 1 },
            { dan: '2025-12-04', split_dan: 2 }
        ]
    },
    {
        id: 2,
        naziv: 'Bro Split 5-Day',
        broj_dana: 5,
        opis: "Klasični bro split gdje se svaki dan fokusira na jednu mišićnu skupinu.",
        dani: [
            {
                dan: 1,
                nativ: 'Chest',
                vjezbe: [
                    { id: 0, broj_setova: 4 },
                    { id: 5, broj_setova: 3 },
                    { id: 12, broj_setova: 3 }
                ]
            },
            {
                dan: 2,
                nativ: 'Back',
                vjezbe: [
                    { id: 7, broj_setova: 4 },
                    { id: 9, broj_setova: 3 },
                    { id: 13, broj_setova: 3 }
                ]
            },
            {
                dan: 3,
                nativ: 'Legs',
                vjezbe: [
                    { id: 6, broj_setova: 4 },
                    { id: 10, broj_setova: 3 },
                    { id: 11, broj_setova: 3 }
                ]
            },
            {
                dan: 4,
                nativ: 'Shoulders',
                vjezbe: [
                    { id: 1, broj_setova: 4 },
                    { id: 14, broj_setova: 3 },
                    { id: 15, broj_setova: 3 }
                ]
            },
            {
                dan: 5,
                nativ: 'Arms',
                vjezbe: [
                    { id: 4, broj_setova: 3 },
                    { id: 16, broj_setova: 3 },
                    { id: 17, broj_setova: 3 }
                ]
            }
        ],
        kalendar: [
            { dan: '2025-11-26', split_dan: 1 },
            { dan: '2025-11-27', split_dan: 2 },
            { dan: '2025-11-28', split_dan: 3 },
            { dan: '2025-11-29', split_dan: 4 },
            { dan: '2025-11-30', split_dan: 5 },
            { dan: '2025-12-01', split_dan: null },
            { dan: '2025-12-02', split_dan: 1 },
            { dan: '2025-12-03', split_dan: 2 },
            { dan: '2025-12-04', split_dan: 3 },
            { dan: '2025-12-05', split_dan: 4 }
        ]
    }
]

export const vjezbe=[
    {
        id: 0,
        opis: "Kontrolirano spuštanje utega s blagim pregibom koljena, fokus na istezanju zadnje lože i podizanju kukova prema naprijed.",
        glavni_misic: "Hamstring (Stražnja loža)",
        naziv: "Rumunjsko mrtvo dizanje (RDL)",
        ostali_misici: [
            "Gluteus (Stražnjica)",
            "Donja leđa (Erector spinae)"
        ]
    },
    {
        id: 1,
        opis: "Podizanje tijela iz visećeg položaja do razine brade povlačenjem iz leđa. Može se izvoditi s različitim hvatovima.",
        glavni_misic: "Latissimus dorsi (Široki leđni)",
        naziv: "Zgibovi",
        ostali_misici: [
            "Biceps",
            "Trapezius",
            "Podlaktice"
        ]
    },
    {
        id: 2,
        opis: "Potisak šipke iznad glave iz stojećeg položaja, aktivirajući ramena i stabilizatore trupa.",
        glavni_misic: "Deltoideus (Ramena)",
        naziv: "Overhead press – vojnički potisak",
        ostali_misici: [
            "Triceps",
            "Gornja prsa",
            "Stabilizatori jezgre"
        ]
    }
]

export const splits=[
    {
        id: 0,
        naziv: "Full Body 3x",
        broj_dana: 3,
        opis: "Trening cijelog tijela tri puta tjedno, idealno za početnike ili povratnike.",
        dani: [
            {
                dan: 1,
                nativ: "Full Body A",
                vjezbe: [
                    { id: 0, broj_setova: 3 },
                    { id: 7, broj_setova: 3 },
                    { id: 6, broj_setova: 3 }
                ]
            },
            {
                dan: 2,
                nativ: "Full Body B",
                vjezbe: [
                    { id: 1, broj_setova: 3 },
                    { id: 9, broj_setova: 3 },
                    { id: 10, broj_setova: 3 }
                ]
            },
            {
                dan: 3,
                nativ: "Full Body C",
                vjezbe: [
                    { id: 5, broj_setova: 3 },
                    { id: 4, broj_setova: 3 },
                    { id: 11, broj_setova: 3 }
                ]
            }
        ],
        kalendar: [
            { dan: "2025-01-01", split_dan: null },
            { dan: "2025-01-02", split_dan: null },
            { dan: "2025-01-03", split_dan: null }
        ]
    },
    {
        id: 1,
        naziv: "Push Pull 4x",
        broj_dana: 4,
        opis: "Jednostavna podjela na potisne i povlačne mišiće, trenirano dvaput tjedno.",
        dani: [
            {
                dan: 1,
                nativ: "Push 1",
                vjezbe: [
                    { id: 0, broj_setova: 4 },
                    { id: 1, broj_setova: 3 },
                    { id: 5, broj_setova: 3 }
                ]
            },
            {
                dan: 2,
                nativ: "Pull 1",
                vjezbe: [
                    { id: 7, broj_setova: 4 },
                    { id: 9, broj_setova: 3 },
                    { id: 4, broj_setova: 3 }
                ]
            },
            {
                dan: 3,
                nativ: "Push 2",
                vjezbe: [
                    { id: 0, broj_setova: 3 },
                    { id: 14, broj_setova: 3 },
                    { id: 15, broj_setova: 3 }
                ]
            },
            {
                dan: 4,
                nativ: "Pull 2",
                vjezbe: [
                    { id: 7, broj_setova: 3 },
                    { id: 13, broj_setova: 3 },
                    { id: 4, broj_setova: 3 }
                ]
            }
        ],
        kalendar: [
            { dan: "2025-02-01", split_dan: null },
            { dan: "2025-02-02", split_dan: null },
            { dan: "2025-02-03", split_dan: null },
            { dan: "2025-02-04", split_dan: null }
        ]
    },
    {
        id: 2,
        naziv: "Upper Lower 2x",
        broj_dana: 2,
        opis: "Minimalistički split za zauzete osobe – dva treninga tjedno, jedan za gornji i jedan za donji dio tijela.",
        dani: [
            {
                dan: 1,
                nativ: "Upper",
                vjezbe: [
                    { id: 0, broj_setova: 4 },
                    { id: 1, broj_setova: 3 },
                    { id: 7, broj_setova: 3 }
                ]
            },
            {
                dan: 2,
                nativ: "Lower",
                vjezbe: [
                    { id: 6, broj_setova: 4 },
                    { id: 10, broj_setova: 3 },
                    { id: 11, broj_setova: 3 }
                ]
            }
        ],
        kalendar: [
            { dan: "2025-03-01", split_dan: null },
            { dan: "2025-03-02", split_dan: null }
        ]
    }
]

export const custom_vjezbe=[
    {
        id: 0,
        id_usera: 3,
        naziv: "Incline bench bučicama (spor tempo)",
        opis: "Potisak bučicama na kosoj klupi uz sporije ekscentrično spuštanje (3 sekunde).",
        glavni_misic: "Prsa (gornji dio)",
        ostali_misici: ["Prednja ramena", "Triceps"]
    },
    {
        id: 1,
        id_usera: 1,
        naziv: "Hip thrust s pauzom",
        opis: "Podizanje kukova s pauzom od 2 sekunde na vrhu pokreta za bolje aktiviranje gluteusa.",
        glavni_misic: "Gluteus",
        ostali_misici: ["Hamstrings", "Donja leđa"]
    },
    {
        id: 2,
        id_usera: 1,
        naziv: "Zgibovi s elastičnom trakom",
        opis: "Pomoćna traka omogućava pravilniji i dublji zgib uz manji otpor.",
        glavni_misic: "Latissimus (široki leđni)",
        ostali_misici: ["Biceps", "Srednja leđa"]
    }
]

