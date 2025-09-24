const canvas = document.getElementById('myCanvas');
const infoDiv = document.getElementById('infoDiv') as HTMLDivElement;
const massSlider = document.getElementById('massSlider') as HTMLInputElement;
const kSlider = document.getElementById('kSlider') as HTMLInputElement;
const cSlider = document.getElementById('cSlider') as HTMLInputElement;
const massValueSpan = document.getElementById('massValue') as HTMLSpanElement;
const kValueSpan = document.getElementById('kValue') as HTMLSpanElement;
const cValueSpan = document.getElementById('cValue') as HTMLSpanElement;

massValueSpan.textContent = massSlider.value;
kValueSpan.textContent = kSlider.value;
cValueSpan.textContent = cSlider.value;

if (canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let isDragging = false;

        class Particle {
            x; y; vx; vy; mass; radius; color;
            constructor(x, y, mass, radius, color) {
                this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.mass = mass; this.radius = radius; this.color = color;
            }
            update(springConstant, damping, targetY) {
                const displacement = this.y - targetY;
                const springForce = -springConstant * displacement;
                const dampingForce = -damping * this.vy;
                const netForce = springForce + dampingForce;
                const ay = netForce / this.mass;
                this.vy += ay;
                this.y += this.vy;
            }
            draw() {
                const targetY = canvas.height / 2;
                ctx.beginPath();
                ctx.moveTo(this.x, targetY);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            }
        }

        const particle = new Particle(canvas.width / 2, canvas.height / 2 + 100, parseFloat(massSlider.value), 20, 'blue');
        massSlider.addEventListener('input', (e) => {
            const newMass = parseFloat(e.target.value);
            particle.mass = newMass;
            massValueSpan.textContent = newMass.toString();
        });
        kSlider.addEventListener('input', (e) => {
            kValueSpan.textContent = e.target.value;
        });
        cSlider.addEventListener('input', (e) => {
            cValueSpan.textContent = e.target.value;
        });
        function updateInfo() {
            infoDiv.innerHTML = `
                <p>Mass: ${particle.mass} kg</p>
                <p>Spring Constant (k): ${parseFloat(kSlider.value).toFixed(2)}</p>
                <p>Damping (c): ${parseFloat(cSlider.value).toFixed(2)}</p>
                <p>Velocity Y: ${particle.vy.toFixed(2)}</p>
            `;
        }
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const k = parseFloat(kSlider.value);
            const c = parseFloat(cSlider.value);
            const targetY = canvas.height / 2;
            if (!isDragging) {
                particle.update(k, c, targetY);
            }
            particle.draw();
            updateInfo();
        }
        canvas.addEventListener('mousedown', (e) => {
            const dist = Math.sqrt((e.offsetX - particle.x) ** 2 + (e.offsetY - particle.y) ** 2);
            if (dist < particle.radius) {
                isDragging = true;
            }
        });
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                particle.y = e.offsetY;
            }
        });
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        animate();
    }
}