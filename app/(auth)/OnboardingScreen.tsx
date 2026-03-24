import React, { useRef, useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Image,
    Pressable,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const SLIDE_DURATION = 4000;
const FADE_OUT_MS = 400;
const FADE_IN_MS = 600;

const slides = [
    {
        id: 1,
        image: require("@/assets/img/onboarding/slide1.png"),
        title: "Fuel Your Body Right",
        text: "Order nutritious meals tailored to your fitness goals—delivered fresh to your door. Say goodbye to guesswork and hello to smart eating.",
    },
    {
        id: 2,
        image: require("@/assets/img/onboarding/slide2.png"),
        title: "Personalized Guidance",
        text: "Connect with certified trainers and wellness coaches to get custom fitness plans, nutritional advice, and mental wellness support tailored just for you.",
    },
    {
        id: 3,
        image: require("@/assets/img/onboarding/slide3.png"),
        title: "Stay on Top",
        text: "Monitor your workouts, track your health stats, and see your improvement over time — all in one place. Your fitness journey starts with clarity and motivation.",
    },
];

const OnboardingScreen: React.FC = () => {
    const router = useRouter();

    // One opacity + translateY per slide
    const opacities = useRef(slides.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
    const translateYs = useRef(slides.map((_, i) => new Animated.Value(i === 0 ? 0 : 20))).current;

    const currentRef = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const isAnimating = useRef(false);

    const animateToNext = useCallback(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const from = currentRef.current;
        const to = (from + 1) % slides.length;

        // Prepare incoming slide
        opacities[to].setValue(0);
        translateYs[to].setValue(20);

        // Update dot immediately
        setActiveIndex(to);

        Animated.parallel([
            // Fade out current
            Animated.timing(opacities[from], {
                toValue: 0,
                duration: FADE_OUT_MS,
                useNativeDriver: true,
            }),
            Animated.timing(translateYs[from], {
                toValue: -15,
                duration: FADE_OUT_MS,
                useNativeDriver: true,
            }),
            // Fade in next (slightly delayed for overlap)
            Animated.sequence([
                Animated.delay(100),
                Animated.parallel([
                    Animated.timing(opacities[to], {
                        toValue: 1,
                        duration: FADE_IN_MS,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateYs[to], {
                        toValue: 0,
                        duration: FADE_IN_MS,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start(() => {
            currentRef.current = to;
            isAnimating.current = false;
        });
    }, [opacities, translateYs]);

    useEffect(() => {
        const interval = setInterval(animateToNext, SLIDE_DURATION);
        return () => clearInterval(interval);
    }, [animateToNext]);

    const handleGetStarted = () => {
        router.replace("/RegisterScreen");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* All slides pre-rendered, visibility via animated opacity */}
                <View style={styles.slideArea}>
                    {slides.map((slide, i) => (
                        <Animated.View
                            key={slide.id}
                            style={[
                                styles.slideContent,
                                i > 0 && styles.slideOverlay,
                                {
                                    opacity: opacities[i],
                                    transform: [{ translateY: translateYs[i] }],
                                },
                            ]}
                        >
                            <View style={styles.imageContainer}>
                                <Image
                                    source={slide.image}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Dot Indicators */}
                <View style={styles.dotsContainer}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === activeIndex ? styles.dotActive : styles.dotInactive,
                            ]}
                        />
                    ))}
                </View>

                {/* All text slides pre-rendered */}
                <View style={styles.textArea}>
                    {slides.map((slide, i) => (
                        <Animated.View
                            key={slide.id}
                            style={[
                                styles.textContent,
                                i > 0 && styles.textOverlay,
                                {
                                    opacity: opacities[i],
                                    transform: [{ translateY: translateYs[i] }],
                                },
                            ]}
                        >
                            <Text style={styles.title}>{slide.title}</Text>
                            <Text style={styles.description}>{slide.text}</Text>
                        </Animated.View>
                    ))}
                </View>

                {/* Get Started Button */}
                <Pressable
                    onPress={handleGetStarted}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    // Slide area (image)
    slideArea: {
        width: width * 0.72,
        height: width * 0.72,
        marginBottom: 30,
    },
    slideContent: {
        width: "100%",
        height: "100%",
    },
    slideOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    imageContainer: {
        flex: 1,
    },
    image: {
        width: "100%",
        height: "100%",
    },

    // Dots
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        backgroundColor: "#34699A",
    },
    dotActive: {
        opacity: 1,
        width: 24,
        borderRadius: 5,
    },
    dotInactive: {
        opacity: 0.3,
    },

    // Text area
    textArea: {
        width: "100%",
        minHeight: 130,
    },
    textContent: {
        width: "100%",
        textAlign: "center",
    },
    textOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    title: {
        fontSize: 24,
        fontFamily: "SF-Pro-DisplayBold",
        fontWeight: "700",
        color: "#113F67",
        textAlign: "center",
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        fontFamily: "SF-Pro-DisplayRegular",
        color: "#34699A",
        textAlign: "center",
        marginHorizontal: 24,
        lineHeight: 22,
    },

    // Button
    button: {
        backgroundColor: "#34699A",
        paddingVertical: 18,
        paddingHorizontal: 80,
        borderRadius: 20,
        position: "absolute",
        bottom: 80,
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontFamily: "SF-Pro-DisplayBold",
        fontWeight: "600",
        textAlign: "center",
    },
});
