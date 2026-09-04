"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

type ColorMode = "molten" | "ember" | "frost";

interface MoltenMetalProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  detail?: number;
  glow?: number;
  coreSize?: number;
  swirl?: number;
  fold?: number;
  blackPoint?: number;
  brightness?: number;
  colorMode?: ColorMode;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  opacity?: number;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return [1, 1, 1];
  }

  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const colorModeToFloat = (mode: ColorMode) => {
  if (mode === "ember") return 1;
  if (mode === "frost") return 2;
  return 0;
};

const vertex = `#version 300 es

in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es

precision highp float;

uniform vec2 iResolution;
uniform float iTime;

uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;

uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;

uniform vec2 uMouse;
uniform float uMouseStrength;
uniform bool uEnableMouse;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(
    sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453
  );
}

void main() {

  float time = iTime * uSpeed;

  vec2 p =
    uScale *
    ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y)
    - 0.5;

  if (uEnableMouse) {
    vec2 drift = (uMouse - 0.5) * uMouseStrength * 2.0;
    p += drift;
  }

  vec2 i = p;

  float c = 0.0;

  float r = length(
    p +
    vec2(
      sin(time),
      sin(time * 0.3 + 5.0)
    ) * 0.5
  );

  float d = length(p);

  float rot = d + time + p.x * uSwirl;

  float cosRot = cos(rot);

  mat2 warp = mat2(
    cos(rot - sin(time / 5.0)),
    sin(rot),
    -sin(cosRot - time),
    cosRot
  ) * uFold;

  float glowCore = uGlow * uCoreSize;

  for (float n = 0.0; n < 8.0; n++) {

    if (n >= uDetail) {
      break;
    }

    p *= warp;

    float t = r - time / (n + 3.0);

    i -=
      p +
      vec2(
        cos(t - i.x - r) + sin(t + i.y),
        sin(t - i.y) + cos(t + i.x) + r
      );

    c +=
      glowCore /
      length(
        vec2(
          sin(i.x + t),
          cos(i.y + t)
        )
      );
  }

  c /= 6.0;

  float intensity =
    max(c - uBlackPoint, 0.0)
    * uBrightness;

  float g = clamp(intensity, 0.0, 1.0);

  float mid = 0.5;

  if (uColorMode > 1.5) {
    mid = 0.65;
  } else if (uColorMode > 0.5) {
    mid = 0.35;
  }

  vec3 col =
    mix(
      uColor1,
      uColor2,
      smoothstep(0.0, mid, g)
    );

  col =
    mix(
      col,
      uColor3,
      smoothstep(mid, 1.0, g)
    );

  float alpha = g;

  if (uGrain > 0.5) {

    float grain =
      hash(gl_FragCoord.xy + iTime);

    alpha +=
      (grain - 0.5)
      * uGrainIntensity;
  }

  alpha =
    clamp(alpha, 0.0, 1.0)
    * uOpacity;

  fragColor =
    vec4(col * alpha, alpha);
}
`;

export default function MoltenMetal({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.25,
  scale = 4,
  detail = 3,
  glow = 1.6,
  coreSize = 0.1,
  swirl = 1,
  fold = -0.2,
  blackPoint = 0.05,
  brightness = 1.3,
  colorMode = "molten",
  grain = true,
  grainIntensity = 0.04,
  mouseInteraction = true,
  mouseStrength = 0.2,
  opacity = 0.85,
  className = "",
}: MoltenMetalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });

    const gl = renderer.gl;

    gl.clearColor(0, 0, 0, 0);

    const canvas = gl.canvas;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    container.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,

      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Float32Array([1, 1]),
        },

        uSpeed: { value: speed },
        uScale: { value: scale },
        uDetail: { value: detail },
        uGlow: { value: glow },
        uCoreSize: { value: coreSize },
        uSwirl: { value: swirl },
        uFold: { value: fold },
        uBlackPoint: { value: blackPoint },
        uBrightness: { value: brightness },

        uColorMode: {
          value: colorModeToFloat(colorMode),
        },

        uGrain: {
          value: grain ? 1 : 0,
        },

        uGrainIntensity: {
          value: grainIntensity,
        },

        uOpacity: {
          value: opacity,
        },

        uMouse: {
          value: new Float32Array([0.5, 0.5]),
        },

        uMouseStrength: {
          value: mouseStrength,
        },

        uEnableMouse: {
          value: mouseInteraction,
        },

        uColor1: {
          value: new Float32Array(hexToRgb(color1)),
        },

        uColor2: {
          value: new Float32Array(hexToRgb(color2)),
        },

        uColor3: {
          value: new Float32Array(hexToRgb(color3)),
        },
      },
    });

    const mesh = new Mesh(gl, {
      geometry,
      program,
    });

    const resize = () => {
      const rect = container.getBoundingClientRect();

      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      renderer.setSize(width, height);

      const resolution =
        program.uniforms.iResolution.value as Float32Array;

      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
    };

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(container);

    resize();

    const targetMouse = [0.5, 0.5];
    const currentMouse = [0.5, 0.5];

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      targetMouse[0] =
        (event.clientX - rect.left) / rect.width;

      targetMouse[1] =
        1 -
        (event.clientY - rect.top) / rect.height;
    };

    const handleMouseLeave = () => {
      targetMouse[0] = 0.5;
      targetMouse[1] = 0.5;
    };

    canvas.addEventListener(
      "mousemove",
      handleMouseMove
    );

    canvas.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    let animationFrame = 0;
    const startTime = performance.now();

    const animate = (time: number) => {
      if (document.hidden) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      program.uniforms.iTime.value =
        (time - startTime) * 0.001;

      currentMouse[0] +=
        0.05 *
        (targetMouse[0] - currentMouse[0]);

      currentMouse[1] +=
        0.05 *
        (targetMouse[1] - currentMouse[1]);

      const mouse =
        program.uniforms.uMouse.value as Float32Array;

      mouse[0] = currentMouse[0];
      mouse[1] = currentMouse[1];

      renderer.render({
        scene: mesh,
      });

      animationFrame =
        requestAnimationFrame(animate);
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);

      resizeObserver.disconnect();

      canvas.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      canvas.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }

      gl.getExtension(
        "WEBGL_lose_context"
      )?.loseContext();
    };
  }, [
    color1,
    color2,
    color3,
    speed,
    scale,
    detail,
    glow,
    coreSize,
    swirl,
    fold,
    blackPoint,
    brightness,
    colorMode,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseStrength,
    opacity,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className}`}
    />
  );
}
