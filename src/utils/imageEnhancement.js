/**
 * Lightweight AI-like image enhancement utilities
 * Uses canvas pixel manipulation for subtle, natural-looking corrections
 */

// ── Brightness Analysis ────────────────────────────────────────────────────────

export function analyzeBrightness(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let totalBrightness = 0;
  const sampleStep = 16;
  let sampleCount = 0;
  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
    sampleCount++;
  }
  return sampleCount > 0 ? totalBrightness / sampleCount : 128;
}

// ── Auto Brightness ────────────────────────────────────────────────────────────

export function applyAutoBrightness(ctx, width, height, intensity = 0.6) {
  const avgBrightness = analyzeBrightness(ctx, width, height);
  const correction = (128 - avgBrightness) / 255;
  if (Math.abs(correction) < 0.02) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const brightFactor = 1 + correction * 0.7 * intensity;

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.min(255, Math.max(0, data[i]     * brightFactor));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * brightFactor));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * brightFactor));
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Auto Contrast ──────────────────────────────────────────────────────────────

export function applyAutoContrast(ctx, width, height, intensity = 0.6) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let minLum = 255, maxLum = 0;
  for (let i = 0; i < data.length; i += 4 * 8) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }
  const range = maxLum - minLum;
  if (range < 30) return;

  const blend = intensity * 0.5;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const stretched = ((data[i + c] - minLum) / range) * 255;
      data[i + c] = Math.min(255, Math.max(0, data[i + c] * (1 - blend) + stretched * blend));
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Skin Smoothing ─────────────────────────────────────────────────────────────

export function applySkinSmoothing(ctx, width, height, intensity = 0.35) {
  if (intensity <= 0) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const out = new Uint8ClampedArray(data);
  const radius = 2;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const isSkin = r > 95 && g > 40 && b > 20 &&
        r > g && r > b && Math.abs(r - g) > 10 && r - Math.min(g, b) > 15;
      if (!isSkin) continue;

      let sr = 0, sg = 0, sb = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ni = ((y + dy) * width + (x + dx)) * 4;
          sr += data[ni]; sg += data[ni + 1]; sb += data[ni + 2];
          count++;
        }
      }
      out[idx]     = r * (1 - intensity) + (sr / count) * intensity;
      out[idx + 1] = g * (1 - intensity) + (sg / count) * intensity;
      out[idx + 2] = b * (1 - intensity) + (sb / count) * intensity;
    }
  }
  ctx.putImageData(new ImageData(out, width, height), 0, 0);
}

// ── Noise Reduction (fast box blur 3x3) ───────────────────────────────────────

export function applyNoiseReduction(ctx, width, height, intensity = 0.4) {
  if (intensity <= 0) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const out = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += data[((y + dy) * width + (x + dx)) * 4 + c];
          }
        }
        const blurred = sum / 9;
        out[idx + c] = data[idx + c] * (1 - intensity) + blurred * intensity;
      }
    }
  }
  ctx.putImageData(new ImageData(out, width, height), 0, 0);
}

// ── Portrait Blur (edge vignette blur) ────────────────────────────────────────

export function applyPortraitBlur(ctx, width, height, intensity = 0.5) {
  if (intensity <= 0) return;
  // Draw radial gradient vignette on a second canvas, blend with blur
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const octx = offscreen.getContext('2d');

  // Copy original
  octx.drawImage(ctx.canvas, 0, 0);

  // Blur the offscreen
  octx.filter = `blur(${Math.round(intensity * 6)}px)`;
  octx.drawImage(ctx.canvas, 0, 0);
  octx.filter = 'none';

  // Create radial gradient mask (clear=center, opaque=edges)
  const grd = ctx.createRadialGradient(
    width / 2, height * 0.45, width * 0.2,
    width / 2, height * 0.45, width * 0.65,
  );
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, `rgba(0,0,0,${intensity * 0.85})`);

  // Paint blurred version masked by gradient
  const temp = document.createElement('canvas');
  temp.width = width; temp.height = height;
  const tctx = temp.getContext('2d');
  tctx.drawImage(offscreen, 0, 0);
  tctx.globalCompositeOperation = 'destination-in';
  tctx.fillStyle = grd;
  tctx.fillRect(0, 0, width, height);

  ctx.drawImage(temp, 0, 0);
}

// ── Color Enhancement ─────────────────────────────────────────────────────────

export function applyColorEnhancement(ctx, width, height, intensity = 0.5) {
  if (intensity <= 0) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const satBoost = 1 + intensity * 0.25;
  const warmth   = intensity * 8; // shift R up, B down slightly

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;

    // Convert to HSL, boost saturation
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    const newS = Math.min(1, s * satBoost);
    // Convert back
    let nr, ng, nb;
    if (newS === 0) {
      nr = ng = nb = l;
    } else {
      const q = l < 0.5 ? l * (1 + newS) : l + newS - l * newS;
      const p = 2 * l - q;
      nr = hue2rgb(p, q, h + 1/3);
      ng = hue2rgb(p, q, h);
      nb = hue2rgb(p, q, h - 1/3);
    }

    data[i]     = Math.min(255, Math.max(0, nr * 255 + warmth));
    data[i + 1] = Math.min(255, Math.max(0, ng * 255));
    data[i + 2] = Math.min(255, Math.max(0, nb * 255 - warmth * 0.3));
  }
  ctx.putImageData(imageData, 0, 0);
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1; if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

// ── Smart Crop ────────────────────────────────────────────────────────────────

export function getSmartCropRegion(imgWidth, imgHeight, targetRatio = 4 / 3) {
  const imgRatio = imgWidth / imgHeight;
  if (imgRatio <= targetRatio) {
    const newH = imgWidth / targetRatio;
    const sy = Math.max(0, (imgHeight - newH) * 0.35);
    return { sx: 0, sy, sw: imgWidth, sh: Math.min(newH, imgHeight) };
  } else {
    const newW = imgHeight * targetRatio;
    const sx = (imgWidth - newW) / 2;
    return { sx, sy: 0, sw: newW, sh: imgHeight };
  }
}

// ── Master apply ──────────────────────────────────────────────────────────────

export function applyEnhancements(canvas, options = {}, intensity = 0.6) {
  const {
    autoBrightness  = true,
    autoContrast    = true,
    skinSmoothing   = false,
    noiseReduction  = false,
    portraitBlur    = false,
    colorEnhance    = false,
  } = options;

  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  if (autoBrightness)  applyAutoBrightness(ctx, w, h, intensity);
  if (autoContrast)    applyAutoContrast(ctx, w, h, intensity);
  if (colorEnhance)    applyColorEnhancement(ctx, w, h, intensity);
  if (skinSmoothing)   applySkinSmoothing(ctx, w, h, intensity * 0.6);
  if (noiseReduction)  applyNoiseReduction(ctx, w, h, intensity * 0.5);
  if (portraitBlur)    applyPortraitBlur(ctx, w, h, intensity * 0.7);

  return canvas.toDataURL('image/jpeg', 0.93);
}

// ── Preview helper: returns { original, enhanced } ───────────────────────────

export async function generateEnhancedPreview(dataUrl, options, intensity) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const enhanced = applyEnhancements(canvas, options, intensity);
      resolve({ original: dataUrl, enhanced });
    };
    img.src = dataUrl;
  });
}
