const process = require('node:process');

/**
 * 登录协议运行时配置
 *
 * 说明：这里不硬编码“不可维护”的私有协议细节，而是把可变项集中成 profile，
 * 方便后续通过环境变量或 Web 面板更新，不需要到处改业务代码。
 */

const DEFAULT_PROTOCOL_PROFILE = Object.freeze({
    name: 'qq-farm-mobile-ws',
    serverUrl: 'wss://gate-obt.nqf.qq.com/prod/ws',
    clientVersion: '1.7.0.9_20260313',
    platform: 'qq',
    os: 'iOS',
    origin: 'https://gate-obt.nqf.qq.com',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56 NetType/WIFI Language/zh_CN MiniProgramEnv/Mac',
    openId: '',
    login: {
        serviceName: 'gamepb.userpb.UserService',
        methodName: 'Login',
        heartbeatMethodName: 'Heartbeat',
        sceneId: '1256',
        sharerId: 0,
        sharerOpenId: '',
        shareCfgId: 0,
        reportData: {
            callback: '',
            cd_extend_info: '',
            click_id: '',
            clue_token: '',
            minigame_channel: 'other',
            minigame_platid: 2,
            req_id: '',
            trackid: '',
        },
    },
    device_info: {
        client_version: '1.7.0.9_20260313',
        sys_software: 'iOS 18.7',
        network: 'wifi',
        memory: '7672',
        device_id: 'iPhone X<iPhone18,3>',
    },
    crypto: {
        requireEncryptedPayload: true,
    },
    reconnect: {
        minDelayMs: 3000,
        maxDelayMs: 60000,
        handshakeTimeoutMs: 15000,
        heartbeatTimeoutMs: 60000,
        maxHeartbeatMisses: 2,
        terminalWsCodes: [400, 401, 403],
    },
});

function envFlag(name, fallback = false) {
    const raw = process.env[name];
    if (raw === undefined || raw === null || raw === '') return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(raw).trim().toLowerCase());
}

