function nonSimdAsmjsModule (global, imp, buffer) {
  'use asm';
  var b8 = new global.Uint8Array(buffer);
  var toF = global.Math.fround;
  var imul = global.Math.imul;

  function declareHeapLength() {
    b8[0x00ffffff] = 0;
  }

  function mandelPixelX1 (xf, yf, yd, max_iterations) {
    xf = toF(xf);
    yf = toF(yf);
    yd = toF(yd);
    max_iterations = max_iterations | 0;

    var z_re  = toF(0), z_im  = toF(0);
    var z_re2 = toF(0), z_im2 = toF(0);
    var new_re = toF(0), new_im = toF(0);
    var count = 0, i = 0, mi = 0;

    z_re  = xf;
    z_im  = yf;
    i = 0;
    while ((i | 0) < (max_iterations | 0)) {
      z_re2 = toF(z_re * z_re);
      z_im2 = toF(z_im * z_im);

      if (toF(z_re2 + z_im2) > toF(4))
        break;

      new_re = toF(z_re2 - z_im2);
      new_im = toF(toF(z_re * toF(2)) * z_im);
      z_re   = toF(xf + new_re);
      z_im   = toF(yf + new_im);
      count  = (count + 1) | 0;
      i = (i + 1) | 0;
    }
    return count | 0;
  }

  function mapColorAndSetPixel (x, y, width, value, max_iterations) {
    x = x | 0;
    y = y | 0;
    width = width | 0;
    value = value | 0;
    max_iterations = max_iterations | 0;

    var rgb = 0, r = 0, g = 0, b = 0, index = 0;
    var mk0 = 0;
    mk0 = 0x007fffff;

    index = ((((imul((width >>> 0), (y >>> 0)) | 0) + x) | 0) * 4) | 0;
    if ((value | 0) == (max_iterations | 0)) {
      r = 0;
      g = 0;
      b = 0;
    } else {
      rgb = ~~toF(toF(toF(toF(value >>> 0) * toF(0xffff)) / toF(max_iterations >>> 0)) * toF(0xff));
      r = rgb & 0xff;
      g = (rgb >>> 8) & 0xff;
      b = (rgb >>> 16) & 0xff;
    }
    b8[(index & mk0) >> 0] = r;
    b8[(index & mk0) + 1 >> 0] = g;
    b8[(index & mk0) + 2 >> 0] = b;
    b8[(index & mk0) + 3 >> 0] = 255;
  }

  function mandelColumnX1 (x, width, height, xf, yf, yd, max_iterations) {
    x = x | 0;
    width = width | 0;
    height = height | 0;
    xf = toF(xf);
    yf = toF(yf);
    yd = toF(yd);
    max_iterations = max_iterations | 0;

    var y = 0, m = 0;

    yd = toF(yd);
    y = 0;
    while ((y | 0) < (height | 0)) {
      m = mandelPixelX1(toF(xf), toF(yf), toF(yd), max_iterations) | 0;
      mapColorAndSetPixel(x | 0, y | 0, width, m, max_iterations);
      yf = toF(yf + yd);
      y = (y + 1) | 0;
    }
  }

  function mandelX1 (width, height, xc, yc, scale, max_iterations) {
    width = width | 0;
    height = height | 0;
    xc = toF(xc);
    yc = toF(yc);
    scale = toF(scale);
    max_iterations = max_iterations | 0;

    var x0 = toF(0), y0 = toF(0), xd = toF(0), yd = toF(0), xf = toF(0);
    var x = 0;

    x0 = toF(xc - toF(scale * toF(1.5)));
    y0 = toF(yc - scale);
    xd = toF(toF(scale * toF(3)) / toF(width >>> 0));
    yd = toF(toF(scale * toF(2)) / toF(height >>> 0));
    xf = x0;
    x = 0;
    while ((x | 0) < (width | 0)) {
      mandelColumnX1(x, width, height, xf, y0, yd, max_iterations);
      xf = toF(xf + xd);
      x = (x + 1) | 0;
    }
  }

  function mandel (width, height, xc, yc, scale, max_iterations) {
    width = width | 0;
    height = height | 0;
    xc = toF(xc);
    yc = toF(yc);
    scale = toF(scale);
    max_iterations = max_iterations | 0;

    var x0 = toF(0), y0 = toF(0);
    var xd = toF(0), yd = toF(0);
    var xf = toF(0);
    var x = 0;

    x0 = toF(xc - toF(scale * toF(1.5)));
    y0 = toF(yc - scale);
    xd = toF(toF(scale * toF(3)) / toF(width >>> 0));
    yd = toF(toF(scale * toF(2)) / toF(height >>> 0));
    xf = x0;
    x = 0;
    while ((x | 0) < (width | 0)) {
      mandelColumnX1(x, width, height, xf, y0, yd, max_iterations);
      xf = toF(xf + xd);
      x = (x + 1) | 0;
    }
  }

  return mandel;
}
