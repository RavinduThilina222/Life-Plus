import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../configs/firebaseConfig';


const ViewExercises = () => {
  const router = useRouter()
  const { patientid } = useLocalSearchParams()
  const [patient, setPatient] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [watchedExercise, setWatchedExercise] = useState([]);


  useEffect(() => {
    fetchPatient()
  }
  , []);

  useEffect(() => {
    fetchExcercises()
  }, [workouts]); // Fetch exercises when workouts change


const fetchPatient = async () => {
  try {
    const q = query(
      collection(db, 'Patient_Table'),
      where('user_id', '==', patientid)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const patientData = querySnapshot.docs[0].data(); // Get the first matching document
      setPatient(patientData);
      setWorkouts(patientData.workouts); // Set workouts if available
      console.log('Patient:', patientData);
      console.log('Workouts: ',workouts);
    } else {
      console.log('No such document!');
    }
  } catch (error) {
    console.log('Error getting document:', error);
  }
};

const fetchExcercises = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find today's workout
    const todayWorkout = workouts.find(workout => workout.date === today);

    if (!todayWorkout) {
      console.log('No workout scheduled for today.');
      return;
    }

    const todayExercises = todayWorkout.exercises;
    console.log("Today's Exercises:", todayExercises);

    const exercisePromises = todayExercises.map(async (exercise) => {
      const docRef = doc(db, 'Exercise_Table', exercise.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log(`No exercise found for ID: ${exercise.id}`);
        return null;
      }
    });

    const exerciseDetails = await Promise.all(exercisePromises);
    const validExercises = exerciseDetails.filter(ex => ex !== null);

    console.log('Exercise Details:', validExercises);
    setExercises(validExercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
  }
};

const handleVideoPress = async (videoUrl, videoName) => {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const time = now.toTimeString().split(' ')[0]; // Get current time in HH:MM:SS format

    // Query the Patient_Table to find the document with the matching user_id
    const q = query(
      collection(db, 'Patient_Table'),
      where('user_id', '==', patientid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No patient found with the given patientid:', patientid);
      return;
    }

    // Get the document reference for the first matching document
    const patientDocRef = querySnapshot.docs[0].ref;

    // Get the current patient data
    const patientData = querySnapshot.docs[0].data();
    const currentWatchedExercises = patientData.watchedExercise || [];

    // Check if the video is already marked as watched using video_url
    const isAlreadyWatched = currentWatchedExercises.some(
      (entry) => entry.videoUrl === videoUrl
    );

    if (isAlreadyWatched) {
      console.log(`Video ${videoUrl} is already marked as watched.`);
      return;
    }

    // Update the watchedExercise field in the Patient_Table
    await updateDoc(patientDocRef, {
      watchedExercise: arrayUnion({ videoUrl, videoName, date, time }), // Add videoUrl, videoName, date, and time
    });

    console.log(`Video ${videoUrl} marked as watched on ${date} at ${time}.`);

    // Update the watchedExercise state locally
    setWatchedExercise((prev) => [...prev, { videoUrl, videoName, date, time }]);

    // Navigate to the VideoPlayer component
    router.push({
      pathname: '/patient/VideoPlayer',
      params: { videoUrl, videoName },
    });
  } catch (error) {
    console.error('Error updating watchedExercise:', error);
  }
};




  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <View style={{ padding: 20, backgroundColor: '#2384f1', flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back-circle" size={24} color="black" />
            </TouchableOpacity>
            <Text style={{ color: 'black', fontSize: 20, fontWeight: '500', fontFamily: 'outfit_regular' }}>
              Exercises
            </Text>
          </View>
      <View style={styles.container}>
        <Text style={styles.label}>Today's Exercises</Text>
        {exercises.map((exercise, index) => {
  console.log('Exercise:', exercise);
  return (
    <TouchableOpacity
      key={index}
      style={styles.exerciseVideoContainer}
      onPress={() =>
        handleVideoPress(
          exercise.video_url,
          exercise.video_name || `Exercise ${index + 1}`
        )
      }
    >
      <Text style={{ fontFamily: 'outfit_regular', fontSize: 16 }}>
        {exercise.video_name || `Exercise ${index + 1}`}
      </Text>
    </TouchableOpacity>
  );
})}


      </View>
    </View>
  )
}

export default ViewExercises

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b7d7f7',
  },
  label: {
    fontFamily: 'outfit_regular',
    margin: 20,
    fontSize: 20,
  },
  videoContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 20,
  },
  exerciseVideoContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 20,
  },
  video: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  
})
