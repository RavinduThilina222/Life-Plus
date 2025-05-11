import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { db } from '../../configs/firebaseConfig';

export default function PatientWorkout() {
  const { workoutid, patientid } = useLocalSearchParams(); // Ensure `patientid` is passed as well
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutDetails();
  }, []);

  const fetchWorkoutDetails = async () => {
    try {
      const q = query(
        collection(db, 'Patient_Table'),
        where('user_id', '==', patientid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('No patient found.');
        return;
      }

      const patientData = snapshot.docs[0].data();
      const workouts = patientData.workouts || [];
      const watched = patientData.watchedExercise || [];

      // Find the workout by ID
      const workout = workouts.find((w) => w.id === workoutid);

      if (!workout) {
        console.log('Workout not found.');
        return;
      }

      const enrichedExercises = workout.exercises.map((exercise) => {
        const watchedEntry = watched.find(
          (entry) =>
            entry.exercise_id === exercise.id && entry.workout_id === workoutid
        );

        return {
          ...exercise,
          watched: !!watchedEntry,
        };
      });

      setExercises(enrichedExercises);
    } catch (err) {
      console.error('Error fetching workout details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
        Workout Exercises
      </Text>
      {exercises.map((exercise, index) => (
        <View
          key={index}
          style={{
            backgroundColor: '#fff',
            padding: 15,
            marginBottom: 10,
            borderRadius: 10,
            borderLeftWidth: 6,
            borderLeftColor: exercise.watched ? 'green' : 'gray',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            {exercise.video_name}
          </Text>
          <Text style={{ color: 'gray', marginTop: 4 }}>
            Status: {exercise.watched ? 'Watched ✅' : 'Not Watched ❌'}
          </Text>
        </View>
      ))}
    </View>
  );
}
