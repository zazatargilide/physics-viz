const canvas = document.getElementById('myCanvas');
const infoDiv = document.getElementById('infoDiv') as HTMLDivElement;
const massSlider = document.getElementById('massSlider') as HTMLInputElement;
const gravitySelect = document.getElementById('gravitySelect') as HTMLSelectElement;
const massValueSpan = document.getElementById('massValue') as HTMLSpanElement;
const gravityValueSpan = document.getElementById('gravityValue') as HTMLSpanElement;

massValueSpan.textContent = massSlider.value;
gravityValueSpan.textContent = gravitySelect.options[gravitySelect.selectedIndex].text;

if (canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let isDragging = false;
        let lastMousePos = { x: 0, y: 0 };
        
        const trail: { x: number; y: number; }[] = [];
        const maxTrailLength = 450; 
        const maxSpeed = 100;

        let prevVx = 0;
        let prevVy = 0;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            mass: number;
            gravity: number;
            radius: number;
            color: string;
            
            constructor(x: number, y: number, mass: number, gravity: number, color: string) {
                this.x = x;
                this.y = y;
                this.vx = 0;
                this.vy = 0;
                this.mass = mass;
                this.gravity = gravity;
                this.color = color;
                this.radius = 20 + Math.pow(this.mass, 0.8);
            }

            update() {
                prevVx = this.vx;
                prevVy = this.vy;

                const ay = this.gravity;
                this.vy += ay;
                this.x += this.vx;
                this.y += this.vy;

                this.vx *= 0.99;
                this.vy *= 0.99;

                const bounceFactor = 0.6;

                if (this.y + this.radius > canvas.height) {
                    this.y = canvas.height - this.radius;
                    this.vy *= -bounceFactor; 
                    
                    if (Math.abs(this.vy) < 1 && Math.abs(this.vx) < 1) { 
                        this.vy = 0;
                        this.vx = 0;
                    }
                }
                
                if (this.y - this.radius < 0) {
                    this.y = this.radius;
                    this.vy *= -bounceFactor;
                }
                
                if (this.x + this.radius > canvas.width) {
                    this.x = canvas.width - this.radius;
                    this.vx *= -bounceFactor; 
                }
                
                if (this.x - this.radius < 0) {
                    this.x = this.radius;
                    this.vx *= -bounceFactor;
                }

                trail.push({ x: this.x, y: this.y });

                if (trail.length > maxTrailLength) {
                    trail.shift();
                }
            }

            draw() {
                for (let i = 0; i < trail.length; i++) {
                    const alpha = (i / trail.length) * 0.5;
                    const trailRadius = 2;
                    ctx.beginPath();
                    ctx.arc(trail[i].x, trail[i].y, trailRadius, 0, Math.PI * 2, false);
                    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
                    ctx.fill();
                    ctx.closePath();
                }

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            }
        }

        const particle = new Particle(canvas.width / 2, 50, parseFloat(massSlider.value), parseFloat(gravitySelect.value), 'blue');

        massSlider.addEventListener('input', (e) => {
            const newMass = parseFloat((e.target as HTMLInputElement).value);
            particle.mass = newMass;
            particle.radius = 20 + Math.pow(newMass, 0.8); 
            massValueSpan.textContent = newMass.toString();
        });

        gravitySelect.addEventListener('change', (e) => {
            const selectedGravity = parseFloat((e.target as HTMLSelectElement).value);
            particle.gravity = selectedGravity;
            gravityValueSpan.textContent = gravitySelect.options[gravitySelect.selectedIndex].text;
        });
        
        function updateInfo() {
            const currentSpeed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
            const displayedSpeed = currentSpeed < 1 ? 0 : currentSpeed.toFixed(2);
            
            const displayedVx = Math.abs(particle.vx) < 1 ? 0 : particle.vx.toFixed(2);
            const displayedVy = Math.abs(particle.vy) < 1 ? 0 : particle.vy.toFixed(2);
            
            const height = (canvas.height - particle.y).toFixed(2);
            
            const deltaVx = particle.vx - prevVx;
            const deltaVy = particle.vy - prevVy;

            infoDiv.innerHTML = `
                <p>Speed (v): ${displayedSpeed} px/s</p>
                <p>Velocity X (vx): ${displayedVx} px/s</p>
                <p>Velocity Y (vy): ${displayedVy} px/s</p>
                <p>Height (y): ${height} px</p>
                <p>Gravity (g): ${particle.gravity.toFixed(2)} px/s²</p>
                <p>Mass (m): ${particle.mass.toFixed(0)} units</p>
                <p>Radius (r): ${particle.radius.toFixed(0)} px</p>
                <br>
                <h3>Formulas</h3>
                <p><b>Acceleration Y:</b> a = Δv<sub>y</sub>/Δt = (${particle.vy.toFixed(2)} - ${prevVy.toFixed(2)}) / 1 = ${(deltaVy).toFixed(2)} px/s²</p>
                <p><b>Velocity Y:</b> v<sub>y</sub> = v<sub>y₀</sub> + a · t = ${prevVy.toFixed(2)} + ${particle.gravity.toFixed(2)} · 1 = ${(prevVy + particle.gravity).toFixed(2)} px/s</p>
            `;
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (!isDragging) {
                particle.update();
            }

            particle.draw();
            updateInfo();
        }

        canvas.addEventListener('mousedown', (e) => {
            const dist = Math.sqrt((e.offsetX - particle.x) ** 2 + (e.offsetY - particle.y) ** 2);
            if (dist < particle.radius) {
                isDragging = true;
                lastMousePos = { x: e.offsetX, y: e.offsetY };
                particle.vx = 0;
                particle.vy = 0;
                trail.length = 0;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                particle.x = e.offsetX;
                particle.y = e.offsetY;
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                const speedFactor = 20 / particle.mass;
                let newVx = (e.offsetX - lastMousePos.x) * speedFactor;
                let newVy = (e.offsetY - lastMousePos.y) * speedFactor;

                const currentSpeed = Math.sqrt(newVx ** 2 + newVy ** 2);
                if (currentSpeed > maxSpeed) {
                    const ratio = maxSpeed / currentSpeed;
                    newVx *= ratio;
                    newVy *= ratio;
                }

                particle.vx = newVx;
                particle.vy = newVy;
            }
        });

        animate();

    } else {
        console.error('Could not get 2D context for canvas.');
    }
} else {
    console.error('The element with ID "myCanvas" was not found or is not a canvas element.');
}