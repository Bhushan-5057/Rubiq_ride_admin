import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/redux/store";
import {
  fetchAllUsersThunk,
  createUserThunk,
  updateUserThunk,
  deleteUserThunk,
} from "../../../store/redux/user-slice";
import { PencilIcon, Eye, Trash2, Plus, ArrowLeft } from "lucide-react";
import Button from "../../ui/button/Button";
import Badge from "../../ui/badge/Badge";
import { useToast } from "../../ui/toast/ToastContext";
import { getApiErrorMessage } from "../../../lib/apiError";
import { SearchControl } from "../shared/GetAllTableControls";

function FullPageModal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50  overflow-auto flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white  p-6 rounded-2xl shadow-xl border border-gray-200 ">
        {/* BACK BUTTON: inside form, top of content */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl
                     bg-gray-100  text-gray-900 
                     hover:bg-gray-200  transition"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* FORM CONTENT */}
        {children}
      </div>
    </div>
  );
}

export default function AdminTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const { data: users, loading } = useSelector(
    (state: RootState) => state.user,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);

  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({
    _id: "",
    name: "",
    email: "",
    password: "",
  });
  const [viewUser, setViewUser] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    dispatch(fetchAllUsersThunk());
  }, [dispatch]);

  const filteredUsers = users.filter((u) => {
    const name = u.name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  const handleAddAdmin = async () => {
    if (
      !addForm.name.trim() ||
      !addForm.email.trim() ||
      !addForm.password.trim()
    ) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      await dispatch(createUserThunk({ ...addForm, role: "admin" })).unwrap();
      showToast("Admin created successfully", "success");
      setAddModalOpen(false);
      setAddForm({ name: "", email: "", password: "" });
      dispatch(fetchAllUsersThunk());
    } catch (error) {
      showToast(
        typeof error === "string"
          ? error
          : getApiErrorMessage(error, "Create Admin"),
        "error"
      );
    }
  };
  const handleEditSubmit = async () => {
    try {
      const payload: any = {
        _id: editForm._id,
        name: editForm.name,
        email: editForm.email,
      };

      if (
        editForm.password &&
        editForm.password.trim() !== "" &&
        editForm.password !== "********"
      ) {
        payload.password = editForm.password;
      }

      await dispatch(updateUserThunk(payload)).unwrap();
      showToast("Admin updated successfully", "success");
      setEditModalOpen(false);
      setEditForm({ _id: "", name: "", email: "", password: "" });
      dispatch(fetchAllUsersThunk());
    } catch (error) {
      showToast(
        typeof error === "string"
          ? error
          : getApiErrorMessage(error, "Update Admin"),
        "error"
      );
    }
  };

  const handleDeleteAdmin = async (_id: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      await dispatch(deleteUserThunk({ _id })).unwrap();
      showToast("Admin deleted successfully", "success");
      dispatch(fetchAllUsersThunk());
    } catch (error) {
      showToast(
        typeof error === "string"
          ? error
          : getApiErrorMessage(error, "Delete Admin"),
        "error"
      );
    }
  };

  const openEditModal = (user: any) => {
    setEditForm({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: "********",
    });
    setEditModalOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Admins
        </h2>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="w-full flex-1 sm:w-auto">
            <SearchControl
              placeholder="Search name, email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={14} /> Add Admin
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Name
              </th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Email
              </th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Role
              </th>
              <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-10 text-center text-sm text-gray-500"
                >
                  Loading admins...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-10 text-center text-sm text-gray-500"
                >
                  No admins found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td className="p-3 text-sm text-gray-700 ">
                    {user.name}
                  </td>
                  <td className="p-3 text-sm text-gray-700 ">
                    {user.email}
                  </td>
                  <td className="p-3">
                    <Badge
                      size="sm"
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "superadmin"
                          ? "bg-red-100 text-red-800  "
                          : "bg-blue-100 text-blue-800  "
                      }`}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setViewUser(user);
                        setViewModalOpen(true);
                      }}
                    >
                      <Eye
                        size={16}
                        className="text-gray-600 "
                      />
                    </button>
                    <button onClick={() => openEditModal(user)}>
                      <PencilIcon
                        size={16}
                        className="text-green-600 "
                      />
                    </button>
                    <button onClick={() => handleDeleteAdmin(user._id)}>
                      <Trash2
                        size={16}
                        className="text-red-600 "
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <FullPageModal onClose={() => setAddModalOpen(false)}>
          <div className="flex flex-col gap-6">
            <input
              type="text"
              placeholder="Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full text-lg bg-white  text-gray-700 "
            />
            <input
              type="email"
              placeholder="Email"
              value={addForm.email}
              onChange={(e) =>
                setAddForm({ ...addForm, email: e.target.value })
              }
              className="border rounded-lg px-4 py-3 w-full text-lg bg-white  text-gray-700 "
            />
            <input
              type="password"
              placeholder="Password"
              value={addForm.password}
              onChange={(e) =>
                setAddForm({ ...addForm, password: e.target.value })
              }
              className="border rounded-lg px-4 py-3 w-full text-lg bg-white  text-gray-700 "
            />
            <Button
              className="w-full py-3 text-lg"
              variant="primary"
              onClick={handleAddAdmin}
            >
              Create Admin
            </Button>
          </div>
        </FullPageModal>
      )}

      {isEditModalOpen && (
        <FullPageModal onClose={() => setEditModalOpen(false)}>
          <div className="flex flex-col gap-6">
            <input
              type="text"
              placeholder="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="border rounded-lg px-4 py-3 w-full text-lg bg-white  text-gray-700 "
            />
            <input
              type="email"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="border rounded-lg px-4 py-3 w-full text-lg bg-white  text-gray-700 "
            />
            <input
              type="password"
              placeholder="Password (leave blank to keep existing)"
              value={editForm.password}
              onChange={(e) =>
                setEditForm({ ...editForm, password: e.target.value })
              }
              className="border rounded-lg px-4 py-3 w-full text-lg bg-white  text-gray-700 "
            />
            <Button
              className="w-full py-3 text-lg"
              variant="primary"
              onClick={handleEditSubmit}
            >
              Update Admin
            </Button>
          </div>
        </FullPageModal>
      )}

      {/* VIEW ADMIN MODAL */}
      {isViewModalOpen && (
        <FullPageModal onClose={() => setViewModalOpen(false)}>
          <div className="flex flex-col gap-2 text-gray-700 ">
            <p>
              <b>Name:</b> {viewUser.name}
            </p>
            <p>
              <b>Email:</b> {viewUser.email}
            </p>
            <p>
              <b>Role:</b> {viewUser.role}
            </p>
          </div>
        </FullPageModal>
      )}
    </div>
  );
}
