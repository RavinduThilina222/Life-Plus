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

    // Get today's workouts (can be multiple)
    const todayWorkouts = workouts.filter(workout => workout.date === today);

    if (todayWorkouts.length === 0) {
      console.log('No workouts scheduled for today.');
      return;
    }

    const allExercises = [];

    for (let workout of todayWorkouts) {
      for (let exercise of workout.exercises) {
        const docRef = doc(db, 'Exercise_Table', exercise.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Determine if the exercise is watched
          const isWatched = patient.watchedExercise?.some(
            (watched) =>
              watched.exercise_id === exercise.id &&
              watched.workout_id === workout.id &&
              watched.date === today
          );

          allExercises.push({
            ...data,
            video_name: exercise.video_name || data.video_name,
            id: exercise.id,
            workout_id: workout.id,
            watched: !!isWatched,
          });
        }
      }
    }

    setExercises(allExercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
  }
};

const handleVideoPress = async (videoUrl, videoName) => {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const q = query(
      collection(db, 'Patient_Table'),
      where('user_id', '==', patientid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No patient found with the given patientid:', patientid);
      return;
    }

    const patientDocRef = querySnapshot.docs[0].ref;
    const patientData = querySnapshot.docs[0].data();
    const currentWatchedExercises = patientData.watchedExercise || [];

    // Loop over workouts to find matching exercise
    let matchedWorkoutId = null;
    let matchedExerciseId = null;

    for (let workout of patientData.workouts || []) {
      for (let ex of workout.exercises || []) {
        if (ex.video_name === videoName || ex.video_url === videoUrl) {
          matchedWorkoutId = workout.id;
          matchedExerciseId = ex.id;
          break;
        }
      }
      if (matchedWorkoutId) break;
    }

    if (!matchedWorkoutId || !matchedExerciseId) {
      console.warn('Workout or exercise ID not found for the selected video.');
    }

    // Check if already watched
    const isAlreadyWatched = currentWatchedExercises.some(
      (entry) => entry.videoUrl === videoUrl
    );

    if (!isAlreadyWatched) {
      // Only update if not already watched
      await updateDoc(patientDocRef, {
        watchedExercise: arrayUnion({
          videoUrl,
          videoName,
          date,
          time,
          workout_id: matchedWorkoutId || 'unknown',
          exercise_id: matchedExerciseId || 'unknown',
        }),
      });

      console.log(`Marked watched: ${videoUrl} under workout ${matchedWorkoutId} and exercise ${matchedExerciseId}`);

      setWatchedExercise((prev) => [
        ...prev,
        { videoUrl, videoName, date, time, workout_id: matchedWorkoutId, exercise_id: matchedExerciseId },
      ]);
    } else {
      console.log(`Video ${videoUrl} already marked as watched.`);
    }

    // Navigate to video
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
        {exercises.map((exercise, index) => (
  <TouchableOpacity
    key={index}
    style={[
      styles.exerciseVideoContainer,
      {
        borderLeftWidth: 5,
        borderLeftColor: exercise.watched ? 'green' : 'gray',
      },
    ]}
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
    <Text style={{ color: 'gray',  fontFamily: 'outfit_regular' }}>
      {exercise.watched ? 'Watched ✅' : 'Not Watched ❌'}
    </Text>
  </TouchableOpacity>
))}



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
