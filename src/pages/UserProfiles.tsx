import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Pencil } from "lucide-react";
import type { z } from "zod";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Input from "../components/form/input/InputField";
import type { AppDispatch, RootState } from "../store/redux/store";
import {
  changeAdminPasswordThunk,
  fetchAdminProfileThunk,
  updateAdminProfileThunk,
} from "../store/redux/profile-slice";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "../store/validation/profileSchema";

type ProfileFormValues = z.infer<typeof updateProfileSchema>;
type PasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function UserProfiles() {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditingName, setIsEditingName] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    data: profile,
    fetchLoading,
    updateLoading,
    passwordLoading,
  } = useSelector((state: RootState) => state.profile);

  const {
    control: profileControl,
    handleSubmit: submitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    control: passwordControl,
    handleSubmit: submitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    dispatch(fetchAdminProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.name) {
      resetProfile({ name: profile.name });
    }
  }, [profile, resetProfile]);


  const handleProfileUpdate = async (values: ProfileFormValues) => {
    try {
      await dispatch(
        updateAdminProfileThunk({ name: values.name.trim() })
      ).unwrap();
      setIsEditingName(false);
    } catch {
      // Error toast is handled through slice state.
    }
  };

  const handlePasswordUpdate = async (values: PasswordFormValues) => {
    try {
      await dispatch(
        changeAdminPasswordThunk({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        })
      ).unwrap();
      resetPassword();
    } catch {
      // Error toast is handled through slice state.
    }
  };

  return (
    <>
      <PageMeta
        title="Profile Management | Rubiq Ride"
        description="Manage profile details and update account password"
      />
      <PageBreadcrumb pageTitle="Profile" />

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3 lg:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {profile?.name || "Admin"}
                </h3>
                <p className="text-xs text-gray-500">
                  {profile?.email || "-"}
                </p>
                <p className="text-xs text-white bg-green-400 inline-block px-2 py-0.5 rounded-full mt-1">
                  {profile?.role?.toUpperCase() || "-"}
                </p>
              </div>
            </div>
            {fetchLoading && (
              <span className="text-xs text-gray-500">Loading profile...</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-3 lg:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">
                Profile Details
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingName((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-md border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
              >
                <Pencil className="h-3.5 w-3.5" />
                {isEditingName ? "Cancel" : "Edit"}
              </button>
            </div>

            <form onSubmit={submitProfile(handleProfileUpdate)} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Name
                </label>
                <Controller
                  name="name"
                  control={profileControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      error={!!profileErrors.name}
                      disabled={!isEditingName || updateLoading}
                      placeholder="Enter name"
                      className="h-9 px-3 py-2 text-xs"
                    />
                  )}
                />
                {profileErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={profile?.email ? String(profile.email) : ""}
                  disabled
                  readOnly
                  className="h-9 px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={!isEditingName || updateLoading}
                className="inline-flex items-center justify-center rounded-md bg-gray-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-3 lg:p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Change Password
            </h4>

            <form onSubmit={submitPassword(handlePasswordUpdate)} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Old Password
                </label>
                <Controller
                  name="oldPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showOldPassword ? "text" : "password"}
                        error={!!passwordErrors.oldPassword}
                        disabled={passwordLoading}
                        placeholder="Enter old password"
                        className="h-9 px-3 py-2 pr-9 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword((prev) => !prev)}
                        className="absolute right-3 top-2 text-gray-400 hover:text-gray-700"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                />
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-xs text-red-500">{passwordErrors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  New Password
                </label>
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        error={!!passwordErrors.newPassword}
                        disabled={passwordLoading}
                        placeholder="Enter new password"
                        className="h-9 px-3 py-2 pr-9 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-2 text-gray-400 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Confirm Password
                </label>
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        error={!!passwordErrors.confirmPassword}
                        disabled={passwordLoading}
                        placeholder="Confirm new password"
                        className="h-9 px-3 py-2 pr-9 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-2 text-gray-400 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center rounded-md bg-gray-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
