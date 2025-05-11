import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { db } from '../../configs/firebaseConfig';

const PatientDetails = () => {
  const { patientid, doctorid } = useLocalSearchParams();
  const [patientData, setPatientData] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [prescription, setPrescription] = useState('');
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [vitals, setVitals] = useState({ blood_pressure: '', blood_sugar: '', body_temperature: '' });
  const [vitalsDocId, setVitalsDocId] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [assignedExercises, setAssignedExercises] = useState([]);
  
  // New state variables for workout creation
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientQuery = query(
          collection(db, 'Patient_Table'),
          where('user_id', '==', patientid)
        );
        const patientSnapshot = await getDocs(patientQuery);
        if (!patientSnapshot.empty) {
          const patientDoc = patientSnapshot.docs[0];
          const patientDataFromDb = { id: patientDoc.id, ...patientDoc.data() };
          setPatientData(patientDataFromDb);
          if (patientDataFromDb.exercises) {
            setAssignedExercises(patientDataFromDb.exercises);
          }
          // Get workouts if they exist
          if (patientDataFromDb.workouts) {
            setWorkouts(patientDataFromDb.workouts);
          }
        }

        const doctorQuery = query(
          collection(db, 'Doctor_Table'),
          where('user_id', '==', doctorid)
        );
        const doctorSnapshot = await getDocs(doctorQuery);
        if (!doctorSnapshot.empty) {
          const doctorDoc = doctorSnapshot.docs[0];
          setDoctorName(doctorDoc.data().name);
        }

        await fetchPrescriptions();
        await fetchVitals();
        await fetchExercises();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [patientid, doctorid]);

  const fetchPrescriptions = async () => {
    const q = query(
      collection(db, 'Prescription_Table'),
      where('doctor_id', '==', doctorid),
      where('patient_id', '==', patientid)
    );
    const snapshot = await getDocs(q);
    const prescriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllPrescriptions(prescriptions);
  };

  const fetchVitals = async () => {
    const vitalsQuery = query(
      collection(db, 'Vitals_Table'),
      where('doctor_id', '==', doctorid),
      where('patient_id', '==', patientid)
    );
    const vitalsSnapshot = await getDocs(vitalsQuery);
    if (!vitalsSnapshot.empty) {
      const docRef = vitalsSnapshot.docs[0];
      setVitals(docRef.data());
      setVitalsDocId(docRef.id);
    } else {
      setVitals({ blood_pressure: '', blood_sugar: '', body_temperature: '' });
      setVitalsDocId(null);
    }
  };

  const handlePrintPrescription = async () => {
    try {
      // Show loading indicator
      Toast.show({ type: 'info', text1: 'Generating prescription PDF...' });

      // Prepare data to send to backend
      const data = {
        patientData,
        doctorName,
        prescriptions: allPrescriptions,
        vitals
      };
      
      const backendUrl = 'http://192.168.63.173:5000/generate-prescription-pdf';
      
      console.log("Sending request to:", backendUrl);
      
      // Call the backend to generate PDF
      const response = await axios.post(backendUrl, data);
      console.log("Response received:", response.status);
      
      const { base64Data } = response.data;
      
      // Make sure the directory exists
      const fileDir = FileSystem.documentDirectory;
      
      // Create a unique filename for the PDF
      const filename = `prescription_${patientData.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      const pdfFilePath = `${fileDir}${filename}`;
      
      console.log("Saving PDF to:", pdfFilePath);
      
      // Write the base64 data to a file
      await FileSystem.writeAsStringAsync(
        pdfFilePath,
        base64Data,
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      const fileInfo = await FileSystem.getInfoAsync(pdfFilePath);
      console.log("File exists:", fileInfo.exists, "Size:", fileInfo.size);
      
      if (fileInfo.exists) {
        // Different handling for iOS and Android
        if (Platform.OS === 'ios') {
          // Use sharing on iOS
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(pdfFilePath, {
              UTI: '.pdf',
              mimeType: 'application/pdf',
            });
            ToastAndroid.show('Prescription PDF generated', ToastAndroid.SHORT);
          } else {
            ToastAndroid.show('Sharing is not available on the device', ToastAndroid.SHORT);
          }
        } else {
          // On Android, open with system PDF viewer
          try {
            const contentUri = await FileSystem.getContentUriAsync(pdfFilePath);
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: contentUri,
              flags: 1,
              type: 'application/pdf',
            });
            ToastAndroid.show('PDF generated', ToastAndroid.SHORT);
          } catch (e) {
            console.error("Error opening PDF:", e);
            // Fallback to sharing if opening directly fails
            await Sharing.shareAsync(pdfFilePath, {
              mimeType: 'application/pdf',
            });
          }
        }
      } else {
        Toast.show({ type: 'error', text1: 'Could not save the PDF file' });
      }
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      ToastAndroid.show('PDF generation process failed', ToastAndroid.SHORT);
    }
  };

  const fetchExercises = async () => {
    const snapshot = await getDocs(collection(db, 'Exercise_Table'));
    const exercises = snapshot.docs.map(doc => ({
      id: doc.id,
      video_name: doc.data().video_name
    }));
    setAllExercises(exercises);
  };

  const handleAddPrescription = async () => {
    if (prescription.trim() === '') return;
    try {
      await addDoc(collection(db, 'Prescription_Table'), {
        doctor_id: doctorid,
        patient_id: patientid,
        prescription
      });
      ToastAndroid.show('Prescription Added', ToastAndroid.SHORT);
      setPrescription('');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  const handleDeletePrescription = async (id) => {
    try {
      await deleteDoc(doc(db, 'Prescription_Table', id));
      ToastAndroid.show('Prescription Deleted', ToastAndroid.SHORT);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleUpdateVitals = async () => {
    try {
      if (vitalsDocId) {
        await updateDoc(doc(db, 'Vitals_Table', vitalsDocId), vitals);
        ToastAndroid.show('Vitals Updated', ToastAndroid.SHORT);
      } else {
        const newDoc = await addDoc(collection(db, 'Vitals_Table'), {
          doctor_id: doctorid,
          patient_id: patientid,
          ...vitals
        });
        setVitalsDocId(newDoc.id);
        ToastAndroid.show('Vitals Added', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error updating vitals:', error);
    }
  };

  const handleAssignExercise = () => {
    const selected = allExercises.find((e) => e.id === selectedExerciseId);
    if (selected && !assignedExercises.some((ex) => ex.id === selected.id)) {
      setAssignedExercises([...assignedExercises, selected]);
    }
  };

  const handleRemoveExercise = (id) => {
    setAssignedExercises(assignedExercises.filter((ex) => ex.id !== id));
  };

  const handleUpdateExercises = async () => {
    try {
      const q = query(
        collection(db, 'Patient_Table'),
        where('user_id', '==', patientid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;

        await updateDoc(docRef, {
          exercises: assignedExercises
        });

        ToastAndroid.show('Exercises updated', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Error updating exercises', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error updating exercises:', error);
    }
  };

  // New functions for workout creation
  const handleAddExerciseToWorkout = () => {
    const selected = allExercises.find((e) => e.id === selectedExerciseId);
    if (selected && !workoutExercises.some((ex) => ex.id === selected.id)) {
      setWorkoutExercises([...workoutExercises, selected]);
    }
  };

  const handleRemoveExerciseFromWorkout = (id) => {
    setWorkoutExercises(workoutExercises.filter((ex) => ex.id !== id));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || workoutDate;
    setShowDatePicker(Platform.OS === 'ios');
    setWorkoutDate(currentDate);
  };

  const handleCreateWorkout = () => {
    if (workoutTitle.trim() === '' || workoutExercises.length === 0) {
      ToastAndroid.show('Please enter workout title and add exercises', ToastAndroid.SHORT);
      return;
    }

    const newWorkout = {
      id: Date.now().toString(), // Generate a unique ID
      title: workoutTitle,
      exercises: workoutExercises,
      date: workoutDate.toISOString().split('T')[0] // Format date as YYYY-MM-DD
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    
    // Reset form
    setWorkoutTitle('');
    setWorkoutExercises([]);
    setWorkoutDate(new Date());
    
    ToastAndroid.show('Workout added to the list', ToastAndroid.SHORT);
  };

  const handleUpdateWorkouts = async () => {
    try {
      const q = query(
        collection(db, 'Patient_Table'),
        where('user_id', '==', patientid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;

        await updateDoc(docRef, {
          workouts: workouts
        });

        ToastAndroid.show('Workouts updated', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Error updating workouts', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error updating workouts:', error);
    }
  };

  const handleDeleteWorkout = (id) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
    ToastAndroid.show('Workout removed from the list', ToastAndroid.SHORT);
  };

  const handleOpenWorkout = (id) => {
      router.push({
          pathname: `doctor/patient_workout?workoutid=${id}&patientid=${patientid}`})
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20, backgroundColor: '#2384f1', flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontSize: 24, fontWeight: '500', fontFamily: 'outfit_regular' }}>
          Patient Record
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {patientData && (
          <View style={{ marginBottom: 20, backgroundColor: '#e0f7fa', padding: 15, borderRadius: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, fontFamily: 'outfit_regular' }}>
              Details
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 5, fontFamily: 'outfit_regular' }}>
              Name: {patientData.name}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 5, fontFamily: 'outfit_regular' }}>
              Age: {patientData.age}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 5, fontFamily: 'outfit_regular' }}>
              Injury/Disease: {patientData.purpose}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 5, fontFamily: 'outfit_regular' }}>
              Doctor: {doctorName}
            </Text>
          </View>
        )}

        {/* New Prescription */}
        <View style={{ marginBottom: 20, backgroundColor: '#e0f7fa', padding: 15, borderRadius: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, fontFamily: 'outfit_regular' }}>
            New Prescription
          </Text>
          <TextInput
            style={{ 
              backgroundColor: '#ffffff', 
              padding: 10, 
              borderRadius: 10, 
              fontSize: 16, 
              height: 100, 
              marginBottom: 10, 
              fontFamily: 'outfit_regular'
            }}
            multiline
            value={prescription}
            onChangeText={setPrescription}
            placeholder="Enter new prescription..."
          />
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#5cda56', 
              paddingVertical: 14, 
              borderRadius: 30, 
              alignItems: 'center', 
              marginTop: 10 
            }} 
            onPress={handleAddPrescription}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'outfit_bold' }}>
              Add Prescription
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              backgroundColor: '#2384f1',
              paddingVertical: 14,
              borderRadius: 30,
              alignItems: 'center',
              marginTop: 10
            }} 
            onPress={handlePrintPrescription}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'outfit_bold' }}>
              Print Prescription
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prescriptions List */}
        <View style={{ marginBottom: 20, backgroundColor: '#e0f7fa', padding: 15, borderRadius: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, fontFamily: 'outfit_regular' }}>
            Current Prescriptions
          </Text>
          {allPrescriptions.map((item) => (
            <View 
              key={item.id} 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                backgroundColor: '#fff', 
                padding: 10, 
                borderRadius: 8, 
                marginBottom: 8, 
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 16, fontFamily: 'outfit_regular' }}>{item.prescription}</Text>
              <TouchableOpacity onPress={() => handleDeletePrescription(item.id)}>
                <Ionicons name="remove-circle-sharp" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Vitals Section */}
        <View style={{ marginBottom: 20, backgroundColor: '#e0f7fa', padding: 15, borderRadius: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, fontFamily: 'outfit_regular' }}>
            Vitals
          </Text>
          {['Blood Pressure', 'Blood Sugar', 'Body Temperature'].map((label, i) => {
            const key = ['blood_pressure', 'blood_sugar', 'body_temperature'][i];
            return (
              <View key={key}>
                <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10, fontFamily: 'outfit_regular' }}>
                  {label}
                </Text>
                <TextInput
                  style={{ backgroundColor: '#ffffff', padding: 10, borderRadius: 10, fontSize: 16, marginBottom: 10, fontFamily: 'outfit_regular' }}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={vitals[key]}
                  onChangeText={(text) => setVitals({ ...vitals, [key]: text })}
                />
              </View>
            );
          })}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#5cda56', 
              paddingVertical: 14, 
              borderRadius: 30, 
              alignItems: 'center', 
              marginTop: 10
            }} 
            onPress={handleUpdateVitals}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'outfit_bold' }}>
              Update Vitals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Workout Section */}
        <View style={{ marginBottom: 20, backgroundColor: '#e0f7fa', padding: 15, borderRadius: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, fontFamily: 'outfit_regular' }}>
            Create Workout
          </Text>
          
          {/* Workout Title */}
          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10, fontFamily: 'outfit_regular' }}>
            Workout Title
          </Text>
          <TextInput
            style={{ backgroundColor: '#ffffff', padding: 10, borderRadius: 10, fontSize: 16, marginBottom: 10, fontFamily: 'outfit_regular' }}
            placeholder="Enter workout title"
            value={workoutTitle}
            onChangeText={setWorkoutTitle}
          />
          
          {/* Date Selection */}
          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10, fontFamily: 'outfit_regular' }}>
            Date: {workoutDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#2384f1', 
              paddingVertical: 10, 
              borderRadius: 30, 
              alignItems: 'center', 
              marginBottom: 15 
            }}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'outfit_bold' }}>
              Select Date
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={workoutDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          
          {/* Exercise Selection */}
          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10, fontFamily: 'outfit_regular' }}>
            Add Exercises to Workout
          </Text>
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            paddingBottom: 2,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            marginBottom: 10
          }}>
            <Picker
              selectedValue={selectedExerciseId}
              onValueChange={(itemValue) => setSelectedExerciseId(itemValue)}
              style={{
                height: 60,
                color: '#000',
              }}
              dropdownIconColor="#003066"
            >
              <Picker.Item label="-- Select Exercise --" value="" color="#999" />
              {allExercises.map((exercise) => (
                <Picker.Item
                  key={exercise.id}
                  label={exercise.video_name}
                  value={exercise.id}
                  color="#000"
                />
              ))}
            </Picker>
          </View>
          
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#5cda56', 
              paddingVertical: 10, 
              borderRadius: 30, 
              alignItems: 'center', 
              marginBottom: 15 
            }}
            onPress={handleAddExerciseToWorkout}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'outfit_bold' }}>
              Add Exercise to Workout
            </Text>
          </TouchableOpacity>
          
          {/* Display selected exercises for this workout */}
          <Text style={{ fontSize: 16, marginBottom: 5, marginTop: 10, fontFamily: 'outfit_regular' }}>
            Selected Exercises for Workout:
          </Text>
          {workoutExercises.length === 0 ? (
            <Text style={{ fontSize: 14, fontStyle: 'italic', marginBottom: 10, fontFamily: 'outfit_regular' }}>
              No exercises selected yet
            </Text>
          ) : (
            workoutExercises.map((exercise) => (
              <View 
                key={exercise.id} 
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  backgroundColor: '#fff', 
                  padding: 10, 
                  borderRadius: 8, 
                  marginBottom: 8, 
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 16, fontFamily: 'outfit_regular' }}>{exercise.video_name}</Text>
                <TouchableOpacity onPress={() => handleRemoveExerciseFromWorkout(exercise.id)}>
                  <Ionicons name="remove-circle-sharp" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))
          )}
          
          {/* Create Workout Button */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#5cda56', 
              paddingVertical: 14, 
              borderRadius: 30, 
              alignItems: 'center', 
              marginTop: 15 
            }}
            onPress={handleCreateWorkout}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'outfit_bold' }}>
              Create Workout
            </Text>
          </TouchableOpacity>
          
          {/* Existing Workouts List */}
          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, fontFamily: 'outfit_regular' }}>
            Current Workouts
          </Text>
          {workouts.length === 0 ? (
            <Text style={{ fontSize: 14, fontStyle: 'italic', marginBottom: 10, fontFamily: 'outfit_regular' }}>
              No workouts created yet
            </Text>
          ) : (
            workouts.map((workout) => (
              <View 
                key={workout.id} 
                style={{ 
                  backgroundColor: '#fff', 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 10
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'outfit_regular' }}>
                    {workout.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteWorkout(workout.id)}>
                    <Ionicons name="trash-outline" size={22} color="red" />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'outfit_regular' }}>
                  Date: {workout.date}
                </Text>
                <Text style={{ fontSize: 14, marginBottom: 5, fontFamily: 'outfit_regular' }}>
                  Exercises ({workout.exercises.length}):
                </Text>
                {workout.exercises.map((exercise, index) => (
                  <Text key={index} style={{ fontSize: 14, marginLeft: 10, fontFamily: 'outfit_regular' }}>
                    • {exercise.video_name}
                  </Text>
                ))}
           <TouchableOpacity
              onPress={() => handleOpenWorkout(workout.id)}
              style={{
                 backgroundColor: '#2384f1',
                 paddingVertical: 8,
                 paddingHorizontal: 16,
                 borderRadius: 10,
                 marginTop: 10,
                 alignItems: 'center',
                  }}>
            <Text style={{ color: 'white', fontSize: 14, fontFamily: 'outfit_regular', fontWeight: '500' }}> View Progress </Text>
           </TouchableOpacity>
          </View>
            ))
          )}
          
          {/* Update Workouts Button */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#2384f1', 
              paddingVertical: 14, 
              borderRadius: 30, 
              alignItems: 'center', 
              marginTop: 15 
            }}
            onPress={handleUpdateWorkouts}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'outfit_bold' }}>
              Update Workouts
            </Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </ScrollView>
  );
};

export default PatientDetails;