// Suvemäe labor: saving data, high scores and realtime rooms for lab projects.
//
//   import { lab } from '../lab.js';
//   const minu = lab();                     // the project's slug comes from the page address
//   await minu.save('seaded', { heli: true });
//   const seaded = await minu.load('seaded', { heli: false });
//   await minu.addScore('Mari', 120);
//   const parimad = await minu.topScores(10);
//   const tuba = minu.join('tuba1');
//   tuba.on('message', (andmed, kellelt) => { ... });
//   tuba.send({ x: 10, y: 20 });
//
// The lab server lives at api/ next to this file, so the same code works on
// labor.suvemäe.ee, in the previews and when running the server locally.

const API = new URL('api/', import.meta.url);
const BASE = new URL('./', import.meta.url).pathname;

function slugFromPage() {
  const slug = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length).split('/')[0] : '';
  if (!slug || slug.includes('.')) {
    throw new Error('lab(): projekti nime ei leitud aadressist, anna see ise: lab("minu-projekt")');
  }
  return slug;
}

async function request(method, url, body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Labori server vastas veaga ${res.status}`);
  return data;
}

export function lab(slug = slugFromPage()) {
  const base = new URL(`p/${encodeURIComponent(slug)}/`, API);
  const keyUrl = (key) => new URL(`kv/${encodeURIComponent(key)}`, base);
  const boardUrl = (board, params = {}) => {
    const url = new URL('scores', base);
    url.search = new URLSearchParams({ board, ...params });
    return url;
  };
  return {
    slug,
    // Saves any JSON value (up to 16 kB) under a key. Everyone sees the same value.
    async save(key, value) {
      await request('PUT', keyUrl(key), { value });
    },
    // Returns the saved value, or `fallback` when nothing is saved yet.
    async load(key, fallback = null) {
      const data = await request('GET', keyUrl(key));
      return data.found ? data.value : fallback;
    },
    async remove(key) {
      await request('DELETE', keyUrl(key));
    },
    async keys() {
      return (await request('GET', new URL('kv', base))).keys;
    },
    // Adds a result to a high score table; `board` lets one project have several tables.
    async addScore(name, score, board = 'main') {
      await request('POST', boardUrl(board), { name, score });
    },
    // Best results first; use order 'asc' when smaller is better (times).
    async topScores(limit = 10, { board = 'main', order = 'desc' } = {}) {
      return (await request('GET', boardUrl(board, { limit, order }))).scores;
    },
    // Joins a realtime room: everyone in the same room gets each other's messages.
    join(room = 'main') {
      return new Room(new URL('ws', base), room);
    },
  };
}

// Events: 'open' (myId, peerIds), 'join' (peerId), 'leave' (peerId),
// 'message' (data, fromId), 'close', 'full' (the room has 30 people already).
// Reconnects by itself after a dropped connection.
class Room {
  #url;
  #socket = null;
  #handlers = new Map();
  #closed = false;
  #retries = 0;

  constructor(url, name) {
    this.#url = new URL(url);
    this.#url.protocol = this.#url.protocol === 'https:' ? 'wss:' : 'ws:';
    this.#url.searchParams.set('room', name);
    this.name = name;
    this.id = null;
    this.peers = new Set();
    this.#connect();
  }

  get connected() {
    return this.#socket !== null && this.#socket.readyState === WebSocket.OPEN && this.id !== null;
  }

  on(event, handler) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());
    this.#handlers.get(event).add(handler);
    return this;
  }

  off(event, handler) {
    this.#handlers.get(event)?.delete(handler);
    return this;
  }

  // Sends to everyone else in the room. Returns false while not connected.
  send(data) {
    return this.#send({ data });
  }

  sendTo(peerId, data) {
    return this.#send({ to: peerId, data });
  }

  close() {
    this.#closed = true;
    this.#socket?.close();
  }

  #send(message) {
    if (!this.connected) return false;
    this.#socket.send(JSON.stringify(message));
    return true;
  }

  #emit(event, ...args) {
    for (const handler of this.#handlers.get(event) ?? []) {
      try {
        handler(...args);
      } catch (err) {
        console.error(err);
      }
    }
  }

  #connect() {
    const socket = new WebSocket(this.#url);
    this.#socket = socket;
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.type === 'welcome') {
        this.id = message.id;
        this.peers = new Set(message.peers);
        this.#retries = 0;
        this.#emit('open', this.id, [...this.peers]);
      } else if (message.type === 'join') {
        this.peers.add(message.id);
        this.#emit('join', message.id);
      } else if (message.type === 'leave') {
        this.peers.delete(message.id);
        this.#emit('leave', message.id);
      } else if (message.type === 'message') {
        this.#emit('message', message.data, message.from);
      }
    };
    socket.onclose = (event) => {
      const peers = [...this.peers];
      this.peers.clear();
      this.id = null;
      for (const peer of peers) this.#emit('leave', peer);
      this.#emit('close');
      if (event.code === 4001) return this.#emit('full');
      if (this.#closed) return;
      const delay = Math.min(10000, 500 * 2 ** this.#retries++);
      setTimeout(() => this.#connect(), delay);
    };
  }
}

export default lab;
