
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    cinzel: require("../assets/fonts/Cinzel-Medium.ttf"),
    outfit_bold: require("../assets/fonts/Outfit-Bold.ttf"),
    outfit_regular: require("../assets/fonts/Outfit-Regular.ttf"),
    outfit_medium: require("../assets/fonts/Outfit-Medium.ttf")
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Define all your routes here
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Toast config={toastConfig} />
      <Stack.Screen name="index" /> {/* Will be your splash/welcome screen */}
      <Stack.Screen name="login" /> {/* Login screen */}
      <Stack.Screen name="admin/[adminid]" /> {/* Admin screen with dynamic parameter */}
      <Stack.Screen name="doctor/[doctorid]" /> 
      <Stack.Screen name="patient/[patientid]" /> {/* Patient screen with dynamic parameter */}
      {/* <Stack.Screen name="dashboard" /> Dashboard if needed */}
    </Stack>
  );
}
