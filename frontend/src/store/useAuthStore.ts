import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { SignInInput } from "../zod/zod";
import type { AxiosError } from "axios";

type AuthStore = {
  authUser: any;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  signin: (data: SignInInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

export async function handleApiRequest<T>(
  apiCall: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  successMessage: string,
  customMessages?: {
    loading?: string;
    success?: string;
    error?: string;
  }
): Promise<T> {
  setLoading(true);

  const toastPromise = toast.promise(
    apiCall()
      .then((res) => res)
      .catch((error: AxiosError<{ message: string }>) => {
        const errMsg =
          error.response?.data?.message ||
          customMessages?.error ||
          "Something went wrong";
        throw new Error(errMsg);
      })
      .finally(() => {
        setLoading(false);
      }),
    {
      loading: customMessages?.loading || "Loading...",
      success: customMessages?.success || successMessage,
      error: (err) => err.message || "Error occurred",
    }
  );

  return toastPromise;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/getuser");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data: any) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signin: async (data: SignInInput) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log("Error logging in:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error logging out:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  updateProfile: async (data) => {
    const response = await handleApiRequest(
      () => axiosInstance.put("/auth/update-profile", data),
      (loading) => set({ isUpdatingProfile: loading }),
      "Profile updated successfully",
      {
        loading: "Updating profile...",
        error: "Failed to update profile",
      }
    );
    set({ authUser: response.data });
    await useAuthStore.getState().checkAuth();
  },
}));
