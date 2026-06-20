const assert = require('node:assert/strict');
const {
    normalizeProtocolProfile,
    buildWebSocketUrl,
    getWebSocketHeaders,
    isTerminalWsCode,
} = require('../src/config/protocol');

const profile = normalizeProtocolProfile({
    serverUrl: 'wss://example.com/prod/ws?bad=1#frag',
    clientVersion: '1.2.3_test',
    platform: 'QQ',
    os: 'iOS',
    userAgent: 'UA',
    origin: 'https://example.com',
    reconnect: { terminalWsCodes: [400, '403'] },
});

assert.equal(profile.serverUrl, 'wss://example.com/prod/ws');
assert.equal(profile.clientVersion, '1.2.3_test');
assert.equal(profile.platform, 'qq');
assert.equal(profile.device_info.client_version, '1.2.3_test');

const url = buildWebSocketUrl(profile, 'abc 123');
assert.ok(url.startsWith('wss://example.com/prod/ws?'));
assert.ok(url.includes('platform=qq'));
assert.ok(url.includes('ver=1.2.3_test'));
assert.ok(url.includes('code=abc+123'));

const headers = getWebSocketHeaders(profile);
assert.equal(headers.Origin, 'https://example.com');
assert.equal(headers['User-Agent'], 'UA');
assert.equal(isTerminalWsCode(403, profile), true);
assert.equal(isTerminalWsCode(1006, profile), false);

console.log('protocol-config ok');
