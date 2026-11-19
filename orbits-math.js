
// Translation of the QBasic N-Bug orbit calculations.
// The original program draws 50 samples along each geodesic segment.
const PI = Math.PI;
const rad = degrees => degrees * PI / 180;
const polar = (radius, angle) => ({x: radius * Math.cos(angle), y: radius * Math.sin(angle)});

const SETTINGS = {
    planar: {radius: 40, theta: 2, increments: [30,35,40,45,50,55], steps: [2,2,2,2,2,2]},
    spherical: {radius: [1.25,1.21,1.2,1.2,1.2,1.2], theta: 60, increments: [27,40,54,35,37,37], steps: [2,2,2,3.5,3.5,3.7]},
    hyperbolic: {radius: [1.6,1.45,1.42,1.4,1.4,1.4], theta: 60, increments: [25,30,35,40,45,48], steps: [2,2,2,2,2,2.1]}
};

function sphericalArc(theta, phi, n, r) {
    const phi2 = phi + 2 * PI / n;
    const a = [Math.sin(theta)*Math.cos(phi), Math.sin(theta)*Math.sin(phi), Math.cos(theta)];
    const b = [Math.sin(theta)*Math.cos(phi2), Math.sin(theta)*Math.sin(phi2), Math.cos(theta)];
    const cross = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    const norm = Math.hypot(...cross);
    if (norm < 1e-12 || Math.abs(cross[2]) < 1e-12) return [];
    const v = cross.map(x => x/norm);
    const cx = r*v[0]/v[2], cy = r*v[1]/v[2], arcRadius = Math.abs(r/v[2]);
    const start = polar(r*Math.tan(theta/2),phi);
    const end = polar(r*Math.tan(theta/2),phi2);
    const alpha0 = Math.atan2(start.y-cy,start.x-cx);
    const alpha1 = Math.atan2(end.y-cy,end.x-cx);
    // The short circular arc connects adjacent polygon vertices.
    const delta = Math.atan2(Math.sin(alpha1-alpha0),Math.cos(alpha1-alpha0));
    return Array.from({length:51},(_,i)=>({x:cx+arcRadius*Math.cos(alpha0+delta*i/50),y:cy+arcRadius*Math.sin(alpha0+delta*i/50)}));
}

function hyperbolicArc(theta, phi, n, r) {
    const phi2 = phi + 2*PI/n;
    const rr = r*Math.tanh(theta/2);
    const rb = (r*r+rr*rr)/(2*rr*Math.cos(PI/n));
    const center = polar(rb,(phi+phi2)/2);
    const circleRadius = Math.sqrt(Math.max(0,rb*rb-r*r));
    const start = polar(rr,phi), end = polar(rr,phi2);
    const alpha0 = Math.atan2(start.y-center.y,start.x-center.x);
    const alpha1 = Math.atan2(end.y-center.y,end.x-center.x);
    const delta = Math.atan2(Math.sin(alpha1-alpha0),Math.cos(alpha1-alpha0));
    return Array.from({length:51},(_,i)=>({x:center.x+circleRadius*Math.cos(alpha0+delta*i/50),y:center.y+circleRadius*Math.sin(alpha0+delta*i/50)}));
}

export function generateOrbits(geometry='planar', bugCount=3) {
    const n = Math.max(3,Math.min(8,Math.round(bugCount)));
    const cfg = SETTINGS[geometry] || SETTINGS.planar;
    const idx = n-3;
    const r = Array.isArray(cfg.radius) ? cfg.radius[idx] : cfg.radius;
    const theta0 = rad(cfg.theta), phi0 = rad(1), dphi = rad(cfg.steps[idx]);
    const c1 = Math.tan(PI/n);
    const c2 = geometry === 'hyperbolic' ? Math.tanh(theta0) : Math.tan(theta0);
    const paths = Array.from({length:n},()=>[]);
    for(let i=0;i<cfg.increments[idx];i++) {
        const phi = phi0+i*dphi;
        const c3 = c2*Math.exp(-i*dphi*c1);
        const theta = geometry === 'hyperbolic' ? Math.atanh(c3) : Math.atan(c3);
        const arc = geometry === 'hyperbolic' ? hyperbolicArc(theta,phi,n,r) : sphericalArc(theta,phi,n,r);
        for(const point of arc) {
            const radius = Math.hypot(point.x,point.y);
            const angle = Math.atan2(point.y,point.x);
            for(let j=0;j<n;j++) paths[j].push(polar(radius,angle+j*2*PI/n));
        }
    }
    return {paths, boundaryRadius: geometry==='hyperbolic'?r:null};
}
