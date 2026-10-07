# Ralf TI

Ralf TI is a friendly robot that helps Suvemäe pupils study. Pick a subject, then your grade, then a topic (or type a word and press "Küsi Ralfilt"), and choose how to learn: a short emoji video with one sentence per scene, flashcards, or easy-to-read text.

"Küsi Ralfilt" searches every topic: its name, keywords, flashcards, video and text. Below the results there are links that open the same word in Vikipeedia, Sõnaveeb and E-koolikott in a new tab; Ralf itself sends nothing to those sites.

Ralf also answers everyday small talk (who made him, how he is, jokes, riddles, the time and date, and more). Those answers live in `jutt.js`: add a pattern and answers there to teach him something new.

Ralf helps you learn, but does not do homework for you: graded work must be your own (school curriculum, section 14).

All lessons live in `ained/`, one ES module per subject; Ralf does not talk to any outside AI service. The topics follow the school curriculum (Tallinna Kunstigümnaasium, grades 1–9): Estonian, literature (5–9), maths, English, nature studies, biology, geography, physics, chemistry, human studies, history, civics, art and music. PE and technology are not in yet.

To add a topic, add an object with `nimi`, `emoji`, `sonad` (search keywords), `video` (`[emoji, sentence]` scenes), `kaardid` (`[question, answer]`) and `tekst` (paragraphs) to the right grade in the subject's file.

Made by Ralf-Stefan from the Sinine group. Made with the help of the Suvemäe labor [AI agent on mintbot.ai](https://mintbot.ai/).

Ralf is drawn in SVG for this project; the pictures in the video are emoji.
