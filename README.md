# suvemae.ee

Source for [suvemäe.ee](https://suvemäe.ee/), the landing page of Suvemäe, the democratic school division of Tallinna Kunstigümnaasium, and the **Suvemäe labor**, where the school's children publish the games, animations and experiments they build together with [mintbot AI agents](https://mintbot.ai/).

| Folder | What it is |
|---|---|
| [`www/`](www/) | [suvemäe.ee](https://suvemäe.ee/) |
| [`labor/`](labor/) | [labor.suvemäe.ee](https://labor.suvemäe.ee/) |
| `labor/<slug>/` | `labor.suvemäe.ee/<slug>/`, one project |
| [`redirect/`](redirect/) | suvemae.ee, www.suvemae.ee and www.suvemäe.ee, all redirected to suvemäe.ee |
| [`labor/lab.js`](labor/lab.js) | storage, high scores and realtime rooms for projects |
| [`server/`](server/) | the lab server at `labor.suvemäe.ee/api/` |
| [`deploy/`](deploy/), [`.github/workflows/`](.github/workflows/) | how `main` is published |

The school homepage, [tkg.suvemäe.ee](https://tkg.suvemäe.ee/), is a separate WordPress site and does not live here.

What agents must and must not do while working with a child is in [AGENTS.md](AGENTS.md).

## From an idea to the lab

1. A child tells their agent what to make. The agent builds it in its own clone of this repository. There is no preview: every small step is pushed, and the child tries it live.
2. When the child is happy, the agent commits, puts the commit on top of `main` and pushes it (the steps are in [AGENTS.md](AGENTS.md), *Publishing*).
3. GitHub Actions publishes `main` to Opalstack. About a minute after the push the work is at `labor.suvemäe.ee/<slug>/`.

Nobody reviews the work on the way: what is pushed is what the children, their parents and the school see. The rules in AGENTS.md are the safeguard, so keep them current.

## The lab server

Projects stay plain HTML and JavaScript. For saving data and playing together they import `labor/lab.js`, which talks to one shared Node.js server (`server/server.js`, Node 22.13 or newer, SQLite through `node:sqlite`, WebSockets through `ws`). Children and their agents never write server code; the limits and safety rules live in one place:

- each project's data is kept apart under its slug, and only slugs with a folder in `labor/` are accepted;
- per-IP rate limits, size limits on requests, values and messages, at most 500 keys per project and 30 visitors per realtime room;
- high score names are cleaned and limited to 20 characters; there is no word filter, and a teacher removes unwanted entries through the agent, straight from the SQLite database;
- errors are logged on the server; visitors only see a short message.

The server reads a JSON config named by `LABOR_CONFIG`: `port`, `db`, `mounts` (URL prefix to a static folder, or `null` for API only; the API answers at `<prefix>api/`), `origins` and `projectsFile`.

Run it locally with the lab included:

```sh
cd server && npm ci && npm run dev
```

Then open <http://localhost:8000/naidis/>.

## Publishing

Every push to `main` goes live: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs [`deploy/opalstack.sh`](deploy/opalstack.sh), which mirrors `www/`, `labor/` and `redirect/` onto their Opalstack apps with rsync over SSH (files removed here are removed there too), copies `server/` to the API app, backs up the API's database into `data/backup/` and restarts the server. The job then checks that both pages serve what was pushed and that the API answers. There is no staging copy in between. A deploy takes about a minute, and deploys run one at a time: a push made during a deploy waits, and of several waiting pushes only the newest is deployed, since it carries all their changes; the ones it overtook show as cancelled. The log is under *Actions*, and a deploy can be started by hand there too.

| Folder | Opalstack app | Serves |
|---|---|---|
| `www/` | `~/apps/suvemaeweb_avaleht` | suvemäe.ee |
| `labor/` | `~/apps/suvemaeweb_labor` | labor.suvemäe.ee |
| `redirect/` | `~/apps/suvemaeweb_redirect` | suvemae.ee, www.suvemae.ee and www.suvemäe.ee, redirected to suvemäe.ee |
| `server/` | `~/apps/suvemaeweb_laborapi/server` | labor.suvemäe.ee/api/ (a proxy-port app on port 1534, started by `server/run.sh` from the user's crontab) |

The workflow runs in the repository's `production` environment, which only `main` may deploy to. Its one secret, `DEPLOY_SSH_KEY`, is an SSH key made for this workflow alone and installed with `restrict` in `~/.ssh/authorized_keys` on Opalstack; deleting the `github-actions@mangus/suvemae.ee` line there revokes it. The API's database, config and logs live in its `data/` folder and `config.json` on Opalstack and are never overwritten. Files are never edited by hand on Opalstack: the next deploy overwrites them. To see what a deploy would change without doing it, run the script with `DRY_RUN=1` and the same environment variables as the workflow from a machine with SSH access.

GitHub can leave a run hanging in *waiting* for the environment although `production` has no reviewers or wait timer: on 7 October 2026 one hung for half an hour, and every deploy after it queued up behind it. So each run first cancels the older runs hanging there (the `unstick` job), and the next push frees a stuck queue. Should the day's last push hang, cancel it under *Actions* and start a deploy by hand.
