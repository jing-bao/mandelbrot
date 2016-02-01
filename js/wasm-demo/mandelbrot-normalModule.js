function NormalModule (buffer) {
  var b8 = new Uint8Array(buffer);

  function mapColorAndSetPixel (x, y, width, value, max_iterations) {
    var rgb, r, g, b;
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
    b8[index]   = r;
    b8[index+1] = g;
    b8[index+2] = b;
    b8[index+3] = 255;
  }

  function mandelx1 (c_re, c_im, max_iterations) {
    var z_re = c_re,
        z_im = c_im,
        i;
    for (i = 0; i < max_iterations; i++) {
      var z_re2 = z_re*z_re;
      var z_im2 = z_im*z_im;
      if (z_re2 + z_im2 > 4.0)
        break;

      var new_re = z_re2 - z_im2;
      var new_im = 2.0 * z_re * z_im;
      z_re = c_re + new_re;
      z_im = c_im + new_im;
    }
    return i;
  }

  function mandel (width, height, xc, yc, scale, max_iterations) {
    var x0 = xc - 1.5*scale;
    var y0 = yc - scale;
    var xd = (3.0*scale)/width;
    var yd = (2.0*scale)/height;
    var xf = x0;
    for (var x = 0; x < width; ++x) {
      var yf = y0;
      for (var y = 0; y < height; ++y) {
        var m = mandelx1 (xf, yf, max_iterations);
        mapColorAndSetPixel (x, y, width, m, max_iterations);
        yf += yd;
      }
      xf += xd;
    }
  }

  return mandel;
}
