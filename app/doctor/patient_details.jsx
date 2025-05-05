// import { useLocalSearchParams } from 'expo-router';
// import {
//   addDoc,
//   collection,
//   deleteDoc,
//   doc,
//   getDocs,
//   query,
//   updateDoc,
//   where
// } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import Toast from 'react-native-toast-message';
// import { db } from '../../configs/firebaseConfig';

// const PatientDetails = () => {
//   const { patientid, doctorid } = useLocalSearchParams();

//   const [patientData, setPatientData] = useState(null);
//   const [doctorName, setDoctorName] = useState('');
//   const [prescription, setPrescription] = useState('');
//   const [allPrescriptions, setAllPrescriptions] = useState([]);
//   const [vitals, setVitals] = useState({
//     blood_pressure: '',
//     blood_sugar: '',
//     body_temperature: ''
//   });
//   const [vitalsDocId, setVitalsDocId] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch patient data
//         const patientQuery = query(
//           collection(db, 'Patient_Table'),
//           where('user_id', '==', patientid)
//         );
//         const patientSnapshot = await getDocs(patientQuery);
//         if (!patientSnapshot.empty) {
//           const patientDoc = patientSnapshot.docs[0];
//           setPatientData(patientDoc.data());
//         }

//         // Fetch doctor name
//         const doctorQuery = query(
//           collection(db, 'Doctor_Table'),
//           where('user_id', '==', doctorid)
//         );
//         const doctorSnapshot = await getDocs(doctorQuery);
//         if (!doctorSnapshot.empty) {
//           const doctorDoc = doctorSnapshot.docs[0];
//           setDoctorName(doctorDoc.data().name);
//         }

//         await fetchPrescriptions();
//         await fetchVitals(); // <-- fetch vitals here
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, [patientid, doctorid]);

//   const fetchPrescriptions = async () => {
//     const q = query(
//       collection(db, 'Prescription_Table'),
//       where('doctor_id', '==', doctorid),
//       where('patient_id', '==', patientid)
//     );
//     const snapshot = await getDocs(q);
//     const prescriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     setAllPrescriptions(prescriptions);
//   };

//   const fetchVitals = async () => {
//     const vitalsQuery = query(
//       collection(db, 'Vitals_Table'),
//       where('doctor_id', '==', doctorid),
//       where('patient_id', '==', patientid)
//     );
//     const vitalsSnapshot = await getDocs(vitalsQuery);
//     if (!vitalsSnapshot.empty) {
//       const docRef = vitalsSnapshot.docs[0];
//       setVitals(docRef.data());
//       setVitalsDocId(docRef.id);
//     } else {
//       setVitals({
//         blood_pressure: '',
//         blood_sugar: '',
//         body_temperature: ''
//       });
//       setVitalsDocId(null);
//     }
//   };

//   const handleAddPrescription = async () => {
//     try {
//       if (prescription.trim() === '') return;
//       await addDoc(collection(db, 'Prescription_Table'), {
//         doctor_id: doctorid,
//         patient_id: patientid,
//         prescription
//       });
//       Toast.show({ type: 'success', text1: 'Prescription added' });
//       setPrescription('');
//       fetchPrescriptions();
//     } catch (error) {
//       console.error('Error adding prescription:', error);
//     }
//   };

//   const handleDeletePrescription = async (id) => {
//     try {
//       await deleteDoc(doc(db, 'Prescription_Table', id));
//       Toast.show({ type: 'success', text1: 'Prescription deleted' });
//       fetchPrescriptions();
//     } catch (error) {
//       console.error('Error deleting prescription:', error);
//     }
//   };

//   const handleUpdateVitals = async () => {
//     try {
//       if (vitalsDocId) {
//         // Update existing vitals
//         const vitalsRef = doc(db, 'Vitals_Table', vitalsDocId);
//         await updateDoc(vitalsRef, {
//           blood_pressure: vitals.blood_pressure,
//           blood_sugar: vitals.blood_sugar,
//           body_temperature: vitals.body_temperature
//         });
//         Toast.show({ type: 'success', text1: 'Vitals updated' });
//       } else {
//         // Add new vitals
//         const newDoc = await addDoc(collection(db, 'Vitals_Table'), {
//           doctor_id: doctorid,
//           patient_id: patientid,
//           blood_pressure: vitals.blood_pressure,
//           blood_sugar: vitals.blood_sugar,
//           body_temperature: vitals.body_temperature
//         });
//         setVitalsDocId(newDoc.id);
//         Toast.show({ type: 'success', text1: 'Vitals added' });
//       }
//     } catch (error) {
//       console.error('Error updating vitals:', error);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Patient Record</Text>
//       </View>

