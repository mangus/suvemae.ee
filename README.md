# suvemae.ee

Source for [suvemäe.ee](https://suvemäe.ee/), the landing page of Suvemäe, the democratic school division of Tallinna Kunstigümnaasium, and the **Suvemäe labor**, where the school's children publish the games, animations and experiments they build together with AI agents.

| Folder | What it is |
|---|---|
| [`www/`](www/) | [suvemäe.ee](https://suvemäe.ee/) |
| [`labor/`](labor/) | [labor.suvemäe.ee](https://labor.suvemäe.ee/) |
| `labor/<slug>/` | `labor.suvemäe.ee/<slug>/`, one project |
| [`labor/lab.js`](labor/lab.js) | storage, high scores and realtime rooms for projects |
| [`server/`](server/) | the lab server at `labor.suvemäe.ee/api/` |
| [`deploy/`](deploy/), [`.github/workflows/`](.github/workflows/) | publishing `main` to Opalstack, and the previews |

The school homepage, [tkg.suvemäe.ee](https://tkg.suvemäe.ee/), is a separate WordPress site and does not live here.

What agents must and must not do while working with a child is in [AGENTS.md](AGENTS.md).

## The lab server

Projects stay plain HTML and JavaScript. For saving data and playing together they import `labor/lab.js`, which talks to one shared Node.js server (`server/server.js`, Node 22.13 or newer, SQLite through `node:sqlite`, WebSockets through `ws`). Children and their agents never write server code; the limits and safety rules live in one place:

- each project's data is kept apart under its slug, and only slugs with a folder in `labor/` are accepted;
- per-IP rate limits, size limits on requests, values and messages, at most 500 keys per project and 30 visitors per realtime room;
- high score names are cleaned and limited to 20 characters; there is no word filter, and a teacher removes unwanted entries through the agent, straight from the SQLite database;
- errors are logged on the server; visitors only see a short message.

The server reads a JSON config named by `LABOR_CONFIG`: `port`, `db`, `mounts` (URL prefix to a static folder, or `null` for API only; the API answers at `<prefix>api/`), `origins`, `projectsFile`, `indexPath` and `wsAliases` (extra WebSocket prefixes mapped onto mount prefixes).

Run it locally with the lab included:

```sh
cd server && npm ci && npm run dev
```

Then open <http://localhost:8000/naidis/>.

## Publishing

Every push to `main` goes live: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs [`deploy/opalstack.sh`](deploy/opalstack.sh), which copies `www/` and `labor/` to their Opalstack apps and `server/` to the API app, backs up the API's database into `data/backup/` and restarts the server. There is no staging copy in between. The workflow needs the repository secrets `OPALSTACK_SSH_KEY` and `OPALSTACK_KNOWN_HOSTS`. The API's database, config and logs live in its `data/` folder and `config.json` on Opalstack and are never overwritten. Files are never edited by hand on Opalstack.

## Previews

The agent server keeps one working copy per group (`/srv/suvemae/<group>`) and serves each one, with its own preview database, at `https://agent1122.mintbot.ai/app/<group>/` (the lab) and `/app/<group>/www/` (the landing page), straight from the files on disk with no build or deploy step. The platform proxy passes WebSockets only under `/app/ws/`, so in a preview `lab.js` connects there and the server maps `/app/ws/` back onto `/app/`. The configuration is [`deploy/preview.json`](deploy/preview.json); the systemd unit is in [`deploy/systemd/`](deploy/systemd/). The preview server itself runs from `/srv/suvemae/main`, which is updated by hand when `server/` changes.
