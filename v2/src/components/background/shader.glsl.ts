/**
 * Pattern: "Monjori" by Mic (http://www.pouet.net/prod.php?which=52761), as
 * published in the three.js webgl_shader example (three.js is MIT-licensed,
 * © three.js authors).
 *
 * The pattern is copied verbatim from src/static/js/shader.js — it is the site's
 * visual identity, so that math must not drift. Three things are added: the
 * declarations three.js used to prepend automatically (precision, attributes),
 * which raw WebGL requires us to supply; `uScale` on the first line, which crops
 * the pattern to the viewport instead of stretching it (see webgl.ts); and the
 * final colouring, which maps the pattern onto a two-colour ramp instead of
 * tinting v1's multicolour output.
 */

export const VERTEX_SHADER = `
attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

/**
 * No `precision` line here on purpose — webgl.ts prepends it after checking
 * what the device actually supports.
 *
 * It must be highp. `a = time * 40.0` grows without bound, and under mediump
 * (10-bit mantissa, range ±16384) the value quantises as it grows: by 2 minutes
 * it can only change every 0.1s, so the animation visibly steps at ~10fps even
 * while the GPU draws at 60, and past ~410s it leaves mediump's range entirely.
 * three.js defaulted to highp, which is why v1 never showed this.
 */
export const FRAGMENT_SHADER = `
varying vec2 vUv;
uniform float time;
uniform vec2 uScale;
uniform vec3 uColorDark;
uniform vec3 uColorLight;

void main() {
  vec2 p = ( -1.0 + 2.0 * vUv ) * uScale;
  float a = time * 40.0;
  float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;

  e = 400.0 * ( p.x * 0.5 + 0.5 );
  f = 400.0 * ( p.y * 0.5 + 0.5 );
  i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
  d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
  r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
  q = f / r;
  e = ( r * cos( q ) ) - a / 2.0;
  f = ( r * sin( q ) ) - a / 2.0;
  d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
  h = ( ( f + d ) + a / 2.0 ) * g;
  i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
  h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
  h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
  i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
  i = mod( i / 5.6, 256.0 ) / 64.0;
  if ( i < 0.0 ) i += 4.0;
  if ( i >= 2.0 ) i = 4.0 - i;
  d = r / 350.0;
  d += sin( d * d * 8.0 ) * 0.52;
  f = ( sin( a * g ) + 1.0 ) / 2.0;

  vec3 baseColor =
  vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x +
  vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x );

  // Collapse the pattern to its brightness and ramp dark → light, so every
  // pixel lands between the two brand colours rather than on v1's rainbow.
  float t = clamp(dot(baseColor, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  gl_FragColor = vec4(mix(uColorDark, uColorLight, t), 1.0);
}
`;

/**
 * Passed straight through as sRGB: the canvas outputs whatever the shader
 * writes, so these hex values are exactly what appears at the ramp's ends.
 */
function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [((value >> 16) & 0xff) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255];
}

/** The background ramp. This is the one place to change its colours. */
export const SHADER_DARK_HEX = "#192758";
export const SHADER_LIGHT_HEX = "#6FB5DA";

export const SHADER_DARK: readonly [number, number, number] = hexToRgb(SHADER_DARK_HEX);
export const SHADER_LIGHT: readonly [number, number, number] = hexToRgb(SHADER_LIGHT_HEX);
