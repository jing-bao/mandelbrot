/* -*- Mode: javascript; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 ; js-indent-level : 2 ; js-curly-indent-offset: 0 -*- */
/* vim: set ts=2 et sw=2 tw=80: */

// Mandelbrot using SIMD
// Author: Peter Jensen, Intel Corporation

// global variables
var animate        = false;
var choice         = "Normal JS";
var max_iterations = 100;
var HAS_WASM = typeof _WASMEXP_ !== 'undefined';

// Polyfill and alerts
if (typeof Math.fround == 'undefined') {
  Math.fround = function(x) { return x };
}
if (!HAS_WASM) {
  alert('WASM not implemented in this browser. WASM choice is disabled');
}

// Asm.js module buffer.
var buffer = new ArrayBuffer(16 * 1024 * 1024);
// WASM file buffer.
var wasm_buffer = null;

// logging operations
var logger = {
  msg: function (msg) {
    console.log (msg);
  }
}

// Basic canvas operations
var canvas = function () {

  var _ctx;
  var _width;
  var _height;
  var _image_data;

  function init (canvas_id) {
    var $canvas = $(canvas_id);
    _ctx        = $canvas.get(0).getContext("2d");
    _width      = $canvas.width();
    _height     = $canvas.height();
    _image_data = _ctx.getImageData (0, 0, _width, _height);
  }

  function update (buffer) {
    var imageData = new Uint8ClampedArray(buffer, 0, _width * _height * 4);
    _image_data.data.set(imageData);
    _ctx.putImageData(_image_data, 0, 0);
  }

  function getWidth () {
    return _width;
  }

  function getHeight () {
    return _height;
  }

  return {
    init:                init,
    update:              update,
    getWidth:            getWidth,
    getHeight:           getHeight,
  }

}();

var mandelAsmjs = AsmJSModule (this, {}, buffer);
var mandelWasm = null;

function drawMandelbrot (width, height, xc, yc, scale) {
  logger.msg ("drawMandelbrot(xc:" + xc + ", yc:" + yc + ")");
  if (choice == "WASM" && HAS_WASM)
    mandelWasm(width, height, xc, yc, scale, max_iterations);
  else if (choice == "ASM.JS")
    mandelAsmjs(width, height, xc, yc, scale, max_iterations);
  else
    console.log("Normal");
  canvas.update(buffer);
}

function animateMandelbrot () {
  var scale_start = 1.0;
  var scale_end   = 0.0005;
  var xc_start    = -0.5;
  var yc_start    = 0.0;
  var xc_end      = 0.0;
  var yc_end      = 0.75;
  var steps       = 200.0;
  var scale_step  = (scale_end - scale_start)/steps;
  var xc_step     = (xc_end - xc_start)/steps;
  var yc_step     = (yc_end - yc_start)/steps;
  var scale       = scale_start;
  var xc          = xc_start;
  var yc          = yc_start;
  var i           = 0;
  var now         = performance.now();

  function draw1 () {
    if (animate) {
      setTimeout(draw1, 1);
    }
    drawMandelbrot (canvas.getWidth(), canvas.getHeight(), xc, yc, scale);
    if (scale < scale_end || scale > scale_start) {
      scale_step = -scale_step;
      xc_step = -xc_step;
      yc_step = -yc_step;
    }
    scale += scale_step;
    xc += xc_step;
    yc += yc_step;
    i++;
    if (((i % 10)|0) === 0) {
      var t = performance.now();
      update_fps (10000/(t - now));
      now = t;
    }
  }

  draw1();
}

function update_fps (fps) {
  var $fps = $("#fps");
  $fps.text (fps.toFixed(1));
}

// input click handlers

function start() {
  animate = true;
  animateMandelbrot ();
}

function stop() {
  animate = false;
}

function choose() {
  choice = $('input[name=choose]:checked').val();
  logger.msg(choice);
  var $info = $("#info");
  $info.text(choice);
}

function main () {
  logger.msg ("main()");
  canvas.init ("#mandel");
  $("#start").click (start);
  $("#stop").click (stop);
  $("input[name=choose]").click (choose);
  if (HAS_WASM) {
    var url = 'mandelbrot.wasm';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      wasm_buffer = this.response;
      if(wasm_buffer) {
        mandelWasm = _WASMEXP_.instantiateModule(wasm_buffer, {}, buffer).mandel;
        $("#wasm").attr ('disabled', false);
      }
    };
    xhr.send(null);
  }
  animateMandelbrot ();
}

$(main);
