"""Browser regression checks. Run: uv run --with playwright tests/rendering.py"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    source = (ROOT / 'mang.js').read_text()
    source = source.rsplit('})();', 1)[0] + 'window.testGame = {makeSprite, TEGELASED, OSAD, LISAD, look, player, npcs, S};})();'
    page.route('**/mang.js', lambda route: route.fulfill(body=source, content_type='application/javascript'))
    page.goto(f'http://127.0.0.1:{server.server_port}/')
    result = page.evaluate('''() => {
      const {makeSprite, TEGELASED, OSAD, S} = testGame;
      let count = 0;
      for (const headShape of OSAD[0].v.map(v => v[0]))
        for (const bodyShape of OSAD[1].v.map(v => v[0]))
          for (const hair of OSAD[3].v.map(v => v[0])) {
            const c = makeSprite({...TEGELASED[0], teacher: true, seed: 999,
              headShape, bodyShape, hair, hat: '#c8705f', bag: '#98ad7c',
              book: '#7ea6b8', scarf: '#dcb15a', glasses: true});
            const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
            for (let y=0;y<c.height;y++) for(let x=0;x<c.width;x++)
              if ((x < S || y < S || x >= c.width-S || y >= c.height-S) && d[(y*c.width+x)*4+3])
                throw Error(`Sprite clipped: ${headShape}/${bodyShape}/${hair} at ${x},${y}`);
            count++;
          }
      return count;
    }''')
    print('Unclipped teacher/all-accessory combinations:', result)
    page.locator('#alusta').click()
    count = page.locator('#osad button').count()
    for button in page.locator('#osad button').all():
        button.click()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Mobile overflow'
    page.locator('#valmis').click()
    before = page.evaluate('({x:testGame.player.x,y:testGame.player.y})')
    box = page.locator('#louend').bounding_box()
    page.touchscreen.tap(box['x'] + box['width'] * .30, box['y'] + box['height'] * .62)
    page.wait_for_timeout(650)
    after = page.evaluate('({x:testGame.player.x,y:testGame.player.y})')
    assert before != after, 'Touch did not move player'
    assert not errors, errors
    print('Builder buttons exercised:', count, 'Mobile touch:', before, '->', after, 'Errors:', errors)
    page.screenshot(path=str(ROOT / 'tests/mobile.png'))
    page.evaluate('''() => {
      const sheet = document.createElement('canvas'); sheet.width=1100; sheet.height=500;
      const c=sheet.getContext('2d'); c.fillStyle='#f8f2e4'; c.fillRect(0,0,1100,500);
      testGame.TEGELASED.forEach((o,i)=>{
        const s=testGame.makeSprite({...o,seed:100+i*17});
        const x=20+(i%9)*120,y=10+Math.floor(i/9)*245;
        c.drawImage(s,x,y,s.width/testGame.S*1.4,s.height/testGame.S*1.4);
        c.fillStyle='#35344a'; c.font='13px sans-serif'; c.fillText(o.name,x+18,y+230);
      });
      document.body.replaceChildren(sheet);
    }''')
    page.set_viewport_size({'width':1100,'height':500})
    page.screenshot(path=str(ROOT / 'tests/characters.png'))
    browser.close()
server.shutdown()
