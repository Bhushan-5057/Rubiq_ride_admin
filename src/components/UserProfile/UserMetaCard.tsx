import { useEffect, useState } from "react";


interface User {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserMetaCard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user-profile");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);
  if (!user) {
    return (
      <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl text-center text-gray-500 dark:text-gray-400">
        Loading user info...
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={user.profileImage || "/images/user/owner.jpg"}
                alt="user"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-center xl:text-left">
              <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {user.name || "Unknown User"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email || "No email available"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
                Role: {user.role || "N/A"}
              </p>
            </div>
          </div>
          {/* <div className="flex justify-center mt-4 xl:mt-0">
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Edit
            </button>
          </div> */}
        </div>
      </div>
    
    </>
  );
}
