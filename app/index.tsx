import { ScreenProvider, useScreenSettings } from "@/hooks/screen";
import React, { useState } from "react";
import { PaperProvider, Surface, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, Line, G, Text as SvgText, Circle } from 'react-native-svg';
import InputSpinner from "react-native-input-spinner";


const range = (start: number, end: number, step: number = 1): number[] =>
  Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, i) => start + i * step);

// const px2moa = (value: number, click: number = ScreenClick) => value * click * 0.3


const ScreenLayer = (size: { width?: number; height?: number } = { width: 720, height: 576 }) => {

  const { screenWidth, screenHeight, screenClick } = useScreenSettings();

  const width = size.width ?? screenWidth;
  const height = size.height ?? screenHeight;
  const centerX = width / 2;
  const centerY = height / 2;

  const factors = [1, 2, 3, 4]

  const cropText = (factor: number) => {
    const calculatedHeightPx = screenHeight / factor
    const calculatedHeightMoa = calculatedHeightPx * screenClick * 0.3
    return `${(calculatedHeightPx).toFixed(0)}px / ${calculatedHeightMoa.toFixed(0)}MOA`
  }

  const drawCrop = () => {
    return factors.map((factor, index) => {
      const rectWidth = width / factor;
      const rectHeight = height / factor;
      const textX = centerX + rectWidth / 2 - (width / 50); // 5px offset from right edge
      const textY = centerY; // Center of rectangle

      return (
        <G key={index}>
          {/* Centered Grey Rectangle */}
          <Rect
            x={centerX - rectWidth / 2}
            y={centerY - rectHeight / 2}
            width={rectWidth}
            height={rectHeight}
            fill="grey"
            fillOpacity={0.5}
            stroke="black"
          />

          {/* Height Label Rotated -90 Degrees */}
          <SvgText
            x={textX}
            y={textY}
            fontSize={width / 50}
            fill="black"
            textAnchor="middle"
            transform={`rotate(-90, ${textX}, ${textY})`}
          >
            {cropText(factor)}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <Svg width={width} height={height}>
      {/* White background */}

      <Rect width="100%" height="100%" fill="white" />

      {/* Cross at center */}
      <Line x1={centerX} y1={0} x2={centerX} y2={height} stroke="green" strokeWidth={1} />
      <Line x1={0} y1={centerY} x2={width} y2={centerY} stroke="green" strokeWidth={1} />

      {/* Crop factors */}
      {drawCrop()}

    </Svg>
  );
};


const CalimatorLayer = ({ width, height }: { width: number; height: number }) => {

  const { zeroY, moa2px } = useScreenSettings();

  const centerX = width / 2;
  const centerY = height / 2;

  const w10 = moa2px(2, height);

  const moaNums = range(-30, 30, 10);

  const xLines = () => moaNums.map((xMoa, index) => {
    const xPx = centerX + moa2px(xMoa, height);
    return (
      <Line
        key={index}
        x1={xPx}
        y1={centerY - w10 + zeroY}
        x2={xPx}
        y2={centerY + w10 + zeroY}
        stroke="blue"
        strokeWidth={1}
      />
    );
  })

  const yLines = () => moaNums.map((yMoa, index) => {
    const yPx = centerY + moa2px(yMoa, height);
    return (
      <Line
        key={index}
        x1={centerX + w10}
        y1={yPx + zeroY}
        x2={centerX - w10}
        y2={yPx + zeroY}
        stroke="blue"
        strokeWidth={1}
      />
    );
  })

  return (
    <Svg width={width} height={height}>
      {xLines()}
      {yLines()}
    </Svg>
  );
};

const DropLayer = ({ width, height }: { width: number; height: number }) => {

  const { zeroY, moa2px, dropAtTargetMoa } = useScreenSettings();

  const centerX = width / 2;
  const centerY = height / 2;

  const p1 = {
    x: centerX,
    y: centerY + zeroY,
  }

  const p2 = {
    x: centerX,
    y: centerY + zeroY + moa2px(dropAtTargetMoa, height),
  }

  return (
    <Svg width={width} height={height}>
      <Line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke="red"
        strokeWidth={2}
      />
      <Circle cx={p1.x} cy={p1.y} r={5} fill={"red"} />
      <Circle cx={p2.x} cy={p2.y} r={5} fill={"red"} />
    </Svg>
  )
}

const Reticle = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <Surface
      elevation={2}
      style={{
        width: "100%",
        aspectRatio: 1.25,
        marginBottom: 10,
      }}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      {size.width > 0 && size.height > 0 && (
        <Svg width={size.width} height={size.height}>
          <ScreenLayer width={size.width} height={size.height} />
          <G>
            <CalimatorLayer width={size.width} height={size.height} />
            <DropLayer width={size.width} height={size.height} />
          </G>
        </Svg>
      )}
    </Surface>
  );
};


const Controls = () => {
  const { setValues, zeroY } = useScreenSettings();

  const valueChange = (value: number) => {
    setValues({
      zeroY: value
    });
  };

  return (
    <Surface
      elevation={2}
      style={{
        flex: 1, // Take up the remaining space
        width: "100%",
      }}
    >
      <Text>Clcik size, cm/100m</Text>
      <InputSpinner 
        min={-250}
        max={250}
        step={5}
        value={zeroY}
        onChange={valueChange}
        textColor="white"
        showBorder={true}
        rounded={false}
      />
    </Surface>
  );
};



export default function Index() {
  return (
    <ScreenProvider>
      <SafeAreaView>
        <PaperProvider>
          <Surface
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
            }}
          >
            {/* <Text>Edit app/index.tsx to edit this screen.</Text> */}
            <Reticle />
            <Controls />
          </Surface>
        </PaperProvider>
      </SafeAreaView>
    </ScreenProvider>
  );
}
