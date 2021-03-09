"use strict";
exports.__esModule = true;
exports.V3 = void 0;
var Helpers_1 = require("./Helpers");
var V3 = /** @class */ (function () {
    function V3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    V3.prototype.scale = function (scalar) {
        return new V3(this.x * scalar, this.y * scalar, this.z * scalar);
    };
    V3.prototype.add = function (v3) {
        return new V3(this.x + v3.x, this.y + v3.y, this.z + v3.z);
    };
    V3.prototype.sign = function () {
        return new V3(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z));
    };
    V3.prototype.abs = function () {
        return new V3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    };
    V3.prototype.dot = function (v3) {
        return this.x * v3.x + this.y * v3.y + this.z * v3.z;
    };
    V3.prototype.cross = function (v3) {
        return new V3(this.y * v3.z - this.z * v3.y, this.z * v3.x - this.x * v3.z, this.x * v3.y - this.y * v3.x);
    };
    V3.prototype.mag = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    };
    V3.prototype.unit = function () {
        return this.scale(1 / this.mag());
    };
    V3.prototype.equals = function (that) {
        return this.x === that.x && this.y === that.y && this.z === that.z;
    };
    V3.prototype.toString = function (sigFigs, sciNot) {
        if (sigFigs === void 0) { sigFigs = 4; }
        if (sciNot === void 0) { sciNot = false; }
        sigFigs = Math.max(sigFigs, 1);
        if (sciNot) {
            return "<" + Helpers_1.Helpers.sciNot(this.x, sigFigs) + ", " + Helpers_1.Helpers.sciNot(this.y, sigFigs)
                + ", " + Helpers_1.Helpers.sciNot(this.z, sigFigs) + ">";
        }
        else {
            var xPow10 = Math.floor(Math.log10(Math.abs(this.x)));
            var yPow10 = Math.floor(Math.log10(Math.abs(this.y)));
            var zPow10 = Math.floor(Math.log10(Math.abs(this.z)));
            return "<" + Helpers_1.Helpers.roundToPow(this.x, xPow10 - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.y, yPow10 - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.z, zPow10 - sigFigs + 1) + ">";
        }
    };
    return V3;
}());
exports.V3 = V3;
