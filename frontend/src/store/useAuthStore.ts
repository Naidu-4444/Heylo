import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { SignInInput } from "../zod/zod";
import type { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";

type AuthStore = {
  authUser: any;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: Socket | null;
  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  signin: (data: SignInInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  connectsocket: () => void;
  disconnectsocket: () => void;
};

const BASE_URL = "http://localhost:5000";

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

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/getuser");
      set({ authUser: res.data });
      get().connectsocket();
    } catch (error) {
      console.log("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectsocket();
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signin: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await handleApiRequest(
        () => axiosInstance.post("/auth/login", data),
        (loading) => set({ isLoggingIn: loading }),
        "Logged in successfully",
        {
          loading: "Logging in...",
          error: "Failed to login",
        }
      );

      set({ authUser: response.data });
      await useAuthStore.getState().checkAuth();
      get().connectsocket();
    } catch (error) {
      console.log("Error logging in:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectsocket();
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
  connectsocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newsocket = io(BASE_URL, {
      autoConnect: false,
      query: { userId: authUser._id },
    });

    newsocket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    newsocket.connect();
    set({ socket: newsocket });
  },
  disconnectsocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
