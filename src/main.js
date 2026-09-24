import * as THREE from 'three';
import './style.css';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

document.body.appendChild(renderer.domElement);


// Particle colours

const colors = [
    0x5961FF,
    0x4F55E8,
    0x666CFF,
    0x7479FF,
    0x7379A8,
    0xA7ACD0,
    0xD4D7E8
];


// Particles

const particleCount = 15;
const trailLength = 30;

const particles = [];

for (let i = 0; i < particleCount; i++) {

    // Random size

    const size = THREE.MathUtils.randFloat(
        0.06,
        0.13
    );

    const geometry = new THREE.SphereGeometry(
        size,
        12,
        12
    );


    // Random colour

    const color =
        colors[
            Math.floor(
                Math.random() * colors.length
            )
        ];

    const material = new THREE.MeshBasicMaterial({
        color: color
    });

    const particle = new THREE.Mesh(
        geometry,
        material
    );

    particle.position.set(0, 0, 0);

    scene.add(particle);


    // Random cone axis

    const coneAngle =
        THREE.MathUtils.degToRad(
            THREE.MathUtils.randFloat(15, 25)
        );

    const theta =
        Math.random() * Math.PI * 2;

    const axis = new THREE.Vector3(
        Math.sin(coneAngle) * Math.cos(theta),
        Math.sin(coneAngle) * Math.sin(theta),
        Math.cos(coneAngle)
    ).normalize();


    // Basis around axis

    const helper =
        Math.abs(axis.y) < 0.9
            ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(1, 0, 0);

    const side = new THREE.Vector3()
        .crossVectors(axis, helper)
        .normalize();

    const up = new THREE.Vector3()
        .crossVectors(axis, side)
        .normalize();


    // Random motion

    const radius =
        THREE.MathUtils.randFloat(1.1, 1.7);

    const speed =
        THREE.MathUtils.randFloat(5, 8);

    const rotationSpeed =
        THREE.MathUtils.randFloat(18, 26);

    const tightening =
        THREE.MathUtils.randFloat(0.15, 0.25);


    // Individual trail

    const trailPoints = [];

    for (let j = 0; j < trailLength; j++) {

        const trailGeometry =
            new THREE.SphereGeometry(
                size * (1 - j / trailLength),
                8,
                8
            );

        const trailMaterial =
            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1 - j / trailLength
            });

        const trailPoint =
            new THREE.Mesh(
                trailGeometry,
                trailMaterial
            );

        scene.add(trailPoint);
        trailPoints.push(trailPoint);
    }


    particles.push({
        mesh: particle,

        axis,
        side,
        up,

        radius,
        speed,
        rotationSpeed,
        tightening,

        angle:
            Math.random() * Math.PI * 2,

        distance: 0,

        trailPoints
    });
}


// Animation

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    for (const p of particles) {

        // Rotation

        p.angle +=
            delta * p.rotationSpeed;


        // Tighten spiral

        p.radius *=
            Math.pow(p.tightening, delta);


        // Move along axis

        p.distance +=
            delta * p.speed;


        // Position along axis

        const position =
            p.axis.clone()
                .multiplyScalar(p.distance);


        // Spiral around axis

        const spiral =
            p.side.clone()
                .multiplyScalar(
                    Math.cos(p.angle) * p.radius
                )
                .add(
                    p.up.clone()
                        .multiplyScalar(
                            Math.sin(p.angle) * p.radius
                        )
                );


        p.mesh.position
            .copy(position)
            .add(spiral);


        // Trail

        p.trailPoints[0].position.copy(
            p.mesh.position
        );

        for (
            let i = trailLength - 1;
            i > 0;
            i--
        ) {
            p.trailPoints[i].position.lerp(
                p.trailPoints[i - 1].position,
                0.35
            );
        }
    }


    renderer.render(scene, camera);
}

animate();


// Resize

window.addEventListener('resize', () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});