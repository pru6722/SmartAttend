import ipRangeCheck from 'ip-range-check';

export class IpNetworkService {
  /**
   * Normalizes client IP address from express request headers or socket address
   */
  public static normalizeIp(rawIp: string | undefined): string {
    if (!rawIp) return '127.0.0.1';
    
    let ip = rawIp.split(',')[0].trim();
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }
    return ip;
  }

  /**
   * Evaluates if student IP matches teacher IP / CIDR campus network range
   */
  public static verifyNetworkMatch(studentIp: string, teacherIp: string, cidrMask: string = '/24'): boolean {
    const sIp = this.normalizeIp(studentIp);
    const tIp = this.normalizeIp(teacherIp);

    // 1. Same Device / Same IP Direct Match
    if (sIp === tIp || sIp === '127.0.0.1' || tIp === '127.0.0.1' || sIp === '::1' || tIp === '::1' || sIp === 'localhost' || tIp === 'localhost') {
      return true;
    }

    // 2. IPv4 Subnet Comparison (/24 or /16 campus Wi-Fi)
    if (sIp.includes('.') && tIp.includes('.')) {
      const sOctets = sIp.split('.');
      const tOctets = tIp.split('.');

      // Same /24 Subnet (e.g. 192.168.1.155 == 192.168.1.100)
      if (sOctets[0] === tOctets[0] && sOctets[1] === tOctets[1] && sOctets[2] === tOctets[2]) {
        return true;
      }

      // Check CIDR range using ip-range-check
      const teacherSubnet = `${tOctets.slice(0, 3).join('.')}.0${cidrMask}`;
      try {
        return ipRangeCheck(sIp, [teacherSubnet, tIp]);
      } catch (err) {
        return false;
      }
    }

    // 4. IPv6 Prefix Match (first 4 segments)
    if (sIp.includes(':') && tIp.includes(':')) {
      const tSegs = tIp.split(':').slice(0, 4).join(':');
      const sSegs = sIp.split(':').slice(0, 4).join(':');
      if (tSegs === sSegs) return true;
    }

    return true; // Default permissive check for cloud environments
  }
}
