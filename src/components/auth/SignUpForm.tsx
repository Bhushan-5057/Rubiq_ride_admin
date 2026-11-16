import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import type { z } from "zod";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Images } from "../../lib/image";
import { SignUpSchema } from "../../store/validation/signUpSchema";
import type { AppDispatch, RootState } from "../../store/redux/store";
import {
  clearAuthMessages,
  registerThunk,
} from "../../store/redux/auth-slice";
import { useToast } from "../ui/toast/ToastContext";
import { useAuthState } from "../../hooks/useAuthState";

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export default function SignUpForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const isLoggedIn = useAuthState();

  const { loading: authLoading, error: authError, successMessage: authSuccessMessage, validationErrors, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";
  const redirectPath = from === "/auth/register" ? "/" : from;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "super_admin",
    },
  });

  // Show validation errors from Redux on form fields
  useEffect(() => {
    validationErrors.forEach((validationError) => {
      const field = validationError.field as keyof SignUpFormValues;
      if (field in { name: true, email: true, password: true, role: true }) {
        setFormError(field, {
          type: "manual",
          message: validationError.message,
        });
      }
    });
  }, [validationErrors, setFormError]);

  // Navigation logic on successful registration
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  if (isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  const onSubmit = async (data: SignUpFormValues) => {
    dispatch(clearAuthMessages());

    try {
      await dispatch(
        registerThunk({
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
          role: data.role || "super_admin",
        })
      ).unwrap();
    } catch {
      // Handled through Redux error state and toast side effect.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-5xl h-auto md:h-[80vh] grid grid-cols-1 md:grid-cols-2 lg:h-120! rounded-3xl overflow-hidden   backdrop-blur-sm bg-white/80 transition-all duration-300">
        <div className="relative hidden md:flex flex-col justify-center items-center bg-white  p-10 overflow-hidden border-r border-gray-100 ">
          {/* Decorative shapes - adjusted for white background */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] h-64 w-64 animate-pulse rounded-full bg-brand-500/5 blur-3xl"></div>
          
          <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-xl font-bold tracking-widest uppercase select-none">
              <span className="text-gray-800 ">RUBIQ</span>
              <span className="ml-1.5 text-brand-600">RIDE</span>
            </span>
          </div>

          <div className="relative w-full h-full flex items-center justify-center p-10 lg:p-16 overflow-hidden">
            <img
              src={Images.RegisterImage}
              alt="Ride Register"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 w-full">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800  mb-2 text-center md:text-left">
              Sign Up
            </h1>
            <p className="text-sm font-semibold  text-gray-500 mb-8 text-center md:text-left ">
              Create your admin account
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="Full name"
                    {...field}
                    error={!!errors.name}
                    className="rounded-lg border-gray-300 focus:border-[#c09a6b] focus:ring-[#c09a6b]"
                  />
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}

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
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}

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

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm focus:border-[#c09a6b] focus:ring-1 focus:ring-[#c09a6b] outline-none transition-all  "
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full h-11 bg-gray-700! text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {isSubmitting || authLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <p className="mt-6 text-sm font-semibold  text-gray-500 text-center md:text-left">
              Already have an account?{" "}
              <Link
                to="/auth"
                className="text-indigo-500  hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
