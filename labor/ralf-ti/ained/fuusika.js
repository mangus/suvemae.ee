// Füüsika lessons for Ralf TI, based on the school curriculum.
export default {
  id: 'fuusika',
  nimi: 'Füüsika',
  emoji: '⚡',
  klassid: {
    '8': [
      {
        nimi: 'Valgus ja peegeldumine',
        emoji: '💡',
        sonad: ['valgus', 'valgusallikas', 'peegeldumine', 'peegel', 'vari', 'poolvari', 'värvus', 'varvus', 'neeldumine'],
        video: [
          ['☀️', 'Päike on looduslik valgusallikas, lamp on tehislik valgusallikas.'],
          ['➡️', 'Valgus levib ühtlases keskkonnas sirgjooneliselt.'],
          ['🌑', 'Kui ese takistab valgust, tekib selle taha vari.'],
          ['🪞', 'Peeglilt peegeldub valgus nii, et langemisnurk võrdub peegeldumisnurgaga.'],
          ['🍎', 'Punane õun peegeldab punast valgust ja neelab teised värvused.'],
          ['✅', 'Valgus on energia, mida pinnad kas peegeldavad või neelavad.']
        ],
        kaardid: [
          ['Mis vahe on looduslikul ja tehislikul valgusallikal?', 'Looduslik tekib looduses (Päike, välk), tehisliku on teinud inimene (lamp, ekraan).'],
          ['Miks tekib vari?', 'Valgus levib sirgjooneliselt ega pääse läbi läbipaistmatu eseme.'],
          ['Mis on peegeldumise seadus?', 'Langemisnurk on võrdne peegeldumisnurgaga.'],
          ['Miks läheb must särk päikese käes soojemaks kui valge?', 'Must pind neelab rohkem valgust ja valguse energia muutub soojuseks.'],
          ['Miks näeme lehte rohelisena?', 'Leht peegeldab rohelist valgust, teised värvused neelduvad.'],
          ['Mis on poolvari?', 'Osaliselt valgustatud ala varju ümber, mis tekib suure valgusallika korral.']
        ],
        tekst: [
          'Valgus on energia liik. Valgusallikad võivad olla looduslikud, näiteks Päike ja välk, või tehislikud, näiteks lamp ja telefoni ekraan.',
          'Ühtlases keskkonnas levib valgus sirgjooneliselt. Seepärast tekib läbipaistmatu eseme taha vari. Kui valgusallikas on suur, tekib varju ümber ka poolvari.',
          'Kui valgus langeb peeglile, peegeldub see kindla reegli järgi: langemisnurk on võrdne peegeldumisnurgaga. Läikiv pind peegeldab valgust ühes suunas, matt pind hajutab seda igas suunas.',
          'Valge valgus koosneb paljudest värvustest. Ese paistab sellist värvi, millist valgust ta peegeldab. Tume pind neelab rohkem valgust ja soojeneb rohkem kui hele pind.',
          'Valguse peegeldumist kasutame igapäevaelus: peeglid, helkurid ja heledad seinad aitavad meil paremini näha ja olla nähtav.'
        ]
      },
      {
        nimi: 'Valguse murdumine ja läätsed',
        emoji: '🔍',
        sonad: ['murdumine', 'lääts', 'laats', 'kumerlääts', 'nõguslääts', 'noguslaats', 'fookus', 'optiline tugevus', 'silm', 'prillid'],
        video: [
          ['🥤', 'Pliiats klaasis vees paistab murtud, sest valgus muudab vee piiril suunda.'],
          ['🐢', 'Vees ja klaasis levib valgus aeglasemalt kui õhus, seepärast see murdub.'],
          ['🔍', 'Kumerlääts koondab valguskiired ühte punkti, mida nimetatakse fookuseks.'],
          ['👓', 'Nõguslääts hajutab valguskiiri.'],
          ['👁️', 'Silmas tekitab lääts kujutise võrkkestale.'],
          ['🧮', 'Läätse optiline tugevus D = 1/f, kus f on fookuskaugus meetrites.']
        ],
        kaardid: [
          ['Miks valgus murdub?', 'Valguse kiirus on eri keskkondades erinev, kiiruse muutumisel muutub ka suund.'],
          ['Mis on täielik peegeldumine?', 'Valgus ei pääse tihedamast keskkonnast välja, vaid peegeldub tagasi. Seda kasutatakse valguskaablites.'],
          ['Mille poolest erinevad kumer- ja nõguslääts?', 'Kumerlääts koondab kiiri, nõguslääts hajutab neid.'],
          ['Leia läätse optiline tugevus, kui f = 0,5 m.', 'D = 1/0,5 m = 2 dioptrit.'],
          ['Mis vahe on tõelisel ja näilisel kujutisel?', 'Tõelise kujutise saab püüda ekraanile, näilist näeme ainult läätse või peegli kaudu.'],
          ['Milliseid prille kannab lühinägelik inimene?', 'Nõgusläätsedega prille.']
        ],
        tekst: [
          'Kui valgus läheb ühest keskkonnast teise, näiteks õhust vette, muutub selle suund. Seda nimetatakse murdumiseks. Põhjus on selles, et valgus levib eri keskkondades erineva kiirusega.',
          'Murdumisnäitaja näitab, mitu korda on valguse kiirus keskkonnas väiksem kui vaakumis. Kui valgus liigub tihedamast keskkonnast hõredamasse suure nurga all, võib tekkida täielik peegeldumine.',
          'Kumerlääts koondab paralleelsed kiired fookusesse. Nõguslääts hajutab kiiri. Läätse optiline tugevus arvutatakse valemiga D = 1/f, ühik on dioptria.',
          'Silm on optiline süsteem: silmalääts tekitab kujutise võrkkestale. Lühinägelikkust parandatakse nõgusläätsedega, kaugnägelikkust kumerläätsedega.',
          'Läätsed on prillides, luubis, fotoaparaadis ja mikroskoobis.'
        ]
      },
      {
        nimi: 'Liikumine, jõud ja tihedus',
        emoji: '🚲',
        sonad: ['liikumine', 'kiirus', 'teepikkus', 'jõud', 'joud', 'raskusjõud', 'raskusjoud', 'hõõrdejõud', 'hoordejoud', 'tihedus', 'mass'],
        video: [
          ['🚲', 'Kiirus näitab, kui pika tee keha ajaühikus läbib: v = s/t.'],
          ['🏃', 'Kui 100 meetrit joostakse 20 sekundiga, on kiirus 5 m/s.'],
          ['🌍', 'Maa tõmbab kõiki kehi enda poole – see on raskusjõud F = mg.'],
          ['🧊', 'Hõõrdejõud takistab liikumist, libedal jääl on see väike.'],
          ['🪀', 'Venitatud vedru tahab tagasi algkujule – see on elastsusjõud.'],
          ['🪨', 'Tihedus näitab, kui suur mass on ühel ruumalaühikul: ρ = m/V.']
        ],
        kaardid: [
          ['Kuidas arvutada kiirust?', 'v = s/t ehk teepikkus jagatud ajaga.'],
          ['Mis on ühtlane liikumine?', 'Liikumine, kus keha läbib võrdsetes ajavahemikes võrdsed teepikkused.'],
          ['Kui suur on 2 kg kehale mõjuv raskusjõud?', 'F = mg ≈ 2 kg · 10 N/kg = 20 N.'],
          ['Millega mõõdetakse jõudu?', 'Dünamomeetriga, ühik on njuuton (N).'],
          ['Millest sõltub hõõrdejõud?', 'Pindade karedusest ja sellest, kui tugevasti kehad teineteise vastu surutud on.'],
          ['Kui suur on vee tihedus?', '1000 kg/m³ ehk 1 g/cm³.']
        ],
        tekst: [
          'Liikumist kirjeldame teepikkuse, aja ja kiiruse abil. Kiirus arvutatakse valemiga v = s/t. Näiteks 36 km/h on sama mis 10 m/s.',
          'Ühtlasel liikumisel kiirus ei muutu, ebaühtlasel muutub. Liikumist saab kujutada tabeli või graafikuna.',
          'Jõud on kehade vastastikmõju. Jõud võib keha liikuma panna, peatada või muuta selle kiirust ja suunda. Kui kehale mõjuvad jõud on tasakaalus, keha kiirus ei muutu.',
          'Raskusjõud arvutatakse valemiga F = mg, kus g ≈ 9,8 N/kg. Hõõrdejõud aeglustab liikumist. Elastsusjõud tekib, kui keha venitada või kokku suruda.',
          'Tihedus on aine omadus ja arvutatakse valemiga ρ = m/V. Mass iseloomustab keha inertsust: mida suurem mass, seda raskem on keha kiirust muuta.'
        ]
      },
      {
        nimi: 'Rõhk ja üleslükkejõud',
        emoji: '🎈',
        sonad: ['rõhk', 'rohk', 'õhurõhk', 'ohurohk', 'üleslükkejõud', 'uleslukkejoud', 'pascal', 'ujumine', 'archimedes'],
        video: [
          ['🎿', 'Suuskadega ei vaju lumme, sest jõud jaotub suurele pinnale.'],
          ['🧮', 'Rõhk arvutatakse valemiga p = F/S, ühik on paskal (Pa).'],
          ['🤿', 'Mida sügavamal vees, seda suurem on rõhk: p = ρgh.'],
          ['🎈', 'Vedelikus ja gaasis mõjub kehale ülespoole suunatud üleslükkejõud.'],
          ['🚢', 'Laev ujub, sest üleslükkejõud on sama suur kui laeva raskusjõud.'],
          ['✅', 'Rõhk ja üleslükkejõud selgitavad paljusid loodusnähtusi.']
        ],
        kaardid: [
          ['Mis on rõhk?', 'Rõhumisjõud pinnaühiku kohta: p = F/S.'],
          ['Kuidas suurendada rõhku sama jõu korral?', 'Tuleb vähendada pindala, nagu terava noa puhul.'],
          ['Mida ütleb Pascali seadus?', 'Vedelikule või gaasile avaldatud rõhk kandub edasi ühtviisi igas suunas.'],
          ['Kui suur on vee rõhk 10 m sügavusel (ilma õhurõhuta)?', 'p = 1000 · 10 · 10 = 100 000 Pa.'],
          ['Kuidas arvutada üleslükkejõudu?', 'Fü = ρgV, kus V on keha poolt välja tõrjutud vedeliku ruumala.'],
          ['Millal keha upub?', 'Kui raskusjõud on suurem kui üleslükkejõud.']
        ],
        tekst: [
          'Rõhk näitab, kui suur jõud mõjub pinnaühikule. Valem on p = F/S ja ühik on paskal (Pa). Sama jõu korral on väikesel pinnal rõhk suur ja suurel pinnal väike.',
          'Pascali seaduse järgi kandub rõhk vedelikes ja gaasides edasi igas suunas ühtviisi. Selle peal töötavad näiteks hüdraulilised pidurid.',
          'Vedeliku rõhk suureneb sügavusega: p = ρgh. Ka õhul on rõhk – õhurõhk on merepinnal umbes 100 000 Pa.',
          'Vedelikus või gaasis mõjub kehale üleslükkejõud Fü = ρgV. Kui üleslükkejõud on võrdne raskusjõuga, keha ujub. Kui raskusjõud on suurem, keha upub.',
          'Seepärast ujuvad laevad, hõljuvad õhupallid ja kalad saavad vees tõusta ning laskuda.'
        ]
      },
      {
        nimi: 'Töö, energia ja võimsus',
        emoji: '🏋️',
        sonad: ['mehaaniline töö', 'energia', 'võimsus', 'voimsus', 'kineetiline', 'potentsiaalne', 'kang', 'lihtmehhanism'],
        video: [
          ['🏋️', 'Tööd tehakse siis, kui jõud liigutab keha: A = F · s.'],
          ['⚽', 'Liikuval kehal on kineetiline energia.'],
          ['⛰️', 'Kõrgel oleval kehal on potentsiaalne energia.'],
          ['🔄', 'Energia ei kao, vaid muundub ühest liigist teise.'],
          ['⏱️', 'Võimsus näitab, kui kiiresti tööd tehakse: N = A/t.'],
          ['🔧', 'Kang ja kaldpind teevad töö kergemaks, aga tee pikeneb.']
        ],
        kaardid: [
          ['Kuidas arvutada mehaanilist tööd?', 'A = F · s, ühik on džaul (J).'],
          ['Kui palju tööd tehakse, kui 50 N jõuga lükatakse kasti 4 m?', 'A = 50 N · 4 m = 200 J.'],
          ['Mis on energia?', 'Keha võime teha tööd.'],
          ['Kui 200 J tööd tehakse 10 sekundiga, kui suur on võimsus?', 'N = 200 J / 10 s = 20 W.'],
          ['Too näiteid lihtmehhanismidest.', 'Kang, kaldpind, ratas ja plokk.'],
          ['Mida ütleb mehaanika kuldreegel?', 'Mitu korda võidame jõus, sama mitu korda kaotame teepikkuses – töö jääb samaks.']
        ],
        tekst: [
          'Füüsikas tehakse tööd siis, kui kehale mõjuv jõud paneb keha liikuma. Töö arvutatakse valemiga A = F · s ja selle ühik on džaul (J).',
          'Energia on keha võime teha tööd. Liikuval kehal on kineetiline energia, kõrgele tõstetud kehal potentsiaalne energia. Näiteks kiigel muundub potentsiaalne energia kineetiliseks ja tagasi.',
          'Energia ei teki ega kao, vaid muundub ühest liigist teise. Seda nimetatakse energia jäävuse seaduseks.',
          'Võimsus näitab, kui kiiresti tööd tehakse: N = A/t. Võimsuse ühik on vatt (W).',
          'Lihtmehhanismid, nagu kang, kaldpind, ratas ja plokk, võimaldavad kasutada väiksemat jõudu. Mehaanika kuldreegli järgi peab siis aga jõudu rakendama pikema tee jooksul.'
        ]
      }
    ],
    '9': [
      {
        nimi: 'Elektrilaeng ja elektriline vastastikmõju',
        emoji: '🎈',
        sonad: ['elektrilaeng', 'laeng', 'elektriseerumine', 'elektron', 'välk', 'valk', 'staatiline'],
        video: [
          ['🎈', 'Hõõru õhupalli vastu villast kampsunit ja see hakkab paberitükke tõmbama.'],
          ['➕', 'Laenguid on kahte liiki: positiivsed ja negatiivsed.'],
          ['🧲', 'Samanimelised laengud tõukuvad, erinimelised tõmbuvad.'],
          ['🔁', 'Hõõrumisel liiguvad elektronid ühelt kehalt teisele.'],
          ['🌩️', 'Välk on suur elektrilahendus pilvede ja Maa vahel.'],
          ['✅', 'Laeng ei teki ega kao, see ainult liigub ühelt kehalt teisele.']
        ],
        kaardid: [
          ['Kuidas keha elektriseerub?', 'Hõõrumisel või kokkupuutel liiguvad elektronid ühelt kehalt teisele.'],
          ['Millise laenguga on elektron?', 'Negatiivse.'],
          ['Kuidas mõjuvad teineteisele samanimeliste laengutega kehad?', 'Nad tõukuvad.'],
          ['Kuidas sõltub elektriline vastastikmõju kaugusest?', 'Mida suurem on kaugus, seda nõrgem on mõju.'],
          ['Too näide elektrilisest vastastikmõjust igapäevaelus.', 'Juuksed tõusevad pärast mütsi peast võtmist püsti.'],
          ['Mis on välk?', 'Elektrilahendus laetud pilvede või pilve ja Maa vahel.']
        ],
        tekst: [
          'Kõik ained koosnevad aatomitest, milles on positiivse laenguga prootonid ja negatiivse laenguga elektronid. Tavaliselt on neid võrdselt ja keha on neutraalne.',
          'Kui kaks keha hõõruvad, võivad elektronid liikuda ühelt kehalt teisele. Elektronide juurde saanud keha laadub negatiivselt, elektrone kaotanud keha positiivselt.',
          'Samanimeliste laengutega kehad tõukuvad, erinimeliste laengutega kehad tõmbuvad. Mida kaugemal kehad on, seda nõrgem on mõju.',
          'Laeng ei teki ega kao – see ainult jaotub kehade vahel ümber. Seda nimetatakse laengu jäävuseks.',
          'Elektrilist vastastikmõju näeme, kui juuksed tõusevad püsti, riided kleepuvad kokku või taevas lööb välku.'
        ]
      },
      {
        nimi: 'Vooluring, pinge ja takistus',
        emoji: '🔌',
        sonad: ['vooluring', 'elektrivool', 'voolutugevus', 'pinge', 'takistus', 'ohmi seadus', 'jadaühendus', 'jadauhendus', 'rööpühendus', 'roopuhendus'],
        video: [
          ['🔋', 'Vooluringis on vooluallikas, tarbija, lüliti ja juhtmed.'],
          ['➡️', 'Elektrivool on laetud osakeste suunatud liikumine.'],
          ['📏', 'Voolutugevust mõõdab ampermeeter, pinget voltmeeter.'],
          ['🧮', 'Ohmi seadus: I = U/R.'],
          ['🔗', 'Jadamisi ühendatud tarbijates on voolutugevus sama.'],
          ['🔀', 'Rööbiti ühendatud tarbijatel on pinge sama.']
        ],
        kaardid: [
          ['Millised on vooluringi põhiosad?', 'Vooluallikas, tarbija, lüliti ja ühendusjuhtmed.'],
          ['Kuidas ühendatakse ampermeeter ja voltmeeter?', 'Ampermeeter jadamisi, voltmeeter rööbiti.'],
          ['Leia voolutugevus, kui U = 12 V ja R = 4 Ω.', 'I = 12 V / 4 Ω = 3 A.'],
          ['Kuidas leida jadaühenduse kogutakistust?', 'R = R₁ + R₂.'],
          ['Mis kehtib rööpühenduse korral?', 'U = U₁ = U₂ ja I = I₁ + I₂.'],
          ['Millest sõltub juhi takistus?', 'Materjalist, pikkusest ja ristlõike pindalast: R = ρl/S.']
        ],
        tekst: [
          'Elektrivool on laetud osakeste suunatud liikumine. Metallides liiguvad elektronid, vedelikes ja gaasides ioonid. Vooluks on vaja vooluallikat ja suletud vooluringi.',
          'Vooluringi joonistatakse skeemina kokkuleppeliste tingmärkidega. Vooluallikas tekitab pinge, tarbija muundab elektrienergia näiteks valguseks või soojuseks.',
          'Voolutugevust (A) mõõdetakse ampermeetriga, mis ühendatakse jadamisi. Pinget (V) mõõdetakse voltmeetriga, mis ühendatakse rööbiti. Takistuse ühik on oom (Ω).',
          'Ohmi seadus: I = U/R. Jadaühenduses on voolutugevus kõikjal sama, pinged ja takistused liituvad. Rööpühenduses on pinge sama, voolutugevused liituvad ja 1/R = 1/R₁ + 1/R₂.',
          'Juhi takistus sõltub materjalist, pikkusest ja jämedusest: R = ρl/S. Pikk ja peenike traat takistab voolu rohkem kui lühike ja jäme.'
        ]
      },
      {
        nimi: 'Elektri töö, võimsus ja ohutus',
        emoji: '💡',
        sonad: ['elektrienergia', 'võimsus', 'voimsus', 'kilovatt-tund', 'kaitse', 'lühis', 'luhis', 'elektriohutus', 'maandus'],
        video: [
          ['💡', 'Elektrivool teeb tööd: lamp helendab, veekeetja soojeneb.'],
          ['🧮', 'Elektrivoolu võimsus N = I · U.'],
          ['🔢', 'Tarbitud energiat mõõdetakse kilovatt-tundides (kWh).'],
          ['🔥', 'Voolu toimel eraldub soojust: Q = I²Rt.'],
          ['⚠️', 'Lühis tekitab väga suure voolu ja võib põhjustada tulekahju.'],
          ['🛡️', 'Kaitse ja maandus hoiavad meid ja seadmeid ohutuna.']
        ],
        kaardid: [
          ['Kuidas arvutada elektrivoolu tööd?', 'A = I · U · t.'],
          ['Kui suur on veekeetja võimsus, kui U = 230 V ja I = 5 A?', 'N = 230 V · 5 A = 1150 W.'],
          ['Kui palju energiat kulutab 2 kW ahi 3 tunniga?', '2 kW · 3 h = 6 kWh.'],
          ['Mis on lühis?', 'Olukord, kus vool läheb tarbijast mööda väga väikese takistusega teed ja voolutugevus kasvab järsult.'],
          ['Milleks on kaitse?', 'See katkestab vooluringi, kui vool läheb liiga suureks.'],
          ['Milleks on kaitsemaandus?', 'See juhib ohtliku voolu maasse, kui seade on rikkis.']
        ],
        tekst: [
          'Elektrivool teeb tööd ja muundab elektrienergia valguseks, soojuseks või liikumiseks. Töö arvutatakse valemiga A = IUt ja võimsus valemiga N = IU.',
          'Kodus mõõdab elektriarvesti kulutatud energiat kilovatt-tundides. Maksumuse leiame, kui korrutame kilovatt-tunnid ühe kilovatt-tunni hinnaga.',
          'Kui juhtmes on vool, see soojeneb. Eralduv soojushulk on Q = I²Rt. Selle peal töötavad näiteks triikraud ja veekeetja.',
          'Lühise korral kasvab voolutugevus järsult ja juhtmed võivad üle kuumeneda. Kaitse katkestab sel juhul vooluringi. Kaitse peab sobima kõigi korraga töötavate seadmete koguvõimsusega.',
          'Elektriga tuleb olla ettevaatlik: ära kasuta katkiste juhtmetega seadmeid, ära puuduta pistikupesa märgade kätega ning lase rikkeid parandada spetsialistil.'
        ]
      },
      {
        nimi: 'Magnetnähtused',
        emoji: '🧲',
        sonad: ['magnet', 'magnetväli', 'magnetvali', 'kompass', 'magnetpoolus', 'elektromagnet'],
        video: [
          ['🧲', 'Igal magnetil on põhja- ja lõunapoolus.'],
          ['🔁', 'Samanimelised poolused tõukuvad, erinimelised tõmbuvad.'],
          ['✨', 'Rauapuru näitab magnetvälja jõujooni.'],
          ['🧭', 'Kompassinõel pöördub Maa magnetvälja suunas.'],
          ['🔌', 'Vooluga juhe pöörab magnetnõela – vool tekitab magnetvälja.'],
          ['🏗️', 'Elektromagnet tõstab romuplatsil rauda.']
        ],
        kaardid: [
          ['Mitu poolust on magnetil?', 'Kaks: põhjapoolus (N) ja lõunapoolus (S).'],
          ['Kuidas mõjuvad magnetite samanimelised poolused?', 'Nad tõukuvad.'],
          ['Miks kompass näitab põhja?', 'Kompassinõel on magnet, mis pöördub Maa magnetvälja suunas.'],
          ['Kuidas saab magnetvälja nähtavaks teha?', 'Rauapuru abil, mis asetub mööda jõujooni.'],
          ['Mida näitab magnetnõela pöördumine vooluga juhtme lähedal?', 'Et elektrivool tekitab enda ümber magnetvälja.'],
          ['Mis on elektromagnet?', 'Raudsüdamikuga mähis, mis muutub magnetiks, kui sellest läbib vool.']
        ],
        tekst: [
          'Magnetil on kaks poolust: põhjapoolus ja lõunapoolus. Samanimelised poolused tõukuvad ja erinimelised tõmbuvad.',
          'Magneti ümber on magnetväli. Seda saab nähtavaks teha rauapuruga, mis asetub mööda magnetvälja jõujooni.',
          'Ka Maa on nagu suur magnet. Kompassinõel pöördub Maa magnetvälja suunas ja aitab leida põhjasuunda.',
          'Elektrivool tekitab enda ümber magnetvälja. Seepärast pöörab vooluga juhe magnetnõela. Elektromagnetit saab sisse ja välja lülitada.',
          'Magneteid kasutatakse elektrimootorites, kõlarites, uksesulgurites ja kompassides.'
        ]
      },
      {
        nimi: 'Soojus ja aine olekud',
        emoji: '🌡️',
        sonad: ['soojus', 'temperatuur', 'soojusülekanne', 'soojusulekanne', 'konvektsioon', 'soojusjuhtivus', 'sulamine', 'aurumine', 'erisoojus'],
        video: [
          ['🌡️', 'Mida soojem on aine, seda kiiremini selle osakesed liiguvad.'],
          ['🛤️', 'Soojenedes kehad paisuvad – seepärast on rööbaste vahel vahed.'],
          ['🥄', 'Metall-lusikas kuumas tees soojeneb: see on soojusjuhtivus.'],
          ['🔥', 'Soe õhk tõuseb üles ja külm laskub alla: see on konvektsioon.'],
          ['☀️', 'Päikese soojus jõuab meieni kiirgusena.'],
          ['🧊', 'Jää sulab 0 °C juures ja vesi keeb normaalrõhul 100 °C juures.']
        ],
        kaardid: [
          ['Mida näitab temperatuur?', 'Aineosakeste keskmist liikumisenergiat.'],
          ['Kuidas teisendada Celsiuse kraadid kelviniteks?', 'T = t + 273, näiteks 0 °C = 273 K.'],
          ['Nimeta kolm soojusülekande liiki.', 'Soojusjuhtivus, konvektsioon ja soojuskiirgus.'],
          ['Mis on aine erisoojus?', 'Soojushulk, mis on vaja 1 kg aine soojendamiseks 1 °C võrra.'],
          ['Kui palju soojust on vaja 1 kg vee soojendamiseks 10 °C võrra?', 'Q = cmΔt = 4200 · 1 · 10 = 42 000 J.'],
          ['Mis toimub aurumisel?', 'Vedelik muutub gaasiks ja võtab ümbrusest soojust.']
        ],
        tekst: [
          'Kõik ained koosnevad pidevalt liikuvatest osakestest. Mida kõrgem on temperatuur, seda kiiremini osakesed liiguvad. Soojenedes kehad enamasti paisuvad.',
          'Temperatuuri mõõdetakse termomeetriga. Kasutatakse Celsiuse skaalat (°C) ja Kelvini skaalat (K): T = t + 273.',
          'Soojus liigub soojemalt kehalt külmemale kolmel viisil: soojusjuhtivusega (näiteks metallis), konvektsiooniga (vedelikes ja gaasides) ja kiirgusega (näiteks Päikeselt).',
          'Soojushulka arvutatakse valemiga Q = cmΔt, kus c on aine erisoojus. Vee erisoojus on suur, umbes 4200 J/(kg·°C), seepärast soojeneb ja jahtub vesi aeglaselt.',
          'Aine võib olla tahkes, vedelas või gaasilises olekus. Sulamisel, aurumisel ja keemisel neelab aine soojust, tahkumisel ja kondenseerumisel eraldab soojust.'
        ]
      }
    ]
  }
};
