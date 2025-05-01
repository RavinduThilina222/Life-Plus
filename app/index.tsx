// app/index.js (The Welcome/Splash screen)
import { View, Text, Image, Animated } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function WelcomePage() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigation timer - go to login after 6 seconds
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [scaleAnim]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#ade8fe',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 25,
      }}
    >
      <Animated.Image
        source={require('../assets/images/healthcare.png')}
        style={{
          width: 200,
          height: 200,
          transform: [{ scale: scaleAnim }],
        }}
      />
      <Text
        style={{
          fontSize: 50,
          fontWeight: 'bold',
          color: '#023e55',
          fontFamily: 'cinzel',
        }}
      >
        LIFEPLUS
      </Text>
    </View>
  );
}
