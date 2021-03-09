"use strict";
exports.__esModule = true;
exports.M2 = void 0;
var Helpers_1 = require("./Helpers");
var V2_1 = require("./V2");
var M2 = /** @class */ (function () {
    function M2() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 2 && args[0] instanceof V2_1.V2) {
            this.x0 = args[0].x;
            this.y0 = args[0].y;
            this.x1 = args[1].x;
            this.y1 = args[1].y;
        }
        else if (args.length === 4 && typeof args[0] === "number") {
            this.x0 = args[0];
            this.y0 = args[1];
            this.x1 = args[2];
            this.y1 = args[3];
        }
        else {
            throw new Error("Error constructing M2, unhandled parameter types: " + Helpers_1.Helpers.listTypes(args));
        }
    }
    M2.prototype.intersect = function (that, uncapped) {
        if (uncapped === void 0) { uncapped = false; }
        var denom = (this.x0 - this.x1) * (that.y0 - that.y1) - (this.y0 - this.y1) * (that.x0 - that.x1);
        if (denom === 0) {
            return null;
        }
        var bezT = ((this.x0 - that.x0) * (that.y0 - that.y1) - (this.y0 - that.y0) * (that.x0 - that.x1)) / denom;
        var bezU = ((this.x1 - this.x0) * (this.y0 - that.y0) - (this.y1 - this.y0) * (this.x0 - that.x0)) / denom;
        if (!uncapped && (bezT < 0 || bezT > 1 || bezU < 0 || bezU > 1)) {
            return null;
        }
        return new V2_1.V2(this.x0 + bezT * (this.x1 - this.x0), this.y0 + bezT * (this.y1 - this.y0));
    };
    M2.prototype.collinear = function (p, threshold) {
        if (threshold === void 0) { threshold = .001; }
        // check "outter" bounds of line's bounding box (angle check takes care of "inner" bounds)
        // relative to <x0, y0>
        if (this.x0 < this.x1) { // expanded logic to save computations
            if (p.x > this.x1 + threshold) {
                return false;
            }
        }
        else {
            if (p.x < this.x1 - threshold) {
                return false;
            }
        }
        if (this.y0 < this.y1) {
            if (p.y > this.y1 + threshold) {
                return false;
            }
        }
        else {
            if (p.y < this.y1 - threshold) {
                return false;
            }
        }
        var thisAngle = new V2_1.V2(this.x1, this.y1).add(new V2_1.V2(this.x0, this.y0).scale(-1)).originAngle();
        var this0pAngle = new V2_1.V2(p.x, p.y).add(new V2_1.V2(this.x0, this.y0).scale(-1)).originAngle();
        var dAngle = thisAngle - this0pAngle;
        return Math.min(Math.abs(dAngle), Math.abs(dAngle + Math.sign(-dAngle) * Math.PI * 2)) <= threshold;
    };
    M2.prototype.negateFromTri = function (tri) {
        var thisTri01 = new M2(tri.p0, tri.p1).intersect(this);
        var thisTri02 = new M2(tri.p0, tri.p2).intersect(this);
        var thisTri12 = new M2(tri.p1, tri.p2).intersect(this);
        var this0inTri = tri.pointInscribed(new V2_1.V2(this.x0, this.y0));
        var this1inTri = tri.pointInscribed(new V2_1.V2(this.x1, this.y1));
        if (!thisTri01 && !thisTri02 && !thisTri12 && !this0inTri && !this1inTri) {
            return [this];
        }
        if (this0inTri && this1inTri) {
            return [];
        }
        if (thisTri01 && thisTri02) {
            if (thisTri01.add(thisTri02.scale(-1)).dot(new V2_1.V2(this.x0, this.y0).add(thisTri02.scale(-1))) > 0) {
                return [new M2(this.x0, this.y0, thisTri01.x, thisTri01.y), new M2(this.x1, this.y1, thisTri02.x, thisTri02.y)];
            }
            else {
                return [new M2(this.x1, this.y1, thisTri01.x, thisTri01.y), new M2(this.x0, this.y0, thisTri02.x, thisTri02.y)];
            }
        }
        else if (thisTri01 && thisTri12) {
            if (thisTri01.add(thisTri12.scale(-1)).dot(new V2_1.V2(this.x0, this.y0).add(thisTri12.scale(-1))) > 0) {
                return [new M2(this.x0, this.y0, thisTri01.x, thisTri01.y), new M2(this.x1, this.y1, thisTri12.x, thisTri12.y)];
            }
            else {
                return [new M2(this.x1, this.y1, thisTri01.x, thisTri01.y), new M2(this.x0, this.y0, thisTri12.x, thisTri12.y)];
            }
        }
        else if (thisTri02 && thisTri12) {
            if (thisTri02.add(thisTri12.scale(-1)).dot(new V2_1.V2(this.x0, this.y0).add(thisTri12.scale(-1))) > 0) {
                return [new M2(this.x0, this.y0, thisTri02.x, thisTri02.y), new M2(this.x1, this.y1, thisTri12.x, thisTri12.y)];
            }
            else {
                return [new M2(this.x1, this.y1, thisTri02.x, thisTri02.y), new M2(this.x0, this.y0, thisTri12.x, thisTri12.y)];
            }
        }
        else if (thisTri01) {
            if (tri.pointInscribed(new V2_1.V2(this.x0, this.y0))) {
                return [new M2(this.x1, this.y1, thisTri01.x, thisTri01.y)];
            }
            else {
                return [new M2(this.x0, this.y0, thisTri01.x, thisTri01.y)];
            }
        }
        else if (thisTri02) {
            if (tri.pointInscribed(new V2_1.V2(this.x0, this.y0))) {
                return [new M2(this.x1, this.y1, thisTri02.x, thisTri02.y)];
            }
            else {
                return [new M2(this.x0, this.y0, thisTri02.x, thisTri02.y)];
            }
        }
        else if (thisTri12) {
            if (tri.pointInscribed(new V2_1.V2(this.x0, this.y0))) {
                return [new M2(this.x1, this.y1, thisTri12.x, thisTri12.y)];
            }
            else {
                return [new M2(this.x0, this.y0, thisTri12.x, thisTri12.y)];
            }
        }
        return [this];
    };
    M2.prototype.toString = function (sigFigs, sciNot) {
        if (sigFigs === void 0) { sigFigs = 4; }
        if (sciNot) {
            return "M2[ (" + Helpers_1.Helpers.sciNot(this.x0, sigFigs) + "," + Helpers_1.Helpers.sciNot(this.y0, sigFigs)
                + ") ,(" + Helpers_1.Helpers.sciNot(this.x1, sigFigs) + "," + Helpers_1.Helpers.sciNot(this.y1, sigFigs) + ") ]";
        }
        else {
            var x0Pow = Math.floor(Math.log10(Math.abs(this.x0)));
            var x1Pow = Math.floor(Math.log10(Math.abs(this.x1)));
            var y0Pow = Math.floor(Math.log10(Math.abs(this.y0)));
            var y1Pow = Math.floor(Math.log10(Math.abs(this.y1)));
            return "M2[ (" + Helpers_1.Helpers.roundToPow(this.x0, x0Pow - sigFigs + 1) + ","
                + Helpers_1.Helpers.roundToPow(this.y0, y0Pow - sigFigs + 1) + "), ("
                + Helpers_1.Helpers.roundToPow(this.x1, x1Pow - sigFigs + 1) + ","
                + Helpers_1.Helpers.roundToPow(this.y1, y1Pow - sigFigs + 1) + ") ]";
        }
    };
    return M2;
}());
exports.M2 = M2;
