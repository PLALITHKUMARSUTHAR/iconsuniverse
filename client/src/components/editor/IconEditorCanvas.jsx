import React, { useMemo } from 'react';
import { recolorSvg, normalizeSvgForCanvas } from '../../services/svgCacheService';

const IconEditorCanvas = ({
  rawSvg = '',
  color = '#00327d',
  layerColorOverrides = {},
  rotation = 0,
  flipH = false,
  flipV = false,
  scale = 1,
  padding = 16,
  shape = 'none',
  badgeColor = '#00327d',
  badgeOpacity = 100,
  previewSize = 260,
}) => {
  // Process raw SVG with color overrides & inline styles
  const processedSvg = useMemo(() => {
    if (!rawSvg) return '';

    let content = rawSvg;

    // Apply layer color replacements
    if (Object.keys(layerColorOverrides).length > 0) {
      Object.entries(layerColorOverrides).forEach(([original, replacement]) => {
        const regex = new RegExp(original, 'gi');
        content = content.replace(regex, replacement);
      });
    } else if (color) {
      content = recolorSvg(content, color);
    }

    return normalizeSvgForCanvas(content);
  }, [rawSvg, color, layerColorOverrides]);

  const opacityHex = Math.round((badgeOpacity / 100) * 255)
    .toString(16)
    .padStart(2, '0');

  const getShapeStyles = () => {
    if (shape === 'none') {
      return {
        backgroundColor: 'transparent',
        borderRadius: '0px',
      };
    }

    const baseStyle = {
      backgroundColor: `${badgeColor}${opacityHex}`,
    };

    if (shape === 'circle') {
      return {
        ...baseStyle,
        borderRadius: '50%',
      };
    }

    if (shape === 'rounded') {
      return {
        ...baseStyle,
        borderRadius: '24%',
      };
    }

    if (shape === 'hexagon') {
      return {
        ...baseStyle,
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        borderRadius: '0px',
      };
    }

    return baseStyle;
  };

  // When a backdrop shape is applied, scale the icon inside to ~60% so it fits with balanced margins
  const effectiveScale = shape !== 'none' ? scale * 0.65 : scale;

  const transformStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) scale(${effectiveScale})`,
    transformOrigin: 'center center',
    transition: 'transform 0.2s ease',
  };

  return (
    <div className="relative flex items-center justify-center p-6 bg-[radial-gradient(#e2e2e9_1px,transparent_1px)] [background-size:16px_16px] rounded-3xl border border-landing-surface-container bg-white/80 overflow-hidden shadow-inner">
      {/* Outer Backdrop Shape Container */}
      <div
        className="relative flex items-center justify-center transition-all duration-300 shadow-sm overflow-hidden m-auto"
        style={{
          width: `${previewSize}px`,
          height: `${previewSize}px`,
          ...getShapeStyles(),
        }}
      >
        {/* Inner Centered Icon */}
        <div
          className="w-full h-full flex items-center justify-center m-auto text-landing-primary [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:m-auto [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:overflow-visible"
          style={{
            ...transformStyle,
            padding: `${padding}px`,
          }}
          dangerouslySetInnerHTML={{ __html: processedSvg }}
        />
      </div>
    </div>
  );
};

export default IconEditorCanvas;
