import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { Helmet } from "react-helmet";

export default function Auth() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // Redirect authenticated users away from login page
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thriphti-green"></div>
      </div>
    );
  }

  // If user is already authenticated, don't render anything (will be redirected)
  if (user) {
    return null;
  }

  // Otherwise, show the auth form
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
      <Helmet>
        <title>Sign In or Sign Up | Thriphti</title>
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-thriphti-green mb-2">Welcome to Thriphti</h1>
        <p className="text-gray-600">Sign in to your account or create a new one</p>
      </div>
      
      <AuthForm />
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