//       <View style={styles.content}>
//         {patientData && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Details</Text>
//             <Text style={styles.detailText}>Name: {patientData.name}</Text>
//             <Text style={styles.detailText}>Age: {patientData.age}</Text>
//             <Text style={styles.detailText}>Injury/Disease: {patientData.purpose}</Text>
//             <Text style={styles.detailText}>Doctor: {doctorName}</Text>
//           </View>
//         )}

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>New Prescription</Text>
//           <TextInput
//             style={[styles.input, { height: 100 }]}
//             multiline
//             value={prescription}
//             onChangeText={setPrescription}
//             placeholder="Enter new prescription..."
//           />
//           <TouchableOpacity style={styles.registerButton} onPress={handleAddPrescription}>
//             <Text style={styles.buttonText}>Add Prescription</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Current Prescriptions</Text>
//           {allPrescriptions.map((item) => (
//             <View key={item.id} style={styles.prescriptionItem}>
//               <Text style={styles.detailText}>{item.prescription}</Text>
//               <TouchableOpacity
//                 style={styles.deleteButton}
//                 onPress={() => handleDeletePrescription(item.id)}
//               >
//                 <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Vitals</Text>

//           <View style={styles.section}>

//   <Text style={styles.inputLabel}>Blood Pressure</Text>
//   <TextInput
//     style={styles.input}
//     placeholder="e.g. 120/80"
//     value={vitals.blood_pressure}
//     onChangeText={(text) => setVitals({ ...vitals, blood_pressure: text })}
//   />

//   <Text style={styles.inputLabel}>Blood Sugar</Text>
//   <TextInput
//     style={styles.input}
//     placeholder="e.g. 90 mg/dL"
//     value={vitals.blood_sugar}
//     onChangeText={(text) => setVitals({ ...vitals, blood_sugar: text })}
//   />

//   <Text style={styles.inputLabel}>Body Temperature</Text>
//   <TextInput
//     style={styles.input}
//     placeholder="e.g. 98.6°F"
//     value={vitals.body_temperature}
//     onChangeText={(text) => setVitals({ ...vitals, body_temperature: text })}
//   />

//   <TouchableOpacity style={styles.registerButton} onPress={handleUpdateVitals}>
//     <Text style={styles.buttonText}>Update Vitals</Text>
//   </TouchableOpacity>
// </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   header: { padding: 20, backgroundColor: '#069ed3' },
//   headerText: {
//     color: 'black',
//     fontSize: 24,
//     fontWeight: '500',
//     fontFamily: 'outfit_regular'
//   },
//   content: { padding: 20 },
//   section: {
//     marginBottom: 20,
//     backgroundColor: '#e0f7fa',
//     padding: 15,
//     borderRadius: 10
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//     fontFamily: 'outfit_regular'
//   },
//   detailText: {
//     fontSize: 16,
//     marginBottom: 5,
//     fontFamily: 'outfit_regular'
//   },
//   inputLabel: {
//     fontSize: 16,
//     marginBottom: 5,
//     marginTop: 10,
//     fontFamily: 'outfit_regular'
//   },
//   input: {
//     backgroundColor: '#ffffff',
//     padding: 10,
//     borderRadius: 10,
//     fontSize: 16,
//     marginBottom: 10,
//     fontFamily: 'outfit_regular'
//   },
//   registerButton: {
//     backgroundColor: '#5cda56',
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//     marginTop: 10
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     fontFamily: 'outfit_regular'
//   },
//   prescriptionItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 8,
//     alignItems: 'center'
//   },
//   deleteButton: {
//     backgroundColor: '#ff5c5c',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 5
//   }
// });

// export default PatientDetails;

import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { db } from '../../configs/firebaseConfig';

