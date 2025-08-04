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
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../store/AuthContext';
import { loginUser } from '../api/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required'),
});

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [apiError, setApiError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
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

  const handleLogin = async (values, { setSubmitting }) => {
    setApiError('');
    try {
      const { user, token } = await loginUser(values);
      await login(token || 'dummy-token', user);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.');
      setSubmitting(false);
    }
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
              <Icon name="robot-happy" size={60} color={theme.colors.primary} />
              <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                Welcome Back
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Sign in to your AI social account
              </Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <>
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

                  <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>

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
                    icon="login"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </>
              )}
            </Formik>

            {!keyboardVisible && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtonsContainer}>
                  <Button
                    mode="outlined"
                    style={styles.socialButton}
                    icon="google"
                    onPress={() => {}}
                  >
                    Google
                  </Button>
                  <Button
                    mode="outlined"
                    style={styles.socialButton}
                    icon="apple"
                    onPress={() => {}}
                  >
                    Apple
                  </Button>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={[styles.footerLink, { color: theme.colors.primary }]}> Sign up</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
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
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 0,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    height: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: 6,
    borderColor: '#ddd',
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