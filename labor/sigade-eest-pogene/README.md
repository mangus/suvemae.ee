# Põgene sigade eest!

3D-mäng, kus sina oled siil. Jooksed aiaga piiratud metsalagendikul, korjad õunu ja põgened näljaste sigade eest. Iga 15 sekundi järel tuleb juurde uus siga ja sead jooksevad aina kiiremini.

Kuidas mängida:

- Korja 10 õuna. Kui saad kõik kätte, oled võitnud.
- Kui siga sind puudutab, on mäng läbi.
- Keera end kerra (tühik või 🦔 nupp). Siis ei saa siga sind kätte ja okkad lükkavad ta eemale. Kerra saab keerata iga 4 sekundi järel.
- Arvutis liigud WASD- või nooleklahvidega, telefonis ekraaninuppudega.

Mängu 3D-vaade tuleb väikesest omatehtud mootorist (`mootor.mjs`). See joonistab tavalisele canvasele mudeleid, mis on tehtud lihtsatest kujunditest (kast, silinder, koonus, kera). Mudelid on failis `mudelid.mjs`, mängureeglid failis `game-core.mjs` ja mäng ise failis `mang.mjs`. Teste saab käivitada käskudega `node game-core.test.mjs` ja `node mootor.test.mjs`.

Made by the Kakud group. Made with the help of the Suvemäe labor [AI agent on mintbot.ai](https://mintbot.ai/).

Kõik mudelid, värvid ja helid on tehtud mängu enda koodiga. Väliseid materjale ei kasutata.
