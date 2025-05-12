import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../configs/firebaseConfig';


// ... keep your imports and setup unchanged

const PatientDashboard = () => {
  const { patientid } = useLocalSearchParams();

  const [Patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (patientid) {
      fetchPatient();
      fetchVitals();
      requestNotificationPermission();
    }
  }, [patientid]);

  const fetchPatient = async () => {
    try {
      const q = query(
        collection(db, 'Patient_Table'),
        where('user_id', '==', patientid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const patientData = querySnapshot.docs[0].data();
        console.log('Patient data:', patientData);
        setPatient(patientData);
      } else {
        console.error('No such patient found!');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVitals = async () => {
    try {
      const q = query(
        collection(db, 'Vitals_Table'),
        where('patient_id', '==', patientid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const vitalsData = querySnapshot.docs[0].data();
        console.log('Vital data:', vitalsData);
        setVitals(vitalsData);
      } else {
        console.error('No such patient found!');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (Patient?.workouts) {
      scheduleWorkoutNotifications(Patient.workouts);
    }
  }, [Patient]);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permission not granted');
    }
  };

  const scheduleWorkoutNotifications = async (workouts) => {
    for (const workout of workouts) {
      if (workout.date) {
        const [year, month, day] = workout.date.split('-').map(Number);
        const workoutDate = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
  
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Workout Reminder',
            body: `You have "${workout.title || 'a workout'}" scheduled today at 9:30 AM`,
            sound: 'default',
          },
          trigger: workoutDate,
        });
      }
    }
  };
  
  
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Patient Dashboard</Text>
      </View>
      <Text style={styles.welcomeText}>Welcome! {Patient?.name}</Text>
      <Text style={styles.idText}>
        Your ID is {Patient?.user_id}
      </Text>
      <View style={styles.subContainer}>
        <Text style={styles.subContainerText}>Date you visited your therapist</Text>
        <Text style={styles.subContainerText2}>12th May 2025</Text>
        <Text style={styles.subContainerText}>Next Appointment</Text>
        <Text style={styles.subContainerText2}>Second Week of June</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push({
              pathname: '/patient/bookAppointment',
              params: { patientid: patientid },
            });
          }}
        >
          <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
      {/* Vitals Section */}
      <View style={styles.vitalsContainer}>
        <View style={styles.metricContainer}>
          <Text style={styles.metricTitle}>Body Temperature</Text>
          <Text style={styles.metricValue}>
            {vitals ? `${vitals.body_temperature} F` : 'Loading...'}
          </Text>
        </View>
        <View style={styles.metricContainer}>
          <Text style={styles.metricTitle}>Blood Pressure</Text>
          <Text style={styles.metricValue}>
            {vitals ? `${vitals.blood_pressure} mmHg` : 'Loading...'}
          </Text>
        </View>
        <View style={styles.metricContainer}>
          <Text style={styles.metricTitle}>Blood Sugar</Text>
          <Text style={styles.metricValue}>
            {vitals ? `${vitals.blood_sugar} mg/dL` : 'Loading...'}
          </Text>
        </View>
      </View>

      <View style={{ margin: 20 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push({
              pathname: '/patient/ViewExercises',
              params: { patientid: patientid },
            });
          }}
        >
          <Text style={styles.buttonText}>Let's Do Your Exercise</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipText}>Drink 3 - 4 litres of water daily</Text>
        <Text style={styles.tipText}>Start your day with glass of water</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b7d7f7',
  },
  header: {
    padding: 20,
    backgroundColor:'#2384f1',
  },
  headerText: {
    color: 'black',
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'outfit_regular',
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'outfit_bold',
    color: '#003066',
    margin: 20,
  },
  idText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 20,
    fontFamily: 'outfit_bold',
  },
  subContainer: {
    paddingVertical: 20,
    paddingHorizontal:30,
    backgroundColor: '#bce5ff',
    borderRadius: 20,
    margin: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 4.84,
    flexDirection: 'column',

  },
  subContainerText: {
    marginBottom: 5,
    fontSize: 18,
    color: 'black',
    fontFamily: 'outfit_regular',
  },
  subContainerText2: {
    marginBottom: 5,
    marginHorizontal: 15,
    fontSize: 16,
    fontFamily: 'outfit_bold',
    color: 'black',
  },
  button: {
    backgroundColor: '#1471f5',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'outfit_bold',
  },
  vitalsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 20,
    gap: 15,
    flexDirection: 'column',
  },
  metricContainer: {
    padding: 10,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#daeefc',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  metricTitle: {
    fontFamily: 'outfit_bold',
    fontSize: 14,
    color: '#003066',
  },
  metricValue: {
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'outfit_regular',
  },
  tipBox: {
    padding: 20,
    backgroundColor: '#bce5ff',
    borderRadius: 20,
    margin: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 4.84,
    flexDirection: 'column',
    height: 100,
    justifyContent: 'center',
  },
  tipText: {
    fontSize: 16,
    color: '#003066',
    fontFamily: 'outfit_regular',
  },
});

export default PatientDashboard;
