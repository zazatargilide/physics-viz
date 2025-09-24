const canvas = document.getElementById('myCanvas');
const infoDiv = document.getElementById('infoDiv') as HTMLDivElement;
const starMassSlider = document.getElementById('starMassSlider') as HTMLInputElement;
const initialVelocitySlider = document.getElementById('initialVelocitySlider') as HTMLInputElement;
const starMassValueSpan = document.getElementById('starMassValue') as HTMLSpanElement;
const initialVelocityValueSpan = document.getElementById('initialVelocityValue') as HTMLSpanElement;

starMassValueSpan.textContent = starMassSlider.value;
initialVelocityValueSpan.textContent = initialVelocitySlider.value;

if (canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const GRAVITATIONAL_CONSTANT = 0.5;

        class Vector {
            x: number;
            y: number;
            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
            }
            add(other: Vector): Vector {
                return new Vector(this.x + other.x, this.y + other.y);
            }
            subtract(other: Vector): Vector {
                return new Vector(this.x - other.x, this.y - other.y);
            }
            scale(scalar: number): Vector {
                return new Vector(this.x * scalar, this.y * scalar);
            }
            magnitude(): number {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            }
            normalize(): Vector {
                const mag = this.magnitude();
                return mag === 0 ? new Vector(0, 0) : new Vector(this.x / mag, this.y / mag);
            }
        }

        class Body {
            position: Vector;
            velocity: Vector;
            mass: number;
            radius: number;
            color: string;
            
            constructor(x: number, y: number, mass: number, radius: number, color: string, vx: number, vy: number) {
                this.position = new Vector(x, y);
                this.velocity = new Vector(vx, vy);
                this.mass = mass;
                this.radius = radius;
                this.color = color;
            }

            update(bodies: Body[]) {
                let netForce = new Vector(0, 0);
                for (const other of bodies) {
                    if (other !== this) {
                        const direction = other.position.subtract(this.position);
                        const distance = direction.magnitude();
                        const forceMagnitude = (GRAVITATIONAL_CONSTANT * this.mass * other.mass) / (distance * distance);
                        const force = direction.normalize().scale(forceMagnitude);
                        netForce = netForce.add(force);
                    }
                }
                const acceleration = netForce.scale(1 / this.mass);
                this.velocity = this.velocity.add(acceleration);
                this.position = this.position.add(this.velocity);
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const bodies: Body[] = [];
        const star = new Body(canvas.width / 2, canvas.height / 2, parseFloat(starMassSlider.value), 20, 'yellow', 0, 0);
        const planet = new Body(canvas.width / 2 + 300, canvas.height / 2, 10, 8, 'blue', 0, parseFloat(initialVelocitySlider.value));
        bodies.push(star, planet);

        let trail: Vector[] = [];
        const maxTrailLength = 400;

        starMassSlider.addEventListener('input', (e) => {
            const newMass = parseFloat((e.target as HTMLInputElement).value);
            star.mass = newMass;
            starMassValueSpan.textContent = newMass.toString();
        });

        initialVelocitySlider.addEventListener('input', (e) => {
            const newVelocity = parseFloat((e.target as HTMLInputElement).value);
            planet.velocity.y = newVelocity;
            initialVelocityValueSpan.textContent = newVelocity.toString();
        });
        
        function updateInfo() {
            const distance = star.position.subtract(planet.position).magnitude().toFixed(2);
            const forceMagnitude = (GRAVITATIONAL_CONSTANT * star.mass * planet.mass) / (Math.pow(parseFloat(distance), 2));
            
            infoDiv.innerHTML = `
                <p>Star Mass: ${star.mass.toFixed(0)}</p>
                <p>Planet Mass: ${planet.mass.toFixed(0)}</p>
                <p>Distance: ${distance} px</p>
                <br>
                <h3>Formulas</h3>
                <p><b>Gravitational Force:</b></p>
                <p>F = G * (m1 * m2) / r²</p>
                <p>F = ${GRAVITATIONAL_CONSTANT} * (${star.mass.toFixed(0)} * ${planet.mass.toFixed(0)}) / ${distance}² = ${forceMagnitude.toFixed(2)} N</p>
            `;
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (const body of bodies) {
                body.update(bodies);
            }
            
            star.draw();
            planet.draw();
            
            trail.push(planet.position);
            if (trail.length > maxTrailLength) {
                trail.shift();
            }

            for(let i = 0; i < trail.length - 1; i++) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${i / trail.length})`;
                ctx.beginPath();
                ctx.moveTo(trail[i].x, trail[i].y);
                ctx.lineTo(trail[i+1].x, trail[i+1].y);
                ctx.stroke();
            }

            updateInfo();
        }

        animate();

    } else {
        console.error('Could not get 2D context for canvas.');
    }
} else {
    console.error('The element with ID "myCanvas" was not found or is not a canvas element.');
}