const PatientDetails = () => {
  const { patientid, doctorid } = useLocalSearchParams();

  const [patientData, setPatientData] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [prescription, setPrescription] = useState('');
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [vitals, setVitals] = useState({
    blood_pressure: '',
    blood_sugar: '',
    body_temperature: ''
  });
  const [vitalsDocId, setVitalsDocId] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [assignedExercises, setAssignedExercises] = useState([]);

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
          setPatientData({ id: patientDoc.id, ...patientDoc.data() });

          // Load previously assigned exercises
          if (patientDoc.data().exercises) {
            setAssignedExercises(patientDoc.data().exercises);
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
      Toast.show({ type: 'success', text1: 'Prescription added' });
      setPrescription('');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  const handleDeletePrescription = async (id) => {
    try {
      await deleteDoc(doc(db, 'Prescription_Table', id));
      Toast.show({ type: 'success', text1: 'Prescription deleted' });
      fetchPrescriptions();
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleUpdateVitals = async () => {
    try {
      if (vitalsDocId) {
        await updateDoc(doc(db, 'Vitals_Table', vitalsDocId), vitals);
        Toast.show({ type: 'success', text1: 'Vitals updated' });
      } else {
        const newDoc = await addDoc(collection(db, 'Vitals_Table'), {
          doctor_id: doctorid,
          patient_id: patientid,
          ...vitals
        });
        setVitalsDocId(newDoc.id);
        Toast.show({ type: 'success', text1: 'Vitals added' });
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
  
        Toast.show({ type: 'success', text1: 'Exercises updated' });
      } else {
        Toast.show({ type: 'error', text1: 'Patient not found' });
      }
    } catch (error) {
      console.error('Error updating exercises:', error);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Patient Record</Text>
      </View>

      <View style={styles.content}>
        {patientData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.detailText}>Name: {patientData.name}</Text>
            <Text style={styles.detailText}>Age: {patientData.age}</Text>
            <Text style={styles.detailText}>Injury/Disease: {patientData.purpose}</Text>
            <Text style={styles.detailText}>Doctor: {doctorName}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Prescription</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            value={prescription}
            onChangeText={setPrescription}
            placeholder="Enter new prescription..."
          />
          <TouchableOpacity style={styles.registerButton} onPress={handleAddPrescription}>
            <Text style={styles.buttonText}>Add Prescription</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Prescriptions</Text>
          {allPrescriptions.map((item) => (
            <View key={item.id} style={styles.prescriptionItem}>
              <Text style={styles.detailText}>{item.prescription}</Text>
              <TouchableOpacity onPress={() => handleDeletePrescription(item.id)}>
                <Ionicons name="remove-circle-sharp" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vitals</Text>

          <Text style={styles.inputLabel}>Blood Pressure</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 120/80"
            value={vitals.blood_pressure}
            onChangeText={(text) => setVitals({ ...vitals, blood_pressure: text })}
          />

          <Text style={styles.inputLabel}>Blood Sugar</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 90 mg/dL"
            value={vitals.blood_sugar}
            onChangeText={(text) => setVitals({ ...vitals, blood_sugar: text })}
          />

          <Text style={styles.inputLabel}>Body Temperature</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 98.6°F"
            value={vitals.body_temperature}
            onChangeText={(text) => setVitals({ ...vitals, body_temperature: text })}
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleUpdateVitals}>
            <Text style={styles.buttonText}>Update Vitals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign Exercises</Text>

          <Text style={styles.inputLabel}>Select Exercise</Text>
          <Picker
            selectedValue={selectedExerciseId}
            onValueChange={(itemValue) => {
              setSelectedExerciseId(itemValue);
              handleAssignExercise();
            }}
            style={styles.input}
          >
            <Picker.Item label="-- Select Exercise --" value="" />
            {allExercises.map((exercise) => (
              <Picker.Item
                key={exercise.id}
                label={exercise.video_name}
                value={exercise.id}
              />
            ))}
          </Picker>

          {assignedExercises.map((exercise) => (
            <View key={exercise.id} style={styles.prescriptionItem}>
              <Text style={styles.detailText}>{exercise.video_name}</Text>
              <TouchableOpacity onPress={() => handleRemoveExercise(exercise.id)}>
                <Ionicons name="remove-circle-sharp" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.registerButton} onPress={handleUpdateExercises}>
            <Text style={styles.buttonText}>Update Exercises</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#069ed3', display:'flex', flexDirection:'row', gap:10 },
  headerText: {
    color: 'black',
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'outfit_regular'
  },
  content: { padding: 20 },
  section: {
    marginBottom: 20,
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'outfit_regular'
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'outfit_regular'
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    fontFamily: 'outfit_regular'
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'outfit_regular'
  },
  registerButton: {
    backgroundColor: '#5cda56',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'outfit_regular'
  },
  prescriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center'
  }
});

export default PatientDetails;

