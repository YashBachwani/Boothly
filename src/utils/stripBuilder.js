import { STRIP_THEMES, FILTERS } from '../constants';

/**
 * Generate a photo strip canvas from an array of photo dataURLs
 * Returns a dataURL of the generated strip
 */
export async function generateStrip({
  photos,
  layout = 'vertical',
  themeId = 'minimal',
  customText = '',
  showDate = true,
}) {
  const theme = STRIP_THEMES.find(t => t.id === themeId) || STRIP_THEMES[0];

  return new Promise((resolve) => {
    const loadImage = (src) =>
      new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      });

    Promise.all(photos.map(loadImage)).then((images) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const count = images.length;

      // Photo dimensions
      const photoW = 400;
      const photoH = 300;
      const padding = 14;
      const border = theme.borderWidth || 8;
      const radius = theme.borderRadius || 4;

      if (layout === 'vertical') {
        const stripW = photoW + padding * 2 + border * 2;
        const stripH = (photoH + padding) * count + padding + border * 2 + (customText ? 50 : 30) + (showDate ? 30 : 0);
        canvas.width = stripW;
        canvas.height = stripH;

        // Background
        drawBackground(ctx, canvas.width, canvas.height, theme, radius);

        // Border rect
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = border;
        ctx.strokeRect(border / 2, border / 2, canvas.width - border, canvas.height - border);

        // Photos
        images.forEach((img, i) => {
          const x = padding + border;
          const y = border + padding + i * (photoH + padding);
          drawPhoto(ctx, img, x, y, photoW, photoH, radius > 4 ? radius - 4 : 0);
        });

        // Date & text
        const bottomY = border + padding + count * (photoH + padding);
        if (customText) {
          drawText(ctx, customText, canvas.width / 2, bottomY + 20, theme, 18, true);
        }
        if (showDate) {
          const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          drawText(ctx, dateStr, canvas.width / 2, canvas.height - 14, theme, 13, false);
        }
        // Boothly watermark
        drawText(ctx, '✦ boothly', canvas.width / 2, canvas.height - (showDate ? 30 : 14), theme, 11, false, 0.5);

      } else if (layout === 'grid') {
        const cols = 2;
        const rows = Math.ceil(count / cols);
        const pw = 280;
        const ph = 210;
        const gap = 10;
        const stripW = cols * pw + (cols + 1) * gap + border * 2;
        const stripH = rows * ph + (rows + 1) * gap + border * 2 + 50;
        canvas.width = stripW;
        canvas.height = stripH;

        drawBackground(ctx, canvas.width, canvas.height, theme, radius);
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = border;
        ctx.strokeRect(border / 2, border / 2, canvas.width - border, canvas.height - border);

        images.forEach((img, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = border + gap + col * (pw + gap);
          const y = border + gap + row * (ph + gap);
          drawPhoto(ctx, img, x, y, pw, ph, radius > 4 ? radius - 4 : 0);
        });

        const bottomY = border + gap + rows * (ph + gap);
        if (customText) drawText(ctx, customText, canvas.width / 2, bottomY + 18, theme, 16, true);
        if (showDate) {
          const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          drawText(ctx, dateStr, canvas.width / 2, canvas.height - 12, theme, 12, false);
        }
        drawText(ctx, '✦ boothly', canvas.width / 2, canvas.height - (showDate ? 28 : 12), theme, 10, false, 0.5);

      } else if (layout === 'polaroid') {
        const pw = 320;
        const ph = 280;
        const polH = ph + 80; // extra space for caption
        const gap = 20;
        const padH = 20;
        const stripW = pw + gap * 2;
        const stripH = count * (polH + gap) + padH + 40;
        canvas.width = stripW;
        canvas.height = stripH;

        // White/bg background
        ctx.fillStyle = theme.id === 'dark' || theme.id === 'neon' || theme.id === 'film' ? '#111' : '#F0EBE3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        images.forEach((img, i) => {
          const x = gap;
          const y = padH + i * (polH + gap);
          // Polaroid card shadow
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 16;
          ctx.shadowOffsetY = 6;
          // White polaroid background
          ctx.fillStyle = theme.id === 'dark' || theme.id === 'neon' ? '#1A1A1E' : '#FFFFFF';
          roundRect(ctx, x - 6, y - 6, pw + 12, polH + 12, 4);
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          // Photo
          drawPhoto(ctx, img, x, y, pw, ph, 2);
          // Caption line
          const caption = i === 0 ? '✦ boothly' : '';
          if (caption) {
            ctx.fillStyle = theme.textColor;
            ctx.font = `italic 14px 'Playfair Display', serif`;
            ctx.textAlign = 'center';
            ctx.fillText(caption, x + pw / 2, y + ph + 45);
          }
        });

        // Date
        if (showDate) {
          const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          ctx.fillStyle = theme.textColor;
          ctx.globalAlpha = 0.5;
          ctx.font = `12px 'Space Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(dateStr, canvas.width / 2, canvas.height - 10);
          ctx.globalAlpha = 1;
        }

      } else if (layout === 'filmstrip') {
        const pw = 350;
        const ph = 260;
        const sprocketH = 30;
        const gap = 8;
        const sideW = 40;
        const stripW = pw + sideW * 2;
        const stripH = count * (ph + gap) + gap * 2 + sprocketH * 2;
        canvas.width = stripW;
        canvas.height = stripH;

        // Film base
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sprocket holes top & bottom
        drawSprockets(ctx, canvas.width, sprocketH, true);
        drawSprockets(ctx, canvas.width, sprocketH, false, canvas.height);

        images.forEach((img, i) => {
          const x = sideW;
          const y = sprocketH + gap + i * (ph + gap);
          drawPhoto(ctx, img, x, y, pw, ph, 0);
        });

        // Film grain overlay
        ctx.globalAlpha = 0.04;
        for (let i = 0; i < 1200; i++) {
          const gx = Math.random() * canvas.width;
          const gy = Math.random() * canvas.height;
          ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
          ctx.fillRect(gx, gy, 1, 1);
        }
        ctx.globalAlpha = 1;

        if (showDate) {
          const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          ctx.fillStyle = '#FFD700';
          ctx.font = `bold 11px 'Space Mono', monospace`;
          ctx.textAlign = 'left';
          ctx.fillText(dateStr, 8, canvas.height - 6);
          ctx.textAlign = 'right';
          ctx.fillText('BOOTHLY', canvas.width - 8, canvas.height - 6);
        }
      }

      resolve(canvas.toDataURL('image/png', 1.0));
    });
  });
}

function drawBackground(ctx, w, h, theme, radius) {
  if (theme.bg.startsWith('linear-gradient')) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    const match = theme.bg.match(/#[A-Fa-f0-9]{6}/g);
    if (match && match.length >= 2) {
      grad.addColorStop(0, match[0]);
      grad.addColorStop(1, match[1]);
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = theme.bg;
  }
  if (radius > 0) {
    roundRect(ctx, 0, 0, w, h, radius);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, w, h);
  }

  // Subtle paper texture
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function drawPhoto(ctx, img, x, y, w, h, radius) {
  ctx.save();
  if (radius > 0) {
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();
  } else {
    ctx.rect(x, y, w, h);
    ctx.clip();
  }
  // Cover-fit
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function drawText(ctx, text, x, y, theme, size, bold = false, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = theme.textColor;
  ctx.font = `${bold ? 'bold ' : ''}${size}px '${theme.fontFamily}', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawSprockets(ctx, width, sprocketH, isTop, offsetY = 0) {
  const y = isTop ? 0 : offsetY - sprocketH;
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, y, width, sprocketH);
  // Sprocket holes
  const holeW = 18;
  const holeH = 14;
  const holeY = y + (sprocketH - holeH) / 2;
  const gap = 32;
  const startX = 12;
  ctx.fillStyle = '#333';
  for (let x = startX; x < width - holeW; x += gap) {
    roundRect(ctx, x, holeY, holeW, holeH, 2);
    ctx.fill();
  }
}
