import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../configs/firebaseConfig';

const PatientDashboard = () => {
    const { patientid } = useLocalSearchParams();

    const [Patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

     const router = useRouter();

    useEffect(() => {
        fetchPatient();
      }, [patientid]);


      const fetchPatient = async () => {
        try {
          const q = query(
            collection(db, 'Patient_Table'),
            where('user_id', '==', patientid) // Match patientid with user_id
          );
          const querySnapshot = await getDocs(q);
    
          if (!querySnapshot.empty) {
            const patientData = querySnapshot.docs[0].data(); // Assuming only one match
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Patient Dashboard</Text>
      </View>

      <Text style={{fontSize:24,fontWeight:'bold',fontFamily:'outfit_regular', margin:20}}> Welcome ! {Patient?.name} </Text>
      
      <View style={styles.subContainer}>
        <Text style={styles.subContainerText}>Date you visited your therapist</Text>
        <Text style={styles.subContainerText2}>12th May 2025</Text>

        <Text style={styles.subContainerText}>Next Appointment</Text>
        <Text style={styles.subContainerText2}>Second Week of June</Text>

        <TouchableOpacity style={styles.button}
        onPress={()=> {
            router.push({
                pathname: '/patient/bookAppointment',
                params: { patientid: patientid }
            });
        }}>
            <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
        
      </View>

      <View style={{
        backgroundColor: '#f5f5f5',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        padding:20,
        paddingBottom:0,
        margin:20,
        height:150,
        borderRadius:20,
      }}>
        <View style={styles.metricContainer}>
            <Text style={{fontWeight:'bold',fontSize:13}}>Body Temperature</Text>
            <Text style={{fontSize:16}}>98.4 F</Text>
        </View>
        <View style={styles.metricContainer}>
            <Text style={{fontWeight:'bold',fontSize:13}}>Blood Pressure</Text>
            <Text style={{fontSize:16}}>120/80 mmHg</Text>
        </View>
        <View style={styles.metricContainer}>
            <Text style={{fontWeight:'bold',fontSize:13}}>Blood Sugar</Text>
            <Text style={{fontSize:16}}>98.4 F</Text>
        </View>

      </View>

      <View style={{margin:20}}>
      <TouchableOpacity style={styles.button} 
      onPress={()=> {
            router.push({
                pathname: '/patient/ViewExercises',
                params: { patientid: patientid }
            });
        }}>
        <Text style={styles.buttonText}>Let's Do Your Exercise</Text>
      </TouchableOpacity>
      </View>

      <View style={{
        padding:20,
        backgroundColor:'#6cb3e6',
        borderRadius:20,
        margin:20,
        elevation:5,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.75,
        shadowRadius: 4.84,
        flexDirection:'column',
        height:100,
      }}>
        <Text style={{fontSize:16}}>Drink 3 - 4 litres of water daily</Text>
        <Text style={{fontSize:16}}>Start your day with glass of water</Text>
      </View>

      
      
    </View>
  )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#b7d7f7',
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
      subContainer:{
        padding:20,
        backgroundColor:'#6cb3e6',
        borderRadius:20,
        margin:20,
        elevation:5,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.75,
        shadowRadius: 4.84,
        flexDirection:'column',
        height:210,
      },
      subContainerText:{
        marginBottom:5,
        fontSize:18,
        fontWeight:'500',
        color:'black',
      },
        subContainerText2:{
            marginBottom:5,
            marginHorizontal:15,
            fontSize:16,
            fontWeight:'400',
            color:'black',
        },
      button: {
        backgroundColor: '#1471f5',
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
        alignItems: 'center',
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
      metricContainer:{
        backgroundColor: '#6cb3e6',
        padding: 5,
        borderRadius: 20,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#069ed3',
        borderWidth: 1,
        gap: 5,
      }
})


export default PatientDashboard