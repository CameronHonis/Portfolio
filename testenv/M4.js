"use strict";
exports.__esModule = true;
exports.M4 = void 0;
var Helpers_1 = require("./Helpers");
var V2_1 = require("./V2");
var V3_1 = require("./V3");
var M4 = /** @class */ (function () {
    function M4() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            this.r00 = 1;
            this.r10 = 0;
            this.r20 = 0;
            this.r01 = 0;
            this.r11 = 1;
            this.r21 = 0;
            this.r02 = 0;
            this.r12 = 0;
            this.r22 = 1;
            this.p03 = 0;
            this.p13 = 0;
            this.p23 = 0;
        }
        else if (args.length === 12 && typeof args[0] === "number") {
            this.r00 = args[0];
            this.r10 = args[1];
            this.r20 = args[2];
            this.r01 = args[3];
            this.r11 = args[4];
            this.r21 = args[5];
            this.r02 = args[6];
            this.r12 = args[7];
            this.r22 = args[8];
            this.p03 = args[9];
            this.p13 = args[10];
            this.p23 = args[11];
        }
        else if (args.length === 4 && args[0] instanceof V3_1.V3) {
            this.r00 = args[0].x;
            this.r10 = args[0].y;
            this.r20 = args[0].z;
            this.r01 = args[1].x;
            this.r11 = args[1].y;
            this.r21 = args[1].z;
            this.r02 = args[2].x;
            this.r12 = args[2].y;
            this.r22 = args[2].z;
            this.p03 = args[3].x;
            this.p13 = args[3].y;
            this.p23 = args[3].z;
        }
        else if (args.length === 2 && args[0] instanceof V3_1.V3) {
            this.lookVector = args[1].add(args[0].scale(-1)).unit();
            if (this.lookVector.abs().equals(new V3_1.V3(0, 0, 1))) {
                this.rightVector = new V3_1.V3(1, 0, 0);
            }
            else {
                this.rightVector = this.lookVector.cross(new V3_1.V3(0, 0, 1)).unit();
            }
            this.upVector = this.rightVector.cross(this.lookVector).unit();
            this.position = args[0];
            this.r00 = this.rightVector.x;
            this.r10 = this.rightVector.y;
            this.r20 = this.rightVector.z;
            this.r01 = this.lookVector.x;
            this.r11 = this.lookVector.y;
            this.r21 = this.lookVector.z;
            this.r02 = this.upVector.x;
            this.r12 = this.upVector.y;
            this.r22 = this.upVector.z;
            this.p03 = this.position.x;
            this.p13 = this.position.y;
            this.p23 = this.position.z;
        }
        else {
            throw new Error("Error constructing M4, unhandled parameter types: " + Helpers_1.Helpers.listTypes(args));
        }
        this.rightVector = new V3_1.V3(this.r00, this.r10, this.r20);
        this.lookVector = new V3_1.V3(this.r01, this.r11, this.r21);
        this.upVector = new V3_1.V3(this.r02, this.r12, this.r22);
        this.position = new V3_1.V3(this.p03, this.p13, this.p23);
    }
    M4.prototype.dot = function (that) {
        return new V3_1.V3(this.r00 * that.x + this.r01 * that.y + this.r02 * that.z + this.p03, this.r10 * that.x + this.r11 * that.y + this.r12 * that.z + this.p13, this.r20 * that.x + this.r21 * that.y + this.r22 * that.z + this.p23);
    };
    M4.prototype.product = function (that) {
        return new M4(this.r00 * that.r00 + this.r01 * that.r10 + this.r02 * that.r20, this.r10 * that.r00 + this.r11 * that.r10 + this.r12 * that.r20, this.r20 * that.r00 + this.r21 * that.r10 + this.r22 * that.r20, this.r00 * that.r01 + this.r01 * that.r11 + this.r02 * that.r21, this.r10 * that.r01 + this.r11 * that.r11 + this.r12 * that.r21, this.r20 * that.r01 + this.r21 * that.r11 + this.r22 * that.r21, this.r00 * that.r02 + this.r01 * that.r12 + this.r02 * that.r22, this.r10 * that.r02 + this.r11 * that.r12 + this.r12 * that.r22, this.r20 * that.r02 + this.r21 * that.r12 + this.r22 * that.r22, this.r00 * that.p03 + this.r01 * that.p13 + this.r02 * that.p23 + this.p03, this.r10 * that.p03 + this.r11 * that.p13 + this.r12 * that.p23 + this.p13, this.r20 * that.p03 + this.r21 * that.p13 + this.r22 * that.p23 + this.p23);
    };
    M4.prototype.invert = function () {
        return new M4(this.r11 * this.r22 - this.r21 * this.r12, //r00
        -this.r10 * this.r22 + this.r20 * this.r12, //r10
        this.r10 * this.r21 - this.r20 * this.r11, //r20
        -this.r01 * this.r22 + this.r21 * this.r02, //r01
        this.r00 * this.r22 - this.r20 * this.r02, //r11
        -this.r00 * this.r21 + this.r20 * this.r01, //r21
        this.r01 * this.r12 - this.r11 * this.r02, //r02
        -this.r00 * this.r12 + this.r10 * this.r02, //r12
        this.r00 * this.r11 - this.r10 * this.r01, //r22
        -this.r01 * this.r12 * this.p23 + this.r01 * this.p13 * this.r22
            + this.r11 * this.r02 * this.p23 - this.r11 * this.p03 * this.r22
            - this.r21 * this.r02 * this.p13 + this.r21 * this.p03 * this.r12, //p03
        this.r00 * this.r12 * this.p23 - this.r00 * this.p13 * this.r22
            - this.r10 * this.r02 * this.p23 + this.r10 * this.p03 * this.r22
            + this.r20 * this.r02 * this.p13 - this.r20 * this.p03 * this.r12, //p13
        -this.r00 * this.r11 * this.p23 + this.r00 * this.p13 * this.r21
            + this.r10 * this.r01 * this.p23 - this.r10 * this.p03 * this.r21
            - this.r20 * this.r01 * this.p13 + this.r20 * this.p03 * this.r11);
    };
    M4.prototype.pointToScreenPos = function (point, FOV, screenSize) {
        var relPos = this.invert().dot(point);
        if (relPos.y < 0.01) {
            return new V2_1.V2(NaN, NaN);
        }
        var unmappedX = relPos.x / relPos.y / Math.tan(FOV.x / 2);
        var unmappedY = relPos.z / relPos.y / Math.tan(FOV.y / 2);
        var mappedX = (.5 + unmappedX / 2) * screenSize.x;
        var mappedY = (.5 - unmappedY / 2) * screenSize.y;
        return new V2_1.V2(mappedX, mappedY);
    };
    M4.prototype.rotateZXY = function (z, x, y) {
        var thisRotZ = this.product(new M4(new V3_1.V3(0, 0, 0), new V3_1.V3(Math.sin(z), Math.cos(z), 0)));
        var thisRotZX = thisRotZ.product(new M4(new V3_1.V3(0, 0, 0), new V3_1.V3(0, Math.cos(x), Math.sin(x))));
        return thisRotZX.product(new M4(new V3_1.V3(Math.cos(y), 0, Math.sin(y)), new V3_1.V3(0, 1, 0), new V3_1.V3(Math.cos(y + Math.PI / 2), 0, Math.sin(y + Math.PI / 2)), new V3_1.V3(0, 0, 0)));
    };
    M4.prototype.center = function () {
        return new M4(this.rightVector, this.lookVector, this.upVector, new V3_1.V3(0, 0, 0));
    };
    M4.prototype.getViewportBoundingBox = function (FOV, renderDis, angularRelief) {
        var _this = this;
        if (angularRelief === void 0) { angularRelief = Math.PI / 16; }
        FOV = FOV.add(angularRelief, angularRelief);
        var viewBB = [this.position, this.position];
        var updateBB = function (newPos) {
            viewBB[0] = new V3_1.V3(Math.min(viewBB[0].x, newPos.x), Math.min(viewBB[0].y, newPos.y), Math.min(viewBB[0].z, newPos.z));
            viewBB[1] = new V3_1.V3(Math.max(viewBB[1].x, newPos.x), Math.max(viewBB[1].y, newPos.y), Math.max(viewBB[1].z, newPos.z));
        };
        // get corner viewport box positions
        var topLeftRay = this.rotateZXY(-FOV.x / 2, FOV.y / 2, 0).dot(new V3_1.V3(0, renderDis, 0));
        updateBB(topLeftRay);
        var topRightRay = this.rotateZXY(FOV.x / 2, FOV.y / 2, 0).dot(new V3_1.V3(0, renderDis, 0));
        updateBB(topRightRay);
        var botLeftRay = this.rotateZXY(-FOV.x / 2, -FOV.y / 2, 0).dot(new V3_1.V3(0, renderDis, 0));
        updateBB(botLeftRay);
        var botRightRay = this.rotateZXY(FOV.x / 2, -FOV.y / 2, 0).dot(new V3_1.V3(0, renderDis, 0));
        updateBB(botRightRay);
        // include spherical edge of render area
        var checkAxisRay = function (axisRay) {
            if (_this.center().isInFrame(axisRay, FOV)) {
                var axisRayPos = _this.position.add(axisRay.unit().scale(renderDis));
                updateBB(axisRayPos);
            }
        };
        checkAxisRay(new V3_1.V3(1, 0, 0));
        checkAxisRay(new V3_1.V3(-1, 0, 0));
        checkAxisRay(new V3_1.V3(0, 1, 0));
        checkAxisRay(new V3_1.V3(0, -1, 0));
        checkAxisRay(new V3_1.V3(0, 0, 1));
        checkAxisRay(new V3_1.V3(0, 0, -1));
        return viewBB;
    };
    M4.prototype.isInFrame = function (point, FOV) {
        var relPoint = this.invert().dot(point).unit();
        return relPoint.y > 0 && Math.abs(relPoint.x) < Math.sin(FOV.x / 2) && Math.abs(relPoint.z) < Math.sin(FOV.y / 2);
    };
    M4.prototype.toString = function (expandedForm, sigFigs) {
        if (expandedForm === void 0) { expandedForm = false; }
        if (sigFigs === void 0) { sigFigs = 4; }
        if (!expandedForm) {
            return "M4[ r" + this.rightVector.toString(sigFigs)
                + "\n    l" + this.lookVector.toString(sigFigs) + " "
                + "\n    u" + this.upVector.toString(sigFigs)
                + "\n    p" + this.position.toString(sigFigs) + "]";
        }
        else {
            var r00pow = Math.floor(Math.log10(Math.abs(this.r00)));
            var r01pow = Math.floor(Math.log10(Math.abs(this.r01)));
            var r02pow = Math.floor(Math.log10(Math.abs(this.r02)));
            var p03pow = Math.floor(Math.log10(Math.abs(this.p03)));
            var r10pow = Math.floor(Math.log10(Math.abs(this.r10)));
            var r11pow = Math.floor(Math.log10(Math.abs(this.r11)));
            var r12pow = Math.floor(Math.log10(Math.abs(this.r12)));
            var p13pow = Math.floor(Math.log10(Math.abs(this.p13)));
            var r20pow = Math.floor(Math.log10(Math.abs(this.r20)));
            var r21pow = Math.floor(Math.log10(Math.abs(this.r21)));
            var r22pow = Math.floor(Math.log10(Math.abs(this.r22)));
            var p23pow = Math.floor(Math.log10(Math.abs(this.p23)));
            return "[" + Helpers_1.Helpers.roundToPow(this.r00, r00pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.r01, r01pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.r02, r02pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.p03, p03pow - sigFigs + 1) + ",\n "
                + Helpers_1.Helpers.roundToPow(this.r10, r10pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.r11, r11pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.r12, r12pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.p13, p13pow - sigFigs + 1) + ",\n "
                + Helpers_1.Helpers.roundToPow(this.r20, r20pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.r21, r21pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.r22, r22pow - sigFigs + 1) + ", "
                + Helpers_1.Helpers.roundToPow(this.p23, p23pow - sigFigs + 1) + ",\n "
                + "0, 0, 0, 1]";
        }
    };
    return M4;
}());
exports.M4 = M4;
