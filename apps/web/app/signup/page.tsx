"use client" 
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
// Replace these with your actual Cloudinary credentials
// Get them from: https://cloudinary.com/console
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME??"";
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET??"";
const FALLBACK_IMAGE = process.env.FALLBACK_IMAGE??"";


export default function SignupPage() {

      const router = useRouter()
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Toggle password visibility (show/hide password text)
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data that will be sent to the backend
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    imagePath: '' // Will store the Cloudinary URL or fallback image
  });
  
  // Local preview of the uploaded image (base64 string)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Loading state for form submission
  const [loading, setLoading] = useState(false);
  
  // Loading state specifically for image upload to Cloudinary
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Error and success messages to display to user
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: session, status } = useSession()

    

  // ============================================
  // CLOUDINARY UPLOAD FUNCTION
  // ============================================
  /**
   * Uploads an image file to Cloudinary
   * @param file - The image file to upload
   * @returns The secure URL of the uploaded image, or fallback image on error
   */
  const uploadToCloudinary = async (file: string | Blob) => {
    // Create FormData to send the file as multipart/form-data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      // Make POST request to Cloudinary's upload endpoint
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      // Check if upload was successful
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Parse the response to get the image URL
      const data = await response.json();
      return data.secure_url; // Returns HTTPS URL of uploaded image
    } catch (error) {
      // Log error and return fallback image if upload fails
      console.error('Cloudinary upload error:', error);
      return FALLBACK_IMAGE;
    }
  };

  // ============================================
  // IMAGE UPLOAD HANDLER
  // ============================================
  /**
   * Handles image selection and upload process
   * 1. Shows preview immediately (for better UX)
   * 2. Uploads to Cloudinary in background
   * 3. Updates form data with Cloudinary URL
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the first selected file
    if (file) {
      setUploadingImage(true); // Show loading state
      
      // ---- STEP 1: Show preview immediately ----
      // Use FileReader to convert file to base64 for instant preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // When file is read, set it as preview (type assertion since readAsDataURL always returns string)
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file); // Read file as Data URL (base64)

      // ---- STEP 2: Upload to Cloudinary ----
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      // ---- STEP 3: Update form data with the URL ----
      setFormData({ ...formData, imagePath: cloudinaryUrl });
      setUploadingImage(false); // Hide loading state
    }
  };

  // ============================================
  // REMOVE IMAGE HANDLER
  // ============================================
  /**
   * Removes the uploaded image and resets to fallback
   */
  const removeImage = () => {
    setImagePreview(null); // Clear preview
    setFormData({ ...formData, imagePath: FALLBACK_IMAGE }); // Set fallback image
  };

  // ============================================
  // FORM SUBMISSION HANDLER
  // ============================================
  /**
   * Handles form submission to create a new account
   * Sends form data to backend API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Reset messages
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Send POST request to signup endpoint
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send form data as JSON
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Show message and redirect
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/home'; // Redirect to home page
        }, 2000);
      } else {
        // Error: Show error message from server
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      // Network error: Connection issues
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false); // Always stop loading state
    }
  };

  useEffect(() => {
        // Check if session has finished loading
        if (status === "loading") {
          return  // Still loading, do nothing
        }
    
        // If not authenticated, redirect to login
        if (status === "authenticated") {
          router.push("/home")
        }
      }, [status, router])  // ✅ Dependencies array
    
      // Show loading state while checking authentication
      if (status === "loading") {
        return (
          <div className="min-h-[675px] flex items-center justify-center">
            <p>Loading...</p>
          </div>
        )
      }

  // ============================================
  // RENDER UI
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ============================================
          HEADER SECTION
          ============================================ */}
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-bold">Rebuild</h1>
      </header>

      {/* ============================================
          MAIN CONTENT - SIGNUP FORM
          ============================================ */}
      <div className="flex items-center justify-center px-4 py-12">
        {/* Card container with glassmorphism effect */}
        <div className="w-full max-w-md p-8 rounded-2xl border bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-2xl">
          
          {/* ---- Form Header ---- */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Join Rebuild and start your journey
            </p>
          </div>

          {/* ---- Form Fields ---- */}
          <div className="space-y-5">
            
            {/* ============================================
                PROFILE IMAGE UPLOAD SECTION
                ============================================ */}
            <div className="flex flex-col items-center mb-6">
              {imagePreview ? (
                // ---- Image Preview (when image is selected) ----
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                  />
                  
                  {/* Loading spinner overlay during upload */}
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {/* Remove image button */}
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={uploadingImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                // ---- Upload Button (when no image selected) ----
                <label className="w-24 h-24 rounded-full border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-100 dark:bg-slate-700/30">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </label>
              )}
              
              {/* Upload status text */}
              <p className="text-sm mt-2 text-slate-600 dark:text-slate-400">
                {uploadingImage ? 'Uploading...' : 'Profile Photo (Optional)'}
              </p>
            </div>

            {/* ============================================
                NAME INPUT FIELD
                ============================================ */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* ============================================
                EMAIL INPUT FIELD
                ============================================ */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="john@example.com"
              />
            </div>

            {/* ============================================
                PASSWORD INPUT FIELD WITH TOGGLE
                ============================================ */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                {/* Password input - type changes based on showPassword state */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
                
                {/* Eye icon button to toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password requirements hint */}
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-500">
                Must be at least 6 characters
              </p>
            </div>

            {/* ============================================
                ERROR MESSAGE DISPLAY
                ============================================ */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* ============================================
                SUCCESS MESSAGE DISPLAY
                ============================================ */}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm">
                {success}
              </div>
            )}

            {/* ============================================
                SUBMIT BUTTON
                ============================================ */}
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImage} // Disable if submitting or uploading image
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            {/* ============================================
                SIGN IN LINK (for existing users)
                ============================================ */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <a href="/login" className="text-blue-500 hover:text-blue-400 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}