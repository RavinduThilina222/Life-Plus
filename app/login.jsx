
import { useFonts } from "expo-font";
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { db } from '../configs/firebaseConfig';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    outfit_bold: require('../assets/fonts/Outfit-Bold.ttf'),
  });

  useEffect(() => {
  
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }


  const handleLogin = async () => {
    if (!userId.trim()) {
     ToastAndroid.show('No user ID found', ToastAndroid.SHORT);
      return;
    }

    try {
      const q = query(
        collection(db, 'User_Table'),
        where('user_id', '==', userId.trim())
      );
      const querySnapshot = await getDocs(q); 

      if (!querySnapshot.empty) {
        if(userId.includes('ADM')){
          router.push({
            pathname: '/admin/[adminid]',
            params: { adminid: userId }
          });
        } else if(userId.includes('DOC')){
          router.push({
            pathname: '/doctor/[doctorid]',
            params: { doctorid: userId }
          });
        }
      } else {
       ToastAndroid.show('User not found', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      console.error("Login Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Hey User</Text>
        <Text style={styles.subtitle}>Please enter your user-ID to login</Text>

        <TextInput
          placeholder="Enter user ID"
          placeholderTextColor="#999"
          value={userId}
          onChangeText={setUserId}
          style={styles.input}
        />

        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ade8fe',
  },
  header: {
    padding: 20,
    backgroundColor: '#3f94ff',
  },
  headerTitle: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'outfit_regular',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 52,
    color: '#003066',
    fontFamily: 'outfit_bold',
  },
  subtitle: {
    fontSize: 20,
    color: '#003066',
    fontFamily: 'outfit_bold',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    color: '#000',
    fontFamily: 'outfit_regular',
  },
  loginButton: {
    backgroundColor: '#2384f1',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'outfit_bold',
  },
});
