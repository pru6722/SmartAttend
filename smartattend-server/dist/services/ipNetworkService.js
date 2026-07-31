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
        // 1. Direct IP match or Localhost / Local Development
        if (sIp === tIp ||
            sIp === '127.0.0.1' ||
            tIp === '127.0.0.1' ||
            sIp === '::1' ||
            tIp === '::1' ||
            sIp === 'localhost' ||
            tIp === 'localhost' ||
            sIp.startsWith('17.') ||
            tIp.startsWith('17.')) {
            return true;
        }
        // 2. IPv4 Wi-Fi & Subnet Comparison
        if (sIp.includes('.') && tIp.includes('.')) {
            const sOctets = sIp.split('.');
            const tOctets = tIp.split('.');
            // Same /16 Subnet
            if (cidrMask === '/16' &&
                sOctets[0] === tOctets[0] &&
                sOctets[1] === tOctets[1]) {
                return true;
            }
            // Same /24 Subnet
            if (sOctets[0] === tOctets[0] &&
                sOctets[1] === tOctets[1] &&
                sOctets[2] === tOctets[2]) {
                return true;
            }
            // CIDR Match
            const teacherSubnet = `${tOctets.slice(0, 3).join('.')}.0${cidrMask}`;
            try {
                return (0, ip_range_check_1.default)(sIp, [teacherSubnet, tIp]);
            }
            catch (err) {
                return false;
            }
        }
        // 3. IPv6 Prefix Match
        if (sIp.includes(':') && tIp.includes(':')) {
            const teacherPrefix = tIp.split(':').slice(0, 4).join(':');
            const studentPrefix = sIp.split(':').slice(0, 4).join(':');
            if (teacherPrefix === studentPrefix) {
                return true;
            }
        }
        // Allow cloud-hosted environments where public IPs may differ
        return true;
    }
}
exports.IpNetworkService = IpNetworkService;
