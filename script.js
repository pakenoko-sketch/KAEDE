/* ---------------- Lock screen swipe-to-start ---------------- */
const lockScreen = document.getElementById('lock-screen');
let dragStartY = null;
let dragging = false;
let dragDelta = 0;

function pointerDown(y) {
  dragStartY = y;
  dragging = true;
  lockScreen.classList.add('dragging');
  lockScreen.style.transition = 'none';
}
function pointerMove(y) {
  if (!dragging || dragStartY === null) return;
  let delta = y - dragStartY;
  if (delta > 0) delta = 0;
  dragDelta = delta;
  lockScreen.style.transform = 'translateY(' + delta + 'px)';
}
function pointerUp() {
  if (!dragging) return;
  dragging = false;
  lockScreen.classList.remove('dragging');
  lockScreen.style.transition = 'transform 0.3s ease';
  const threshold = window.innerHeight * 0.2;
  if (Math.abs(dragDelta) > threshold) {
    lockScreen.style.transform = 'translateY(-100%)';
    setTimeout(() => { lockScreen.style.display = 'none'; }, 300);
  } else {
    lockScreen.style.transform = 'translateY(0)';
  }
  dragDelta = 0;
  dragStartY = null;
}

lockScreen.addEventListener('touchstart', e => pointerDown(e.touches[0].clientY), { passive: true });
lockScreen.addEventListener('touchmove', e => { pointerMove(e.touches[0].clientY); e.preventDefault(); }, { passive: false });
lockScreen.addEventListener('touchend', pointerUp);

lockScreen.addEventListener('mousedown', e => pointerDown(e.clientY));
window.addEventListener('mousemove', e => pointerMove(e.clientY));
window.addEventListener('mouseup', pointerUp);

/* ---------------- Clocks ---------------- */
const dayNames = ['日','月','火','水','木','金','土'];
const svgNS = 'http://www.w3.org/2000/svg';
const analog = document.getElementById('analog');

function buildAnalogFace() {
  const cx = 70, cy = 70, r = 64;
  const face = document.createElementNS(svgNS, 'circle');
  face.setAttribute('cx', cx); face.setAttribute('cy', cy); face.setAttribute('r', r);
  face.setAttribute('fill', '#ffffff'); face.setAttribute('stroke', '#dfe4ee'); face.setAttribute('stroke-width', '2');
  analog.appendChild(face);

  for (let i = 0; i < 60; i++) {
    const angle = (i * 6) * Math.PI / 180;
    const isHour = i % 5 === 0;
    const len = isHour ? 8 : 4;
    const outerR = r - 4;
    const x1 = cx + outerR * Math.sin(angle), y1 = cy - outerR * Math.cos(angle);
    const x2 = cx + (outerR - len) * Math.sin(angle), y2 = cy - (outerR - len) * Math.cos(angle);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#c3cadb'); line.setAttribute('stroke-width', isHour ? 2 : 1);
    analog.appendChild(line);
  }

  for (let h = 1; h <= 12; h++) {
    const angle = (h * 30) * Math.PI / 180;
    const nr = r * 0.72;
    const x = cx + nr * Math.sin(angle), y = cy - nr * Math.cos(angle);
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', x); text.setAttribute('y', y + 4);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#6b7a99');
    text.textContent = h;
    analog.appendChild(text);
  }

  ['hour', 'minute', 'second'].forEach(id => {
    const hand = document.createElementNS(svgNS, 'line');
    hand.setAttribute('id', 'hand-' + id);
    hand.setAttribute('x1', cx); hand.setAttribute('y1', cy);
    hand.setAttribute('stroke-linecap', 'round');
    if (id === 'hour') { hand.setAttribute('stroke', '#1b2a4a'); hand.setAttribute('stroke-width', '4'); }
    if (id === 'minute') { hand.setAttribute('stroke', '#1b2a4a'); hand.setAttribute('stroke-width', '3'); }
    if (id === 'second') { hand.setAttribute('stroke', '#4c7eff'); hand.setAttribute('stroke-width', '1.5'); }
    analog.appendChild(hand);
  });

  const pin = document.createElementNS(svgNS, 'circle');
  pin.setAttribute('cx', cx); pin.setAttribute('cy', cy); pin.setAttribute('r', 3);
  pin.setAttribute('fill', '#1b2a4a');
  analog.appendChild(pin);
}
buildAnalogFace();

function setHand(id, angleDeg, length) {
  const cx = 70, cy = 70;
  const rad = angleDeg * Math.PI / 180;
  const x2 = cx + length * Math.sin(rad);
  const y2 = cy - length * Math.cos(rad);
  const hand = document.getElementById('hand-' + id);
  hand.setAttribute('x2', x2); hand.setAttribute('y2', y2);
}

function two(n) { return n.toString().padStart(2, '0'); }

function tick() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();

  document.getElementById('digital-clock').textContent = two(h) + ':' + two(m) + ':' + two(s);
  document.getElementById('lock-time').textContent = two(h) + ':' + two(m);
  document.getElementById('lock-date').textContent =
    (now.getMonth() + 1) + '月' + now.getDate() + '日(' + dayNames[now.getDay()] + ')';

  setHand('hour', ((h % 12) + m / 60) * 30, 34);
  setHand('minute', (m + s / 60) * 6, 48);
  setHand('second', s * 6, 54);
}
tick();
setInterval(tick, 1000);
