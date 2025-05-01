// import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
// import React, { useState } from 'react';
// import Toast from 'react-native-toast-message';
// import { useRouter } from 'expo-router';
// import Ionicons from '@expo/vector-icons/Ionicons';

// export default function RegisterDoctor() {
//   const router = useRouter();

//   const [form, setForm] = useState({
//     userType: 'Doctor',
//     name: '',
//     degree: '',
//     speciality: '',
//     regNumber: '',
//     gender: 'male',
//     hospitals: [],
//   });

//   const handleChange = (key, value) => {
//     setForm(prev => ({ ...prev, [key]: value }));
//   };

//   const toggleHospital = (hospital) => {
//     setForm(prev => ({
//       ...prev,
//       hospitals: prev.hospitals.includes(hospital)
//         ? prev.hospitals.filter(h => h !== hospital)
//         : [...prev.hospitals, hospital]
//     }));
//   };

//   const handleRegister = () => {
//     const { name, degree, speciality, regNumber } = form;
//     if (!name || !degree || !speciality || !regNumber) {
//       Toast.show({
//         type: 'error',
//         text1: 'All fields are required!',
//       });
//       return;
//     }
//     Toast.show({
//       type: 'success',
//       text1: 'Doctor Registered Successfully!',
//     });
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: '#ade8fe' }}>
//       {/* Header */}
//       <View style={{ padding: 20, backgroundColor: '#069ed3', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back-circle" size={24} color="black" />
//         </TouchableOpacity>
//         <Text style={{ color: 'black', fontSize: 24, fontWeight: '500' }}>Register Doctor</Text>
//       </View>

//       {/* Content */}
//       <View style={{ flex: 1, marginTop: 30, paddingHorizontal: 20, gap: 20 }}>
//         {/* User Type Selector */}
//         <Text style={{ fontSize: 16, fontFamily: 'outfit_bold', color: '#003066' }}>Select Type</Text>
//         <View style={{ flexDirection: 'row', gap: 20 }}>
//           {['Physiotherapist', 'Doctor'].map(type => (
//             <Pressable
//               key={type}
//               onPress={() => handleChange('userType', type)}
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 paddingHorizontal: 15,
//                 paddingVertical: 8,
//                 borderRadius: 20,
//                 borderWidth: 1,
//                 borderColor: '#003066',
//                 backgroundColor: form.userType === type ? '#003066' : 'white'
//               }}
//             >
//               <Text style={{
//                 color: form.userType === type ? 'white' : '#003066',
//                 fontFamily: 'outfit_regular'
//               }}>
//                 {type}
//               </Text>
//             </Pressable>
//           ))}
//         </View>

//         {/* Input Fields */}
//         {['name', 'degree', 'speciality', 'regNumber'].map((field, index) => (
//           <TextInput
//             key={index}
//             placeholder={`Enter ${field === 'regNumber' ? 'registration number' : field}`}
//             placeholderTextColor="#999"
//             value={form[field]}
//             onChangeText={(text) => handleChange(field, text)}
//             style={{
//               backgroundColor: 'white',
//               paddingVertical: 12,
//               paddingHorizontal: 20,
//               borderRadius: 50,
//               borderWidth: 1,
//               borderColor: '#ccc',
//               fontSize: 16,
//               color: '#000',
//               fontFamily: 'outfit_regular'
//             }}
//           />
//         ))}


//         <Text style={{ fontSize: 16, fontFamily: 'outfit_bold', color: '#003066' }}>
//   Select working hospitals/clinics
// </Text>
// {['City hospital', 'Green Clinic', 'Sunrise medical center', 'Carewell hospital'].map((hospital) => (
//   <Pressable
//     key={hospital}
//     onPress={() => toggleHospital(hospital)}
//     style={{
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 15,
//       paddingVertical: 10,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: '#003066',
//       backgroundColor: 'white',
//       marginBottom: 10
//     }}
//   >
//     <View style={{
//       width: 20,
//       height: 20,
//       marginRight: 10,
//       borderWidth: 2,
//       borderColor: '#003066',
//       borderRadius: 4,
//       backgroundColor: form.hospitals.includes(hospital) ? '#003066' : 'white',
//       justifyContent: 'center',
//       alignItems: 'center',
//     }}>
//       {form.hospitals.includes(hospital) && (
//         <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>
//       )}
//     </View>
//     <Text style={{
//       color: '#003066',
//       fontSize: 16,
//       fontFamily: 'outfit_regular'
//     }}>
//       {hospital}
//     </Text>
//   </Pressable>
// ))}

//         {/* Register Button */}
//         <TouchableOpacity
//           onPress={handleRegister}
//           style={{
//             backgroundColor: '#2384f1',
//             paddingVertical: 14,
//             paddingHorizontal: 60,
//             borderRadius: 30,
//             alignItems: 'center'
//           }}
//         >
//           <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: 'outfit_bold' }}>
//             Register
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Toast />
//     </View>
//   );
// }

import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { db } from '../../configs/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function RegisterDoctor() {
  const router = useRouter();

  const [form, setForm] = useState({
    userType: 'Doctor',
    name: '',
    degree: '',
    speciality: '',
    regNumber: '',
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
    const { name, degree, speciality, regNumber, hospitals, userType, gender } = form;

    if (!name || !degree || !speciality || !regNumber) {
      Toast.show({
        type: 'error',
        text1: 'All fields are required!',
      });
      return;
    }

    try {
      const newDoctor = {
        id: Date.now().toString(), // or use uuid if preferred
        name,
        degree,
        speciality,
        user_id: regNumber,
        working_hospitals: hospitals,
        gender,
        userType,
      };

      await addDoc(collection(db, 'Doctor_Table'), newDoctor);

      Toast.show({
        type: 'success',
        text1: 'Doctor Registered Successfully!',
      });

      // Optionally clear form or navigate
      setForm({
        userType: 'Doctor',
        name: '',
        degree: '',
        speciality: '',
        regNumber: '',
        gender: 'male',
        hospitals: [],
      });
      router.back();

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
      {/* Header */}
      <View style={{ padding: 20, backgroundColor: '#069ed3', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontSize: 24, fontWeight: '500' }}>Register Doctor</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, marginTop: 30, paddingHorizontal: 20, gap: 20 }}>
        {/* User Type Selector */}
        <Text style={{ fontSize: 16, fontFamily: 'outfit_bold', color: '#003066' }}>Select Type</Text>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {['Physiotherapist', 'Doctor'].map(type => (
            <Pressable
              key={type}
              onPress={() => handleChange('userType', type)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#003066',
                backgroundColor: form.userType === type ? '#003066' : 'white'
              }}
            >
              <Text style={{
                color: form.userType === type ? 'white' : '#003066',
                fontFamily: 'outfit_regular'
              }}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Input Fields */}
        {['name', 'degree', 'speciality', 'regNumber'].map((field, index) => (
          <TextInput
            key={index}
            placeholder={`Enter ${field === 'regNumber' ? 'registration number' : field}`}
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

        {/* Working Hospitals */}
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

        {/* Register Button */}
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

