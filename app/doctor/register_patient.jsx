import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { db } from '../../configs/firebaseConfig';

export default function RegisterPatient() {
  const router = useRouter();
  const { doctorid } = useLocalSearchParams();

  const [form, setForm] = useState({
    patient_id: '',
    name: '',
    age: '',
    mobile: '',
    blood_group: '',
    purpose: '',
    gender: 'male',
  });

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    const { patient_id, name, age, mobile, blood_group, purpose, gender } = form;

    if (!patient_id || !name || !age || !mobile || !blood_group || !purpose) {
      Toast.show({
        type: 'error',
        text1: 'All fields are required!',
      });
      return;
    }

    try {
      const userId = patient_id;

      // Add to User_Table
      await addDoc(collection(db, 'User_Table'), {
        id: Date.now().toString(),
        user_type: 'PATIENT',
        user_id: userId,
        created_by: doctorid,
        created_at: serverTimestamp(),
      });

      // Add to Patient_Table
      const newPatient = {
        id: Date.now().toString(),
        user_id: userId,
        name,
        age,
        mobile,
        blood_group,
        purpose,
        gender,
        created_by: doctorid,
        created_at: serverTimestamp(),
      };

      await addDoc(collection(db, 'Patient_Table'), newPatient);

      Toast.show({
        type: 'success',
        text1: 'Patient Registered Successfully!',
      });

      // Reset form
      setForm({
        patient_id: '',
        name: '',
        age: '',
        mobile: '',
        blood_group: '',
        purpose: '',
        gender: 'male',
      });

    } catch (error) {
      console.error('Error adding patient: ', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to register patient.',
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ade8fe' }}>
      <View style={{ padding: 20, backgroundColor: '#069ed3', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontSize: 24, fontWeight: '500' }}>Register Patient</Text>
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: 30 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {[
          { key: 'patient_id', label: 'Patient Registration ID' },
          { key: 'name', label: 'Name' },
          { key: 'age', label: 'Age', keyboardType: 'numeric' },
          { key: 'mobile', label: 'Mobile No.', keyboardType: 'numeric' },
          { key: 'blood_group', label: 'Blood Group' },
        ].map((field, index) => (
          <TextInput
            key={index}
            placeholder={`Enter ${field.label}`}
            placeholderTextColor="#999"
            value={form[field.key]}
            onChangeText={(text) => handleChange(field.key, text)}
            keyboardType={field.keyboardType || 'default'}
            style={{
              backgroundColor: 'white',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: '#ccc',
              fontSize: 16,
              color: '#000',
              fontFamily: 'outfit_regular',
              marginTop: 20
            }}
          />
        ))}

        <TextInput
          placeholder="Describe Injury or Disease"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={form.purpose}
          onChangeText={(text) => handleChange('purpose', text)}
          style={{
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#ccc',
            fontSize: 16,
            color: '#000',
            fontFamily: 'outfit_regular',
            marginTop: 20,
            textAlignVertical: 'top',
          }}
        />

        <Text style={{ fontSize: 16, fontFamily: 'outfit_bold', color: '#003066', marginTop: 20 }}>
          Select Gender
        </Text>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
          {['male', 'female'].map(gender => (
            <Pressable
              key={gender}
              onPress={() => handleChange('gender', gender)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#003066',
                backgroundColor: form.gender === gender ? '#003066' : 'white'
              }}
            >
              <Text style={{
                color: form.gender === gender ? 'white' : '#003066',
                fontFamily: 'outfit_regular'
              }}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          style={{
            backgroundColor: '#2384f1',
            paddingVertical: 14,
            paddingHorizontal: 60,
            borderRadius: 30,
            alignItems: 'center',
            marginTop: 30
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: 'outfit_bold' }}>
            Register
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </View>
  );
}
