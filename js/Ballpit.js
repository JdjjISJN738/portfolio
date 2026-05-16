/**
 * Ballpit - Vanilla JS implementation
 * Inspired by the provided React component source.
 */

(function() {
    'use strict';

    // We expect THREE to be globally available via CDN
    if (typeof THREE === 'undefined') {
        console.error('Ballpit: THREE.js not found. Please include Three.js CDN script.');
        return;
    }

    const {
        Vector3, MeshPhysicalMaterial, InstancedMesh, Clock, AmbientLight,
        SphereGeometry, ShaderChunk, Scene, Color, Object3D, SRGBColorSpace,
        MathUtils, Vector2, WebGLRenderer, PerspectiveCamera,
        PointLight, ACESFilmicToneMapping, Plane, Raycaster
    } = THREE;

    // Helper for random floats
    const { randFloat: k, randFloatSpread: E } = MathUtils;

    // --- Physics Engine (Class W in provided source) ---
    class BallPhysics {
        constructor(config) {
            this.config = config;
            this.positionData = new Float32Array(3 * config.count).fill(0);
            this.velocityData = new Float32Array(3 * config.count).fill(0);
            this.sizeData = new Float32Array(config.count).fill(1);
            this.center = new Vector3();
            this.init();
        }

        init() {
            const { config, positionData } = this;
            this.center.toArray(positionData, 0);
            for (let i = 1; i < config.count; i++) {
                const s = 3 * i;
                positionData[s] = E(2 * config.maxX);
                positionData[s + 1] = E(2 * config.maxY);
                positionData[s + 2] = E(2 * config.maxZ);
            }
            for (let i = 0; i < config.count; i++) {
                this.sizeData[i] = i === 0 ? config.size0 : k(config.minSize, config.maxSize);
            }
        }

        update(delta) {
            const { config, center, positionData, sizeData, velocityData } = this;
            let r = 0;
            const F = new Vector3();
            const I = new Vector3();
            const B = new Vector3();
            const O = new Vector3();
            const N = new Vector3();
            const _ = new Vector3();
            const j = new Vector3();
            const H = new Vector3();
            const T = new Vector3();

            if (config.controlSphere0) {
                r = 1;
                F.fromArray(positionData, 0);
                F.lerp(center, 0.1).toArray(positionData, 0);
                // Velocity 0 for the controlled sphere
                velocityData[0] = 0; velocityData[1] = 0; velocityData[2] = 0;
            }

            // Update positions and handle boundaries
            for (let idx = r; idx < config.count; idx++) {
                const base = 3 * idx;
                I.fromArray(positionData, base);
                B.fromArray(velocityData, base);
                
                // Gravity
                B.y -= delta * config.gravity * sizeData[idx];
                // Friction
                B.multiplyScalar(config.friction);
                // Velocity Clamp
                const maxV = config.maxVelocity || 0.15;
                if (B.length() > maxV) B.setLength(maxV);
                
                I.add(B);

                // Collisions with other balls
                const radius = sizeData[idx];
                for (let jdx = idx + 1; jdx < config.count; jdx++) {
                    const otherBase = 3 * jdx;
                    O.fromArray(positionData, otherBase);
                    N.fromArray(velocityData, otherBase);
                    const otherRadius = sizeData[jdx];
                    _.copy(O).sub(I);
                    const dist = _.length();
                    const sumRadius = radius + otherRadius;
                    if (dist < sumRadius && dist > 0) {
                        const overlap = sumRadius - dist;
                        j.copy(_).normalize().multiplyScalar(0.5 * overlap);
                        H.copy(j).multiplyScalar(Math.max(B.length(), 1));
                        T.copy(j).multiplyScalar(Math.max(N.length(), 1));
                        I.sub(j);
                        B.sub(H);
                        O.add(j);
                        N.add(T);
                        O.toArray(positionData, otherBase);
                        N.toArray(velocityData, otherBase);
                    }
                }

                // Collision with control sphere
                if (config.controlSphere0) {
                    const controlPos = new Vector3().fromArray(positionData, 0);
                    _.copy(controlPos).sub(I);
                    const dist = _.length();
                    const sumRadius0 = radius + sizeData[0];
                    if (dist < sumRadius0 && dist > 0) {
                        const diff = sumRadius0 - dist;
                        j.copy(_).normalize().multiplyScalar(diff);
                        H.copy(j).multiplyScalar(Math.max(B.length(), 2));
                        I.sub(j);
                        B.sub(H);
                    }
                }

                // Wall boundaries
                if (Math.abs(I.x) + radius > config.maxX) {
                    I.x = Math.sign(I.x) * (config.maxX - radius);
                    B.x = -B.x * config.wallBounce;
                }
                if (config.gravity === 0) {
                    if (Math.abs(I.y) + radius > config.maxY) {
                        I.y = Math.sign(I.y) * (config.maxY - radius);
                        B.y = -B.y * config.wallBounce;
                    }
                } else if (I.y - radius < -config.maxY) {
                    I.y = -config.maxY + radius;
                    B.y = -B.y * config.wallBounce;
                }
                const maxBoundaryZ = Math.max(config.maxZ, config.maxSize);
                if (Math.abs(I.z) + radius > maxBoundaryZ) {
                    I.z = Math.sign(I.z) * (maxBoundaryZ - radius);
                    B.z = -B.z * config.wallBounce;
                }

                I.toArray(positionData, base);
                B.toArray(velocityData, base);
            }
        }
    }

    // --- Sub-Surface Scattering Material (Class Y in source) ---
    class BallMaterial extends MeshPhysicalMaterial {
        constructor(params) {
            super(params);
            this.uniforms = {
                thicknessDistortion: { value: 0.1 },
                thicknessAmbient: { value: 0 },
                thicknessAttenuation: { value: 0.1 },
                thicknessPower: { value: 2 },
                thicknessScale: { value: 10 }
            };
            this.onBeforeCompile = (shader) => {
                Object.assign(shader.uniforms, this.uniforms);
                
                // Define uniforms at the top
                shader.fragmentShader = `
                    uniform float thicknessPower;
                    uniform float thicknessScale;
                    uniform float thicknessDistortion;
                    uniform float thicknessAmbient;
                    uniform float thicknessAttenuation;
                ` + shader.fragmentShader;

                // Define the function after Three.js lighting structs are available
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <lights_pars_begin>',
                    `
                    #include <lights_pars_begin>
                    void RE_Direct_Scattering(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
                        vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
                        float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
                        #ifdef USE_COLOR
                            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
                        #else
                            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
                        #endif
                        reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
                    }
                    `
                );

                // Inject the call into the lighting chunk
                const lights_fragment_begin = ShaderChunk.lights_fragment_begin.replace(
                    'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
                    `
                    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
                    RE_Direct_Scattering(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
                    `
                );
                shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lights_fragment_begin);
            };
        }
    }

    // --- Instanced Mesh for Balls (Class Z in source) ---
    class BallpitMesh extends InstancedMesh {
        constructor(renderer, config) {
            const geo = new SphereGeometry(1, 32, 32);
            const mat = new BallMaterial({
                metalness: 0.5,
                roughness: 0.5,
                clearcoat: 1.0,
                clearcoatRoughness: 0.15,
                color: new Color(0xffffff)
            });
            
            super(geo, mat, config.count);
            
            this.config = config;
            this.physics = new BallPhysics(config);
            this.dummy = new Object3D();
            
            this.ambientLight = new AmbientLight(0xffffff, 1.0);
            this.pointLight = new PointLight(0xffffff, 200);
            
            this.initColors();
        }

        initColors() {
            const colorPalette = this.config.colors.map(c => new Color(c));
            for (let i = 0; i < this.count; i++) {
                const ratio = i / (this.count - 1);
                const scaled = ratio * (colorPalette.length - 1);
                const idx = Math.floor(scaled);
                const alpha = scaled - idx;
                const start = colorPalette[idx];
                const end = colorPalette[Math.min(idx + 1, colorPalette.length - 1)];
                const col = start.clone().lerp(end, alpha);
                this.setColorAt(i, col);
                if (i === 0) this.pointLight.color.copy(col);
            }
            this.instanceColor.needsUpdate = true;
        }

        update(delta) {
            this.physics.update(delta);
            for (let i = 0; i < this.count; i++) {
                this.dummy.position.fromArray(this.physics.positionData, 3 * i);
                if (i === 0 && !this.config.followCursor) {
                    this.dummy.scale.setScalar(0); // Hide the cursor ball if not following
                } else {
                    this.dummy.scale.setScalar(this.physics.sizeData[i]);
                }
                this.dummy.updateMatrix();
                this.setMatrixAt(i, this.dummy.matrix);
                if (i === 0) this.pointLight.position.copy(this.dummy.position);
            }
            this.instanceMatrix.needsUpdate = true;
        }
    }

    // --- Main Controller ---
    window.initBallpit = function(canvas, config = {}) {
        const settings = Object.assign({
            count: 100,
            gravity: 0.01,
            friction: 0.9975,
            wallBounce: 0.95,
            followCursor: false,
            colors: [0x2563eb, 0x7c3aed, 0x06b6d4],
            minSize: 0.5,
            maxSize: 1.0,
            size0: 1.2,
            maxVelocity: 0.15,
            maxX: 5,
            maxY: 5,
            maxZ: 2
        }, config);

        const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.outputColorSpace = SRGBColorSpace;

        const scene = new Scene();
        const camera = new PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 20;

        const mesh = new BallpitMesh(renderer, settings);
        scene.add(mesh);
        scene.add(mesh.ambientLight);
        scene.add(mesh.pointLight);

        const clock = new Clock();
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        const plane = new Plane(new Vector3(0, 0, 1), 0);
        const intersectPoint = new Vector3();

        function resize() {
            const width = canvas.parentElement.clientWidth;
            const height = canvas.parentElement.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            // Calculate world boundaries
            const fovRad = (camera.fov * Math.PI) / 180;
            const h = 2 * Math.tan(fovRad / 2) * camera.position.z;
            const w = h * camera.aspect;
            mesh.config.maxX = w / 2;
            mesh.config.maxY = h / 2;
        }

        window.addEventListener('resize', resize);
        resize();

        const hero = canvas.closest('.hero') || canvas.parentElement;

        function onMouseMove(e) {
            const rect = hero.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(plane, intersectPoint);
            mesh.physics.center.copy(intersectPoint);
            mesh.config.controlSphere0 = true;
        }

        function onTouchMove(e) {
            if (e.touches.length > 0) {
                onMouseMove(e.touches[0]);
            }
        }

        hero.addEventListener('mousemove', onMouseMove);
        hero.addEventListener('touchmove', onTouchMove);
        hero.addEventListener('mouseleave', () => mesh.config.controlSphere0 = false);
        hero.addEventListener('touchend', () => mesh.config.controlSphere0 = false);

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            mesh.update(delta);
            renderer.render(scene, camera);
        }

        animate();
        
        return {
            renderer,
            scene,
            camera,
            mesh,
            dispose: function() {
                window.removeEventListener('resize', resize);
                // Additional cleanup...
            }
        };
    };

})();
