export function getFirebaseAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code: string = error?.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid. Please check your email format.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account was found with this email. Please check your email or Sign Up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please Sign In instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please enter at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Access temporarily restricted due to repeated failed attempts. Please try again in a few minutes or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Authentication popup was closed before completion.';
    case 'auth/cancelled-popup-request':
      return 'Authentication request was canceled.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this project.';
    case 'passwords-do-not-match':
      return 'Passwords do not match. Please re-enter your password confirmation.';
    case 'missing-fields':
      return 'Please complete all required fields.';
    default:
      if (typeof error?.message === 'string' && error.message.trim()) {
        // Strip out "Firebase: " prefix if present for clean UI display
        return error.message.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]+\)\.?$/i, '');
      }
      return 'Authentication failed. Please try again.';
  }
}
