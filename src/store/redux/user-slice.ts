import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchAllUsers, createUser, updateUser, deleteUser } from "../api/user-api";
import { getApiErrorMessage } from "../../lib/apiError";


export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  password?: string;
}

interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchAllUsersThunk = createAsyncThunk<User[], void, { rejectValue: string }>(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllUsers({ role: "admin" });
      return (
        (Array.isArray(response.users) ? response.users : null) || 
        (Array.isArray(response.data?.users) ? response.data.users : null) || 
        (Array.isArray(response.data) ? response.data : null) || 
        (Array.isArray(response) ? response : [])
      );
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch All Users"));
    }
  }
);

export const createUserThunk = createAsyncThunk<
  User,
  { name: string; email: string; password: string; role?: string },
  { rejectValue: string }>(  "user/createUser",

  async (payload, { rejectWithValue }) => {
    try {
      const response = await createUser(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Create User"));
    }
  }
);

export const updateUserThunk = createAsyncThunk<
  User,
  { _id: string; name?: string; email?: string; password?: string },
  { rejectValue: string }>("user/updateUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { _id, password, ...rest } = payload;
      const updateData: any = { ...rest };

      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      const response = await updateUser({ id: _id, ...updateData });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Update User"));
    }
  }
);

export const deleteUserThunk = createAsyncThunk<
  { _id: string },
  { _id: string },
  { rejectValue: string }>("user/deleteUser", async ({ _id }, { rejectWithValue }) => {
  try {
    await deleteUser(_id);
    return { _id };
  } catch (error: any) {
    return rejectWithValue(getApiErrorMessage(error, "Delete User"));
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.data.push(action.payload);
        state.message = "User created successfully";
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const index = state.data.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }
        state.message = "User updated successfully";
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
        state.loading = false;
        state.data = state.data.filter((user) => user._id !== action.payload._id);
        state.message = "User deleted successfully";
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessage } = userSlice.actions;
export default userSlice.reducer;
