import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function Tab() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Welcome to Midwives Care</Text>
                <Text style={styles.headerSubtitle}>Your trusted partners for maternal and infant health</Text>
            </View>

            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: 'https://sncs-prod-external.mayo.edu/-/media/national-files/images/hometown-health/2021/baby-laying-on-back-smiling.jpg?sc_lang=en&la=en&h=370&w=660&hash=50DF8BE03FA3BF2B4E1F844DDCE73B78' }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Why Choose Us?</Text>
                <Text style={styles.infoText}>
                    Our experienced team of midwives is dedicated to providing personalized care and support for mothers
                    and infants at every stage of the journey. We believe in compassionate care and are here to ensure
                    a healthy and safe experience for both you and your baby.
                </Text>
            </View>

            {/* Awareness Sessions Section */}
            <View style={styles.awarenessSection}>
                <Text style={styles.sectionTitle}>Awareness Sessions</Text>
                <Text style={styles.sectionText}>
                    Join our expert-led awareness sessions to learn about maternal health, breastfeeding techniques,
                    and newborn care. Our sessions are designed to prepare mothers and families for a healthy experience.
                </Text>
                <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View All Sessions</Text>
                </TouchableOpacity>
            </View>

            {/* Midwives Scheduling Section */}
            <View style={styles.schedulingSection}>
                <Text style={styles.sectionTitle}>Midwives Scheduling</Text>
                <Text style={styles.sectionText}>
                    Schedule an appointment with one of our certified midwives at a time that suits you. We offer flexible
                    scheduling options to ensure you receive the care you need.
                </Text>
                <TouchableOpacity style={styles.scheduleButton}>
                    <Text style={styles.scheduleButtonText}>View Available Times</Text>
                </TouchableOpacity>
            </View>

            {/* Vaccination Processes Section */}
            <View style={styles.vaccinationSection}>
                <Text style={styles.sectionTitle}>Vaccination Processes</Text>
                <Text style={styles.sectionText}>
                    Stay informed about vaccination processes for your baby. Our midwives will guide you through the
                    necessary vaccinations and provide support throughout the process.
                </Text>
                <TouchableOpacity style={styles.learnMoreButton}>
                    <Text style={styles.learnMoreButtonText}>Learn More</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#F9F9F9',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
    imageContainer: {
        marginVertical: 20,
    },
    heroImage: {
        width: '100%',
        height: 250,
        borderRadius: 10,
    },
    infoSection: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    sectionText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
    },
    awarenessSection: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
    },
    schedulingSection: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
    },
    scheduleButton: {
        backgroundColor: '#43B0F1',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    scheduleButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    vaccinationSection: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
    },
    learnMoreButton: {
      backgroundColor: '#43B0F1',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    learnMoreButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    viewButton: {
      backgroundColor: '#43B0F1',
      padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
});
