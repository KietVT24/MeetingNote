// src/services/UrlService.js
import axios from 'axios';
import Url from '../models/Url.js';

class UrlService {
    /**
     * Check URL health
     */
    static async checkHealth(url) {
        const base = url.endsWith('/') ? url.slice(0, -1) : url;
        const paths = ['/healthz', '/healthy', '/health'];

        for (const path of paths) {
            try {
                const res = await axios.get(`${base}${path}`, {
                    timeout: 5000,
                    validateStatus: (s) => s < 500,
                });

                if (res.status === 200) {
                    if (res.data?.ok !== undefined) return res.data.ok === true;
                    return true;
                }

                if (res.status < 400) return true;
            } catch (_) {
                // Continue trying other paths
            }
        }

        return false;
    }

    /**
     * Health sweep - check all URLs and remove unhealthy ones
     */
    static async healthSweep(nameServer = null) {
        const urlRecords = await Url.findAll(nameServer);
        const results = await Promise.allSettled(urlRecords.map(async (record) => ({
            record,
            isHealthy: await this.checkHealth(record.url),
        })));

        const healthyUrls = [];
        const removedUrls = [];

        for (const r of results) {
            if (r.status !== 'fulfilled') continue;

            const { record, isHealthy } = r.value;
            if (isHealthy) {
                healthyUrls.push(record);
            } else {
                await Url.deleteByUrl(record.url);
                removedUrls.push(record);
            }
        }

        return {
            totalChecked: urlRecords.length,
            healthyUrls,
            removedUrls,
            healthyCount: healthyUrls.length,
            removedCount: removedUrls.length,
        };
    }

    /**
     * Validate URL format
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Add URL with validation
     */
    static async addUrl(url, nameServer = null) {
        if (!this.isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }
        return Url.create(url, nameServer);
    }

    /**
     * Get all URLs with optional filtering
     */
    static async getUrls(nameServer = null) {
        return Url.findAll(nameServer);
    }

    /**
     * Get URL count
     */
    static async getCount(nameServer = null) {
        return Url.count(nameServer);
    }

    /**
     * Update URL
     */
    static async updateUrl(id, updates) {
        if (updates.url && !this.isValidUrl(updates.url)) {
            throw new Error('Invalid URL format');
        }
        return Url.updateById(id, updates);
    }

    /**
     * Delete URL
     */
    static async deleteUrl(id) {
        return Url.deleteById(id);
    }

    /**
     * Get name servers
     */
    static async getNameServers() {
        return Url.getNameServers();
    }
}

export default UrlService;
