
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = name =>
  fs.readFileSync(path.join(root, name), 'utf8');

test('alıcı menülerinde lojistik teklif bağlantıları yok', () => {
  for (const name of [
    'src/components/Navbar.tsx',
    'src/components/buyer/BuyerPanelNavigation.tsx',
  ]) {
    const source = read(name);
    assert.doesNotMatch(source, /to="\/buyer\/shipping-(quotes|request)"/);
    assert.doesNotMatch(source, /path: "\/buyer\/shipping-(quotes|request)"/);
  }
});

test('alıcı panelinde lojistik teklif kartı yok', () => {
  const source = read('src/pages/BuyerDashboardPage.tsx');
  assert.doesNotMatch(source, /<Link to="\/buyer\/shipping-quotes"/);
  assert.match(source, /to="\/buyer\/orders"/);
});

test('sipariş sayfasında nakliye teklifi düğmesi yok', () => {
  const source = read('src/pages/BuyerOrdersPage.tsx');
  assert.doesNotMatch(source, /to={`\/buyer\/shipping-request/);
  assert.match(source, /startOrderChat\(o\.id\)/);
});

test('yeni nakliye talebi sayfası siparişlere yönleniyor', () => {
  const source = read('src/App.tsx');
  assert.match(source,
    /path="\/buyer\/shipping-request"[\s\S]*?<Navigate to="\/buyer\/orders" replace \/>/);
});

test('lojistik teklif sayfası siparişlere yönleniyor', () => {
  const source = read('src/App.tsx');
  assert.match(source,
    /path="\/logistics\/shipping"[\s\S]*?<PrivateRoute role="LOGISTICS">[\s\S]*?<Navigate to="\/logistics\/orders" replace \/>/);
});

test('geçmiş teklifler ve takip sayfaları korunuyor', () => {
  const app = read('src/App.tsx');
  const quotes = read('src/pages/BuyerShippingQuotesPage.tsx');
  assert.match(app, /path="\/buyer\/shipping-quotes"/);
  assert.match(app, /path="\/logistics\/orders"/);
  assert.match(quotes, /shippingOrders\.find/);
  assert.match(quotes, /trackingPanelStyle/);
});

test('geçmiş teklifler ekranında kabul düğmesi yok', () => {
  const source = read('src/pages/BuyerShippingQuotesPage.tsx');
  assert.doesNotMatch(source, /onClick=\{\(\) => acceptQuote\(quote\.id\)\}/);
});

test('standart kargo ve sipariş rotaları korunuyor', () => {
  const app = read('src/App.tsx');
  assert.match(app, /path="\/buyer\/orders"/);
  assert.match(app, /path="\/seller\/orders"/);
});
