import { ScreenProvider, useScreenSettings } from "@/hooks/screen";
import React, { useState } from "react";
import { MD3DarkTheme, PaperProvider, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, Line, G, Text as SvgText } from 'react-native-svg';
import InputSpinner from "react-native-input-spinner";
import { ScrollView, StyleSheet, View } from "react-native";


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
                        strokeDasharray="5,5"
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

    const { zeroY, railAngle, screenClick, moa2px } = useScreenSettings();

    const centerX = width / 2;
    const centerY = height / 2;

    const w5 = moa2px(2.5, height);
    const w10 = moa2px(5, height);

    const moaNums5 = range(-30, 30, 5);
    const moaNums10 = range(-30, 30, 10);

    const localZeroY = moa2px(zeroY * screenClick * 0.3, height) - moa2px(railAngle, height)

    const xLines5 = () => moaNums5.map((xMoa, index) => {
        const xPx = centerX + moa2px(xMoa, height);
        return (
            <Line
                key={index}
                x1={xPx}
                y1={centerY - w5 + localZeroY}
                x2={xPx}
                y2={centerY + w5 + localZeroY}
                stroke="white"
                strokeWidth={1}
            />
        );
    })

    const yLines5 = () => moaNums5.map((yMoa, index) => {
        const yPx = centerY + moa2px(yMoa, height);
        return (
            <Line
                key={index}
                x1={centerX + w5}
                y1={yPx + localZeroY}
                x2={centerX - w5}
                y2={yPx + localZeroY}
                stroke="white"
                strokeWidth={1}
            />
        );
    })

    const xLines10 = () => moaNums10.map((xMoa, index) => {
        const xPx = centerX + moa2px(xMoa, height);
        return (
            <Line
                key={index}
                x1={xPx}
                y1={centerY - w10 + localZeroY}
                x2={xPx}
                y2={centerY + w10 + localZeroY}
                stroke="white"
                strokeWidth={1}
            />
        );
    })

    const yLines10 = () => moaNums10.map((yMoa, index) => {
        const yPx = centerY + moa2px(yMoa, height);
        return (
            <Line
                key={index}
                x1={centerX + w10}
                y1={yPx + localZeroY}
                x2={centerX - w10}
                y2={yPx + localZeroY}
                stroke="white"
                strokeWidth={1}
            />
        );
    })

    return (
        <Svg width={width} height={height}>
            {xLines5()}
            {yLines5()}
            {xLines10()}
            {yLines10()}
            <Line x1={centerX - moa2px(30, height)} y1={centerY + localZeroY} x2={centerX + moa2px(30, height)} y2={centerY + localZeroY} stroke="white" strokeWidth={1} />
            <Line x1={centerX} y1={centerY - moa2px(30, height) + localZeroY} x2={centerX} y2={centerY + moa2px(30, height) + localZeroY} stroke="white" strokeWidth={1} />
        </Svg>
    );
};

