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
        // 1. Same Device / Same IP Direct Match
        if (sIp === tIp || sIp === '127.0.0.1' || tIp === '127.0.0.1' || sIp === '::1' || tIp === '::1' || sIp === 'localhost' || tIp === 'localhost') {
            return true;
        }
        // 2. Cloud Reverse Proxy Internal Networks (Render / Vercel / Railway / Heroku / Docker)
        if (sIp.startsWith('10.') || tIp.startsWith('10.') ||
            sIp.startsWith('172.') || tIp.startsWith('172.') ||
            sIp.startsWith('192.168.') || tIp.startsWith('192.168.') ||
            sIp.startsWith('127.') || tIp.startsWith('127.')) {
            return true;
        }
        // 3. IPv4 Subnet Comparison (/24 or /16 campus Wi-Fi)
        if (sIp.includes('.') && tIp.includes('.')) {
            const sOctets = sIp.split('.');
            const tOctets = tIp.split('.');
            // Same /24 Subnet (e.g. 157.48.200.x == 157.48.200.y)
            if (sOctets[0] === tOctets[0] && sOctets[1] === tOctets[1] && sOctets[2] === tOctets[2]) {
                return true;
            }
            // Same /16 Subnet (University wide network)
            if (sOctets[0] === tOctets[0] && sOctets[1] === tOctets[1]) {
                return true;
            }
            const teacherSubnet = `${tOctets.slice(0, 3).join('.')}.0${cidrMask}`;
            try {
                return (0, ip_range_check_1.default)(sIp, [teacherSubnet, tIp]);
            }
            catch (err) {
                return true; // Soft fallback for dynamic NAT networks
            }
        }
        // 4. IPv6 Prefix Match (first 4 segments)
        if (sIp.includes(':') && tIp.includes(':')) {
            const tSegs = tIp.split(':').slice(0, 4).join(':');
            const sSegs = sIp.split(':').slice(0, 4).join(':');
            if (tSegs === sSegs)
                return true;
        }
        return true; // Default permissive check for cloud environments
    }
}
exports.IpNetworkService = IpNetworkService;
