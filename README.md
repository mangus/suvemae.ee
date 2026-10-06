# suvemae.ee

Source for the static parts of [suvemäe.ee](https://suvemäe.ee/): the landing page of Suvemäe, the democratic school division of Tallinna Kunstigümnaasium, and the **Suvemäe labor**, where the school's children publish the games, animations and experiments they build together with AI agents.

| Folder | Live at |
|---|---|
| [`www/`](www/) | [suvemäe.ee](https://suvemäe.ee/) |
| [`labor/`](labor/) | [labor.suvemäe.ee](https://labor.suvemäe.ee/) |
| `labor/<slug>/` | `labor.suvemäe.ee/<slug>/`, one child's project |

The school homepage, [tkg.suvemäe.ee](https://tkg.suvemäe.ee/), is a separate WordPress site and does not live here.

## How a work reaches the lab

The four steps on the lab page, as they map onto this repository:

1. **Idee**: a child comes up with a game, an animation or an experiment.
2. **Koos AI-agendiga**: the child builds it with an AI agent in `labor/<slug>/`, on a `labor/<slug>` branch.
3. **Eelvaade ja heakskiit**: a grown-up previews the pull request, adds the work's card to the lab page and merges it into `main`.
4. **Oma aadress**: once `main` is deployed, the work lives at `labor.suvemäe.ee/<slug>/`.

What agents must and must not do while working with a child is in [AGENTS.md](AGENTS.md).

## Preview locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/labor/>.

## Deploy

Not automated yet. Both sites are plain files served as they are, so deploying means copying `www/` and `labor/` to their document roots on the web host. Keep `main` identical to what is live.
