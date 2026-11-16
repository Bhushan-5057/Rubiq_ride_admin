import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { UserCircleIcon } from "../../icons";
import axiosInstance from "../../store/api/axiosInstance";
import { clearAuthSession, getAuthToken } from "../../lib/auth";
import type { AppDispatch, RootState } from "../../store/redux/store";
import { fetchAdminProfileThunk } from "../../store/redux/profile-slice";

export default function UserDropdown() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const profile = useSelector((state: RootState) => state.profile.data);

  const toggleDropdown = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/admin/profile/logout");
    } catch (error: any) {
      console.error("Logout API failed:", error.response?.data || error.message);
    } finally {
      clearAuthSession();
      sessionStorage.clear();
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate("/auth", { replace: true });
    }
  };

  const handleOpenProfile = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    closeDropdown();
    navigate("/profile");
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    dispatch(fetchAdminProfileThunk());
  }, [dispatch]);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700  dropdown-toggle"
      >
        <UserCircleIcon className="w-8 h-8 mr-2 rounded-full text-gray-500 " />
        <span className="hidden text-sm font-semibold lg:block mr-1 max-w-[120px] truncate">
          {profile?.name ? String(profile.name) : "Admin"}
        </span>

        <svg
          className={`stroke-gray-500  transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg  "
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm  poppins-bold-italic">
            {profile?.name ? String(profile.name) : "Admin Dashboard"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500  poppins-bold-italic">
            {profile?.email ? String(profile.email) : "admin@example.com"}
          </span>
        </div>

        <a
          href="/auth"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700   "
        >
          Sign out
        </a>

        <a
          href="/profile"
          onClick={handleOpenProfile}
          className="flex items-center gap-3 px-3 py-2 mt-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700   "
        >
          Profile
        </a>
      </Dropdown>
    </div>
  );
}
