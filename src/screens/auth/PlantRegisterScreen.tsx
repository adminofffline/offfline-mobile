import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { ArrowLeft, Upload, CheckCircle, Factory, Phone, Mail, Lock, Check } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export function PlantRegisterScreen({ navigation }: any) {
  const { signIn } = useAuth();
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    plantName: '', fssai: '', isi: '', capacity: '', upi: '',
    pincode: '', area: '', password: '', confirmPwd: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP logic
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  // File Upload Logic
  const [fileName, setFileName] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const setVal = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSendOtp = () => {
    if (form.phone.length !== 10) return;
    try {
      ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    } catch (e) {}
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length === 6) {
      try {
        ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
      } catch (e) {}
      setPhoneVerified(true);
      setShowOtpModal(false);
    }
  };

  const handleMockUpload = () => {
    try {
      ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
    } catch (e) {}
    setFileName('Plant_Label_Design.png (702x1063 px 2:7 Ratio verified)');
    setFileUploaded(true);
    setIsUploading(false);
  };

  const handleRegister = async () => {
    if (loading) return;
    setError('');
    if (!phoneVerified) return setError('Please verify your phone number first');
    if (!fileUploaded) return setError('Please upload your plant label artwork');
    if (form.password !== form.confirmPwd) return setError('Passwords do not match');

    setLoading(true);
    try {
      const res = await authApi.register({
        email: form.email,
        password: form.password,
        role: 'WATER_PLANT',
        fullName: `${form.firstName} ${form.lastName}`,
        phone: form.phone,
        plantName: form.plantName,
      });

      if (res.data?.token) {
        await signIn(form.email, form.password);
        // Will auto-navigate to Pending Approval screen or Dashboard
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={COLORS.slate900} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plant Registration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.iconWrapper}>
            <Factory color={COLORS.primary} size={32} />
          </View>
          <Text style={styles.title}>Register your Bottling Plant</Text>
          <Text style={styles.subtitle}>Join the network of certified drinking water manufacturers.</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.flex1]} placeholder="First Name" value={form.firstName} onChangeText={v => setVal('firstName', v)} />
            <View style={{ width: SPACING.md }} />
            <TextInput style={[styles.input, styles.flex1]} placeholder="Last Name" value={form.lastName} onChangeText={v => setVal('lastName', v)} />
          </View>

          <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={v => setVal('email', v)} />
          
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.flex1]} placeholder="Phone Number (10 digits)" keyboardType="number-pad" maxLength={10} value={form.phone} onChangeText={v => setVal('phone', v)} editable={!phoneVerified} />
            <TouchableOpacity 
              style={[styles.verifyBtn, phoneVerified && styles.verifiedBtn, form.phone.length !== 10 && styles.disabledBtn]} 
              onPress={() => !phoneVerified && setShowOtpModal(true)}
              disabled={phoneVerified || form.phone.length !== 10}
            >
              <Text style={[styles.verifyBtnText, phoneVerified && {color: '#fff'}]}>
                {phoneVerified ? 'Verified ✓' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Plant Details</Text>
          <TextInput style={styles.input} placeholder="Plant Legal Name" value={form.plantName} onChangeText={v => setVal('plantName', v)} />
          <TextInput style={styles.input} placeholder="FSSAI License ID" value={form.fssai} onChangeText={v => setVal('fssai', v)} autoCapitalize="characters" />
          <TextInput style={styles.input} placeholder="ISI Certification Number" value={form.isi} onChangeText={v => setVal('isi', v)} autoCapitalize="characters" />
          <TextInput style={styles.input} placeholder="Daily Dispatch Capacity (cans/day)" keyboardType="number-pad" value={form.capacity} onChangeText={v => setVal('capacity', v)} />
          <TextInput style={styles.input} placeholder="Settlement UPI ID (e.g. plant@okhdfc)" value={form.upi} onChangeText={v => setVal('upi', v)} autoCapitalize="none" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Label Design & Assets</Text>
          <Text style={styles.helperText}>Required: 702 × 1063 px (2:7 Ratio)</Text>
          
          <TouchableOpacity 
            style={[styles.uploadBox, fileUploaded && styles.uploadBoxSuccess]} 
            onPress={handleMockUpload}
            disabled={isUploading || fileUploaded}
          >
            {isUploading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : fileUploaded ? (
              <>
                <CheckCircle color={COLORS.success} size={24} />
                <Text style={styles.uploadTextSuccess}>{fileName}</Text>
              </>
            ) : (
              <>
                <Upload color={COLORS.slate500} size={24} />
                <Text style={styles.uploadText}>Tap to select Plant Brand Design Artwork</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Location Matrix</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.flex1]} placeholder="Pincode" keyboardType="number-pad" maxLength={6} value={form.pincode} onChangeText={v => setVal('pincode', v)} />
            <View style={{ width: SPACING.md }} />
            <TextInput style={[styles.input, styles.flex1, {backgroundColor: '#f1f5f9'}]} placeholder="Area (Auto)" value={form.pincode.length === 6 ? 'Chennai Region' : ''} editable={false} />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password} onChangeText={v => setVal('password', v)} />
          <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={form.confirmPwd} onChangeText={v => setVal('confirmPwd', v)} />
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Account & Submit</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Phone Number</Text>
            {!otpSent ? (
              <>
                <Text style={styles.modalSubtitle}>We will send an OTP to {form.phone}</Text>
                <TouchableOpacity style={styles.modalBtn} onPress={handleSendOtp}>
                  <Text style={styles.modalBtnText}>Send OTP</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>Enter the 6-digit OTP sent to your phone</Text>
                <TextInput 
                  style={styles.otpInput} 
                  keyboardType="number-pad" 
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  autoFocus
                />
                <TouchableOpacity style={styles.modalBtn} onPress={handleVerifyOtp}>
                  <Text style={styles.modalBtnText}>Verify OTP</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowOtpModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.slate200 },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.slate900 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 60 },
  
  heroSection: { alignItems: 'center', marginBottom: SPACING.xl },
  iconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFEFF', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.slate900, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.slate500, textAlign: 'center', paddingHorizontal: SPACING.xl },
  
  errorBox: { backgroundColor: '#FEF2F2', padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#B91C1C', fontSize: 14, fontWeight: '500' },
  
  formGroup: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.slate900, marginBottom: SPACING.sm },
  helperText: { fontSize: 12, color: COLORS.slate500, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
  
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.slate200, borderRadius: RADIUS.md, padding: 14, fontSize: 15, color: COLORS.slate900, marginBottom: SPACING.sm },
  
  verifyBtn: { backgroundColor: COLORS.slate200, paddingHorizontal: 16, height: 50, borderRadius: RADIUS.md, justifyContent: 'center', marginLeft: SPACING.sm, marginBottom: SPACING.sm },
  disabledBtn: { opacity: 0.5 },
  verifiedBtn: { backgroundColor: COLORS.success },
  verifyBtnText: { fontWeight: 'bold', color: COLORS.slate900, fontSize: 14 },
  
  uploadBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.slate200, borderStyle: 'dashed', borderRadius: RADIUS.md, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', gap: 12 },
  uploadBoxSuccess: { borderColor: COLORS.success, backgroundColor: '#F0FDF4', borderStyle: 'solid' },
  uploadText: { fontSize: 14, color: COLORS.slate500, fontWeight: '500', textAlign: 'center' },
  uploadTextSuccess: { fontSize: 14, color: COLORS.success, fontWeight: 'bold', textAlign: 'center' },

  submitBtn: { backgroundColor: COLORS.slate900, padding: 16, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: SPACING.md },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.xl },
  modalContent: { backgroundColor: '#fff', padding: SPACING.xl, borderRadius: RADIUS.xl, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.slate900, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: COLORS.slate500, textAlign: 'center', marginBottom: SPACING.lg },
  otpInput: { fontSize: 24, fontWeight: 'bold', letterSpacing: 8, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: 8, width: 150, marginBottom: SPACING.xl },
  modalBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: RADIUS.md, width: '100%', alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalCloseBtn: { padding: 12 },
  modalCloseText: { color: COLORS.slate500, fontWeight: '600' },
});
