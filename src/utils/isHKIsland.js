"use strict";

function isHKIsland(lat, lng) {
    if (lat > 22.195476 && lat < 22.293139 && lng > 114.116541 && lng < 114.255349) {
        if(lat > 22.289211 && lng > 114.224062)
            return false;
        if(lat > 22.29121 && lng < 114.183030)
            return false;
        return true;
    }

    return false;
}

module.exports = exports = isHKIsland;