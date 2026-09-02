const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateOGImage() {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Background Gradient (Deep Midnight Luxury)
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#040711');
  bgGradient.addColorStop(0.5, '#0a1128');
  bgGradient.addColorStop(1, '#050914');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Glowing Halo Effects
  const aura1 = ctx.createRadialGradient(250, 150, 10, 250, 150, 450);
  aura1.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  aura1.addColorStop(0.5, 'rgba(14, 116, 144, 0.1)');
  aura1.addColorStop(1, 'rgba(4, 7, 17, 0)');
  ctx.fillStyle = aura1;
  ctx.fillRect(0, 0, width, height);

  const aura2 = ctx.createRadialGradient(1000, 480, 10, 1000, 480, 500);
  aura2.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
  aura2.addColorStop(1, 'rgba(4, 7, 17, 0)');
  ctx.fillStyle = aura2;
  ctx.fillRect(0, 0, width, height);

  // 3. Grid Pattern Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 4. Subtle Outer Border
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // 5. Draw Logo Icon
  const logoX = 110;
  const logoY = 160;

  const logoGlow = ctx.createRadialGradient(logoX, logoY, 10, logoX, logoY, 70);
  logoGlow.addColorStop(0, 'rgba(34, 211, 238, 0.7)');
  logoGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = logoGlow;
  ctx.beginPath();
  ctx.arc(logoX, logoY, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(logoX, logoY);
  const shieldGrad = ctx.createLinearGradient(-35, -40, 35, 40);
  shieldGrad.addColorStop(0, '#06b6d4');
  shieldGrad.addColorStop(1, '#3b82f6');
  ctx.fillStyle = shieldGrad;

  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(36, -24);
  ctx.lineTo(36, 12);
  ctx.quadraticCurveTo(36, 40, 0, 50);
  ctx.quadraticCurveTo(-36, 40, -36, 12);
  ctx.lineTo(-36, -24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#070d1e';
  ctx.beginPath();
  ctx.arc(4, -2, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(-2, -4, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 6. Brand Name Typography: "LitasDark"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText('Litas', 210, 175);

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText('Dark', 380, 175);

  // Privacy Tag Badge
  ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(580, 120, 260, 42, 21);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('⚡ 100% Client-Side WASM', 598, 147);

  // 7. Main Headline
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('Free In-Browser PDF Suite', 110, 260);

  // Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px sans-serif';
  ctx.fillText('Dark Mode Inverter • Metadata Cleaner • Merge • Split • Convert', 110, 305);

  // 8. Visual Cards
  const cardY = 350;
  const cardHeight = 110;
  const cardWidth = 310;

  const features = [
    { title: '🌙 Dark Mode PDF', desc: 'Instant eye-strain relief inversion', color: '#06b6d4' },
    { title: '🔒 Cleanse Metadata', desc: 'Sanitize hidden author & edit logs', color: '#3b82f6' },
    { title: '⚡ Zero Server Uploads', desc: '100% local RAM security', color: '#10b981' }
  ];

  features.forEach((feat, i) => {
    const cx = 110 + i * (cardWidth + 20);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx, cardY, cardWidth, cardHeight, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = feat.color;
    ctx.beginPath();
    ctx.roundRect(cx + 20, cardY + 16, 40, 4, 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(feat.title, cx + 20, cardY + 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText(feat.desc, cx + 20, cardY + 80);
  });

  // 9. Bottom URL & Action Bar
  const bottomY = 510;

  ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(110, bottomY, 440, 60, 30);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('🔗 litasdark.vercel.app', 135, bottomY + 38);

  const btnGradient = ctx.createLinearGradient(820, bottomY, 1070, bottomY);
  btnGradient.addColorStop(0, '#06b6d4');
  btnGradient.addColorStop(1, '#2563eb');

  ctx.fillStyle = btnGradient;
  ctx.beginPath();
  ctx.roundRect(820, bottomY, 270, 60, 30);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Open Web Suite →', 855, bottomY + 37);

  const pngBuffer = canvas.toBuffer('image/png');
  const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.82 });

  const publicDir = path.join(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), pngBuffer);
  fs.writeFileSync(path.join(publicDir, 'og-image.jpg'), jpgBuffer);

  console.log('Successfully generated public/og-image.png and public/og-image.jpg!');
}

generateOGImage().catch(console.error);