function envNumber(name, fallback, min, max) {
    const n = Number.parseInt(process.env[name], 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
}

function str(value, fallback = '', maxLen = 256) {
    const raw = String(value !== undefined && value !== null ? value : fallback).trim();
    const safe = raw || String(fallback || '').trim();
    return safe.length > maxLen ? safe.slice(0, maxLen) : safe;
}

function normalizeServerUrl(value, fallback = DEFAULT_PROTOCOL_PROFILE.serverUrl) {
    const raw = str(value, fallback, 300);
    try {
        const parsed = new URL(raw);
        const protocol = String(parsed.protocol || '').toLowerCase();
        if (protocol !== 'ws:' && protocol !== 'wss:') return fallback;
        parsed.search = '';
        parsed.hash = '';
        return parsed.toString().replace(/\/$/, '');
    } catch {
        return fallback;
    }
}

function normalizeVersion(value, fallback = DEFAULT_PROTOCOL_PROFILE.clientVersion) {
    const raw = str(value, fallback, 64);
    return /^[\w.-]+$/.test(raw) ? raw : fallback;
}

function normalizeOs(value, fallback = DEFAULT_PROTOCOL_PROFILE.os) {
    const raw = str(value, fallback, 32);
    return /^[\w.-]+$/.test(raw) ? raw : fallback;
}

function normalizePlatform(value, fallback = DEFAULT_PROTOCOL_PROFILE.platform) {
    const raw = str(value, fallback, 16).toLowerCase();
    return ['qq', 'wx'].includes(raw) ? raw : fallback;
}

function normalizeReportData(input, fallback = DEFAULT_PROTOCOL_PROFILE.login.reportData) {
    const src = (input && typeof input === 'object') ? input : {};
    return {
        callback: str(src.callback, fallback.callback, 256),
        cd_extend_info: str(src.cd_extend_info, fallback.cd_extend_info, 256),
        click_id: str(src.click_id, fallback.click_id, 128),
        clue_token: str(src.clue_token, fallback.clue_token, 256),
        minigame_channel: str(src.minigame_channel, fallback.minigame_channel, 64),
        minigame_platid: envNumberLike(src.minigame_platid, fallback.minigame_platid, 0, 99),
        req_id: str(src.req_id, fallback.req_id, 128),
        trackid: str(src.trackid, fallback.trackid, 128),
    };
}

function envNumberLike(value, fallback, min, max) {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
}

function normalizeProtocolProfile(input = {}) {
    const src = (input && typeof input === 'object') ? input : {};
    const base = DEFAULT_PROTOCOL_PROFILE;
    const loginSrc = (src.login && typeof src.login === 'object') ? src.login : {};
    const deviceSrc = (src.device_info && typeof src.device_info === 'object') ? src.device_info : {};
    const cryptoSrc = (src.crypto && typeof src.crypto === 'object') ? src.crypto : {};
    const reconnectSrc = (src.reconnect && typeof src.reconnect === 'object') ? src.reconnect : {};

    const clientVersion = normalizeVersion(src.clientVersion, base.clientVersion);
    const minDelayMs = envNumberLike(reconnectSrc.minDelayMs, base.reconnect.minDelayMs, 1000, 300000);
    const maxDelayMs = Math.max(minDelayMs, envNumberLike(reconnectSrc.maxDelayMs, base.reconnect.maxDelayMs, minDelayMs, 300000));

    return {
        name: str(src.name, base.name, 64),
        serverUrl: normalizeServerUrl(src.serverUrl, base.serverUrl),
        clientVersion,
        platform: normalizePlatform(src.platform, base.platform),
        os: normalizeOs(src.os, base.os),
        origin: str(src.origin, base.origin, 256),
        userAgent: str(src.userAgent, base.userAgent, 512),
        openId: str(src.openId, base.openId, 128),
        login: {
            serviceName: str(loginSrc.serviceName, base.login.serviceName, 128),
            methodName: str(loginSrc.methodName, base.login.methodName, 64),
            heartbeatMethodName: str(loginSrc.heartbeatMethodName, base.login.heartbeatMethodName, 64),
            sceneId: str(loginSrc.sceneId, base.login.sceneId, 32),
            sharerId: envNumberLike(loginSrc.sharerId, base.login.sharerId, 0, Number.MAX_SAFE_INTEGER),
            sharerOpenId: str(loginSrc.sharerOpenId, base.login.sharerOpenId, 128),
            shareCfgId: envNumberLike(loginSrc.shareCfgId, base.login.shareCfgId, 0, Number.MAX_SAFE_INTEGER),
            reportData: normalizeReportData(loginSrc.reportData, base.login.reportData),
        },
        device_info: {
            client_version: clientVersion,
            sys_software: str(deviceSrc.sys_software, base.device_info.sys_software, 100),
            network: str(deviceSrc.network, base.device_info.network, 32),
            memory: str(deviceSrc.memory, base.device_info.memory, 32),
            device_id: str(deviceSrc.device_id, base.device_info.device_id, 120),
        },
        crypto: {
            requireEncryptedPayload: cryptoSrc.requireEncryptedPayload !== undefined
                ? !!cryptoSrc.requireEncryptedPayload
                : base.crypto.requireEncryptedPayload,
        },
        reconnect: {
            minDelayMs,
            maxDelayMs,
            handshakeTimeoutMs: envNumberLike(reconnectSrc.handshakeTimeoutMs, base.reconnect.handshakeTimeoutMs, 5000, 120000),
            heartbeatTimeoutMs: envNumberLike(reconnectSrc.heartbeatTimeoutMs, base.reconnect.heartbeatTimeoutMs, 15000, 300000),
            maxHeartbeatMisses: envNumberLike(reconnectSrc.maxHeartbeatMisses, base.reconnect.maxHeartbeatMisses, 1, 10),
            terminalWsCodes: Array.isArray(reconnectSrc.terminalWsCodes) && reconnectSrc.terminalWsCodes.length
                ? reconnectSrc.terminalWsCodes.map(n => Number.parseInt(n, 10)).filter(n => Number.isFinite(n))
                : [...base.reconnect.terminalWsCodes],
        },
    };
}

function getProtocolProfileFromEnv() {
    return normalizeProtocolProfile({
        name: process.env.FARM_PROTOCOL_NAME,
        serverUrl: process.env.FARM_SERVER_URL,
        clientVersion: process.env.FARM_CLIENT_VERSION,
        platform: process.env.FARM_PLATFORM,
        os: process.env.FARM_OS,
        origin: process.env.FARM_WS_ORIGIN,
        userAgent: process.env.FARM_USER_AGENT,
        openId: process.env.FARM_OPEN_ID,
        crypto: {
            requireEncryptedPayload: !envFlag('FARM_ALLOW_PLAINTEXT_PACKET', false),
        },
        reconnect: {
            minDelayMs: envNumber('FARM_RECONNECT_MIN_MS', DEFAULT_PROTOCOL_PROFILE.reconnect.minDelayMs, 1000, 300000),
            maxDelayMs: envNumber('FARM_RECONNECT_MAX_MS', DEFAULT_PROTOCOL_PROFILE.reconnect.maxDelayMs, 1000, 300000),
            handshakeTimeoutMs: envNumber('FARM_WS_HANDSHAKE_TIMEOUT_MS', DEFAULT_PROTOCOL_PROFILE.reconnect.handshakeTimeoutMs, 5000, 120000),
            heartbeatTimeoutMs: envNumber('FARM_HEARTBEAT_TIMEOUT_MS', DEFAULT_PROTOCOL_PROFILE.reconnect.heartbeatTimeoutMs, 15000, 300000),
            maxHeartbeatMisses: envNumber('FARM_HEARTBEAT_MAX_MISSES', DEFAULT_PROTOCOL_PROFILE.reconnect.maxHeartbeatMisses, 1, 10),
        },
        device_info: {
            sys_software: process.env.FARM_DEVICE_SYS_SOFTWARE,
            network: process.env.FARM_DEVICE_NETWORK,
            memory: process.env.FARM_DEVICE_MEMORY,
            device_id: process.env.FARM_DEVICE_ID,
        },
    });
}

function buildWebSocketUrl(profile, code) {
    const cfg = normalizeProtocolProfile(profile);
    const params = new URLSearchParams();
    params.set('platform', cfg.platform);
    params.set('os', cfg.os);
    params.set('ver', cfg.clientVersion);
    params.set('code', str(code, '', 2048));
    params.set('openID', cfg.openId || '');
    return `${cfg.serverUrl}?${params.toString()}`;
}

function getWebSocketHeaders(profile) {
    const cfg = normalizeProtocolProfile(profile);
    const headers = {
        'User-Agent': cfg.userAgent,
        'Origin': cfg.origin,
    };
    return headers;
}

function getReconnectDelayMs(attempt, profile) {
    const cfg = normalizeProtocolProfile(profile);
    const n = Math.max(0, Number.parseInt(attempt, 10) || 0);
    const base = Math.min(cfg.reconnect.maxDelayMs, cfg.reconnect.minDelayMs * (2 ** n));
    const jitter = Math.floor(Math.random() * Math.max(1000, Math.floor(base * 0.25)));
    return Math.min(cfg.reconnect.maxDelayMs, base + jitter);
}

function isTerminalWsCode(code, profile) {
    const cfg = normalizeProtocolProfile(profile);
    return cfg.reconnect.terminalWsCodes.includes(Number(code));
}

module.exports = {
    DEFAULT_PROTOCOL_PROFILE,
    normalizeProtocolProfile,
    getProtocolProfileFromEnv,
    buildWebSocketUrl,
    getWebSocketHeaders,
    getReconnectDelayMs,
    isTerminalWsCode,
};
