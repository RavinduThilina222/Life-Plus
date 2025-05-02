import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { db } from '../../configs/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function RegisterDoctor() {
  const router = useRouter();
  const { adminid } = useLocalSearchParams();

  const [form, setForm] = useState({
    doctor_type: 'Doctor',
    name: '',
    degree: '',
    speciality: '',
    reg_number: '',
    gender: 'male',
    hospitals: [],
  });

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleHospital = (hospital) => {
    setForm(prev => ({
      ...prev,
      hospitals: prev.hospitals.includes(hospital)
        ? prev.hospitals.filter(h => h !== hospital)
        : [...prev.hospitals, hospital]
    }));
  };

  const handleRegister = async () => {
    const { name, degree, speciality, reg_number, hospitals, doctor_type, gender } = form;

    if (!name || !degree || !speciality || !reg_number) {
      Toast.show({
        type: 'error',
        text1: 'All fields are required!',
      });
      return;
    }

    try {
      const userId = reg_number;

      // First add to User_Table
      await addDoc(collection(db, 'User_Table'), {
        id: Date.now().toString(),
        user_type: 'DOCTOR',
        user_id: userId,
        created_by: adminid,
        created_at: serverTimestamp(),
      });

      // Then add to Doctor_Table
      const newDoctor = {
        id: Date.now().toString(),
        name,
        degree,
        speciality,
        user_id: userId,
        working_hospitals: hospitals,
        gender,
        doctor_type,
      };

      await addDoc(collection(db, 'Doctor_Table'), newDoctor);

      Toast.show({
        type: 'success',
        text1: 'Doctor Registered Successfully!',
      });

      // Clear form and go back
      setForm({
        doctor_type: 'Doctor',
        name: '',
        degree: '',
        speciality: '',
        reg_number: '',
        gender: 'male',
        hospitals: [],
      });
      
    } catch (error) {
      console.error('Error adding document: ', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to register doctor.',
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ade8fe' }}>
      <View style={{ padding: 20, backgroundColor: '#069ed3', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontSize: 24, fontWeight: '500' }}>Register Doctor</Text>
      </View>

      <View style={{ flex: 1, marginTop: 30, paddingHorizontal: 20, gap: 20 }}>
        <Text style={{ fontSize: 16, fontFamily: 'outfit_bold', color: '#003066' }}>Select Type</Text>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {['Physiotherapist', 'Doctor'].map(type => (
            <Pressable
              key={type}
              onPress={() => handleChange('doctor_type', type)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#003066',
                backgroundColor: form.doctor_type === type ? '#003066' : 'white'
              }}
            >
              <Text style={{
                color: form.doctor_type === type ? 'white' : '#003066',
                fontFamily: 'outfit_regular'
              }}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {['name', 'degree', 'speciality', 'reg_number'].map((field, index) => (
          <TextInput
            key={index}
            placeholder={`Enter ${field === 'reg_number' ? 'registration number' : field}`}
            placeholderTextColor="#999"
            value={form[field]}
            onChangeText={(text) => handleChange(field, text)}
            style={{
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
        ))}

        <Text style={{ fontSize: 16, fontFamily: 'outfit_bold', color: '#003066' }}>
          Select working hospitals/clinics
        </Text>
        {['City hospital', 'Green Clinic', 'Sunrise medical center', 'Carewell hospital'].map((hospital) => (
          <Pressable
            key={hospital}
            onPress={() => toggleHospital(hospital)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#003066',
              backgroundColor: 'white',
              marginBottom: 10
            }}
          >
            <View style={{
              width: 20,
              height: 20,
              marginRight: 10,
              borderWidth: 2,
              borderColor: '#003066',
              borderRadius: 4,
              backgroundColor: form.hospitals.includes(hospital) ? '#003066' : 'white',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {form.hospitals.includes(hospital) && (
                <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
            <Text style={{
              color: '#003066',
              fontSize: 16,
              fontFamily: 'outfit_regular'
            }}>
              {hospital}
            </Text>
          </Pressable>
        ))}

        <TouchableOpacity
          onPress={handleRegister}
          style={{
            backgroundColor: '#2384f1',
            paddingVertical: 14,
            paddingHorizontal: 60,
            borderRadius: 30,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: 'outfit_bold' }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
}
