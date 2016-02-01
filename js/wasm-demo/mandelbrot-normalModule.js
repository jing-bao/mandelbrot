function NormalModule (buffer) {
  var b8 = new Uint8Array(buffer);

  function mapColorAndSetPixel (x, y, width, value, max_iterations) {
    var rgb, r, g, b;
    var mk0 = 0x007fffff;
    var index = 4*(x + width*y);
    if (value === max_iterations) {
      r = 0;
      g = 0;
      b = 0;
    }
    else {
      rgb = (value*0xffff/max_iterations)*0xff;
      r = rgb & 0xff;
      g = (rgb >> 8) & 0xff;
      b = (rgb >> 16) & 0xff;
    }
    b8[index & mk0]   = r;
    b8[(index & mk0)+1] = g;
    b8[(index & mk0)+2] = b;
    b8[(index & mk0)+3] = 255;
  }

  function mandelPixelX1 (c_re, c_im, max_iterations) {
    var z_re = c_re,
        z_im = c_im,
        i = 0;
    var z_re2, z_im2, new_re, new_im;
    while (i < max_iterations) {
      z_re2 = z_re*z_re;
      z_im2 = z_im*z_im;
      if (z_re2 + z_im2 > 4.0)
        break;

      new_re = z_re2 - z_im2;
      new_im = 2.0 * z_re * z_im;
      z_re = c_re + new_re;
      z_im = c_im + new_im;
      i = i + 1;
    }
    return i;
  }

  function mandelColumnX1 (x, width, height, xf, yf, yd, max_iterations) {
    var y = 0;
    var m;
    while (y < height) {
      m = mandelPixelX1 (xf, yf, max_iterations);
      mapColorAndSetPixel (x, y, width, m, max_iterations);
      yf = yf + yd;
      y = y + 1;
    }
  }

  function mandel (width, height, xc, yc, scale, max_iterations) {
    var x0 = xc - 1.5*scale;
    var y0 = yc - scale;
    var xd = (3.0*scale)/width;
    var yd = (2.0*scale)/height;
    var xf = x0;
    var x = 0;
    while (x < width) {
      mandelColumnX1(x, width, height, xf, y0, yd, max_iterations);
      xf = xf + xd;
      x = x + 1;
    }
  }

  return mandel;
}
