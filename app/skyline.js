// Vice City skyline for the trophy-guide hero — hand-drawn on canvas, no
// external images, no copyrighted artwork. Deterministic (seeded), so every
// load looks the same: retro slit sun, building silhouettes with lit
// windows, palm trees, birds, and a neon horizon line.
(function () {
  var cv = document.getElementById('skyline');
  if (!cv || !cv.getContext) return;
  var W = 1280, H = 200;
  cv.width = W; cv.height = H;
  var ctx = cv.getContext('2d');
  var seed = 20261119;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

  // Stars in the upper sky.
  ctx.fillStyle = '#ffffff';
  for (var s = 0; s < 26; s++) {
    ctx.globalAlpha = 0.25 + rnd() * 0.5;
    ctx.fillRect(rnd() * W, rnd() * 44, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;

  // Retro sun with horizontal slits.
  var sx = W * 0.72, sy = 116, sr = 60;
  var g = ctx.createLinearGradient(0, sy - sr, 0, sy + sr);
  g.addColorStop(0, '#ffe66d');
  g.addColorStop(0.55, '#ff8a3d');
  g.addColorStop(1, '#ff2d78');
  ctx.save();
  ctx.shadowColor = 'rgba(255,110,60,.85)';
  ctx.shadowBlur = 42;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (var i = 0; i < 5; i++) {
    var y = sy + 8 + i * 11;
    ctx.fillRect(sx - sr - 6, y, sr * 2 + 12, 3 + i * 1.2);
  }
  ctx.restore();

  // Birds.
  ctx.strokeStyle = 'rgba(20,6,36,.85)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  var birds = [[150, 42], [205, 60], [330, 36], [980, 52], [1050, 34]];
  birds.forEach(function (b) {
    ctx.beginPath();
    ctx.moveTo(b[0] - 9, b[1]);
    ctx.quadraticCurveTo(b[0] - 3, b[1] - 6, b[0], b[1]);
    ctx.quadraticCurveTo(b[0] + 3, b[1] - 6, b[0] + 9, b[1]);
    ctx.stroke();
  });

  // Building silhouettes with lit windows.
  var winColors = ['#ffd166', '#2de2ff', '#ff2d78', '#fff3b0'];
  var x = -10;
  while (x < W + 20) {
    var bw = 44 + rnd() * 66;
    var bh = 46 + rnd() * 108;
    var by = H - bh;
    ctx.fillStyle = rnd() < 0.5 ? '#160a26' : '#1e0d33';
    ctx.fillRect(x, by, bw, bh);
    if (rnd() < 0.3) {
      var ax = x + bw / 2;
      ctx.strokeStyle = '#160a26';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax, by);
      ctx.lineTo(ax, by - 16 - rnd() * 10);
      ctx.stroke();
      ctx.fillStyle = '#ff2d78';
      ctx.beginPath();
      ctx.arc(ax, by - 18 - rnd() * 8, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (var wy = by + 8; wy < H - 8; wy += 13) {
      for (var wx = x + 6; wx < x + bw - 6; wx += 11) {
        if (rnd() < 0.28) {
          ctx.fillStyle = winColors[(rnd() * winColors.length) | 0];
          ctx.globalAlpha = 0.5 + rnd() * 0.5;
          ctx.fillRect(wx, wy, 4.5, 6);
        }
      }
    }
    ctx.globalAlpha = 1;
    x += bw + 2 + rnd() * 10;
  }

  // Palm trees in front.
  function palm(px, ph) {
    var baseY = H;
    ctx.strokeStyle = '#0d0518';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px, baseY);
    ctx.quadraticCurveTo(px + 6, baseY - ph * 0.6, px + 14, baseY - ph);
    ctx.stroke();
    var tx = px + 14, ty = baseY - ph;
    ctx.lineWidth = 3.4;
    for (var f = 0; f < 6; f++) {
      var a = Math.PI * (0.12 + f * 0.15);
      var len = 26 + rnd() * 10;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(
        tx + Math.cos(a) * len * 0.6, ty - Math.sin(a) * len * 0.7 - 6,
        tx + Math.cos(a) * len, ty - Math.sin(a) * len * 0.4 + 8
      );
      ctx.stroke();
    }
  }
  palm(70, 74);
  palm(430, 58);
  palm(620, 84);
  palm(1120, 66);
  palm(1240, 78);

  // Neon horizon line.
  ctx.save();
  ctx.shadowColor = 'rgba(45,226,255,.9)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#2de2ff';
  ctx.fillRect(0, H - 3, W, 2);
  ctx.restore();
})();
