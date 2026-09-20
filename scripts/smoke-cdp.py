import json
import socket
import struct
import time
import urllib.request
import base64
from urllib.parse import urlparse


def ws(url):
    p = urlparse(url)
    s = socket.create_connection((p.hostname, p.port))
    key = base64.b64encode(b'echo-key').decode()
    s.sendall(f'GET {p.path} HTTP/1.1\r\nHost: {p.hostname}:{p.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'.encode())
    data = b''
    while b'\r\n\r\n' not in data:
        data += s.recv(4096)
    return s


def send(s, obj):
    payload = json.dumps(obj).encode()
    mask = b'abcd'
    length = len(payload)
    if length < 126:
        header = bytes([129, 128 | length])
    elif length < 65536:
        header = bytes([129, 254]) + struct.pack('>H', length)
    else:
        header = bytes([129, 255]) + struct.pack('>Q', length)
    s.sendall(header + mask + bytes(value ^ mask[index % 4] for index, value in enumerate(payload)))


def recv(s):
    while True:
        header = s.recv(2)
        opcode = header[0] & 15
        length = header[1] & 127
        if length == 126:
            length = struct.unpack('>H', s.recv(2))[0]
        elif length == 127:
            length = struct.unpack('>Q', s.recv(8))[0]
        data = b''
        while len(data) < length:
            data += s.recv(length - len(data))
        if opcode == 1:
            return json.loads(data)


def command(s, ident, method, params=None):
    send(s, {'id': ident, 'method': method, 'params': params or {}})
    while True:
        response = recv(s)
        if response.get('id') == ident:
            return response


def evaluate(s, ident, expression):
    response = command(s, ident, 'Runtime.evaluate', {
        'expression': expression,
        'awaitPromise': True,
        'returnByValue': True,
    })
    return response.get('result', {}).get('result', {}).get('value')


def body(s, ident):
    return evaluate(s, ident, 'document.body.innerText') or ''


def click_text(s, ident, text, selector='button'):
    expression = "(() => { const button = [...document.querySelectorAll(%s)].find(item => item.textContent.includes(%s)); if (!button) return 'missing'; button.click(); return 'clicked' })()" % (json.dumps(selector), json.dumps(text))
    return evaluate(s, ident, expression)


def key(s, ident, key_name, ctrl=False, meta=False):
    return evaluate(s, ident, "window.dispatchEvent(new KeyboardEvent('keydown', { key: %s, ctrlKey: %s, metaKey: %s, bubbles: true })); 'sent'" % (json.dumps(key_name), str(ctrl).lower(), str(meta).lower()))


def set_select(s, ident, value):
    expression = "(() => { const select = document.querySelector('.filter-controls select'); if (!select) return 'missing'; const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; setter.call(select, %s); select.dispatchEvent(new Event('change', { bubbles: true })); return select.value })()" % json.dumps(value)
    return evaluate(s, ident, expression)


def set_input(s, ident, selector, value):
    expression = "(() => { const input = document.querySelector(%s); if (!input) return 'missing'; input.focus(); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, %s); input.dispatchEvent(new Event('input', { bubbles: true })); return input.value })()" % (json.dumps(selector), json.dumps(value))
    return evaluate(s, ident, expression)


