"use strict";
exports.__esModule = true;
// HELPERS --------------------------------------------------
// --- sciNot -----------------------------------------------
// console.log(Helpers.sciNot(1.234567, 3)); // expected 1.23
// console.log(Helpers.sciNot(12.3456, 3)); // expected 1.23E1
// console.log(Helpers.sciNot(1234.5678, 4)); // expected 1.235E3
// console.log(Helpers.sciNot(.004, 1)); // expected 4E-3
// console.log(Helpers.sciNot(.01234, 3)); // expected 1.23E-2
// --- roundToPow -------------------------------------------
// console.log(Helpers.roundToPow(1.2345, 3)); // expected 0
// console.log(Helpers.roundToPow(1.23456, -3)); //expected 1.234
// console.log(Helpers.roundToPow(1200.1, 3)); // expected 1200
// console.log(Helpers.roundToPow(.00123, -4)); // expected .0012
// console.log(Helpers.roundToPow(100.01, -2)); // expected 100.01
// console.log(Helpers.roundToPow(-1.23, -1)); // expected -1.2
// --- atan2 ------------------------------------------------
// console.log(Helpers.atan2(1,0), Math.atan2(0,1)); // expect ===
// console.log(Helpers.atan2(1, 1), Math.atan2(1, 1)); // expect ===
// console.log(Helpers.atan2(1,3), Math.atan2(3,1)); // expect ===
// console.log(Helpers.atan2(0,1), Math.atan2(1,0)); // expect ===
// console.log(Helpers.atan2(-1, 1), Math.atan2(1,-1)); // expect ===
// console.log(Helpers.atan2(-1, 0), Math.atan2(0,-1)); // expect ===
// console.log(Helpers.atan2(-1, -1), Math.atan2(-1, -1)); // expect ===
// console.log(Helpers.atan2(0, -1), Math.atan2(-1, 0)); // expect ===
// console.log(Helpers.atan2(1, -1), Math.atan2(-1, 1)); // expect ===
// console.log(Helpers.atan2(-3,-1), Math.atan2(-1,-3)); // expect ===
// console.time();
// for (let i = 0; i < 100000000; ++i) {
//   const x = (Math.random()-.5)*10;
//   const y = (Math.random()-.5)*10;
//   const a: number = Helpers.atan2(x,y);
// }
// console.timeEnd();
// math.atan2 10^8 in ~1621ms
// Helpers.atan2 10^8 in ~5353ms
// damn
// --- fitIndex ---------------------------------------------
// console.log(Helpers.fitIndex(1,3)); //expect 1
// console.log(Helpers.fitIndex(-1, 3)); // expect 2
// console.log(Helpers.fitIndex(3, 3)); //expect 0
// console.log(Helpers.fitIndex(4,3)); //expect 1
// console.log(Helpers.fitIndex(6, 3)); //expect 0
// console.log(Helpers.fitIndex(-3, 3)); //expect 0
// console.log(Helpers.fitIndex(-4, 3)); //expect 2
// V3 -------------------------------------------------------
// console.log(new V3(1.1111,.00012345678,3000000.1).toString()); // expect <1.111, .0001234, 3000000>
// console.log(new V3(1.1111, .00012345678, 3000000).toString(2)); // expect <1.1, .00012, 3000000>
// console.log(new V3(1.1111, .00012345678, 3000000).toString(3, true)); // expect <1.11, 1.23E-4, 3E6>
// const v3a: V3 = new V3(1.23456789, 2.3456789, 3.141596);
// console.log(v3a.toString());
// const p0: V3 = new V3(1,2,3);
// const p1: V3 = new V3(4,-5,6);
// console.log(p0.cross(p1).toString());
// const p0: V3 = new V3(1,1,1);
// console.log(p0.unit().toString(3)); // expect <.577, .577, .577>
// M4 -------------------------------------------------------
// --- CONSTRUCTIONS && TRANSFORMATIONS ---------------------
// const cam0: M4 = new M4(new V3(0,0,0), new V3(0,0,1));
// console.log(cam0.rightVector.toString(), cam0.r00, cam0.r10, cam0.r20); // expect <1,0,0> 1  0  0
// console.log(cam0.lookVector.toString(), cam0.r01, cam0.r11, cam0.r21);  // expect <0,0,1> 0  0  1
// console.log(cam0.upVector.toString(), cam0.r02, cam0.r12, cam0.r22);   // expect <0,-1,0> 0 -1  0
// const p0: V3 = new V3(0,5,0);
// console.log(cam0.dot(p0).toString()); // expect <0,0,5>
// const p1: V3 = new V3(5,0,0);
// console.log(cam0.dot(p1).toString()); // expect <5,0,0>
// const p2: V3 = new V3(0,0,5);
// console.log(cam0.dot(p2).toString()); // expect <0,-5,0>
// console.log(cam0.rightVector.cross(cam0.lookVector).toString(), "\n");
// const cam1: M4 = new M4(new V3(0,0,0), new V3(1,1,1));
// console.log(cam1.rightVector.toString(3), Helpers.roundToPow(cam1.r00, -3), 
//   Helpers.roundToPow(cam1.r10, -3), Helpers.roundToPow(cam1.r20, -3)); // expect <.707, -.707, 0> .707 -.707 0
// console.log(cam1.lookVector.toString(3), Helpers.roundToPow(cam1.r01, -3), 
//   Helpers.roundToPow(cam1.r11, -3), Helpers.roundToPow(cam1.r21, -3)); // expect <.577, .577, .577> .577 .577 .577
// console.log(cam1.upVector.toString(3), Helpers.roundToPow(cam1.r02, -3), 
//   Helpers.roundToPow(cam1.r12, -3), Helpers.roundToPow(cam1.r22, -3)); // expect <-.408, -.408, .816> -.408 -.408 .816
// console.log(cam1.dot(new V3(1,0,0)).toString()); // expect <.707, -.707, 0>
// console.log(cam1.dot(new V3(0, 1, 0)).toString()); // expect < .577, .577, .577>
// console.log(cam1.dot(new V3(0, 0, 1)).toString()); // expect <-.408, -.408, .816>
// const cam2: M4 = new M4(new V3(5,-2,10), new V3(10,3,-3));
// console.log(cam2.toString()); //expect r<.707, -.707, 0> l<.338, .338, -.878> u<.621, .621, .478> p<5, -2, 10>
// --- INVERSIONS -------------------------------------------
// console.log("");
// console.log(cam1.invert().toString(true)); // expect .707   -.707   0      0
//                                                   // .577   .577    .577   0
//                                                   // -.408  -.408   .816   0
//                                                   // 0      0       0      1
// console.log(cam1.product(cam1.invert()).toString()); // expect identity matrix
// const cam3: M4 = new M4(new V3(0,0,0), new V3(0,1,0));
// console.log(cam3.toString()); //expect identity matrix
// console.log(cam3.invert().toString()); // expect identity matrix
// console.log(cam3.invert().dot(new V3(4,3,2)).toString()); // expect <4,3,2>
// console.log(cam0.invert().dot(new V3(0,2,-2)).toString()); // expect <0,-2,-2>
// const cam4: M4 = new M4(new V3(0,0,2), new V3(0,0,0));
// console.log(cam4.toString());
// console.log(cam4.invert().dot(new V3(0,2,0)).toString()); // expect <0,2,2>
// const cam5: M4 = new M4(new V3(0,10,2), new V3(0,11,2));
// console.log(cam5.invert().dot(new V3(0,12,2)));
// console.log(cam5.product(cam5.invert()).toString());
// console.log(cam5.invert().product(cam5).toString());
// --- RotateZXY --------------------------------------------
// console.log(new M4().rotateZXY(Math.PI/4,Math.PI/4,0).toString());
// console.log(new M4().rotateZXY(Math.PI/4,Math.PI/8,0).toString());
// console.log(new M4().rotateZXY(Math.PI/4,-Math.PI/8,0).toString());
// console.log(new M4().rotateZXY(Math.PI,0,0).toString()); 
// console.log(new M4().rotateZXY(Math.PI, Math.PI/4,0).toString());
// M2 --------------------------------------------------------
// const l0: M2 = new M2(new V2(0, 0), new V2(1, 1));
// const l1: M2 = new M2(new V2(0,2), new V2(2,0));
// const l2: M2 = new M2(new V2(0,3), new V2(3,0));
// const inter0: V2 | null = l0.intersect(l1);
// console.log(inter0);
// console.log(l0.intersect(l2));
// console.log(l0.intersect(l2, true));
// console.log(l0.intersect(l0));
// const l3: M2 = new M2(new V2(0,1), new V2(1,2));
// console.log(l0.intersect(l3));
// console.log(new M2(new V2(0,0), new V2(1,0)).collinear(new V2(.5,0)));
// console.log(new M2(new V2(0,0), new V2(1,0)).collinear(new V2(1,0)));
// console.log(new M2(new V2(0,0), new V2(1,0)).collinear(new V2(0,0)));
// console.log(new M2(new V2(0,0), new V2(1,0)).collinear(new V2(1.1,0)));
// console.log(new M2(new V2(0,0), new V2(1,0)).collinear(new V2(.5,.0005)));
// console.log(new M2(new V2(0,0), new V2(1,1)).collinear(new V2(0,1)));
// console.log(new M2(new V2(0,0), new V2(1,0)).collinear(new V2(.5,.0006)));
// console.log(new M2(new V2(0,0), new V2(1,0)).collinear(new V2(.5,-.0006)));
// console.log(new M2(new V2(0,0), new V2(1,1)).collinear(new V2(-1,-1)));
// Tri -------------------------------------------------------
// console.time();
// const tri0: Tri = new Tri(new V2(0,0), new V2(0,2), new V2(2,0));
// const tri1: Tri = new Tri(new V2(-2,-2), new V2(-2,10), new V2(10,-2));
// for (let i = 0; i < 100; ++i) {
//   tri0.negate(tri1);
// }
// console.timeEnd(); 
// console.log(tri0.pointInside(new V2(.5,.5)));
// console.log(tri0.pointInside(new V2(0,0)));
// console.log(tri0.pointInside(new V2(1,1)));
// console.log(tri0.pointInside(new V2(2,2)));
// const tri0: Tri = new Tri(new V2(0,0), new V2(0,3), new V2(3,0));
// console.log(tri0.pointInscribed(new V2(0,0)));
// console.log(tri0.pointInscribed(new V2(0,0), false));
// const tri1: Tri = new Tri(new V2(.86,.35), new V2(1.82,.59), new V2(.31,1.61));
// const tri0SubTri1: Tri[] = tri0.negate(tri1);
// for (const tri of tri0SubTri1) {
//   console.log(tri);
// }
// const tri2: Tri = new Tri(new V2(.5, .5), new V2(-1,.5), new V2(.5,-1));
// const tri0SubTri2: Tri[] = tri0.negate(tri2);
// for (const tri of tri0SubTri2) {
//   console.log(tri);
// }
// const tri3: Tri = new Tri(new V2(.5,1), new V2(1,.5), new V2(-2,-2));
// const tri0SubTri3: Tri[] = tri0.negate(tri3);
// for (const tri of tri0SubTri3) {
//   console.log(tri);
// }
// const tri4: Tri = new Tri(new V2(.5,.25), new V2(.75,-.25), new V2(1,.25));
// const tri0SubTri4: Tri[] = tri0.negate(tri4);
// for (const tri of tri0SubTri4) {
//   console.log(tri);
// }
// const tri5: Tri = new Tri(new V2(-.25,1), new V2(1,-.25), new V2(1.5, 1.5));
// const tri0SubTri5: Tri[] = tri0.negate(tri5);
// for (const tri of tri0SubTri5) {
//   console.log(tri);
// }
// const tri6: Tri = new Tri(new V2(0,1), new V2(1,0), new V2(1,1));
// const tri0SubTri6: Tri[] = tri0.negate(tri6);
// for (const tri of tri0SubTri6) {
//   console.log(tri);
// }
// const tri7: Tri = new Tri(new V2(-.056,.25), new V2(-1.37,1.68), new V2(1.39,1.57));
// const tri8: Tri = new Tri(new V2(.91,1.36), new V2(-.18,-.62), new V2(-.13,1));
// const tri7SubTri8: Tri[] = tri7.negate(tri8);
// for (const tri of tri7SubTri8) {
//   console.log(tri);
// }
// const tri9: Tri = new Tri(new V2(.5,.5), new V2(.5,1), new V2(1,.5));
// const tri0SubTri9: Tri[] = tri0.negate(tri9);
// for (const tri of tri0SubTri9) {
//   console.log(tri);
// }
// SANDBOX ---------------------------------------------------
// const cam0: M4 = new M4(new V3(0,0,0), new V3(0,1,-.05));
// const cam0FOV: V2 = new V2(Helpers.rad(90), Helpers.rad(50));
// const windowSize: V2 = new V2(1000, 500);
// console.log(cam0.toString());
// const x0: number = 0;
// const y0: number = 40;
// const perlinHeight0: number = 20*(.3*Helpers.perlinR2(.1*x0, .1*y0) + .2*Helpers.perlinR2(.7*x0, .7*y0) - .5);
// const canyonHeight0: number = 10*(1 - 1/(1+Math.pow(Math.E, Math.abs(.3*x0) - 4)));
// const p0: V3 = new V3(x0, y0, perlinHeight0 + canyonHeight0 -5);
// console.log(p0.toString());
// const relP0: V3 = cam0.invert().dot(p0);
// console.log(relP0.toString());
// console.log(cam0.pointToScreenPos(p0, cam0FOV, windowSize));
// console.log(cam0.pointToScreenPos(p0, new V2(Math.PI/2, Math.PI/2), windowSize));
// const cam1: M4 = new M4(new V3(0,0,0), new V3(0,1,0));
// const p1: V3 = new V3(0,3.7,-1.53);
// console.log(cam1.pointToScreenPos(p1, new V2(Math.PI/2, Math.PI/4), windowSize));
// const cam2: M4 = new M4(new V3(0,100,0), new V3(0,101,0));
// console.log(new V3(1,1,1).unit().toString());
// const cam: M4 = new M4();
// const camFOV: V2 = new V2(Math.PI/2, Math.PI/4);
// const screenSize: V2 = new V2(1000,500);
// console.log(cam.getViewportBoundingBox(camFOV, 10, 0));
// const bgStart: V3 = new V3(97,97,112);
// const bgEnd: V3 = new V3(15,15,30);
// const yPos: number = .5
// const baseColor: V3 = new V3(50,255,255);
// const opacity: number = .8;
// const bgColor: V3 = bgStart.add(bgEnd.add(bgStart.scale(-1)).scale(yPos));
// console.log(bgColor.add(baseColor.add(bgColor.scale(-1)).scale(opacity)));
// const lightCam: M4 = new M4().rotateZXY(0,-Math.PI/8,-Math.PI/8);
// console.log(lightCam.upVector.toString());
// const l0: M2 = new M2(0,0,5,5);
// const minMax: [number,number] = [2,4];
// const triA: Tri = new Tri(new V2(5.5,5.5), new V2(5.5,0), new V2(0,5.5));
// const dDis: number = minMax[1] - minMax[0];
// const dX: number = l0.x1 - l0.x0;
// const dY: number = l0.y1 - l0.y0;
// l0.negateFromTri(triA).forEach(v => {
//   let newMin: number, newMax: number;
//   if (dX) {
//     newMin = (v.x0 - l0.x1)/dX * dDis + minMax[1];
//     newMax = (v.x1 - l0.x0)/dX * dDis + minMax[0];
//   } else {
//     newMin = (v.y0 - l0.y1)/dY * dDis + minMax[1];
//     newMax = (v.y1 - l0.y0)/dY * dDis + minMax[0];
//   }
//   console.log(v, newMin, newMax);
// });
// const averageAngles = (angles: [number, number][]) => {
//   let rtn: number = 0;
//   let rtnWeight: number = 0;
//   for (const [ angle, weight ] of angles) {
//     const da: number = rtn - angle;
//     console.log(rtn, angle);
//     if (Math.abs(da) > Math.PI) {
//       rtn -= Math.sign(da)*2*Math.PI;
//     }
//     console.log(rtn, angle,"\n");
//     rtn = rtn*rtnWeight/(rtnWeight + weight) + angle*weight/(rtnWeight + weight);
//     rtnWeight += weight;  
//   }
//   return rtn;
// }
// console.log(averageAngles([[0,.5],[3*Math.PI/2-.01,.5]]),"\n\n\n");
// console.log(averageAngles([[3*Math.PI/2-.01,.5],[0,.5]]),"\n\n\n");
// const window = {
//   innerWidth: 1000,
//   innerHeight: 500,
// }
// const toSVGspace = (v2: V2): V2 => {
//   const bodySize: V2 = new V2(window.innerWidth, window.innerHeight - .1*window.innerWidth);
//   return v2.add(0, -.1*window.innerWidth).parallelProduct(1/bodySize.x, 1/bodySize.y).scale(100);
// }
// console.log(toSVGspace(new V2(500,300)).toString());
