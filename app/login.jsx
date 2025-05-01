
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { db } from '../configs/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';


export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!userId.trim()) {
      Toast.show({
        type: 'error',
        text1: 'No User ID Found!',
      });
      return;
    }

    try {
      const q = query(
        collection(db, 'User_Table'),
        where('user_id', '==', userId.trim())
      );
      const querySnapshot = await getDocs(q); 

      if (!querySnapshot.empty) {
        router.push({
          pathname: '/admin/[adminid]',
          params: { adminid: userId }
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'User Not Found!',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something Went Wrong!',
      });
      console.error("Login Error:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ade8fe' }}>
      <View style={{ padding: 20, backgroundColor: '#069ed3' }}>
        <Text style={{ color: 'black', fontSize: 24, fontWeight: '500' }}>Login</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, gap: 20 }}>
        <Text style={{ fontSize: 52, fontWeight: 'bold', color: '#003066', fontFamily: 'outfit_bold' }}>Hey User</Text>
        <Text style={{ fontSize: 20, color: '#003066', fontWeight: 'bold', fontFamily: 'outfit_bold' }}>
          Please enter your user-ID to login
        </Text>

        <TextInput
          placeholder="Enter user ID"
          placeholderTextColor="#999"
          value={userId}
          onChangeText={setUserId}
          style={{
            width: '100%',
            backgroundColor: 'white',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: '#ccc',
            fontSize: 16,
            color: '#000',
            fontFamily: 'outfit_regular'
          }}
        />

        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: '#2384f1',
            paddingVertical: 14,
            paddingHorizontal: 60,
            borderRadius: 30,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: 'outfit_bold' }}>Login</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
}
