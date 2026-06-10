import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "../ui/toast/ToastContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Images } from "../../lib/image";
import { SignInSchema } from "../../store/validation/signInSchema";
import type { z } from "zod";
import { useAuthState } from "../../hooks/useAuthState";
import { loginThunk, clearAuthMessages } from "../../store/redux/auth-slice";
import type { AppDispatch, RootState } from "../../store/redux/store";

type SignInFormValues = z.infer<typeof SignInSchema>;

export default function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useAuthState();
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, successMessage, validationErrors, isAuthenticated } =
    useSelector((state: RootState) => state.auth);

  const from = (location.state as { from?: { pathname?: string } })?.from
    ?.pathname || "/";
  const registeredEmail =
    (location.state as { registeredEmail?: string })?.registeredEmail ?? "";
  const redirectPath = from === "/auth" ? "/" : from;

  // ALL hooks must be called before any conditional return
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: registeredEmail,
      password: "",
    },
  });

  // Show validation errors from Redux on form fields
  useEffect(() => {
    validationErrors.forEach((validationError) => {
      const field = validationError.field as keyof SignInFormValues;
      if (field in { email: true, password: true }) {
        setFormError(field, {
          type: "manual",
          message: validationError.message,
        });
      }
    });
  }, [validationErrors, setFormError]);

  // Navigation logic on successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // If already logged in, redirect immediately (after all hooks are called)
  if (isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  const onSubmit = async (data: SignInFormValues) => {
    dispatch(clearAuthMessages());
    dispatch(loginThunk(data));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 poppins-semibold-italic">
      <div className="w-full max-w-5xl h-auto md:h-[80vh] grid grid-cols-1 md:grid-cols-2 lg:h-120! rounded-3xl overflow-hidden   backdrop-blur-sm bg-white/80 transition-all duration-300">
        <div className="relative hidden md:flex flex-col justify-center items-center bg-white  p-10 overflow-hidden border-r border-gray-100 ">
          {/* Decorative shapes - adjusted for white background */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>

          <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-xl font-bold tracking-widest uppercase select-none">
              <span className="text-gray-800 ">RUBIQ</span>
              <span className="ml-1.5 text-brand-600">RIDE</span>
            </span>
          </div>
          <div className="relative w-full h-full flex items-center justify-center p-6 lg:p-12 overflow-hidden">
            <img
              src={Images.LoginImage}
              alt="Ride Login"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            />
          </div>

        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10 w-full">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800  mb-2 text-center md:text-left">
              Sign In
            </h1>
            <p className="text-sm font-semibold  text-gray-500 mb-8 text-center md:text-left ">
              Enter your details below
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 poppins-semibold-italic"
            >
              {/* Email */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    type="email"
                    placeholder="Email address"
                    {...field}
                    error={!!errors.email}
                    className="rounded-lg border-gray-300 focus:border-[#c09a6b] focus:ring-[#c09a6b]"
                  />
                )}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}

              {/* Password */}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                      error={!!errors.password}
                      className="pr-10 rounded-lg border-gray-300 focus:border-[#c09a6b] focus:ring-[#c09a6b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-[#c09a6b]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-11 bg-gray-700! text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {loading ? "Signing in..." : "Log In"}
              </Button>
            </form>
            <p className="mt-6 text-sm font-semibold  text-gray-500 text-center md:text-left">
              Don&apos;t have an account?{" "}
              <Link
                to="/auth/register"
                className="text-indigo-500  hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