pages = json.load(urllib.request.urlopen('http://127.0.0.1:9223/json'))
page = next(item for item in pages if item.get('type') == 'page')
socket_ = ws(page['webSocketDebuggerUrl'])
command(socket_, 1, 'Page.navigate', {'url': 'http://127.0.0.1:4174/'})
time.sleep(2.5)
print('1 landing:', 'BEGIN INVESTIGATION' in body(socket_, 2))
print('begin:', click_text(socket_, 3, 'BEGIN INVESTIGATION'))
time.sleep(2)
archive = body(socket_, 4)
print('archive:', 'ARCHIVE OVERVIEW' in archive, 'graph:', 'CONNECTION GRAPH' in archive)
print('nav listening:', click_text(socket_, 5, 'LISTENING', '.nav-item'))
time.sleep(.3)
listening = body(socket_, 6)
print('2 listening:', 'WORLD 01 / LISTENING ARCHIVE' in listening, 'matrix:', 'Three rhythms, one clock.' in listening, 'wedges:', evaluate(socket_, 7, "document.querySelectorAll('.matrix-wedge').length"))
print('hour:', evaluate(socket_, 8, "(() => { const button = document.querySelector('[aria-label=\"Focus 03:00\"]'); if (!button) return 'missing'; button.click(); return 'clicked' })()"))
time.sleep(.15)
print('3 hour:', evaluate(socket_, 9, "document.querySelector('.matrix-readout')?.innerText"))
print('4 filter:', set_select(socket_, 10, 'spotify'))
time.sleep(.15)
print('filter row:', evaluate(socket_, 11, "document.querySelector('.active-filter-row')?.innerText"))
print('filter reset:', click_text(socket_, 111, 'RESET FILTERS', '.reset-button'))
time.sleep(.15)
print('reset cleared:', evaluate(socket_, 112, "Boolean(document.querySelector('.active-filter-row'))"))
print('5 palette:', click_text(socket_, 12, 'COMMAND SEARCH', '.palette-hint'))
time.sleep(.2)
print('open:', evaluate(socket_, 13, "Boolean(document.querySelector('.command-palette'))"))
print('query:', set_input(socket_, 14, '.palette-input input', 'long sessions'))
time.sleep(.2)
print('result:', evaluate(socket_, 15, "document.querySelector('.palette-results')?.innerText"))
key(socket_, 16, 'Escape')
time.sleep(.1)
print('nav transaction:', click_text(socket_, 17, 'TRANSACTIONS', '.nav-item'))
time.sleep(.4)
transaction = body(socket_, 18)
print('6 transactions:', 'WORLD 03 / TRANSACTION STRUCTURE' in transaction, 'slider:', evaluate(socket_, 19, "Boolean(document.querySelector('.entropy-slider'))"))
print('slider:', evaluate(socket_, 20, "document.querySelector('.entropy-slider')?.value"))
print('set slider:', evaluate(socket_, 21, "(() => { const input = document.querySelector('.entropy-slider'); if (!input) return 'missing'; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, '88'); input.dispatchEvent(new Event('input', { bubbles: true })); return input.value })()"))
time.sleep(.2)
print('readout:', evaluate(socket_, 22, "document.querySelector('.entropy-readout')?.innerText"))
print('7 add:', click_text(socket_, 23, '+ ADD TO CASE FILE', '.bookmark-cta'))
time.sleep(.15)
print('count:', evaluate(socket_, 24, "document.querySelector('.case-trigger')?.innerText"))
print('ctrlE:', key(socket_, 25, 'e', ctrl=True))
time.sleep(.2)
print('drawer:', evaluate(socket_, 26, "Boolean(document.querySelector('.case-drawer'))"), 'dossier:', 'EXPORT DOSSIER' in body(socket_, 27))
print('export click:', click_text(socket_, 271, 'EXPORT DOSSIER', '.drawer-actions button'))
time.sleep(.1)
key(socket_, 28, 'Escape')
time.sleep(.1)
print('nav overview:', click_text(socket_, 29, 'OVERVIEW', '.nav-item'))
time.sleep(.3)
print('space:', key(socket_, 30, ' '))
time.sleep(.2)
flight = body(socket_, 31)
print('8 flight:', 'Locking onto the trace...' in flight or 'CAMERA FLY-THROUGH' in flight)
time.sleep(1.2)
flight_done = body(socket_, 32)
print('inspector:', evaluate(socket_, 33, "Boolean(document.querySelector('.investigation-panel'))"), 'alignment:', 'ANALYTICAL ALIGNMENT' in flight_done)
print('9 key 1:', key(socket_, 34, '1'), 'listening:', 'WORLD 01 / LISTENING ARCHIVE' in body(socket_, 35))
print('key 2:', key(socket_, 36, '2'), 'spending:', 'WORLD 02 / HOUSEHOLD LEDGER' in body(socket_, 37))
print('key 3:', key(socket_, 38, '3'), 'transactions:', 'WORLD 03 / TRANSACTION STRUCTURE' in body(socket_, 39))
print('ctrlK:', key(socket_, 40, 'k', ctrl=True))
time.sleep(.15)
print('keyboard palette:', evaluate(socket_, 41, "Boolean(document.querySelector('.command-palette'))"))
