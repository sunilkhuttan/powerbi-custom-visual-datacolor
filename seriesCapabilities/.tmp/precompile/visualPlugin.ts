import { Visual } from "../../src/visual";
var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];

var seriesCapabilities7EA841F2A9074471BE02D2B5F469157F_DEBUG = {
    name: 'seriesCapabilities7EA841F2A9074471BE02D2B5F469157F_DEBUG',
    displayName: 'SeriesCapabilities',
    class: 'Visual',
    version: '1.0.0',
    apiVersion: '2.6.0',
    create: (options) => {
        if (Visual) {
            return new Visual(options);
        }

        console.error('Visual instance not found');
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["seriesCapabilities7EA841F2A9074471BE02D2B5F469157F_DEBUG"] = seriesCapabilities7EA841F2A9074471BE02D2B5F469157F_DEBUG;
}

export default seriesCapabilities7EA841F2A9074471BE02D2B5F469157F_DEBUG;