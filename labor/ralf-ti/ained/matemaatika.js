// Matemaatika lessons for Ralf TI, based on the school curriculum.
export default {
  id: 'matemaatika',
  nimi: 'Matemaatika',
  emoji: '🔢',
  klassid: {
    '1': [
      {
        nimi: 'Arvud 0–100',
        emoji: '🔢',
        sonad: ['arvud', 'loendamine', 'võrdlemine', 'vordlemine', 'kümneline', 'kumneline', 'üheline', 'uheline', 'paarisarv'],
        video: [
          ['🍎', 'Loeme õunu: üks, kaks, kolm – kokku on 3 õuna.'],
          ['🔢', 'Arvu kirjutame numbritega 0, 1, 2 kuni 9.'],
          ['🔟', 'Arvus 34 on 3 kümnelist ja 4 ühelist.'],
          ['🐊', 'Märk > tähendab „suurem kui“: 7 > 5.'],
          ['⚖️', 'Märk = tähendab, et arvud on võrdsed: 6 = 6.'],
          ['✅', 'Nüüd oskad arve järjestada väiksemast suuremani.']
        ],
        kaardid: [
          ['Mitu kümnelist on arvus 52?', '5 kümnelist.'],
          ['Kumb on suurem, 19 või 91?', '91 on suurem.'],
          ['Milline märk sobib: 8 … 3?', '8 > 3'],
          ['Mis arv tuleb pärast arvu 39?', '40'],
          ['Mis on järgarv?', 'Arv, mis näitab järjekorda: esimene, teine, kolmas.']
        ],
        tekst: [
          'Arv näitab, mitu asja on. Arvu kirjutame numbrite abil. Numbreid on kümme: 0, 1, 2, 3, 4, 5, 6, 7, 8 ja 9.',
          'Kahekohalises arvus on kümnelised ja ühelised. Arvus 47 on 4 kümnelist ja 7 ühelist.',
          'Arve võrdleme märkidega >, < ja =. Märgi terav ots näitab alati väiksema arvu poole.',
          'Paarisarvud on 2, 4, 6, 8 ja 10. Paaritud arvud on 1, 3, 5, 7 ja 9.'
        ]
      },
      {
        nimi: 'Liitmine ja lahutamine 20 piires',
        emoji: '➕',
        sonad: ['liitmine', 'lahutamine', 'summa', 'vahe', 'liidetav', 'vähendatav', 'vahendatav'],
        video: [
          ['🍎', 'Sul on 8 õuna ja sõber annab veel 5.'],
          ['➕', 'Liidame: 8 + 5 = 13.'],
          ['🔟', 'Nipp: 8 + 2 = 10 ja veel 3 teeb kokku 13.'],
          ['➖', 'Sööd 4 õuna ära. Lahutame: 13 − 4 = 9.'],
          ['✅', 'Liitmine lisab juurde, lahutamine võtab ära.']
        ],
        kaardid: [
          ['Kuidas nimetatakse liitmise vastust?', 'Summa.'],
          ['Kuidas nimetatakse lahutamise vastust?', 'Vahe.'],
          ['9 + 6 = ?', '15'],
          ['15 − 7 = ?', '8'],
          ['Kas 3 + 5 ja 5 + 3 annavad sama vastuse?', 'Jah, liidetavaid võib vahetada.']
        ],
        tekst: [
          'Liitmisel paneme arvud kokku. Arvud, mida liidame, on liidetavad. Vastus on summa.',
          'Lahutamisel võtame ühest arvust teise ära. Vastus on vahe. Näiteks 12 − 5 = 7.',
          'Kui liidad üle kümne, täida enne kümme. 7 + 6: kõigepealt 7 + 3 = 10, siis 10 + 3 = 13.',
          'Võrduses võib olla täht. Kui a + 4 = 9, siis a = 5, sest 5 + 4 = 9.'
        ]
      },
      {
        nimi: 'Mõõtmine: pikkus, mass ja aeg',
        emoji: '📏',
        sonad: ['mõõtmine', 'mootmine', 'sentimeeter', 'meeter', 'kilogramm', 'liiter', 'kell', 'kalender'],
        video: [
          ['📏', 'Joonlauaga mõõdame pikkust sentimeetrites.'],
          ['🚪', 'Uks on umbes 2 meetrit kõrge.'],
          ['🍞', 'Leiva massi mõõdame grammides või kilogrammides.'],
          ['🥛', 'Piima kogust mõõdame liitrites.'],
          ['🕐', 'Kell näitab tunde ja minuteid.'],
          ['📅', 'Nädalas on 7 päeva ja aastas 12 kuud.']
        ],
        kaardid: [
          ['Mitu sentimeetrit on 1 meeter?', '100 cm.'],
          ['Mis ühikuga mõõdame massi?', 'Grammi (g) või kilogrammiga (kg).'],
          ['Mitu minutit on ühes tunnis?', '60 minutit.'],
          ['Mitu päeva on nädalas?', '7 päeva.'],
          ['Mitu senti on üks euro?', '100 senti.']
        ],
        tekst: [
          'Mõõtühik näitab, millega me mõõdame. Pikkust mõõdame sentimeetrites (cm) ja meetrites (m).',
          'Massi mõõdame grammides (g) ja kilogrammides (kg). Vedelikku mõõdame liitrites (l).',
          'Aega mõõdame sekundites, minutites ja tundides. Ööpäevas on 24 tundi. Kalendrist leiad nädalad ja kuud.',
          'Temperatuuri mõõdame kraadides. Raha arvestame eurodes ja sentides.'
        ]
      },
      {
        nimi: 'Geomeetrilised kujundid',
        emoji: '🔺',
        sonad: ['kujundid', 'kolmnurk', 'ristkülik', 'ristkulik', 'ruut', 'ring', 'kuup', 'kera'],
        video: [
          ['🔺', 'Kolmnurgal on 3 tippu ja 3 külge.'],
          ['🟥', 'Ruudul on 4 võrdset külge.'],
          ['📱', 'Ristkülikul on vastasküljed ühepikkused.'],
          ['⚽', 'Pall on kera – see veereb igas suunas.'],
          ['🎲', 'Täring on kuup – tal on 6 tahku.'],
          ['✅', 'Kujundeid leiad kõikjalt enda ümbert.']
        ],
        kaardid: [
          ['Mitu külge on kolmnurgal?', '3 külge.'],
          ['Mis kujund on pall?', 'Kera.'],
          ['Mitu tahku on kuubil?', '6 tahku.'],
          ['Mille poolest erineb ruut ristkülikust?', 'Ruudu kõik 4 külge on võrdsed.'],
          ['Mis on lõik?', 'Sirgjoone tükk, millel on kaks otspunkti.']
        ],
        tekst: [
          'Tasandilised kujundid on lamedad: kolmnurk, nelinurk, ruut, ristkülik ja ring.',
          'Ruumilised kujundid on nagu päris esemed: kera, kuup, risttahukas, püramiid ja silinder.',
          'Ruumilisel kujundil on tahud, servad ja tipud. Kuubil on 6 tahku, 12 serva ja 8 tippu.',
          'Joonlaua abil saad joonestada lõigu. Näiteks lõik pikkusega 5 cm.'
        ]
      }
    ],
    '2': [
      {
        nimi: 'Arvud 0–1000',
        emoji: '💯',
        sonad: ['arvud', 'sajaline', 'kümneline', 'kumneline', 'järgud', 'jargud', 'arvkiir'],
        video: [
          ['💯', 'Sada on kümme kümnelist.'],
          ['🏠', 'Arvus 352 on 3 sajalist, 5 kümnelist ja 2 ühelist.'],
          ['➕', 'Selle saab kirjutada nii: 352 = 300 + 50 + 2.'],
          ['📏', 'Arvkiirel on arvud järjest nagu joonlaual.'],
          ['✅', 'Mida paremal arvkiirel, seda suurem arv.']
        ],
        kaardid: [
          ['Mitu sajalist on arvus 708?', '7 sajalist.'],
          ['Kirjuta 46 kümneliste ja üheliste summana.', '46 = 40 + 6'],
          ['Kumb on suurem, 599 või 601?', '601'],
          ['Mitu kümnelist on sajas?', '10 kümnelist.']
        ],
        tekst: [
          'Kolmekohalises arvus on kolm järku: sajalised, kümnelised ja ühelised.',
          'Arvu saab kirjutada järkarvude summana. Näiteks 625 = 600 + 20 + 5.',
          'Arvkiir on joon, millel arvud on kindlas järjekorras. Paremal pool on suuremad arvud.',
          'Arve võrdleme alates kõrgeimast järgust. 431 > 413, sest kümnelisi on rohkem.'
        ]
      },
      {
        nimi: 'Liitmine ja lahutamine 100 piires',
        emoji: '🧮',
        sonad: ['liitmine', 'lahutamine', 'avaldis', 'summa', 'vahe', 'tundmatu'],
        video: [
          ['🧮', 'Liidame 36 + 27.'],
          ['🔟', 'Kümnelised: 30 + 20 = 50.'],
          ['1️⃣', 'Ühelised: 6 + 7 = 13.'],
          ['➕', 'Kokku 50 + 13 = 63.'],
          ['🔄', 'Kontroll lahutamisega: 63 − 27 = 36.']
        ],
        kaardid: [
          ['45 + 38 = ?', '83'],
          ['70 − 24 = ?', '46'],
          ['300 + 400 = ?', '700'],
          ['Mis on avaldis?', 'Arvude ja tehtemärkide kogum, näiteks 5 + 3 − 2.'],
          ['Kuidas leida x, kui x + 20 = 50?', 'Lahuta: 50 − 20 = 30, seega x = 30.']
        ],
        tekst: [
          'Kahekohalisi arve liites liida eraldi kümnelised ja ühelised. Siis pane tulemused kokku.',
          'Lahutamise vastust saad kontrollida liitmisega. Kui 50 − 18 = 32, siis 32 + 18 = 50.',
          'Täissadu on lihtne liita: 200 + 500 = 700, sest 2 + 5 = 7.',
          'Kui avaldises on ainult liitmine ja lahutamine, arvutame vasakult paremale.'
        ]
      },
      {
        nimi: 'Korrutamine ja jagamine',
        emoji: '✖️',
        sonad: ['korrutamine', 'jagamine', 'korrutustabel', 'tegur', 'korrutis', 'jagatis'],
        video: [
          ['🍪', 'Kolmel taldrikul on igaühel 4 küpsist.'],
          ['➕', 'Liidame: 4 + 4 + 4 = 12.'],
          ['✖️', 'Lühemalt: 3 · 4 = 12. See on korrutamine.'],
          ['➗', 'Jagame 12 küpsist 3 lapsele: 12 : 3 = 4.'],
          ['🔄', 'Jagamine on korrutamise pöördtehe.']
        ],
        kaardid: [
          ['Kuidas nimetatakse korrutamise vastust?', 'Korrutis.'],
          ['5 · 4 = ?', '20'],
          ['15 : 3 = ?', '5'],
          ['Kuidas kontrollida, et 20 : 4 = 5?', 'Korruta: 5 · 4 = 20.'],
          ['Mida tähendab 2 · 3?', 'Kaks võetakse kolm korda: 2 + 2 + 2.']
        ],
        tekst: [
          'Korrutamine on võrdsete arvude liitmine. 5 + 5 + 5 = 3 · 5 = 15.',
          'Korrutatavaid arve nimetatakse teguriteks. Vastus on korrutis.',
          'Jagamisel jaotame asjad võrdselt. Jagatav jagatakse jagajaga ja vastus on jagatis.',
          'Teises klassis õpime selgeks 2, 3, 4 ja 5 korrutustabeli.'
        ]
      },
      {
        nimi: 'Pikkus, mass ja aeg',
        emoji: '⏰',
        sonad: ['mõõtühik', 'mootuhik', 'millimeeter', 'detsimeeter', 'kilomeeter', 'tonn', 'sajand'],
        video: [
          ['🐜', 'Sipelgas on vaid mõne millimeetri pikkune.'],
          ['📏', '1 cm = 10 mm ja 1 dm = 10 cm.'],
          ['🚗', 'Linnade vahelist teed mõõdame kilomeetrites.'],
          ['🐘', 'Elevandi massi mõõdame tonnides.'],
          ['⏳', 'Sada aastat on üks sajand.']
        ],
        kaardid: [
          ['Mitu millimeetrit on 1 sentimeetris?', '10 mm.'],
          ['Mitu meetrit on 1 kilomeetris?', '1000 m.'],
          ['Mitu kilogrammi on 1 tonnis?', '1000 kg.'],
          ['Mitu aastat on sajandis?', '100 aastat.'],
          ['Mitu tundi on ööpäevas?', '24 tundi.']
        ],
        tekst: [
          'Pikkusühikud väiksemast suuremani: millimeeter, sentimeeter, detsimeeter, meeter ja kilomeeter.',
          'Massiühikud on gramm, kilogramm ja tonn. 1 kg = 1000 g ja 1 t = 1000 kg.',
          'Ajaühikud on sekund, minut, tund, ööpäev, nädal, kuu, aasta ja sajand.',
          'Nimega arv on arv koos ühikuga, näiteks 5 cm või 3 kg. Liita saab ainult sama ühikuga arve.'
        ]
      },
      {
        nimi: 'Tasandilised ja ruumilised kujundid',
        emoji: '🧊',
        sonad: ['kujundid', 'täisnurk', 'taisnurk', 'silinder', 'koonus', 'püramiid', 'puramiid'],
        video: [
          ['📐', 'Täisnurk on nagu raamatu nurk.'],
          ['🟦', 'Ristkülikul ja ruudul on 4 täisnurka.'],
          ['🥫', 'Konservikarp on silindri kujuline.'],
          ['🍦', 'Jäätisetuutu on koonuse kujuline.'],
          ['🔺', 'Püramiidil on tipp ja kolmnurksed küljetahud.']
        ],
        kaardid: [
          ['Mitu täisnurka on ristkülikul?', '4 täisnurka.'],
          ['Mis kujundi moodi on jäätisetuutu?', 'Koonuse moodi.'],
          ['Mis on tahk?', 'Ruumilise kujundi lame külg.'],
          ['Mis on serv?', 'Joon, kus kaks tahku kokku saavad.']
        ],
        tekst: [
          'Tasandilistel kujunditel on tipud, küljed ja nurgad. Täisnurga saad kontrollida nurklauaga.',
          'Ruumilised kujundid on kera, kuup, risttahukas, püramiid, silinder ja koonus.',
          'Silindril ja koonusel on ümmargune põhi. Kera on igast küljest ümmargune.',
          'Kujundeid saab rühmitada, näiteks need, mis veerevad, ja need, mis ei veere.'
        ]
      }
    ],
    '3': [
      {
        nimi: 'Arvud 10 000 piires ja Rooma numbrid',
        emoji: '🏛️',
        sonad: ['tuhandeline', 'arvud', 'rooma numbrid', 'järkarv', 'jarkarv', 'järguühik', 'jarguuhik'],
        video: [
          ['🔢', 'Arvus 4 237 on 4 tuhandelist, 2 sajalist, 3 kümnelist ja 7 ühelist.'],
          ['➕', 'Järkarvude summana: 4000 + 200 + 30 + 7.'],
          ['🏛️', 'Vanad roomlased kasutasid tähti: I, V, X, L, C, D, M.'],
          ['🕰️', 'Rooma numbreid näeb kellal: XII tähendab 12.'],
          ['✅', 'IV on 4, sest väiksem number ees tähendab lahutamist.']
        ],
        kaardid: [
          ['Mitu tuhandelist on arvus 7 015?', '7 tuhandelist.'],
          ['Mis arv on X?', '10'],
          ['Mis arv on IX?', '9'],
          ['Kirjuta Rooma numbritega 15.', 'XV'],
          ['Mis arv on C?', '100']
        ],
        tekst: [
          'Neljakohalises arvus on neli järku: tuhandelised, sajalised, kümnelised ja ühelised.',
          'Me kasutame kümnendsüsteemi: kümme ühikut teevad ühe järgmise järgu ühiku.',
          'Rooma numbrid: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000.',
          'Kui väiksem number on suurema järel, siis liidame (VI = 6). Kui ees, siis lahutame (IV = 4).'
        ]
      },
      {
        nimi: 'Kirjalik liitmine ja lahutamine',
        emoji: '✏️',
        sonad: ['kirjalik', 'liitmine', 'lahutamine', 'üleminek', 'uleminek', 'tulp'],
        video: [
          ['✏️', 'Kirjuta arvud üksteise alla: ühelised üheliste alla.'],
          ['1️⃣', 'Alusta paremalt, üheliste järgust.'],
          ['🔟', 'Kui saad 10 või rohkem, kanna üks edasi järgmisse järku.'],
          ['➖', 'Lahutades võta vajadusel üks laenuks järgmisest järgust.'],
          ['🔄', 'Kontrolli vastust pöördtehtega.']
        ],
        kaardid: [
          ['Millisest järgust alustatakse kirjalikku liitmist?', 'Ühelistest ehk paremalt.'],
          ['2 458 + 1 375 = ?', '3 833'],
          ['5 000 − 1 250 = ?', '3 750'],
          ['Kuidas kontrollida lahutamist?', 'Liida vahe ja vähendaja – peab tulema vähendatav.']
        ],
        tekst: [
          'Suuri arve on mugav liita ja lahutada kirjalikult, üksteise all.',
          'Jälgi, et sama järgu numbrid oleksid täpselt üksteise all.',
          'Liitmisel kantakse ülejääv kümme järgmisse järku. Lahutamisel võetakse puudu jäädes laenuks.',
          'Hinda alati, kas vastus on mõistlik. 2 900 + 3 100 peab olema umbes 6 000.'
        ]
      },
      {
        nimi: 'Korrutustabel ja tehete järjekord',
        emoji: '🧮',
        sonad: ['korrutustabel', 'tehete järjekord', 'tehete jarjekord', 'sulud', 'jagamine'],
        video: [
          ['✖️', 'Korrutustabel aitab arvutada kiiresti: 7 · 8 = 56.'],
          ['🥇', 'Kõigepealt arvutame sulgudes.'],
          ['🥈', 'Siis korrutame ja jagame.'],
          ['🥉', 'Lõpuks liidame ja lahutame.'],
          ['🧮', '2 + 3 · 4 = 2 + 12 = 14.']
        ],
        kaardid: [
          ['6 · 7 = ?', '42'],
          ['Mis tuleb enne, liitmine või korrutamine?', 'Korrutamine.'],
          ['(2 + 3) · 4 = ?', '20'],
          ['Mis on 9 · 0?', '0 – nulliga korrutades tuleb alati 0.'],
          ['Kas nulliga saab jagada?', 'Ei saa.']
        ],
        tekst: [
          'Kolmandas klassis õpime selgeks kogu korrutustabeli kuni 10 · 10.',
          'Tehete järjekord: sulud, siis korrutamine ja jagamine, siis liitmine ja lahutamine.',
          'Summat saab korrutada nii: (3 + 4) · 5 = 3 · 5 + 4 · 5 = 35.',
          'Arv 0 on eriline. 0 + 5 = 5, 5 · 0 = 0 ja 0 : 5 = 0. Nulliga jagada ei tohi.'
        ]
      },
      {
        nimi: 'Murrud: pool, kolmandik, veerand',
        emoji: '🍕',
        sonad: ['murd', 'murrud', 'pool', 'veerand', 'kolmandik', 'viiendik', 'lugeja', 'nimetaja'],
        video: [
          ['🍕', 'Lõikame pitsa kaheks võrdseks osaks – iga tükk on pool ehk 1/2.'],
          ['🍰', 'Neljast võrdsest tükist üks on veerand ehk 1/4.'],
          ['🔢', 'Murru alumine arv on nimetaja, ülemine on lugeja.'],
          ['🍬', '1/4 kaheteistkümnest kommist on 12 : 4 = 3 kommi.'],
          ['✅', 'Murd näitab osa tervikust.']
        ],
        kaardid: [
          ['Mida näitab murru nimetaja?', 'Mitmeks võrdseks osaks tervik jagati.'],
          ['Leia 1/2 arvust 18.', '9'],
          ['Leia 1/5 arvust 25.', '5'],
          ['Kumb on suurem, 1/3 või 1/4?', '1/3 – mida vähem osi, seda suurem tükk.'],
          ['Kuidas loetakse 1/3?', 'Üks kolmandik.']
        ],
        tekst: [
          'Murd näitab osa tervikust. Tervik jagatakse võrdseteks osadeks.',
          'Murrus 1/4 on 1 lugeja ja 4 nimetaja. See tähendab üht osa neljast.',
          'Arvust osa leidmiseks jaga arv nimetajaga. 1/3 arvust 15 on 15 : 3 = 5.',
          'Murd võib olla osa kujundist, näiteks pool ruudust, või osa hulgast, näiteks veerand õuntest.'
        ]
      },
      {
        nimi: 'Hulknurga ümbermõõt',
        emoji: '📐',
        sonad: ['ümbermõõt', 'umbermoot', 'hulknurk', 'murdjoon', 'ringjoon', 'raadius'],
        video: [
          ['🐜', 'Sipelgas käib ümber aia. Kogu tee pikkus on ümbermõõt.'],
          ['📐', 'Ümbermõõdu leiame, kui liidame kõik küljed.'],
          ['🔺', 'Kolmnurga küljed on 3 cm, 4 cm ja 5 cm: P = 12 cm.'],
          ['🟥', 'Ruudu külg on 6 cm: P = 4 · 6 = 24 cm.'],
          ['⭕', 'Ringjoone joonestame sirkliga, raadius on kaugus keskpunktist.']
        ],
        kaardid: [
          ['Mis tähega tähistatakse ümbermõõtu?', 'P'],
          ['Ristküliku küljed on 5 cm ja 2 cm. Leia P.', '14 cm'],
          ['Mis on hulknurk?', 'Kinnise murdjoonega piiratud kujund, nt kolmnurk või viisnurk.'],
          ['Kuidas leida murdjoone pikkust?', 'Liida kõigi lõikude pikkused.']
        ],
        tekst: [
          'Hulknurk on kujund, mida piirab kinnine murdjoon. Kolmnurk, nelinurk, viisnurk ja kuusnurk on hulknurgad.',
          'Ümbermõõt on kõigi külgede pikkuste summa. Selle tähis on P.',
          'Ruudul on neli võrdset külge, seega P = 4 · külg.',
          'Ringjoon joonestatakse sirkliga. Kõik ringjoone punktid on keskpunktist sama kaugel.'
        ]
      }
    ],
    '4': [
      {
        nimi: 'Arvud miljonini',
        emoji: '🏙️',
        sonad: ['miljon', 'naturaalarv', 'arvtelg', 'järguühik', 'jarguuhik', 'kümnendsüsteem', 'kumnendsusteem'],
        video: [
          ['🏙️', 'Tallinnas elab üle 400 000 inimese.'],
          ['🔢', 'Miljon on 1 000 000 – tuhat tuhandet.'],
          ['📊', 'Suure arvu kirjutame kolmekaupa: 345 678.'],
          ['➕', '345 678 = 300 000 + 40 000 + 5 000 + 600 + 70 + 8.'],
          ['📏', 'Arvteljel saab näidata ka suuri arve.']
        ],
        kaardid: [
          ['Mitu nulli on miljonis?', '6 nulli.'],
          ['Mis arv on 99 999 järel?', '100 000'],
          ['Mis vahe on arvul ja numbril?', 'Number on märk (0–9), arv näitab hulka.'],
          ['Kumb on suurem, 120 300 või 102 300?', '120 300']
        ],
        tekst: [
          'Naturaalarvud on loendamisel saadavad arvud: 1, 2, 3 ja nii edasi.',
          'Suures arvus jätame iga kolme järgu järel väikese vahe. Nii on seda lihtsam lugeda.',
          'Arvu võib kirjutada järkarvude summana või järguühikute kordsete summana: 3 · 1000 + 5 · 10 = 3 050.',
          'Arvteljel on igal arvul oma koht. Eelnev arv on vasakul, järgnev paremal.'
        ]
      },
      {
        nimi: 'Korrutamine ja jagamine jäägiga',
        emoji: '➗',
        sonad: ['jagamine', 'jääk', 'jäägiga', 'jaagiga', 'korrutamine', 'jaguvus'],
        video: [
          ['🍬', 'Jagame 17 kommi 5 lapsele.'],
          ['👧', 'Iga laps saab 3 kommi, sest 3 · 5 = 15.'],
          ['🍭', 'Üle jääb 2 kommi – see on jääk.'],
          ['✍️', 'Kirjutame: 17 : 5 = 3 (jääk 2).'],
          ['✅', 'Jääk on alati väiksem kui jagaja.']
        ],
        kaardid: [
          ['23 : 4 = ?', '5, jääk 3'],
          ['Mida tähendab, et 12 jagub 3-ga?', 'Jagamisel ei jää jääki.'],
          ['400 : 10 = ?', '40'],
          ['Kuidas kontrollida jäägiga jagamist?', 'Korruta jagatis jagajaga ja liida jääk.'],
          ['25 · 4 = ?', '100']
        ],
        tekst: [
          'Jagamisel on kaks tähendust: jaotamine võrdseteks osadeks ja mahutamine.',
          'Kui jagamine ei lähe täpselt välja, jääb jääk. Jääk peab olema jagajast väiksem.',
          'Nullidega lõppevat arvu jagame kümnega, ära võttes ühe nulli: 3 500 : 10 = 350.',
          'Korrutamisel võib tegureid vahetada ja rühmitada: 25 · 7 · 4 = 25 · 4 · 7 = 700.'
        ]
      },
      {
        nimi: 'Harilik murd',
        emoji: '🥧',
        sonad: ['harilik murd', 'murd', 'lugeja', 'nimetaja', 'tervik', 'kolmveerand'],
        video: [
          ['🥧', 'Pirukas on lõigatud 8 võrdseks tükiks.'],
          ['🍴', 'Sõid 3 tükki – see on 3/8 pirukast.'],
          ['🔢', 'Lugeja 3 näitab võetud osi, nimetaja 8 kõiki osi.'],
          ['🧮', '3/4 arvust 20: 20 : 4 = 5 ja 5 · 3 = 15.'],
          ['🕒', 'Veerand tundi on 15 minutit.']
        ],
        kaardid: [
          ['Leia 2/3 arvust 12.', '8'],
          ['Mitu minutit on kolmveerand tundi?', '45 minutit.'],
          ['Millal on murd võrdne 1-ga?', 'Kui lugeja ja nimetaja on võrdsed, nt 5/5.'],
          ['1/4 tervikust on 6. Kui suur on tervik?', '24'],
          ['Kumb on suurem, 3/7 või 5/7?', '5/7']
        ],
        tekst: [
          'Harilik murd näitab, mitu võrdset osa tervikust on võetud. Kriipsu all on nimetaja, peal lugeja.',
          'Osa leidmiseks jaga arv nimetajaga ja korruta lugejaga.',
          'Terviku leidmiseks tee vastupidi. Kui 1/5 on 4, siis tervik on 4 · 5 = 20.',
          'Sama nimetajaga murdudest on suurem see, millel on suurem lugeja.'
        ]
      },
      {
        nimi: 'Kiirus, teepikkus ja aeg',
        emoji: '🚲',
        sonad: ['kiirus', 'teepikkus', 'liikumine', 'ajaühik', 'ajauhik', 'kilomeetrit tunnis'],
        video: [
          ['🚲', 'Jalgrattur sõidab 15 km tunnis – see on kiirus 15 km/h.'],
          ['⏱️', 'Kui sõita 2 tundi, läbitakse 2 · 15 = 30 km.'],
          ['🛣️', 'Teepikkus = kiirus · aeg.'],
          ['⌛', 'Aeg = teepikkus : kiirus.'],
          ['✅', 'Kiirus näitab, kui pika tee läbid ühes ajaühikus.']
        ],
        kaardid: [
          ['Auto sõidab 60 km/h. Kui kaugele jõuab 3 tunniga?', '180 km.'],
          ['Kuidas leida aega?', 'Jaga teepikkus kiirusega.'],
          ['Mitu sekundit on minutis?', '60 sekundit.'],
          ['Mida tähendab 5 m/s?', 'Iga sekundiga läbitakse 5 meetrit.']
        ],
        tekst: [
          'Kiirus näitab, kui pika tee keha ühe ajaühiku jooksul läbib. Ühikud on km/h, m/min ja m/s.',
          'Teepikkuse leiame, kui korrutame kiiruse ajaga. Aja leiame, kui jagame teepikkuse kiirusega.',
          'Ajaühikuid teisendades pea meeles: 1 h = 60 min, 1 min = 60 s, 1 ööpäev = 24 h.',
          'Temperatuurigraafikul ja liikumise graafikul näed, kuidas suurus aja jooksul muutub.'
        ]
      },
      {
        nimi: 'Ristküliku ja ruudu ümbermõõt ning pindala',
        emoji: '🟩',
        sonad: ['pindala', 'ümbermõõt', 'umbermoot', 'ristkülik', 'ristkulik', 'ruutmeeter', 'hektar'],
        video: [
          ['🟩', 'Ristküliku küljed on 5 cm ja 3 cm.'],
          ['📐', 'Ümbermõõt: P = 2 · (5 + 3) = 16 cm.'],
          ['🔲', 'Pindala näitab, mitu ühikruutu mahub kujundi sisse.'],
          ['✖️', 'Pindala: S = 5 · 3 = 15 cm².'],
          ['🌾', 'Põllu pindala mõõdetakse hektarites.']
        ],
        kaardid: [
          ['Mis tähega tähistatakse pindala?', 'S'],
          ['Ruudu külg on 7 cm. Leia pindala.', '49 cm²'],
          ['Mitu ruutsentimeetrit on 1 ruutdetsimeetris?', '100 cm²'],
          ['Mitu ruutmeetrit on 1 hektaris?', '10 000 m²'],
          ['Mis on arvu ruut?', 'Arv korrutatud iseendaga, nt 6² = 36.']
        ],
        tekst: [
          'Ümbermõõt on kujundi ümber oleva joone pikkus. Ristkülikul P = 2 · (a + b), ruudul P = 4 · a.',
          'Pindala on kujundi sisemuse suurus. Ristkülikul S = a · b, ruudul S = a · a.',
          'Pindalaühikud on mm², cm², dm², m², ha ja km². Näiteks 1 dm² = 100 cm² ja 1 m² = 100 dm².',
          'Pindvõrdsed kujundid võivad olla eri kujuga, aga nende pindala on sama.'
        ]
      }
    ],
    '5': [
      {
        nimi: 'Arvude jaguvus',
        emoji: '🔍',
        sonad: ['jaguvus', 'algarv', 'kordarv', 'jaguvustunnus', 'tegur', 'kordne'],
        video: [
          ['🔍', 'Arv jagub 2-ga, kui ta lõpeb paarisnumbriga.'],
          ['5️⃣', 'Arv jagub 5-ga, kui ta lõpeb numbriga 0 või 5.'],
          ['➕', 'Arv jagub 3-ga, kui tema numbrite summa jagub 3-ga.'],
          ['💎', 'Algarvul on ainult kaks tegurit: 1 ja arv ise.'],
          ['🧱', '12 = 2 · 2 · 3 – see on algtegurite korrutis.']
        ],
        kaardid: [
          ['Kas 471 jagub 3-ga?', 'Jah, 4 + 7 + 1 = 12 jagub 3-ga.'],
          ['Kas 1 on algarv?', 'Ei, 1 ei ole alg- ega kordarv.'],
          ['Nimeta neli esimest algarvu.', '2, 3, 5, 7'],
          ['Leia SÜT(12, 18).', '6'],
          ['Leia VÜK(4, 6).', '12']
        ],
        tekst: [
          'Arv jagub teisega, kui jagamisel ei jää jääki. Siis on teine arv esimese tegur.',
          'Jaguvustunnused: 10-ga jaguvad nulliga lõppevad arvud, 9-ga need, mille numbrite summa jagub 9-ga.',
          'Algarvul on täpselt kaks tegurit. Kordarvul on rohkem tegureid.',
          'Suurim ühistegur (SÜT) ja vähim ühiskordne (VÜK) aitavad hiljem murdudega arvutada.'
        ]
      },
      {
        nimi: 'Kümnendmurrud',
        emoji: '🔟',
        sonad: ['kümnendmurd', 'kumnendmurd', 'koma', 'ümardamine', 'umardamine', 'kümnendik', 'kumnendik'],
        video: [
          ['🔟', '0,1 on üks kümnendik ehk 1/10.'],
          ['💶', '2,45 € on 2 eurot ja 45 senti.'],
          ['📏', '1,5 m on 1 meeter ja 5 detsimeetrit.'],
          ['🎯', 'Ümardame 3,47 kümnendikeni: 3,5.'],
          ['➕', 'Liitmisel kirjuta koma koma alla: 1,2 + 0,35 = 1,55.']
        ],
        kaardid: [
          ['Kirjuta 3/10 kümnendmurruna.', '0,3'],
          ['Kumb on suurem, 0,5 või 0,45?', '0,5'],
          ['Ümarda 7,862 sajandikeni.', '7,86'],
          ['2,5 · 10 = ?', '25'],
          ['Ümarda 4 582 sadadeni.', '4 600']
        ],
        tekst: [
          'Kümnendmurrus eraldab koma täisosa murdosast. 0,7 on seitse kümnendikku.',
          'Koma järel tulevad kümnendikud, sajandikud ja tuhandikud.',
          'Ümardamisel vaatame järgmist numbrit: kui see on 5 või suurem, suurendame ümardatavat järku ühe võrra.',
          'Liites ja lahutades kirjuta koma koma alla. Kümnega korrutades nihkub koma ühe koha võrra paremale.'
        ]
      },
      {
        nimi: 'Nurgad',
        emoji: '📐',
        sonad: ['nurk', 'nurgad', 'täisnurk', 'teravnurk', 'nürinurk', 'nurinurk', 'malli', 'kraad'],
        video: [
          ['📐', 'Nurka mõõdame kraadides malli abil.'],
          ['✅', 'Täisnurk on 90°.'],
          ['🔪', 'Teravnurk on väiksem kui 90°.'],
          ['🪭', 'Nürinurk on suurem kui 90°, aga väiksem kui 180°.'],
          ['➖', 'Sirgnurk on 180° – see näeb välja nagu sirge joon.']
        ],
        kaardid: [
          ['Mitu kraadi on täisnurk?', '90°'],
          ['Milline nurk on 130°?', 'Nürinurk.'],
          ['Mis on kõrvunurkade summa?', '180°'],
          ['Mis on tippnurkade kohta õige?', 'Nad on võrdsed.'],
          ['Millega nurka mõõdetakse?', 'Malliga.']
        ],
        tekst: [
          'Nurk koosneb tipust ja kahest kiirest ehk haarast. Nurga suurust mõõdame kraadides.',
          'Nurkade liigid: teravnurk (alla 90°), täisnurk (90°), nürinurk (90° ja 180° vahel) ja sirgnurk (180°).',
          'Kui kaks sirget lõikuvad, tekivad kõrvunurgad ja tippnurgad. Kõrvunurkade summa on 180°, tippnurgad on võrdsed.',
          'Ristuvad sirged lõikuvad täisnurga all. Paralleelsed sirged ei lõiku kunagi.'
        ]
      },
      {
        nimi: 'Andmed ja aritmeetiline keskmine',
        emoji: '📊',
        sonad: ['andmed', 'diagramm', 'keskmine', 'aritmeetiline', 'sagedustabel', 'tulpdiagramm'],
        video: [
          ['📝', 'Küsime klassilt lemmikpuuvilja ja kogume andmed.'],
          ['📋', 'Sagedustabelis on kirjas, mitu korda iga vastus esines.'],
          ['📊', 'Tulpdiagrammilt näeb kohe, mis on kõige populaarsem.'],
          ['➗', 'Keskmine: liida arvud kokku ja jaga nende arvuga.'],
          ['🧮', 'Hinnete 4, 5 ja 3 keskmine on 12 : 3 = 4.']
        ],
        kaardid: [
          ['Leia arvude 2, 6 ja 7 keskmine.', '5'],
          ['Mis on sagedus?', 'Mitu korda mingi väärtus andmetes esineb.'],
          ['Milline diagramm sobib muutuse näitamiseks aja jooksul?', 'Joondiagramm.'],
          ['Nimeta kaks andmete kogumise viisi.', 'Mõõtmine ja küsimustik.']
        ],
        tekst: [
          'Andmeid saab koguda mõõtes või küsitledes. Kogutud andmed korrastame tabelisse.',
          'Sagedustabel näitab, mitu korda iga väärtus esineb.',
          'Tulpdiagramm sobib võrdlemiseks, joondiagramm muutuse näitamiseks ja sektordiagramm osade näitamiseks tervikust.',
          'Aritmeetilise keskmise leiad, kui liidad kõik arvud ja jagad summa arvude hulgaga.'
        ]
      },
      {
        nimi: 'Risttahuka pindala ja ruumala',
        emoji: '📦',
        sonad: ['risttahukas', 'ruumala', 'pindala', 'kuup', 'kuupsentimeeter', 'liiter'],
        video: [
          ['📦', 'Karbil on pikkus, laius ja kõrgus.'],
          ['🧊', 'Ruumala näitab, mitu ühikkuupi karpi mahub.'],
          ['✖️', 'Ruumala: V = a · b · c.'],
          ['📐', 'Karp mõõtudega 4 cm, 3 cm ja 2 cm: V = 24 cm³.'],
          ['🥛', '1 liiter on sama palju kui 1 dm³.']
        ],
        kaardid: [
          ['Kuubi serv on 3 cm. Leia ruumala.', '27 cm³'],
          ['Mitu tahku on risttahukal?', '6 tahku.'],
          ['Mitu liitrit on 1 m³?', '1000 liitrit.'],
          ['Kuidas leida risttahuka pindala?', 'Liida kõigi kuue tahu pindalad.'],
          ['Mis on arvu kuup?', 'Arv korrutatud iseendaga kolm korda, nt 2³ = 8.']
        ],
        tekst: [
          'Risttahukal on 6 ristkülikukujulist tahku. Vastastahud on võrdsed.',
          'Pindala leiame, kui liidame kõigi tahkude pindalad: S = 2(ab + ac + bc).',
          'Ruumala näitab keha suurust ruumis. Risttahukal V = a · b · c, kuubil V = a · a · a.',
          'Ruumalaühikud on mm³, cm³, dm³ ja m³. 1 dm³ = 1 l ja 1 m³ = 1000 l.'
        ]
      }
    ],
    '6': [
      {
        nimi: 'Tehted harilike murdudega',
        emoji: '🍰',
        sonad: ['harilik murd', 'taandamine', 'laiendamine', 'segaarv', 'ühine nimetaja', 'uhine nimetaja'],
        video: [
          ['🍰', '2/4 kooki on sama palju kui 1/2 kooki.'],
          ['✂️', 'Taandamisel jagame lugeja ja nimetaja sama arvuga.'],
          ['🔗', 'Liitmiseks too murrud ühisele nimetajale: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.'],
          ['✖️', 'Korrutamisel korrutame lugejad ja nimetajad: 2/3 · 3/5 = 6/15 = 2/5.'],
          ['🔄', 'Jagamisel korrutame jagaja pöördarvuga.']
        ],
        kaardid: [
          ['Taanda 6/8.', '3/4'],
          ['3/5 + 1/5 = ?', '4/5'],
          ['Kirjuta 7/2 segaarvuna.', '3 1/2'],
          ['Mis on 2/3 pöördarv?', '3/2'],
          ['Kirjuta 1/4 kümnendmurruna.', '0,25']
        ],
        tekst: [
          'Murru väärtus ei muutu, kui lugejat ja nimetajat korrutada või jagada sama arvuga. Nii murdu laiendatakse või taandatakse.',
          'Erinimeliste murdude liitmiseks ja lahutamiseks leia ühine nimetaja.',
          'Liigmurrus on lugeja nimetajast suurem. Selle saab kirjutada segaarvuna, millel on täisosa ja murdosa.',
          'Murrujoon tähendab jagamist. 3/8 = 3 : 8 = 0,375.'
        ]
      },
      {
        nimi: 'Täisarvud',
        emoji: '🌡️',
        sonad: ['täisarv', 'taisarv', 'negatiivne', 'vastandarv', 'absoluutväärtus', 'absoluutvaartus'],
        video: [
          ['🌡️', 'Talvel võib olla −10 kraadi – see on negatiivne arv.'],
          ['📏', 'Arvteljel on negatiivsed arvud nullist vasakul.'],
          ['🪞', '5 ja −5 on vastandarvud.'],
          ['📐', 'Absoluutväärtus on kaugus nullist: |−5| = 5.'],
          ['✅', 'Täisarvud on …, −2, −1, 0, 1, 2, …']
        ],
        kaardid: [
          ['Mis on −8 vastandarv?', '8'],
          ['|−12| = ?', '12'],
          ['Kumb on suurem, −3 või −7?', '−3'],
          ['Mis on arvu 4 pöördarv?', '1/4'],
          ['Kas 0 on täisarv?', 'Jah.']
        ],
        tekst: [
          'Täisarvud on naturaalarvud, nende vastandarvud ja null.',
          'Negatiivseid arve kasutame külmakraadide, võlgade ja merepinnast madalamate kohtade kirjeldamiseks.',
          'Arvteljel on suurem see arv, mis asub paremal. Seega −2 > −6.',
          'Absoluutväärtus näitab arvu kaugust nullist ja ei ole kunagi negatiivne.'
        ]
      },
      {
        nimi: 'Protsent',
        emoji: '💯',
        sonad: ['protsent', 'protsendid', 'allahindlus', 'osa leidmine', 'sajandik'],
        video: [
          ['💯', 'Üks protsent on üks sajandik: 1% = 1/100 = 0,01.'],
          ['🍫', '50% on pool ja 25% on veerand.'],
          ['🏷️', 'Jope maksab 80 € ja allahindlus on 25%.'],
          ['🧮', '25% arvust 80 on 80 · 0,25 = 20 €.'],
          ['✅', 'Jope maksab nüüd 60 €.']
        ],
        kaardid: [
          ['Kirjuta 30% kümnendmurruna.', '0,3'],
          ['Leia 10% arvust 250.', '25'],
          ['Mitu protsenti on 3/4?', '75%'],
          ['Mitu protsenti on terve asi?', '100%']
        ],
        tekst: [
          'Protsent tähendab sajandikku. Märk % tähendab „sajast“.',
          'Protsendi saab kirjutada kümnendmurruna ja harilikuna: 20% = 0,2 = 1/5.',
          'Arvust protsendi leidmiseks teisenda protsent kümnendmurruks ja korruta arvuga.',
          'Protsente kohtad poes, ilmateates ja diagrammidel.'
        ]
      },
      {
        nimi: 'Kolmnurk',
        emoji: '🔺',
        sonad: ['kolmnurk', 'sisenurk', 'kõrgus', 'korgus', 'võrdhaarne', 'vordhaarne', 'täisnurkne'],
        video: [
          ['🔺', 'Iga kolmnurga sisenurkade summa on 180°.'],
          ['📐', 'Täisnurkses kolmnurgas on üks nurk 90°.'],
          ['⚖️', 'Võrdkülgses kolmnurgas on kõik küljed ja nurgad võrdsed.'],
          ['📏', 'Kõrgus on lõik tipust vastasküljeni, risti sellega.'],
          ['🧮', 'Pindala: S = alus · kõrgus : 2.']
        ],
        kaardid: [
          ['Kolmnurga kaks nurka on 50° ja 60°. Leia kolmas.', '70°'],
          ['Alus on 8 cm, kõrgus 5 cm. Leia pindala.', '20 cm²'],
          ['Mitu kraadi on võrdkülgse kolmnurga nurk?', '60°'],
          ['Mis on võrdhaarne kolmnurk?', 'Kolmnurk, millel kaks külge on võrdsed.']
        ],
        tekst: [
          'Kolmnurki liigitatakse nurkade järgi teravnurkseteks, täisnurkseteks ja nürinurkseteks.',
          'Külgede järgi on kolmnurgad erikülgsed, võrdhaarsed või võrdkülgsed.',
          'Kolmnurga sisenurkade summa on alati 180°.',
          'Kolmnurga pindala on pool aluse ja kõrguse korrutisest. Kolmnurgad on võrdsed, kui need kattuvad täpselt.'
        ]
      },
      {
        nimi: 'Ringjoon, ring ja koordinaadid',
        emoji: '⭕',
        sonad: ['ringjoon', 'ring', 'raadius', 'diameeter', 'ringi pindala', 'koordinaadid'],
        video: [
          ['⭕', 'Ringjoone kõik punktid on keskpunktist sama kaugel.'],
          ['📏', 'See kaugus on raadius r. Diameeter d = 2r.'],
          ['🥧', 'Arv π (pii) on umbes 3,14.'],
          ['🔄', 'Ringjoone pikkus: C = 2πr.'],
          ['🍕', 'Ringi pindala: S = πr².']
        ],
        kaardid: [
          ['Raadius on 5 cm. Kui suur on diameeter?', '10 cm'],
          ['Mis on π ligikaudne väärtus?', '3,14'],
          ['Raadius on 10 cm. Leia ringjoone pikkus.', 'Umbes 62,8 cm.'],
          ['Raadius on 2 cm. Leia ringi pindala.', 'Umbes 12,56 cm².'],
          ['Mis on koordinaatteljestik?', 'Kaks risti asetsevat arvtelge, millega märgitakse punkti asukohta.']
        ],
        tekst: [
          'Ringjoon on joon, ring on ringjoonega piiratud tasandi osa.',
          'Pii (π) näitab, mitu korda on ringjoone pikkus diameetrist suurem. π ≈ 3,14.',
          'Ringjoone pikkus C = 2πr ehk πd. Ringi pindala S = πr².',
          'Koordinaatteljestikus on punkti asukoht antud kahe arvuga, näiteks A(3; 2): 3 x-teljel ja 2 y-teljel.'
        ]
      }
    ],
    '7': [
      {
        nimi: 'Astendamine',
        emoji: '⚡',
        sonad: ['astendamine', 'aste', 'astendaja', 'standardkuju', 'ratsionaalarv'],
        video: [
          ['⚡', '2³ tähendab 2 · 2 · 2 = 8.'],
          ['🔢', '2 on astme alus ja 3 on astendaja.'],
          ['✖️', 'Sama alusega astmete korrutamisel astendajad liidetakse: a² · a³ = a⁵.'],
          ['🌍', 'Suuri arve kirjutame standardkujul: 5 000 000 = 5 · 10⁶.'],
          ['🔬', 'Väikesi arve samuti: 0,003 = 3 · 10⁻³.']
        ],
        kaardid: [
          ['3⁴ = ?', '81'],
          ['(−2)³ = ?', '−8'],
          ['a⁷ : a² = ?', 'a⁵'],
          ['(a²)³ = ?', 'a⁶'],
          ['Kirjuta 45 000 standardkujul.', '4,5 · 10⁴']
        ],
        tekst: [
          'Aste on lühike viis kirjutada võrdsete tegurite korrutist. aⁿ tähendab, et a on tegurina n korda.',
          'Astendamisreeglid: aᵐ · aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ ja (aᵐ)ⁿ = aᵐⁿ.',
          'Negatiivne arv paarisarvulises astmes on positiivne, paaritus astmes negatiivne.',
          'Standardkujul arv on a · 10ⁿ, kus 1 ≤ a < 10. Nii on mugav kirja panna väga suuri ja väga väikesi arve.'
        ]
      },
      {
        nimi: 'Protsentarvutus',
        emoji: '🏷️',
        sonad: ['protsentarvutus', 'protsent', 'promill', 'osamäär', 'osamaar', 'protsendipunkt'],
        video: [
          ['🏷️', 'Protsentülesandeid on mitut põhitüüpi.'],
          ['🧩', 'Osa leidmine: 15% arvust 200 on 30.'],
          ['🧱', 'Terviku leidmine: kui 20% on 8, siis tervik on 40.'],
          ['📊', 'Osamäära leidmine: 12 on 48-st 25%.'],
          ['📈', 'Hind tõusis 50 eurolt 60 eurole – see on 20% tõus.']
        ],
        kaardid: [
          ['Mis on promill?', 'Tuhandik osa: 1‰ = 0,001.'],
          ['Hind 40 € langes 10%. Mis on uus hind?', '36 €'],
          ['Mitu protsenti on 9 arvust 36?', '25%'],
          ['30% on 12. Leia tervik.', '40'],
          ['Mis on protsendipunkt?', 'Kahe protsendi vahe, nt 5%-lt 8%-le on 3 protsendipunkti.']
        ],
        tekst: [
          'Osa leidmiseks korruta tervik protsendiga kümnendmurruna: 15% arvust 200 = 0,15 · 200 = 30.',
          'Terviku leidmiseks jaga osa protsendiga kümnendmurruna: 8 : 0,2 = 40.',
          'Osamäära leidmiseks jaga osa tervikuga ja korruta 100%-ga.',
          'Muutuse protsendi leiad, kui jagad muutuse algväärtusega. Protsente kasutatakse laenude, intresside ja allahindluste juures.'
        ]
      },
      {
        nimi: 'Lineaarvõrrand',
        emoji: '⚖️',
        sonad: ['võrrand', 'vorrand', 'lineaarvõrrand', 'lineaarvorrand', 'tundmatu', 'lahend'],
        video: [
          ['⚖️', 'Võrrand on nagu kaal: mõlemad pooled on tasakaalus.'],
          ['➖', '3x + 5 = 20. Lahutame mõlemast poolest 5: 3x = 15.'],
          ['➗', 'Jagame mõlemad pooled 3-ga: x = 5.'],
          ['🔄', 'Kontroll: 3 · 5 + 5 = 20. Õige!'],
          ['📝', 'Tekstülesande saab sageli lahendada võrrandi abil.']
        ],
        kaardid: [
          ['Lahenda: x + 7 = 12', 'x = 5'],
          ['Lahenda: 4x = 28', 'x = 7'],
          ['Lahenda: 2x − 3 = 9', 'x = 6'],
          ['Mis on võrrandi lahend?', 'Arv, mis muudab võrrandi tõeseks võrduseks.'],
          ['Mida tohib võrrandiga teha?', 'Mõlemale poolele sama: liita, lahutada, korrutada või jagada (mitte nulliga).']
        ],
        tekst: [
          'Võrrand on võrdus, milles on tundmatu. Võrrandi lahendamine tähendab tundmatu leidmist.',
          'Võrrandi põhiomadus: mõlemale poolele võib liita sama arvu ja mõlemaid pooli võib korrutada või jagada sama nullist erineva arvuga.',
          'Liikme viimisel teisele poole muutub selle märk vastupidiseks.',
          'Tekstülesandes tähista tundmatu tähega, koosta võrrand, lahenda see ja kontrolli vastust.'
        ]
      },
      {
        nimi: 'Statistika ja tõenäosus',
        emoji: '🎲',
        sonad: ['statistika', 'tõenäosus', 'toenaosus', 'mediaan', 'mood', 'keskmine'],
        video: [
          ['📊', 'Andmed: 2, 3, 3, 5, 7.'],
          ['➗', 'Keskmine: (2 + 3 + 3 + 5 + 7) : 5 = 4.'],
          ['🎯', 'Mediaan on järjestatud rea keskmine väärtus: 3.'],
          ['🔁', 'Mood on kõige sagedasem väärtus: samuti 3.'],
          ['🎲', 'Täringuga kuue saamise tõenäosus on 1/6.']
        ],
        kaardid: [
          ['Leia mediaan: 1, 4, 6, 8, 9', '6'],
          ['Mis on variatsiooni ulatus?', 'Suurima ja vähima väärtuse vahe.'],
          ['Mis on mündiviskel kulli tõenäosus?', '1/2'],
          ['Kuidas arvutada klassikalist tõenäosust?', 'Soodsate võimaluste arv jagatud kõigi võimaluste arvuga.'],
          ['Mis on suhteline sagedus?', 'Sagedus jagatud kõigi andmete arvuga.']
        ],
        tekst: [
          'Statistika uurib andmeid. Andmeid iseloomustavad keskmine, mediaan, mood, miinimum, maksimum ja ulatus.',
          'Mediaani leidmiseks järjesta andmed. Kui andmeid on paarisarv, võta kahe keskmise arvu keskmine.',
          'Tõenäosus näitab, kui võimalik on sündmus. See on arv 0 ja 1 vahel.',
          'Võimatu sündmuse tõenäosus on 0, kindla sündmuse tõenäosus on 1.'
        ]
      },
      {
        nimi: 'Võrdeline ja pöördvõrdeline seos',
        emoji: '📈',
        sonad: ['võrdeline', 'vordeline', 'pöördvõrdeline', 'poordvordeline', 'funktsioon', 'graafik'],
        video: [
          ['🍎', '1 kg õunu maksab 2 €, 3 kg maksab 6 €.'],
          ['📈', 'See on võrdeline seos: y = 2x. Graafik on sirge läbi nullpunkti.'],
          ['🚗', 'Mida kiiremini sõidad, seda vähem aega sama tee peale kulub.'],
          ['📉', 'See on pöördvõrdeline seos: y = a/x. Graafik on hüperbool.'],
          ['✅', 'Lineaarfunktsiooni y = ax + b graafik on sirge.']
        ],
        kaardid: [
          ['Mis kujuga on võrdelise seose graafik?', 'Sirge, mis läbib nullpunkti.'],
          ['Mis on pöördvõrdelise seose graafik?', 'Hüperbool.'],
          ['y = 3x. Leia y, kui x = 4.', '12'],
          ['Kas teepikkus ja aeg on sama kiiruse korral võrdelised?', 'Jah.']
        ],
        tekst: [
          'Võrdelise seose korral kasvab üks suurus sama mitu korda kui teine. Valem on y = ax.',
          'Pöördvõrdelise seose korral, kui üks suurus kasvab mitu korda, siis teine kahaneb sama mitu korda. Valem on y = a/x.',
          'Lineaarfunktsioon on y = ax + b. Selle graafik on sirge ja b näitab, kus sirge lõikab y-telge.',
          'Graafiku joonestamiseks koosta väärtuste tabel ja märgi punktid koordinaatteljestikku.'
        ]
      }
    ],
    '8': [
      {
        nimi: 'Üksliikmed ja hulkliikmed',
        emoji: '🧩',
        sonad: ['hulkliige', 'üksliige', 'uksliige', 'sarnased liikmed', 'avaldis', 'korrastamine'],
        video: [
          ['🧩', '3x² on üksliige: arvuline kordaja 3 ja tähtosa x².'],
          ['➕', 'Sarnaseid liikmeid saab koondada: 4x + 2x = 6x.'],
          ['🚫', 'Aga 4x ja 2y ei ole sarnased liikmed.'],
          ['✖️', 'Üksliikme korrutamine hulkliikmega: 2x(x + 3) = 2x² + 6x.'],
          ['➗', 'Jagamine üksliikmega: (6x² + 9x) : 3x = 2x + 3.']
        ],
        kaardid: [
          ['Koonda: 5a − 2a + a', '4a'],
          ['Korruta: 3(x − 4)', '3x − 12'],
          ['(x + 2)(x + 3) = ?', 'x² + 5x + 6'],
          ['Mis on sarnased liikmed?', 'Liikmed, millel on sama tähtosa, nt 2xy ja −5xy.']
        ],
        tekst: [
          'Üksliige on arvude ja muutujate korrutis. Hulkliige on üksliikmete summa.',
          'Hulkliikme lihtsustamiseks koondame sarnased liikmed: liidame nende kordajad.',
          'Hulkliikmete korrutamisel korrutame esimese hulkliikme iga liikme teise hulkliikme iga liikmega.',
          'Kui sulgude ees on miinusmärk, muutuvad sulgude avamisel kõigi sulgudes olevate liikmete märgid.'
        ]
      },
      {
        nimi: 'Korrutamise abivalemid ja tegurdamine',
        emoji: '🪄',
        sonad: ['abivalemid', 'tegurdamine', 'summa ruut', 'vahe ruut', 'ruutude vahe'],
        video: [
          ['🪄', 'Summa ruut: (a + b)² = a² + 2ab + b².'],
          ['➖', 'Vahe ruut: (a − b)² = a² − 2ab + b².'],
          ['🔀', 'Ruutude vahe: a² − b² = (a + b)(a − b).'],
          ['🧮', 'Peastarvutus: 21 · 19 = (20 + 1)(20 − 1) = 400 − 1 = 399.'],
          ['📦', 'Tegurdamine: 6x + 9 = 3(2x + 3).']
        ],
        kaardid: [
          ['(x + 5)² = ?', 'x² + 10x + 25'],
          ['(y − 3)² = ?', 'y² − 6y + 9'],
          ['Tegurda: x² − 16', '(x + 4)(x − 4)'],
          ['Too ühine tegur sulgude ette: 4a² + 8a', '4a(a + 2)'],
          ['Mis on tegurdamine?', 'Avaldise kirjutamine korrutisena.']
        ],
        tekst: [
          'Abivalemid aitavad korrutada kiiremini ilma kõiki liikmeid eraldi korrutamata.',
          'Sage viga: (a + b)² ei võrdu a² + b². Keskmine liige 2ab ei tohi ära kaduda.',
          'Tegurdamine on korrutamise vastupidine tegevus. Esmalt vaata, kas saab ühise teguri sulgude ette tuua.',
          'Seejärel proovi abivalemeid. Ruutkolmliiget saab vahel kirjutada summa või vahe ruuduna.'
        ]
      },
      {
        nimi: 'Lineaarvõrrandisüsteem',
        emoji: '🔀',
        sonad: ['võrrandisüsteem', 'vorrandisusteem', 'asendusvõte', 'asendusvote', 'liitmisvõte', 'liitmisvote'],
        video: [
          ['🔀', 'Kaks tundmatut vajavad kaht võrrandit: x + y = 10 ja x − y = 2.'],
          ['➕', 'Liitmisvõte: liidame võrrandid, y kaob ära: 2x = 12, x = 6.'],
          ['🔄', 'Paneme x tagasi: 6 + y = 10, seega y = 4.'],
          ['🧩', 'Asendusvõte: avalda ühest võrrandist üks tundmatu ja asenda teise.'],
          ['📈', 'Graafiliselt on lahend kahe sirge lõikepunkt.']
        ],
        kaardid: [
          ['Mis on võrrandisüsteemi lahend?', 'Arvupaar, mis rahuldab mõlemat võrrandit.'],
          ['Lahenda: x + y = 7, x − y = 1', 'x = 4, y = 3'],
          ['Mis on graafikul, kui süsteemil lahend puudub?', 'Sirged on paralleelsed.'],
          ['Nimeta kaks lahendusvõtet.', 'Liitmisvõte ja asendusvõte.']
        ],
        tekst: [
          'Kahe tundmatuga lineaarvõrrandisüsteemis on kaks võrrandit, mis peavad kehtima korraga.',
          'Liitmisvõttes korrutame võrrandeid nii, et ühe tundmatu kordajad oleksid vastandarvud, ja siis liidame.',
          'Asendusvõttes avaldame ühe tundmatu ja asendame selle teise võrrandisse.',
          'Tekstülesandes tähista kaks otsitavat suurust tähtedega ja koosta kaks võrrandit. Kontrolli vastust teksti abil.'
        ]
      },
      {
        nimi: 'Paralleelsed sirged ja nurgad',
        emoji: '🛤️',
        sonad: ['paralleelsed', 'põiknurgad', 'poiknurgad', 'lähisnurgad', 'lahisnurgad', 'kesklõik', 'tõestus', 'toestus'],
        video: [
          ['🛤️', 'Rööpad on paralleelsed – nad ei lõiku kunagi.'],
          ['✂️', 'Kui kaht paralleelset sirget lõikab kolmas sirge, tekivad nurgad.'],
          ['🪞', 'Põiknurgad on võrdsed.'],
          ['➕', 'Lähisnurkade summa on 180°.'],
          ['🔺', 'Kolmnurga kesklõik on alusega paralleelne ja pool selle pikkusest.']
        ],
        kaardid: [
          ['Mis on paralleelsete sirgete põiknurkade kohta õige?', 'Nad on võrdsed.'],
          ['Üks lähisnurk on 70°. Kui suur on teine?', '110°'],
          ['Kolmnurga alus on 12 cm. Kui pikk on kesklõik?', '6 cm'],
          ['Mis on teoreem?', 'Väide, mis on tõestatud.']
        ],
        tekst: [
          'Paralleelsed sirged asuvad samal tasandil ega lõiku. Lõikaja moodustab nendega kaasnurgad, põiknurgad ja lähisnurgad.',
          'Kui põiknurgad on võrdsed või lähisnurkade summa on 180°, siis on sirged paralleelsed. See on paralleelsuse tunnus.',
          'Matemaatikas tõestame väiteid loogilise arutlusega, toetudes eeldusele ja juba teadaolevatele faktidele.',
          'Trapetsi kesklõik on alustega paralleelne ja võrdub aluste poolsummaga.'
        ]
      },
      {
        nimi: 'Kujundite sarnasus',
        emoji: '🗺️',
        sonad: ['sarnasus', 'sarnased', 'mõõtkava', 'mootkava', 'sarnasustegur', 'plaan'],
        video: [
          ['🗺️', 'Kaart on maastikuga sarnane, aga palju väiksem.'],
          ['📏', 'Mõõtkava 1 : 1000 tähendab, et 1 cm plaanil on 10 m looduses.'],
          ['🔺', 'Sarnastel kujunditel on vastavad nurgad võrdsed.'],
          ['✖️', 'Vastavad küljed on võrdelised – nende suhe on sarnasustegur k.'],
          ['🌳', 'Varju abil saab leida puu kõrguse ilma ronimata.']
        ],
        kaardid: [
          ['Plaanil on 3 cm, mõõtkava 1 : 500. Kui palju on see looduses?', '15 m'],
          ['Sarnasustegur on 2. Mitu korda on pindala suurem?', '4 korda.'],
          ['Millal on kolmnurgad sarnased?', 'Näiteks siis, kui kaks nurka on vastavalt võrdsed.'],
          ['Mis on sarnasustegur?', 'Vastavate külgede pikkuste suhe.']
        ],
        tekst: [
          'Sarnased kujundid on sama kujuga, kuid võivad olla eri suurusega.',
          'Sarnaste hulknurkade vastavad nurgad on võrdsed ja vastavad küljed võrdelised.',
          'Kui sarnasustegur on k, siis pindalade suhe on k².',
          'Sarnasust kasutatakse plaanide ja kaartide tegemisel ning kõrguste kaudsel mõõtmisel.'
        ]
      }
    ],
    '9': [
      {
        nimi: 'Ruutjuur',
        emoji: '🌱',
        sonad: ['ruutjuur', 'juur', 'juurimine', 'täisruut', 'taisruut'],
        video: [
          ['🌱', 'Ruutjuur on ruutu tõstmise pöördtehe.'],
          ['🔢', '√49 = 7, sest 7² = 49.'],
          ['🟦', 'Ruudu pindala on 64 cm². Külg on √64 = 8 cm.'],
          ['🧮', '√2 ≈ 1,41 – seda saab leida kalkulaatoriga.'],
          ['🚫', 'Negatiivsest arvust ruutjuurt võtta ei saa.']
        ],
        kaardid: [
          ['√81 = ?', '9'],
          ['√0,25 = ?', '0,5'],
          ['√(4 · 9) = ?', '6'],
          ['Kas √(−4) on reaalarv?', 'Ei ole.'],
          ['√100 = ?', '10']
        ],
        tekst: [
          'Arvu a ruutjuur on mittenegatiivne arv, mille ruut on a.',
          'Täisruutude juured on täisarvud: √1 = 1, √4 = 2, √9 = 3, √16 = 4.',
          'Kui arv ei ole täisruut, on tema ruutjuur lõpmatu mitteperioodiline kümnendmurd. Siis kasutame ligikaudset väärtust.',
          'Juurimisel kehtib √(a · b) = √a · √b.'
        ]
      },
      {
        nimi: 'Ruutvõrrand ja ruutfunktsioon',
        emoji: '📉',
        sonad: ['ruutvõrrand', 'ruutvorrand', 'parabool', 'diskriminant', 'ruutfunktsioon', 'haripunkt'],
        video: [
          ['📝', 'Ruutvõrrand: ax² + bx + c = 0.'],
          ['🔍', 'Mittetäielik: x² − 9 = 0, siis x = 3 või x = −3.'],
          ['🧮', 'Täielikku lahendame valemiga x = (−b ± √(b² − 4ac)) : 2a.'],
          ['📉', 'Ruutfunktsiooni y = ax² + bx + c graafik on parabool.'],
          ['🎯', 'Parabooli nullkohad on ruutvõrrandi lahendid.']
        ],
        kaardid: [
          ['Mis on diskriminant?', 'D = b² − 4ac.'],
          ['Mitu lahendit on, kui D < 0?', 'Reaalarvulisi lahendeid pole.'],
          ['Lahenda: x² − 5x + 6 = 0', 'x = 2 või x = 3'],
          ['Millal on parabooli harud üleval?', 'Kui a > 0.'],
          ['Kuidas leida haripunkti x-koordinaati?', 'x = −b : 2a']
        ],
        tekst: [
          'Ruutvõrrandis on tundmatu ruudus. Täielikus ruutvõrrandis on kõik kordajad a, b ja c nullist erinevad.',
          'Diskriminant näitab lahendite arvu: D > 0 – kaks lahendit, D = 0 – üks lahend, D < 0 – reaalarvulisi lahendeid pole.',
          'Ruutfunktsiooni graafik on parabool. Kui a > 0, on harud üleval, kui a < 0, siis all.',
          'Haripunkt on parabooli kõige madalam või kõrgeim punkt. Nullkohad on kohad, kus graafik lõikab x-telge.'
        ]
      },
      {
        nimi: 'Pythagorase teoreem',
        emoji: '📐',
        sonad: ['pythagoras', 'pythagorase teoreem', 'hüpotenuus', 'hupotenuus', 'kaatet', 'täisnurkne kolmnurk'],
        video: [
          ['📐', 'Täisnurkses kolmnurgas on kaks kaatetit ja hüpotenuus.'],
          ['➕', 'Pythagorase teoreem: a² + b² = c².'],
          ['🔺', 'Kaatetid on 3 ja 4: c² = 9 + 16 = 25, seega c = 5.'],
          ['📺', 'Teleri diagonaali saab arvutada sama valemiga.'],
          ['✅', 'Hüpotenuus on alati kõige pikem külg.']
        ],
        kaardid: [
          ['Mis on hüpotenuus?', 'Täisnurga vastas olev külg.'],
          ['Kaatetid on 6 ja 8. Leia hüpotenuus.', '10'],
          ['Hüpotenuus on 13, üks kaatet 5. Leia teine kaatet.', '12'],
          ['Kas teoreem kehtib igas kolmnurgas?', 'Ei, ainult täisnurkses kolmnurgas.']
        ],
        tekst: [
          'Täisnurkse kolmnurga täisnurga lähisküljed on kaatetid, täisnurga vastas olev külg on hüpotenuus.',
          'Pythagorase teoreem: kaatetite ruutude summa võrdub hüpotenuusi ruuduga.',
          'Kaateti leidmiseks lahuta hüpotenuusi ruudust teise kaateti ruut ja võta ruutjuur.',
          'Teoreemi abil leitakse diagonaale, kaugusi ja kõrgusi. Thalese teoreem ütleb, et diameetrile toetuv piirdenurk on täisnurk.'
        ]
      },
      {
        nimi: 'Siinus, koosinus ja tangens',
        emoji: '📏',
        sonad: ['trigonomeetria', 'siinus', 'koosinus', 'tangens', 'teravnurk'],
        video: [
          ['📏', 'Trigonomeetria seob täisnurkse kolmnurga nurgad ja küljed.'],
          ['🔺', 'Siinus = vastaskaatet : hüpotenuus.'],
          ['📐', 'Koosinus = lähiskaatet : hüpotenuus.'],
          ['📈', 'Tangens = vastaskaatet : lähiskaatet.'],
          ['🧮', 'Näiteks sin 30° = 0,5.']
        ],
        kaardid: [
          ['Mis on sin α?', 'Vastaskaateti ja hüpotenuusi suhe.'],
          ['tan 45° = ?', '1'],
          ['cos 60° = ?', '0,5'],
          ['Hüpotenuus on 10, nurk 30°. Kui pikk on nurga vastaskaatet?', '5'],
          ['Kuidas leida sin 37°?', 'Kalkulaatoriga.']
        ],
        tekst: [
          'Teravnurga siinus, koosinus ja tangens on täisnurkse kolmnurga külgede suhted.',
          'Kui tead üht külge ja üht teravnurka, saad leida teised küljed.',
          'Kui tead kaht külge, saad kalkulaatori abil leida nurga.',
          'Trigonomeetriat kasutatakse ehituses, navigatsioonis ja kõrguste mõõtmisel.'
        ]
      },
      {
        nimi: 'Ruumilised kehad',
        emoji: '🧊',
        sonad: ['ruumala', 'silinder', 'koonus', 'kera', 'püramiid', 'puramiid', 'prisma'],
        video: [
          ['🥫', 'Silindri ruumala: V = πr²h.'],
          ['🍦', 'Koonuse ruumala on kolm korda väiksem: V = πr²h : 3.'],
          ['🔺', 'Püramiidi ruumala: V = põhja pindala · kõrgus : 3.'],
          ['⚽', 'Kera ruumala: V = 4/3 · πr³.'],
          ['🌍', 'Kera pindala: S = 4πr².']
        ],
        kaardid: [
          ['Mis on sfäär?', 'Kera pind.'],
          ['Silindri r = 1 m ja h = 2 m. Leia ruumala.', '2π ≈ 6,28 m³'],
          ['Mis on koonuse moodustaja?', 'Lõik koonuse tipust põhja ringjoone punktini.'],
          ['Mis on püramiidi apoteem?', 'Korrapärase püramiidi külgtahu kõrgus.'],
          ['Mis on prisma ruumala valem?', 'V = põhja pindala · kõrgus.']
        ],
        tekst: [
          'Silinder, koonus ja kera on pöördkehad. Silinder tekib ristküliku pöörlemisel ümber oma külje.',
          'Prisma ja silindri ruumala on põhja pindala korda kõrgus.',
          'Püramiidi ja koonuse ruumala on kolmandik sama põhja ja kõrgusega prisma või silindri ruumalast.',
          'Täispindala leidmiseks liida põhja (või põhjade) pindala ja külgpindala.'
        ]
      }
    ]
  }
};
