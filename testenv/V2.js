"use strict";
exports.__esModule = true;
exports.V2 = void 0;
var Helpers_1 = require("./Helpers");
var V2 = /** @class */ (function () {
    function V2() {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        this.x = 0;
        this.y = 0;
        if (typeof (arg[0]) === "number" && typeof (arg[1]) === "number") {
            this.x = arg[0];
            this.y = arg[1];
        }
        else if (typeof (arg[0]) === "string" && typeof (arg[1]) === "string") {
            this.x = parseInt(arg[0]);
            this.y = parseInt(arg[1]);
        }
        else if (arg[0] instanceof Array && typeof (arg[0][0]) === "number" && typeof (arg[0][1]) === "number") {
            this.x = arg[0][0];
            this.y = arg[0][1];
        }
        else if (arg[0] instanceof Array && typeof (arg[0][0]) === "string" && typeof (arg[0][1]) === "string") {
            this.x = parseInt(arg[0][0]);
            this.y = parseInt(arg[0][1]);
        }
        else if (arg[0] instanceof V2) {
            this.x = arg[0].x;
            this.y = arg[0].y;
        }
        else {
            throw new Error("Error constructing V2, Unhandled parameter types: " + Helpers_1.Helpers.listTypes(arg));
        }
    }
    V2.prototype.add = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (typeof (args[0]) === "number" && typeof (args[1]) === "number") {
            return new V2(this.x + args[0], this.y + args[1]);
        }
        else if (typeof (args[0]) === "string" && typeof (args[1]) === "string") {
            return new V2(this.x + parseInt(args[0]), this.y + parseInt(args[1]));
        }
        else if (args[0] instanceof Array && typeof (args[0][0]) === "number" && typeof (args[0][1]) === "number") {
            return new V2(this.x + args[0][0], this.y + args[0][1]);
        }
        else if (args[0] instanceof Array && typeof (args[0][0]) === "string" && typeof (args[0][1]) === "string") {
            return new V2(this.x + parseInt(args[0][0]), this.y + parseInt(args[0][1]));
        }
        else if (args[0] instanceof V2) {
            return new V2(this.x + args[0].x, this.y + args[0].y);
        }
        else {
            throw new Error("Error V2.add, unhandled parameter types: " + Helpers_1.Helpers.listTypes(args));
        }
    };
    V2.prototype.scale = function (coeff) {
        return new V2(coeff * this.x, coeff * this.y);
    };
    V2.prototype.unit = function () {
        var coeff = 1 / this.magnitude();
        if (coeff === Infinity || coeff === -Infinity) {
            throw new Error("V2.unit cannot calculate unit of vector with magnitude of 0");
        }
        return new V2(coeff * this.x, coeff * this.y);
    };
    V2.prototype.magnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    V2.prototype.sign = function () {
        return new V2(Math.sign(this.x), Math.sign(this.y));
    };
    V2.prototype.abs = function () {
        return new V2(Math.abs(this.x), Math.abs(this.y));
    };
    V2.prototype.pow = function (pow) {
        return new V2(Math.pow(this.x, pow), Math.pow(this.y, pow));
    };
    V2.prototype.floor = function () {
        return new V2(Math.floor(this.x), Math.floor(this.y));
    };
    V2.prototype.ceil = function () {
        return new V2(Math.ceil(this.x), Math.ceil(this.y));
    };
    V2.prototype.originAngle = function (lowerBound) {
        if (lowerBound === void 0) { lowerBound = 0; }
        return (Math.atan2(this.y, this.x) + 2 * Math.PI) % (2 * Math.PI) + lowerBound;
    };
    V2.prototype.minOriginAngle = function () {
        var originAngle = this.originAngle();
        return Math.min(Math.abs(originAngle), Math.abs(originAngle - 2 * Math.PI));
    };
    V2.prototype.angleBetween = function (v2) {
        var angleOne = this.originAngle();
        var angleTwo = v2.originAngle();
        return angleTwo - angleOne;
    };
    V2.prototype.minAngleBetween = function (v2) {
        var angleBetween = this.angleBetween(v2);
        return Math.min(Math.abs(angleBetween), Math.abs(angleBetween - 2 * Math.PI));
    };
    V2.prototype.dot = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var that = new V2(arg[0], arg[1]);
        return this.x * that.x + this.y * that.y;
    };
    V2.prototype.cross = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var that = new V2(arg[0], arg[1]);
        return this.x * that.y - this.y * that.x;
    };
    V2.prototype.parallelProduct = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var dotV2 = new V2(arg[0], arg[1]);
        return new V2(this.x * dotV2.x, this.y * dotV2.y);
    };
    V2.prototype.tween = function (target, c0, c1) {
        var diff = target.add(this.scale(-1));
        var offset = diff.scale(c0).add(diff.sign().parallelProduct(c1, c1));
        var postOffsetDiff = target.add(this.add(offset).scale(-1));
        if (Math.sign(postOffsetDiff.x) !== Math.sign(diff.x)) {
            offset = offset.add(postOffsetDiff.x, 0);
        }
        if (Math.sign(postOffsetDiff.y) !== Math.sign(diff.y)) {
            offset = offset.add(0, postOffsetDiff.y);
        }
        return [this.add(offset), this.add(offset).equals(target)];
    };
    V2.prototype.equals = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var dotV2 = new V2(arg[0], arg[1]);
        return this.x === dotV2.x && this.y === dotV2.y;
    };
    V2.prototype.toString = function (sigFigs, sciNot) {
        if (sigFigs === void 0) { sigFigs = 4; }
        if (sciNot === void 0) { sciNot = false; }
        sigFigs = Math.max(sigFigs, 1);
        if (sciNot) {
            return "<" + Helpers_1.Helpers.sciNot(this.x, sigFigs) + ", " + Helpers_1.Helpers.sciNot(this.y, sigFigs) + ">";
        }
        else {
            var xPow10 = Math.floor(Math.log10(Math.abs(this.x)));
            var yPow10 = Math.floor(Math.log10(Math.abs(this.y)));
            return "<" + Helpers_1.Helpers.roundToPow(this.x, xPow10 - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.y, yPow10 - sigFigs + 1) + ">";
        }
    };
    return V2;
}());
exports.V2 = V2;
