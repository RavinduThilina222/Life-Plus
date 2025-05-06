import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../configs/firebaseConfig';

export default function AdminPage() {
  const { adminid } = useLocalSearchParams();

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [admins, setAdmins] = useState([]);
  const [exerciseVideoName, setExerciseVideoName] = useState('');
  const [exerciseVideoLink, setExerciseVideoLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const addNewAdmin = async () => {
    if (!adminName || !adminEmail || !registrationNumber) {
      Toast.show({ type: 'success', text1: 'All Fields Are Required !' });
      return;
    }

    const generatedId = uuidv4();

    try {
      // Step 1: Add to User_Table
      await addDoc(collection(db, 'User_Table'), {
        created_at: new Date(),
        created_by: adminid,
        id: generatedId,
        user_id: registrationNumber,
        user_type: 'ADMIN',
      });

      // Step 2: Add to Admin_Table
      await addDoc(collection(db, 'Admin_Table'), {
        id: generatedId,
        created_by: adminid,
        user_id: registrationNumber,
        admin_name: adminName,
        admin_email: adminEmail,
      });

      Toast.show({ type: 'success', text1: 'Admin Registered Successfully!' });
      fetchAdmins();
      setAdminName('');
      setAdminEmail('');
      setRegistrationNumber('');
    } catch (error) {
      console.error("Error adding admin: ", error);
      Toast.show({ type: 'error', text1: 'Error Registering Admin!' });
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'Admin_Table'));
      const adminList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins: ", error);
      Toast.show({ type: 'error', text1: 'Error Fetching Admins!' });
    } finally {
      setLoading(false);
    }
  };




const pickVideo = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    console.log('Response from ImagePicker:', result);

    if (!result.canceled) {
      const asset = result.assets[0];
      console.log('Selected asset: ', asset);

      const data = new FormData();
      data.append('file', {
        uri: asset.uri,
        type: 'video/mp4',
        name: 'video.mp4',
      });
      data.append('upload_preset', 'exercises');

      console.log('FormData: ', data);

      const response = await axios.post('https://api.cloudinary.com/v1_1/dipz290mx/video/upload', {
        method: 'POST',
        body: data,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        const data = new FormData();
        data.append('file', {
          uri: asset.uri,
          type: 'video/mp4',
          name: 'video.mp4',
        });
        data.append('upload_preset', 'exercises');

        const response = await fetch('https://api.cloudinary.com/v1_1/dipz290mx/video/upload', {
          method: 'POST',
          body: data,
        });

        const uploadResult = await response.json();

        if (uploadResult.secure_url) {
          setExerciseVideoLink(uploadResult.secure_url);
          setIsUploaded(true);
          Toast.show({ type: 'success', text1: 'Video uploaded successfully!' });
        } else {
          console.error('Upload failed:', uploadResult);
          Toast.show({ type: 'error', text1: 'Video upload failed!' });
        }
      }
    }
  
    } catch (error) {
      console.error('Error picking video:', error);
      Toast.show({ type: 'error', text1: 'Error picking video!' });
    }
  };

  const addExercise = async () => {
    if (!exerciseVideoName || !exerciseVideoLink) {
      Toast.show({ type: 'error', text1: 'Please choose a video and provide a name!' });
      return;
    }

    try {
      await addDoc(collection(db, 'Exercise_Table'), {
        video_name: exerciseVideoName,
        video_url: exerciseVideoLink,
        uploaded_at: new Date(),
      });

      Toast.show({ type: 'success', text1: 'Exercise Video Saved Successfully!' });
      alert('Exercise Video Saved Successfully!');
      setIsUploaded(false);
      setExerciseVideoName('');
      setExerciseVideoLink('');
    } catch (error) {
      console.error("Error saving video:", error);
      Toast.show({ type: 'error', text1: 'Failed to save video in Firestore!' });
    }
  };

  const removeAdmin = async (adminId) => {
    try {
      await deleteDoc(doc(db, 'Admin_Table', adminId));
      setAdmins(admins.filter(admin => admin.id !== adminId));
      Toast.show({ type: 'success', text1: 'Admin Removed Successfully!' });
    } catch (error) {
      console.error("Error removing admin: ", error);
      Toast.show({ type: 'error', text1: 'Error Removing Admin!' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: `admin/register_doctor?adminid=${adminid}`,
              query: { adminid: adminid },
            })
          }
          style={styles.registerDoctorBtn}
        >
          <Text style={styles.buttonText}>Register Doctor/Physiotherapist</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addAdminContainer}>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#999"
          value={adminName}
          onChangeText={setAdminName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={adminEmail}
          onChangeText={setAdminEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Registration Number"
          placeholderTextColor="#999"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          style={styles.input}
        />
        <TouchableOpacity onPress={addNewAdmin} style={styles.button}>
          <Text style={styles.buttonText}>Register Admin</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Admins</Text>

      <View style={styles.adminListContainer}>
        {admins.map((item) => (
          <View key={item.id} style={styles.adminItem}>
            <Text style={styles.adminName}>{item.admin_name}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeAdmin(item.id)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Upload Exercise Video Section */}
      <View style={[styles.content, { borderTopColor: '#0f0f0f', borderTopWidth: 1, marginTop: 30 }]}>
        <Text style={styles.sectionTitle}>Upload Exercise Video</Text>

        <TextInput
          placeholder="Video Name"
          placeholderTextColor="#999"
          value={exerciseVideoName}
          onChangeText={setExerciseVideoName}
          style={styles.input}
        />

        {isUploaded ? (
          <Text style={[styles.buttonText, { color: '#3e9bed', textAlign: 'center', marginTop: 20 }]}>
            Uploaded Successfully
          </Text>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#3e9bed' }]}
            onPress={pickVideo}
          >
            <Text style={styles.buttonText}>Choose Video</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, { backgroundColor: '#3478f6' }]} onPress={addExercise}>
          <Text style={styles.buttonText}>Upload Exercise</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#069ed3',
  },
  headerText: {
    color: 'black',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'outfit_regular',
  },
  content: {
    padding: 15,
  },
  addAdminContainer: {
    borderTopWidth: 1,
    borderTopColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#0f0f0f',
    margin: 20,
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
    marginTop: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#5cda56',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'outfit_bold',
  },
  registerDoctorBtn: {
    backgroundColor: '#5cda56',
    paddingVertical: 14,
    marginTop: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'outfit_bold',
    fontSize: 28,
    textAlign: 'center',
    marginTop: 20,
  },
  adminListContainer: {
    marginHorizontal: 15,
  },
  adminItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminName: {
    fontFamily: 'outfit_regular',
    fontSize: 18,
  },
  removeButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    paddingHorizontal:40,
    borderRadius: 5,
  },
  removeText: {
    color: '#fff',
    fontFamily: 'outfit_regular',
    fontSize: 16,
  },
});
