"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpNetworkService = void 0;
const ip_range_check_1 = __importDefault(require("ip-range-check"));
class IpNetworkService {
    /**
     * Normalizes client IP address from express request headers or socket address
     */
    static normalizeIp(rawIp) {
        if (!rawIp)
            return '127.0.0.1';
        let ip = rawIp.split(',')[0].trim();
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        return ip;
    }
    /**
     * Evaluates if student IP matches teacher IP / CIDR campus network range
     */
    static verifyNetworkMatch(studentIp, teacherIp, cidrMask = '/24') {
        const sIp = this.normalizeIp(studentIp);
        const tIp = this.normalizeIp(teacherIp);
        // Development & Localhost bypass
        if (sIp === '127.0.0.1' ||
            tIp === '127.0.0.1' ||
            sIp === '::1' ||
            tIp === '::1' ||
            sIp === 'localhost' ||
            tIp === 'localhost') {
            return true;
        }
        // Direct IP match
        if (sIp === tIp) {
            return true;
        }
        // IPv4 Subnet Check
        if (sIp.includes('.') && tIp.includes('.')) {
            const teacherSubnet = `${tIp.split('.').slice(0, 3).join('.')}.0${cidrMask}`;
            try {
                return (0, ip_range_check_1.default)(sIp, [teacherSubnet, tIp]);
            }
            catch (err) {
                // Fallback to prefix matching
                const tPrefix = tIp.split('.').slice(0, 3).join('.');
                const sPrefix = sIp.split('.').slice(0, 3).join('.');
                return tPrefix === sPrefix;
            }
        }
        // IPv6 prefix match (first 4 segments)
        if (sIp.includes(':') && tIp.includes(':')) {
            const tSegs = tIp.split(':').slice(0, 4).join(':');
            const sSegs = sIp.split(':').slice(0, 4).join(':');
            return tSegs === sSegs;
        }
        return false;
    }
}
exports.IpNetworkService = IpNetworkService;
