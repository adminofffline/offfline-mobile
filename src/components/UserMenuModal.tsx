import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import {
  User,
  LogOut,
  Key,
  ShieldCheck,
  X,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Factory,
  Truck,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { CONFIG } from '../constants/config';

interface UserMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
}

export const UserMenuModal: React.FC<UserMenuModalProps> = ({
  visible,
  onClose,
  onOpenProfile,
}) => {
  const { user, role, signOut } = useAuth();
  const isPlant = role === 'WATER_PLANT';

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus(null);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatus(null);
      }, 2000);
    } catch (err: any) {
      setPasswordStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <Modal visible={visible && !showPasswordModal} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                {/* Header User Details */}
                <View style={styles.menuHeader}>
                  <View style={[styles.roleAvatar, isPlant ? styles.plantRoleBg : styles.distributorRoleBg]}>
                    {isPlant ? (
                      <Factory size={20} color={COLORS.plantAccent} />
                    ) : (
                      <Truck size={20} color={COLORS.distributorAccent} />
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userNameText} numberOfLines={1}>
                      {user?.fullName || user?.plantName || user?.companyName || 'Operator'}
                    </Text>
                    <Text style={styles.userEmailText} numberOfLines={1}>
                      {user?.email || user?.phone || 'Verified Operator'}
                    </Text>
                    <View style={styles.roleTag}>
                      <ShieldCheck size={11} color={isPlant ? COLORS.plantAccent : COLORS.distributorAccent} />
                      <Text style={[styles.roleTagText, { color: isPlant ? COLORS.plantAccent : COLORS.distributorAccent }]}>
                        {isPlant ? 'WATER PLANT OPERATOR' : 'DISTRIBUTOR OPERATOR'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={18} color={COLORS.slate400} />
                  </TouchableOpacity>
                </View>

                {/* Actions List */}
                <View style={styles.menuItems}>
                  {onOpenProfile && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        onClose();
                        onOpenProfile();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemIcon}>
                        <Building2 size={18} color={COLORS.slate700} />
                      </View>
                      <View style={styles.menuItemTextContainer}>
                        <Text style={styles.menuItemTitle}>
                          {isPlant ? 'Plant Facility & License' : 'Distributor Profile'}
                        </Text>
                        <Text style={styles.menuItemSubtitle}>
                          {isPlant ? 'ISI certificates & bottling specs' : 'Warehouse & tax details'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setShowPasswordModal(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemIcon}>
                      <Key size={18} color={COLORS.slate700} />
                    </View>
                    <View style={styles.menuItemTextContainer}>
                      <Text style={styles.menuItemTitle}>Security & Password</Text>
                      <Text style={styles.menuItemSubtitle}>Update terminal access password</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.serverInfoRow}>
                    <Text style={styles.serverInfoLabel}>Connected Endpoint</Text>
                    <Text style={styles.serverInfoValue} numberOfLines={1}>
                      {CONFIG.API_BASE_URL}
                    </Text>
                  </View>

                  {/* Sign Out Button */}
                  <TouchableOpacity
                    style={styles.signOutBtn}
                    onPress={() => {
                      onClose();
                      signOut();
                    }}
                    activeOpacity={0.8}
                  >
                    <LogOut size={16} color={COLORS.error} />
                    <Text style={styles.signOutText}>Sign Out from Terminal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.passwordCard}>
            <View style={styles.passwordCardHeader}>
              <View style={styles.keyIconCircle}>
                <Key size={20} color={COLORS.slate900} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.passwordCardTitle}>Change Password</Text>
                <Text style={styles.passwordCardSubtitle}>Enter your current and new password</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={styles.closeBtn}>
                <X size={18} color={COLORS.slate400} />
              </TouchableOpacity>
            </View>

            {passwordStatus && (
              <View
                style={[
                  styles.statusAlert,
                  passwordStatus.type === 'success' ? styles.statusAlertSuccess : styles.statusAlertError,
                ]}
              >
                {passwordStatus.type === 'success' ? (
                  <CheckCircle2 size={16} color={COLORS.success} />
                ) : (
                  <AlertCircle size={16} color={COLORS.error} />
                )}
                <Text
                  style={[
                    styles.statusAlertText,
                    passwordStatus.type === 'success' ? { color: COLORS.successText } : { color: COLORS.errorText },
                  ]}
                >
                  {passwordStatus.message}
                </Text>
              </View>
            )}

            <View style={styles.passwordForm}>
              <View>
                <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate400}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>NEW PASSWORD (MIN. 6 CHARACTERS)</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate400}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate400}
                />
              </View>

              <TouchableOpacity
                style={styles.savePasswordBtn}
                onPress={handleUpdatePassword}
                disabled={isUpdatingPassword}
                activeOpacity={0.8}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.savePasswordBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 380,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  roleAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  plantRoleBg: {
    backgroundColor: COLORS.plantBg,
    borderWidth: 1,
    borderColor: COLORS.plantBorder,
  },
  distributorRoleBg: {
    backgroundColor: COLORS.distributorBg,
    borderWidth: 1,
    borderColor: COLORS.distributorBorder,
  },
  userInfo: {
    flex: 1,
  },
  userNameText: {
    ...TYPOGRAPHY.base,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  userEmailText: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate500,
    marginTop: 1,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  menuItems: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: COLORS.slate500,
    marginTop: 1,
  },
  serverInfoRow: {
    backgroundColor: COLORS.slate100,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  serverInfoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate500,
    textTransform: 'uppercase',
  },
  serverInfoValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: COLORS.slate700,
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  signOutText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.error,
  },
  passwordCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 380,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  passwordCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  keyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordCardTitle: {
    ...TYPOGRAPHY.base,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  passwordCardSubtitle: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate500,
  },
  passwordForm: {
    gap: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate700,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    ...TYPOGRAPHY.xs,
    color: COLORS.slate900,
  },
  savePasswordBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  savePasswordBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  statusAlertSuccess: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
  },
  statusAlertError: {
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.errorBorder,
  },
  statusAlertText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    flex: 1,
  },
});

export default UserMenuModal;
