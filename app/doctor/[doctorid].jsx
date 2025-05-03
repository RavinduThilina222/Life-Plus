import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../configs/firebaseConfig';

export default function DoctorPage() {
  const { doctorid } = useLocalSearchParams();
  const [doctorData, setDoctorData] = useState(null);
  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    try {
      const q = query(collection(db, 'Patient_Table'), where('created_by', '==', doctorid));
      const querySnapshot = await getDocs(q);
      const patientList = querySnapshot.docs.map(doc => doc.data());
      setPatients(patientList);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const q = query(collection(db, 'Doctor_Table'), where('user_id', '==', doctorid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setDoctorData(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };

    fetchDoctorData();
    fetchPatients();
  }, [doctorid]);


  useFocusEffect(
    React.useCallback(() => {
      fetchPatients();
    }, [doctorid])
  );

  const renderPatientCard = ({ item }) => (
    <View style={styles.patientCard}>
      <Text style={styles.patientText}>Patient ID: {item.user_id}</Text>
      <Text style={styles.patientText}>Name: {item.name}</Text>
      <TouchableOpacity style={styles.viewRecordButton}>
        <Text style={styles.viewRecordButtonText}>View Record</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Doctor Dashboard</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome Doctor!</Text>
        <Text style={styles.idText}>Your User ID: {doctorid}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Work Details</Text>
          {doctorData && (
            <>
              <Text style={styles.detailText}>
                Hospital: {doctorData.working_hospitals.join(', ')}
              </Text>
              <Text style={styles.detailText}>No. of patients: 10</Text>
              <Text style={styles.detailText}>Work duration: 9.00 AM to 5.00 PM</Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Patients</Text>
          <FlatList
            data={patients}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderPatientCard}
            scrollEnabled={false}
          />
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: `doctor/register_patient?doctorid=${doctorid}`,
              query: { doctorid },
            })
          }
          style={styles.registerButton}
        >
          <Text style={styles.buttonText}>Register Patient</Text>
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
    fontWeight: '500',
    fontFamily: 'outfit_regular'
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: 'outfit_bold',
    color: '#003066',
    marginBottom: 10,
  },
  idText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'outfit_bold'
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 10,
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
  patientCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  patientText: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'outfit_regular'
  },
  viewRecordButton: {
    backgroundColor: '#2384f1',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewRecordButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'outfit_regular'
  },
  registerButton: {
    backgroundColor: '#5cda56',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
     fontFamily: 'outfit_regular'
  },
});
