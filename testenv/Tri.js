"use strict";
exports.__esModule = true;
exports.Tri = void 0;
var M2_1 = require("./M2");
var V2_1 = require("./V2");
var Tri = /** @class */ (function () {
    function Tri(p0, p1, p2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
    }
    Tri.prototype.pointInscribed = function (p, inclusive) {
        if (inclusive === void 0) { inclusive = true; }
        var sign = function (p0, p1, p) {
            return (p0.x - p.x) * (p1.y - p.y) - (p1.x - p.x) * (p0.y - p.y);
        };
        var d1 = sign(p, this.p0, this.p1);
        var d2 = sign(p, this.p1, this.p2);
        var d3 = sign(p, this.p2, this.p0);
        var hasNeg, hasPos;
        if (inclusive) {
            hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
            hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        }
        else {
            hasNeg = (d1 <= 0) || (d2 <= 0) || (d3 <= 0);
            hasPos = (d1 >= 0) || (d2 >= 0) || (d3 >= 0);
        }
        return !(hasNeg && hasPos);
    };
    Tri.prototype.negate = function (that) {
        var this0inThat = that.pointInscribed(this.p0);
        var this1inThat = that.pointInscribed(this.p1);
        var this2inThat = that.pointInscribed(this.p2);
        if (this0inThat && this1inThat && this2inThat) {
            return [];
        }
        var that0inThis = this.pointInscribed(that.p0);
        var that1inThis = this.pointInscribed(that.p1);
        var that2inThis = this.pointInscribed(that.p2);
        var this01 = new M2_1.M2(this.p0, this.p1);
        var this02 = new M2_1.M2(this.p0, this.p2);
        var that01 = new M2_1.M2(that.p0, that.p1);
        var that02 = new M2_1.M2(that.p0, that.p2);
        var this12 = new M2_1.M2(this.p1, this.p2);
        var that12 = new M2_1.M2(that.p1, that.p2);
        var this01that01 = this01.intersect(that01);
        var this01that02 = this01.intersect(that02);
        var this02that01 = this02.intersect(that01);
        var this02that02 = this02.intersect(that02);
        var this12that01 = this12.intersect(that01);
        var this12that02 = this12.intersect(that02);
        var this12that12 = this12.intersect(that12);
        var this02that12 = this02.intersect(that12);
        var this01that12 = this01.intersect(that12);
        if (!that0inThis && !that1inThis && !that2inThis && !this01that01 && !this01that02 && !this02that01
            && !this02that02 && !this12that01 && !this12that02 && !this12that12 && !this01that12 && !this02that12) {
            return [this];
        }
        var vertices = []; //pos, avoidEdges, avoidVertex?
        var initializers = []; //possible initial edges
        var idxsAdj = [-1, -1, -1];
        var idxsAdjPointer = 0;
        if (!this0inThat) {
            vertices.push([this.p0, [that01, that02, that12]]);
            idxsAdj[0] = 0;
        }
        if (!this1inThat) {
            vertices.push([this.p1, [that01, that02, that12]]);
            idxsAdj[1] = idxsAdj[idxsAdjPointer] + 1;
            idxsAdjPointer++;
        }
        if (!this2inThat) {
            vertices.push([this.p2, [that01, that02, that12]]);
            idxsAdj[2] = idxsAdj[idxsAdjPointer] + 1;
        }
        if (that0inThis) {
            vertices.push([that.p0, [that12]]);
        }
        if (that1inThis) {
            vertices.push([that.p1, [that02]]);
        }
        if (that2inThis) {
            vertices.push([that.p2, [that01]]);
        }
        if (this01that01) {
            vertices.push([this01that01, [that02, that12], that.p2]);
            if (idxsAdj[0] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[0]]);
            }
            if (idxsAdj[1] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[1]]);
            }
        }
        if (this01that02) {
            vertices.push([this01that02, [that01, that12], that.p1]);
            if (idxsAdj[0] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[0]]);
            }
            if (idxsAdj[1] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[1]]);
            }
        }
        if (this01that12) {
            vertices.push([this01that12, [that01, that02], that.p0]);
            if (idxsAdj[0] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[0]]);
            }
            if (idxsAdj[1] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[1]]);
            }
        }
        if (this02that01) {
            vertices.push([this02that01, [that02, that12], that.p2]);
            if (idxsAdj[0] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[0]]);
            }
            if (idxsAdj[2] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[2]]);
            }
        }
        if (this02that02) {
            vertices.push([this02that02, [that01, that12], that.p1]);
            if (idxsAdj[0] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[0]]);
            }
            if (idxsAdj[2] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[2]]);
            }
        }
        if (this02that12) {
            vertices.push([this02that12, [that01, that02], that.p0,]);
            if (idxsAdj[0] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[0]]);
            }
            if (idxsAdj[2] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[2]]);
            }
        }
        if (this12that01) {
            vertices.push([this12that01, [that02, that12], that.p2]);
            if (idxsAdj[1] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[1]]);
            }
            if (idxsAdj[2] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[2]]);
            }
        }
        if (this12that02) {
            vertices.push([this12that02, [that01, that12], that.p1]);
            if (idxsAdj[1] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[1]]);
            }
            if (idxsAdj[2] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[2]]);
            }
        }
        if (this12that12) {
            vertices.push([this12that12, [that01, that02], that.p0]);
            if (idxsAdj[1] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[1]]);
            }
            if (idxsAdj[2] >= 0) {
                initializers.push([vertices.length - 1, idxsAdj[2]]);
            }
        }
        var visited = new Set(); // helps prevent initializing on already visited vertex
        var triHash = {}; //index format: `${lowestIdx} ${secondLowestIdx} ${highestIdx}`
        var recursePolygon = function (currs, stops, oppEdges) {
            if (stops === void 0) { stops = [-1, -1]; }
            visited.add(currs[0]);
            visited.add(currs[1]);
            for (var i = 0; i < vertices.length; ++i) {
                if (i === currs[0] || i === currs[1]) {
                    continue;
                }
                if (i === stops[0]) {
                    continue;
                }
                if (vertices[currs[0]][1].length !== 3 && vertices[currs[1]][1].length !== 3 && vertices[i][1].length !== 3) {
                    continue;
                }
                if (vertices[currs[0]][1].length === 3 && vertices[currs[1]][1].length === 3 && vertices[i][1].length === 3) {
                    continue;
                }
                if (vertices[currs[0]][2] === vertices[i][0] || vertices[currs[1]][2] === vertices[i][0]) {
                    continue;
                }
                // create tri hash
                var triIdx = void 0;
                if (currs[0] < currs[1] && currs[0] < i) {
                    if (currs[1] < i) {
                        triIdx = currs[0] + " " + currs[1] + " " + i;
                    }
                    else {
                        triIdx = currs[0] + " " + i + " " + currs[1];
                    }
                }
                else if (currs[1] < currs[0] && currs[1] < i) {
                    if (currs[0] < i) {
                        triIdx = currs[1] + " " + currs[0] + " " + i;
                    }
                    else {
                        triIdx = currs[1] + i + " " + currs[0];
                    }
                }
                else {
                    if (currs[0] < currs[1]) {
                        triIdx = i + " " + currs[0] + " " + currs[1];
                    }
                    else {
                        triIdx = i + " " + currs[1] + " " + currs[0];
                    }
                }
                if (triIdx in triHash) {
                    continue;
                }
                // check oppEdge intersection
                var iP0 = new M2_1.M2(vertices[i][0], vertices[currs[0]][0]);
                var iP1 = new M2_1.M2(vertices[i][0], vertices[currs[1]][0]);
                var iMid = new M2_1.M2(vertices[i][0], vertices[currs[0]][0].scale(.5).add(vertices[currs[1]][0].scale(.5)));
                if (oppEdges && iMid.intersect(oppEdges[0])) {
                    continue;
                }
                if (oppEdges && iMid.intersect(oppEdges[1])) {
                    continue;
                }
                // get all shared avoid lines
                var iP0Avoids = [];
                var iP1Avoids = [];
                var sharedAvoids = [];
                for (var _i = 0, _a = vertices[i][1]; _i < _a.length; _i++) {
                    var iAvoid = _a[_i];
                    var inEdgeP0 = false;
                    for (var _b = 0, _c = vertices[currs[0]][1]; _b < _c.length; _b++) {
                        var p0Avoid = _c[_b];
                        if (iAvoid === p0Avoid) {
                            inEdgeP0 = true;
                            break;
                        }
                    }
                    if (inEdgeP0) {
                        iP0Avoids.push(iAvoid);
                    }
                    var inEdgeP1 = false;
                    for (var _d = 0, _e = vertices[currs[1]][1]; _d < _e.length; _d++) {
                        var p1Avoid = _e[_d];
                        if (iAvoid === p1Avoid) {
                            inEdgeP1 = true;
                            break;
                        }
                    }
                    if (inEdgeP1) {
                        iP1Avoids.push(iAvoid);
                    }
                    if (inEdgeP0 && inEdgeP1) {
                        sharedAvoids.push(iAvoid);
                    }
                }
                var iTri = new Tri(vertices[i][0], vertices[currs[0]][0], vertices[currs[1]][0]);
                // check for intersections at avoid lines
                var avoidIntersects = false;
                for (var _f = 0, iP0Avoids_1 = iP0Avoids; _f < iP0Avoids_1.length; _f++) {
                    var iP0Avoid = iP0Avoids_1[_f];
                    if (iP0.intersect(iP0Avoid)) {
                        avoidIntersects = true;
                        break;
                    }
                    if (iTri.pointInscribed(new V2_1.V2(iP0Avoid.x0, iP0Avoid.y0), false)) {
                        avoidIntersects = true;
                        break;
                    }
                    if (iTri.pointInscribed(new V2_1.V2(iP0Avoid.x1, iP0Avoid.y1), false)) {
                        avoidIntersects = true;
                        break;
                    }
                }
                for (var _g = 0, iP1Avoids_1 = iP1Avoids; _g < iP1Avoids_1.length; _g++) {
                    var iP1Avoid = iP1Avoids_1[_g];
                    if (iP1.intersect(iP1Avoid)) {
                        avoidIntersects = true;
                        break;
                    }
                    if (iTri.pointInscribed(new V2_1.V2(iP1Avoid.x0, iP1Avoid.y0), false)) {
                        avoidIntersects = true;
                        break;
                    }
                    if (iTri.pointInscribed(new V2_1.V2(iP1Avoid.x1, iP1Avoid.y1), false)) {
                        avoidIntersects = true;
                        break;
                    }
                }
                if (avoidIntersects) {
                    continue;
                }
                triHash[triIdx] = iTri;
                console.groupEnd();
                if (i === stops[1]) {
                    return i;
                }
                var getCanExtrapolate = function (idx0, idx1) {
                    if (vertices[idx0][1].length === 1) {
                        return vertices[idx1][1].length === 3;
                    }
                    if (vertices[idx0][1].length === 2) {
                        return vertices[idx1][1].length === 2 || vertices[idx1][1].length === 3;
                    }
                    if (vertices[idx0][1].length === 3) {
                        return vertices[idx1][1].length === 1 || vertices[idx1][1].length === 2;
                    }
                    return false;
                };
                if (getCanExtrapolate(currs[0], i)) {
                    if (stops[0] < 0) {
                        stops = [currs[0], i];
                    }
                    var stopped = recursePolygon([currs[0], i], stops, [iP1, new M2_1.M2(vertices[currs[0]][0], vertices[currs[1]][0])]);
                    if (stopped) {
                        return stopped;
                    }
                }
                if (getCanExtrapolate(currs[1], i)) {
                    if (stops[0] < 0) {
                        stops = [currs[1], i];
                    }
                    var stopped = recursePolygon([currs[1], i], stops, [iP0, new M2_1.M2(vertices[currs[0]][0], vertices[currs[1]][0])]);
                    if (stopped) {
                        return stopped;
                    }
                }
                break;
            }
        };
        for (var _i = 0, initializers_1 = initializers; _i < initializers_1.length; _i++) {
            var initializer = initializers_1[_i];
            if (!visited.has(initializer[0]) && !visited.has(initializer[1])) {
                var initEdge = new M2_1.M2(vertices[initializer[0]][0], vertices[initializer[1]][0]);
                if (!initEdge.intersect(vertices[initializer[0]][1][0]) && !initEdge.intersect(vertices[initializer[0]][1][1])) {
                    recursePolygon([initializer[0], initializer[1]]);
                }
            }
        }
        var rtnVals = Object.values(triHash);
        if (!rtnVals.length) {
            recursePolygon([0, 1]);
        }
        return Object.values(triHash);
    };
    Tri.prototype.boundingBox = function () {
        return [
            new V2_1.V2(Math.min(this.p0.x, this.p1.x, this.p2.x), Math.min(this.p0.y, this.p1.y, this.p2.y)),
            new V2_1.V2(Math.max(this.p0.x, this.p1.x, this.p2.x), Math.max(this.p0.y, this.p1.y, this.p2.y))
        ];
    };
    Tri.prototype.boundingBoxIntersects = function (that) {
        var bb0 = this.boundingBox();
        var bb1 = that.boundingBox();
        var pointInBB = function (bb, p) {
            return bb[0].x < p.x && p.x < bb[1].x && bb[0].y < p.y && p.y < bb[1].y;
        };
        return pointInBB(bb0, bb1[0]) || pointInBB(bb0, bb1[1]) || pointInBB(bb1, bb0[0]) || pointInBB(bb1, bb0[1]);
    };
    Tri.prototype.hashcode = function () {
        var order = [this.p0, this.p1, this.p2];
        if (order[2].x < order[1].x || (order[2].x === order[1].x && order[2].y < order[1].y)) {
            var temp = order[1];
            order[1] = order[2];
            order[2] = temp;
        }
        if (order[1].x < order[0].x || (order[1].x === order[0].x && order[1].y < order[0].y)) {
            var temp = order[0];
            order[0] = order[1];
            order[1] = temp;
            // encapsulate in if block to save iteration if second swap doesnt occur
            if (order[2].x < order[1].x || (order[2].x === order[1].x && order[2].y < order[1].y)) {
                var temp_1 = order[1];
                order[1] = order[2];
                order[2] = temp_1;
            }
        }
        return order[0].x + " " + order[0].y + " " + order[1].x + " "
            + order[1].y + " " + order[2].x + " " + order[2].y;
    };
    return Tri;
}());
exports.Tri = Tri;
