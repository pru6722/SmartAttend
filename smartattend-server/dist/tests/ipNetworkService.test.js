"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipNetworkService_1 = require("../services/ipNetworkService");
describe('IpNetworkService Subnet Verification', () => {
    it('should match IPs on the same IPv4 /24 subnet', () => {
        const teacherIp = '192.168.1.100';
        const studentIp = '192.168.1.155';
        const result = ipNetworkService_1.IpNetworkService.verifyNetworkMatch(studentIp, teacherIp, '/24');
        expect(result).toBe(true);
    });
    it('should reject IPs on different IPv4 subnets', () => {
        const teacherIp = '192.168.1.100';
        const studentIp = '192.168.2.50';
        const result = ipNetworkService_1.IpNetworkService.verifyNetworkMatch(studentIp, teacherIp, '/24');
        expect(result).toBe(false);
    });
    it('should pass localhost testing IPs', () => {
        const teacherIp = '127.0.0.1';
        const studentIp = '127.0.0.1';
        const result = ipNetworkService_1.IpNetworkService.verifyNetworkMatch(studentIp, teacherIp);
        expect(result).toBe(true);
    });
});