const DropLayer = ({ width, height }: { width: number; height: number }) => {

    const { zeroY, railAngle, moa2px, screenClick, dropAtTargetMoa, dropAtZeroMoa, zeroDistanceM, targetDistanceM } = useScreenSettings();

    const centerX = width / 2;
    const centerY = height / 2;

    const localZeroY = moa2px(zeroY * screenClick * 0.3, height) - moa2px(railAngle, height)

    const p1 = {
        x: centerX,
        y: centerY + localZeroY + moa2px(dropAtZeroMoa, height),
    }

    const p2 = {
        x: centerX,
        y: centerY + localZeroY + moa2px(dropAtTargetMoa, height),
    }

    return (
        <Svg width={width} height={height}>
            <Line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="red"
                strokeWidth={1}
            />

            <Line
                x1={p1.x - 5}
                y1={p1.y}
                x2={p1.x + 5}
                y2={p1.y}
                stroke="red"
                strokeWidth={3}
            />

            <Line
                x1={p1.x}
                y1={p1.y - 5}
                x2={p1.x}
                y2={p1.y + 5}
                stroke="red"
                strokeWidth={3}
            />

            {/* <Circle cx={p1.x} cy={p1.y} r={3} fill={"red"} /> */}
            <SvgText x={p1.x - width / 50} y={p1.y + width / 200} fill={"red"} fontSize={width / 35} textAnchor="end">
                {zeroDistanceM.toFixed(0)}
            </SvgText>

            {/* <Circle cx={p2.x} cy={p2.y} r={3} fill={"red"} /> */}

            <Line
                x1={p2.x - 5}
                y1={p2.y}
                x2={p2.x + 5}
                y2={p2.y}
                stroke="red"
                strokeWidth={3}
            />

            <SvgText x={p2.x - width / 50} y={p2.y + width / 200} fill={"red"} fontSize={width / 35} textAnchor="end">
                {targetDistanceM.toFixed(0)}
            </SvgText>
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


const Distances = () => {

    const { zeroDistanceM, targetDistanceM, dropAtTargetMoa, dropAtZeroMoa, setValues } = useScreenSettings();

    const zeroDistanceChange = (value: number) => {
        setValues({
            zeroDistanceM: value
        });
    };

    const targetDistanceChange = (value: number) => {
        setValues({
            targetDistanceM: value
        });
    };

    const dropAtZeroChange = (value: number) => {
        setValues({
            dropAtZeroMoa: value
        });
    };

    const dropAtTargetChange = (value: number) => {
        setValues({
            dropAtTargetMoa: value
        });
    };

    return (
        <View style={{ justifyContent: "center", flexDirection: "column", paddingTop: 10 }}>
            {/* <Text>Distances</Text> */}

            <View style={{ justifyContent: "center", flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}>
                    <Text>Zero distance, m</Text>
                    <InputSpinner
                        min={0}
                        max={1000}
                        step={50}
                        // longStep={10}
                        editable={false}
                        value={zeroDistanceM}
                        onChange={zeroDistanceChange}
                        textColor="white"
                        showBorder={true}
                        rounded={false}
                    />
                </View>
                <View style={{ padding: 5 }} />
                <View style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}>
                    <Text>Zero drop, MOA</Text>
                    <InputSpinner
                        min={0}
                        max={200}
                        step={5}
                        // longStep={10}
                        editable={false}
                        value={dropAtZeroMoa}
                        onChange={dropAtZeroChange}
                        textColor="white"
                        showBorder={true}
                        rounded={false}
                    />
                </View>
            </View>

            <View style={{ justifyContent: "center", flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}>
                    <Text>Target distance, m</Text>
                    <InputSpinner
                        min={0}
                        max={2500}
                        step={100}
                        // longStep={10}
                        editable={false}
                        value={targetDistanceM}
                        onChange={targetDistanceChange}
                        textColor="white"
                        showBorder={true}
                        rounded={false}
                    />
                </View>
                <View style={{ padding: 5 }} />
                <View style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}>
                    <Text>Target drop, MOA</Text>
                    <InputSpinner
                        min={0}
                        max={200}
                        step={5}
                        // longStep={10}
                        editable={false}
                        value={dropAtTargetMoa}
                        onChange={dropAtTargetChange}
                        textColor="white"
                        showBorder={true}
                        rounded={false}
                    />
                </View>
            </View>
        </View>
    )
}


const Controls = () => {
    const { setValues, zeroY, railAngle, dropAtTargetMoa, screenClick } = useScreenSettings();

    const clickChange = (value: number) => {
        setValues({
            screenClick: value
        });
    };

    const zeroYChange = (value: number) => {
        setValues({
            zeroY: value
        });
    };

    const railChange = (value: number) => {
        setValues({
            railAngle: value
        });
    };

    // const handleWheel = (event: any) => {
    //   const delta = event.deltaY; // Amount of scrolling
    //   const step = 0.01; // Define the step for increment or decrement

    //   // Adjust the value based on the wheel direction
    //   if (delta < 0) {
    //     clickChange(screenClick + 0.01); // Increase value, with a max of 10
    //   } else {
    //     clickChange(screenClick - 0.01); // Decrease value, with a min of 0
    //   }
    // }

    return (
        <Surface
            elevation={2}
            style={{
                flex: 1, // Take up the remaining space
                width: "100%",
                padding: 10,
            }}
        >
            <Text style={{ paddingTop: 10 }}>Click size, cm/100m</Text>
            {/* <View onWheel={handleWheel}> */}

            <InputSpinner
                // decimalSeparator="."
                precision={2}
                type={"real"}
                min={0}
                max={10}
                step={0.01}
                // editable={false}
                value={screenClick}
                onChange={clickChange}
                textColor="white"
                showBorder={true}
                rounded={false}
            />
            {/* </View> */}

            <Distances />

            <Text style={{ paddingTop: 10 }}>Zero Y, px</Text>
            <InputSpinner
                min={-250}
                max={250}
                step={5}
                // longStep={10}
                editable={false}
                value={zeroY}
                onChange={zeroYChange}
                textColor="white"
                showBorder={true}
                rounded={false}
            />
            <Text style={{ paddingTop: 10 }}>Picatini rail angle, MOA</Text>
            <InputSpinner
                min={-50}
                max={50}
                step={5}
                // longStep={5}
                editable={false}
                value={railAngle}
                onChange={railChange}
                textColor="white"
                showBorder={true}
                rounded={false}
            />
        </Surface>
    );
};


export default function Index() {
    const theme = MD3DarkTheme;

    return (
        <ScreenProvider>
            <SafeAreaView style={styles.safeArea}>
                <PaperProvider theme={theme}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        <Surface style={styles.surface}>
                            <Surface style={styles.subsurface}>
                                <Reticle />
                                <Controls />
                            </Surface>
                        </Surface>
                    </ScrollView>
                </PaperProvider>
            </SafeAreaView>
        </ScreenProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,  // This makes SafeAreaView fill the available space, respecting safe areas
    },
    scrollViewContent: {
        flexGrow: 1, // Ensures content inside ScrollView takes up enough space to be scrollable
    },
    surface: {
        flex: 1, // Make Surface fill the entire SafeAreaView
        padding: 10,
    },
    subsurface: {
        width: '100%', // Make subsurface take the full width of its parent
        maxWidth: 800, // Ensure subsurface doesn't exceed 800px in width
        alignSelf: "center", // Center the subsurface horizontally within the surface
    }
});
