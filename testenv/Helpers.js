"use strict";
exports.__esModule = true;
exports.Helpers = void 0;
var V2_1 = require("./V2");
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Helpers.sciNot = function (num, sigFigs) {
        if (sigFigs === void 0) { sigFigs = 4; }
        sigFigs = Math.max(sigFigs, 1);
        var coeff = Math.pow(10, sigFigs - 1);
        var pow10 = Math.ceil(Math.log10(Math.abs(.1 * num)));
        var rounded = Math.round(coeff * Math.pow(10, -pow10) * num) / coeff;
        return rounded + (pow10 ? "E" + pow10 : "");
    };
    // cuts number precision to 10^pow
    Helpers.roundToPow = function (num, pow) {
        if (pow === void 0) { pow = -3; }
        var numStr = Math.abs(num).toString();
        var decimalIdx;
        if (num % 1 === 0) {
            decimalIdx = numStr.length;
        }
        else {
            decimalIdx = numStr.split(".")[0].length;
        }
        var rtn = numStr.slice(0, Math.max(0, decimalIdx - pow + (decimalIdx < numStr.length ? 1 : 0)));
        while (!rtn.length || (rtn.charAt(0) !== "0" && rtn.length < decimalIdx)) {
            rtn += "0";
        }
        return (Math.sign(num) === -1 ? "-" : "") + rtn;
    };
    Helpers.listTypes = function (arr) {
        var rtn = "";
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var v = arr_1[_i];
            if (rtn.length) {
                rtn += ", ";
            }
            if (v) {
                rtn += v.constructor.name;
            }
            else if (v === null) {
                rtn += "null";
            }
            else {
                rtn += "undefined";
            }
        }
        return rtn;
    };
    Helpers.atan2 = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var x, y;
        if (typeof args[0] === "number" && typeof args[1] === "number") {
            x = args[0];
            y = args[1];
        }
        else {
            x = args[0].x;
            y = args[0].y;
        }
        if (x === 0) {
            if (y > 0) {
                return 1.5708;
            }
            else {
                return -1.5708;
            }
        }
        else if (y === 0) {
            if (x > 0) {
                return 0;
            }
            else {
                return 3.1416;
            }
        }
        var q = y / x;
        var r;
        if (Math.abs(q) <= 1) {
            r = q * (1.0584 - Math.sign(q) * .273 * q);
        }
        else {
            var invQ = 1 / q;
            r = Math.sign(q) * 1.5708 - invQ * (1.0584 - Math.sign(q) * .273 * invQ);
        }
        if (x < 0) {
            r -= Math.sign(r) * 3.1416;
        }
        return r;
    };
    Helpers.rad = function (deg) {
        return deg / 180 * Math.PI;
    };
    // s0 - s6 provide algo with seed
    // assumes increment size of 1
    Helpers.perlinR2 = function (x, y, seed) {
        if (!seed || seed.length !== 7) {
            seed = [2920, 21942, 171324, 8912, 23157, 21732, 9758];
        }
        var s0 = seed[0], s1 = seed[1], s2 = seed[2], s3 = seed[3], s4 = seed[4], s5 = seed[5], s6 = seed[6];
        var x0 = Math.floor(x);
        var y0 = Math.floor(y);
        // get seed generated gradient vectors for all 4 corners
        // gradients are unit vectors of length 1
        var getGrad = function (x, y) {
            var gradAngle = s0 * Math.sin(s1 * x + s2 * y + s3) * Math.cos(s4 * x + s5 * y + s6);
            return new V2_1.V2(Math.cos(gradAngle), Math.sin(gradAngle));
        };
        var dotGrad00 = getGrad(x0, y0).dot(new V2_1.V2(x0 - x, y0 - y));
        var dotGrad01 = getGrad(x0 + 1, y0).dot(new V2_1.V2(x0 + 1 - x, y0 - y));
        var dotGrad10 = getGrad(x0, y0 + 1).dot(new V2_1.V2(x0 - x, y0 + 1 - y));
        var dotGrad11 = getGrad(x0 + 1, y0 + 1).dot(new V2_1.V2(x0 + 1 - x, y0 + 1 - y));
        // interpolate dotGrads
        // w means "weight", numbers closer to 0 favors dg0, numbers closer to 1 favors dg1, must be in range [-1, 1]
        var interpDotGrads = function (dg0, dg1, w) {
            return (dg1 - dg0) * (3 - 2 * w) * w * w + dg0;
        };
        var topVal = interpDotGrads(dotGrad00, dotGrad01, x - x0);
        var botVal = interpDotGrads(dotGrad10, dotGrad11, x - x0);
        var final = interpDotGrads(topVal, botVal, y - y0);
        return final;
    };
    // clones object but keeps references to classes
    Helpers.deepCopy = function (obj) {
        return this.deepCopyRecur(obj, {}, new Set());
    };
    Helpers.deepCopyRecur = function (obj, rtnObj, objHistory) {
        if (!obj || typeof obj !== "object") {
            return obj;
        }
        objHistory.add(obj);
        for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            if (val === null || val.constructor.name !== "Object" || objHistory.has(val)) {
                rtnObj[key] = val;
            }
            else {
                rtnObj[key] = val instanceof Array ? [] : {};
                this.deepCopyRecur(val, rtnObj[key], objHistory);
            }
        }
        return rtnObj;
    };
    // fits index to array, prevents index overflows (i.e. input: idx = -1, arrSize = 3 --> output: 2)
    Helpers.fitIndex = function (idx, arrSize) {
        return (idx + (idx < 0 ? -Math.floor(idx / arrSize) : 1) * arrSize) % arrSize;
    };
    return Helpers;
}());
exports.Helpers = Helpers;
