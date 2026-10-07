"""Offline Chromium tests. Run: uv run --with playwright browser.test.py.
Only lab.js is stubbed (throws offline); game source and canvas are real.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    def serve(route):
        name = route.request.url.split('/')[-1] or 'index.html'
        if name == 'lab.js':
            route.fulfill(body='export function lab() { throw new Error("Offline test"); }', content_type='text/javascript')
            return
        if name not in ['index.html', 'style.css', 'game.js']:
            route.abort()
            return
        text = (ROOT / name).read_text()
        if name == 'game.js':
            text += '\nwindow.testGame = { BODIES, SHOP, me, drawHuman, cleanLook, myLook, readCode, profileCode, loadProfile, avatar, humanSprite, drawShop, buy, buyBody, wear, startSolo, goMenu };'
        route.fulfill(body=text, content_type={'html':'text/html','css':'text/css','js':'text/javascript'}[name.split('.')[-1]])
    page.route('http://ahvihotell.test/**', serve)
    page.goto('http://ahvihotell.test/ahvihotell/')
    page.wait_for_function('window.testGame')
    result = page.evaluate('''() => {
      const {BODIES, SHOP, avatar} = testGame;
      const look = {b:0,s:4,k:0,c:0,w:[]};
      const image = l => avatar(l).toDataURL();
      const bodies = BODIES.map((b,i) => image({...look,b:i}));
      if (new Set(bodies).size !== BODIES.length) throw Error('Bodies must have distinct real canvas appearances');
      let checks = 0;
      for (let b=0; b<BODIES.length; b++) for (const item of SHOP.slice(27)) {
        if (image({...look,b,w:[item.id]}) === bodies[b]) throw Error('Invisible accessory: '+BODIES[b].name+' '+item.name);
        checks++;
      }
      return {uniqueBodies:bodies.length, accessoryDrawings:checks};
    }''')
    print('PASS real canvas:', result)
    page.locator('#shopBtn').click()
    categories = ['Kõik','Tegelased','Pea','Silmad','Kael','Selg','Särgid','Püksid','Jalanõud','Käes','Värvid']
    assert page.locator('#shopFilters button').all_text_contents() == categories
    counts = {'Pea':7, 'Silmad':3, 'Kael':3, 'Selg':3, 'Särgid':3, 'Püksid':9, 'Jalanõud':8, 'Käes':3}
    for label, count in counts.items():
        page.get_by_role('button', name=label, exact=True).click()
        assert page.locator('#shopItems .item').count() == count, label
        assert not page.locator('#bodyItems').is_visible()
    page.get_by_role('button', name='Tegelased', exact=True).click()
    assert page.locator('#bodyItems .item').count() == 9
    assert not page.locator('#shopItems').is_visible()
    page.get_by_role('button', name='Kõik', exact=True).click()
    assert page.locator('#shopItems .item').count() == 39
    assert page.evaluate('document.querySelector("#shop").scrollWidth <= innerWidth')
    print('PASS: all category filters and 390px mobile width')
    assert not errors, errors
    browser.close()
