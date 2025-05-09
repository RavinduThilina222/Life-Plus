import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../configs/firebaseConfig';

const bookAppointment = () => {
  const { patientid } = useLocalSearchParams();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [DateAndTime, setDateAndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Doctor_Table'));
      const doctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctors);
      console.log('Doctors:', doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const HandleAddAppointment = async () => {
    if (!selectedDocId || !selectedHospital) {
      alert('Please select a doctor and a hospital/clinic.');
      return;
    }

    try {
      await addDoc(collection(db, 'Appointment_Table'), {
        patient_id: patientid,
        doctor_id: selectedDocId,
        hospital: selectedHospital,
        date_time: DateAndTime.toISOString(),
      });
      alert('Appointment booked successfully!');
      router.push(`/patient/${patientid}`);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
 
  }
  

  const hospitals = ['City Hospital', 'Green Clinic', 'Sunrise Medical Centre', 'Carewell Hospital'];

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAndTime(prev => new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        prev.getHours(),
        prev.getMinutes()
      ));
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setDateAndTime(prev => new Date(
        prev.getFullYear(),
        prev.getMonth(),
        prev.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      ));
    }
    setShowTimePicker(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20, backgroundColor: '#2384f1', flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontSize: 20, fontWeight: '500', fontFamily: 'outfit_regular' }}>
          Make Your Appointment Here
        </Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>Select your Therapist</Text>
        <Picker
          selectedValue={selectedDocId}
          onValueChange={(itemValue) => setSelectedDocId(itemValue)}
          style={styles.picker}
          dropdownIconColor="#003066"
        >
          <Picker.Item label="-- Select Doctor --" value="" color="#999" />
          {doctors.length > 0 ? doctors.map((doctor) => (
            <Picker.Item
              key={doctor.id}
              label={doctor.name || "Unnamed Doctor"}
              value={doctor.id}
              color="#000"
            />
          )) : (
            <Picker.Item label="No doctors available" value="" color="#999" />
          )}
        </Picker>

        <Text style={styles.label}>Select the Hospital / Clinic</Text>
        <Picker
          selectedValue={selectedHospital}
          onValueChange={(itemValue) => setSelectedHospital(itemValue)}
          style={styles.picker}
          dropdownIconColor="#003066"
        >
          <Picker.Item label="-- Select Hospital/Clinic --" value="" color="#999" />
          {hospitals.map((hospital, index) => (
            <Picker.Item
              key={index}
              label={hospital}
              value={hospital}
              color="#000"
            />
          ))}
        </Picker>

        <Text style={styles.label}>Select the Date and Time</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.buttonText}>
            {`Select Date: ${DateAndTime.toLocaleDateString()}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.buttonText}>
            {`Select Time: ${DateAndTime.toLocaleTimeString()}`}
          </Text>
        </TouchableOpacity>

        {/* Date and Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={DateAndTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={DateAndTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
        {/* Book Appointment Button */}
        <TouchableOpacity style={styles.button} onPress={() => HandleAddAppointment()}>
          <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default bookAppointment;

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
  picker: {
    height: 60,
    color: '#000',
    margin: 20,
    marginTop: 0,
    fontFamily: 'outfit_regular',
    borderRadius: 15,
    borderWidth: 2,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2384f1',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    margin: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'outfit_bold',
  },
});
