import React, { useContext, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import { TextInput, Button, Text, useTheme, RadioButton } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker'; // npm install @react-native-community/datetimepicker
import { AuthContext } from '../store/AuthContext';
import { registerUser } from '../api/auth';

const RegisterSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  birthday: Yup.date().required('Birthday is required'),
  gender: Yup.string().required('Gender is required'),
  nickname: Yup.string().required('Nickname is required'),
});

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [apiError, setApiError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleRegister = async (values, { setSubmitting }) => {
    setApiError('');
    try {
      // Format birthday to YYYY-MM-DD before sending to API
      const formattedValues = {
        ...values,
        birthday: values.birthday.toISOString().split('T')[0]
      };
      const { user, token } = await registerUser(formattedValues);
      await login(token || 'dummy-token', user);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideUpAnim }],
              paddingBottom: keyboardVisible ? 100 : 24
            }
          ]}
        >
          {!keyboardVisible && (
            <View style={styles.header}>
              <Icon name="robot-excited" size={60} color={theme.colors.primary} />
              <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                Join Our Community
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Create your AI social account
              </Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <Formik
              initialValues={{
                first_name: '', 
                last_name: '', 
                email: '', 
                password: '',
                birthday: new Date(2000, 0, 1), // Default date: Jan 1, 2000
                gender: '', 
                nickname: ''
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleRegister}
            >
              {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
                <>
                  <View style={styles.nameRow}>
                    <View style={[styles.nameInput, { marginRight: 8 }]}>
                      <TextInput
                        label="First Name"
                        value={values.first_name}
                        onChangeText={handleChange('first_name')}
                        onBlur={handleBlur('first_name')}
                        error={touched.first_name && !!errors.first_name}
                        left={<TextInput.Icon icon="account-outline" />}
                        style={styles.input}
                        mode="outlined"
                        theme={{
                          colors: {
                            primary: theme.colors.primary,
                            background: theme.colors.surface,
                          }
                        }}
                      />
                      {touched.first_name && errors.first_name && (
                        <Text style={styles.error}>
                          <Icon name="alert-circle" size={14} /> {errors.first_name}
                        </Text>
                      )}
                    </View>
                    <View style={styles.nameInput}>
                      <TextInput
                        label="Last Name"
                        value={values.last_name}
                        onChangeText={handleChange('last_name')}
                        onBlur={handleBlur('last_name')}
                        error={touched.last_name && !!errors.last_name}
                        style={styles.input}
                        mode="outlined"
                        theme={{
                          colors: {
                            primary: theme.colors.primary,
                            background: theme.colors.surface,
                          }
                        }}
                      />
                      {touched.last_name && errors.last_name && (
                        <Text style={styles.error}>
                          <Icon name="alert-circle" size={14} /> {errors.last_name}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TextInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && !!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    left={<TextInput.Icon icon="email-outline" />}
                    style={styles.input}
                    mode="outlined"
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        background: theme.colors.surface,
                      }
                    }}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.error}>
                      <Icon name="alert-circle" size={14} /> {errors.email}
                    </Text>
                  )}

                  <TextInput
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && !!errors.password}
                    secureTextEntry={secureTextEntry}
                    autoComplete="password"
                    left={<TextInput.Icon icon="lock-outline" />}
                    right={
                      <TextInput.Icon 
                        icon={secureTextEntry ? "eye-off" : "eye"} 
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      />
                    }
                    style={styles.input}
                    mode="outlined"
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        background: theme.colors.surface,
                      }
                    }}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.error}>
                      <Icon name="alert-circle" size={14} /> {errors.password}
                    </Text>
                  )}

                  <TextInput
                    label="Nickname"
                    value={values.nickname}
                    onChangeText={handleChange('nickname')}
                    onBlur={handleBlur('nickname')}
                    error={touched.nickname && !!errors.nickname}
                    left={<TextInput.Icon icon="account-circle-outline" />}
                    style={styles.input}
                    mode="outlined"
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        background: theme.colors.surface,
                      }
                    }}
                  />
                  {touched.nickname && errors.nickname && (
                    <Text style={styles.error}>
                      <Icon name="alert-circle" size={14} /> {errors.nickname}
                    </Text>
                  )}

                  {/* Birthday Date Picker */}
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        label="Birthday"
                        value={formatDate(values.birthday)}
                        left={<TextInput.Icon icon="cake-variant-outline" />}
                        style={styles.input}
                        mode="outlined"
                        theme={{
                          colors: {
                            primary: theme.colors.primary,
                            background: theme.colors.surface,
                          }
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                  {touched.birthday && errors.birthday && (
                    <Text style={styles.error}>
                      <Icon name="alert-circle" size={14} /> {errors.birthday}
                    </Text>
                  )}
                  {showDatePicker && (
                    <DateTimePicker
                      value={values.birthday}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setFieldValue('birthday', selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}

                  {/* Gender Radio Buttons */}
                  <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>Gender</Text>
                    <RadioButton.Group
                      onValueChange={value => setFieldValue('gender', value)}
                      value={values.gender}
                    >
                      <View style={styles.radioRow}>
                        <View style={styles.radioOption}>
                          <RadioButton value="male" />
                          <Text>Male</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton value="female" />
                          <Text>Female</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton value="other" />
                          <Text>Other</Text>
                        </View>
                      </View>
                    </RadioButton.Group>
                    {touched.gender && errors.gender && (
                      <Text style={styles.error}>
                        <Icon name="alert-circle" size={14} /> {errors.gender}
                      </Text>
                    )}
                  </View>

                  {apiError && (
                    <View style={styles.apiErrorContainer}>
                      <Icon name="alert-circle" size={20} color={theme.colors.error} />
                      <Text style={[styles.apiError, { color: theme.colors.error }]}>{apiError}</Text>
                    </View>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                    icon="account-plus"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={[styles.footerLink, { color: theme.colors.primary }]}> Sign in</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Formik>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  radioGroup: {
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    padding: 12,
  },
  radioLabel: {
    marginBottom: 8,
    color: '#666',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  apiError: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 0,
    backgroundColor: '#00D1FF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    height: 24,
    color: '#0A0A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    fontWeight: '600',
  },
});