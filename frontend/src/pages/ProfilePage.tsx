import { useState } from "react";
import { Camera, Mail, User, Calendar, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth } =
    useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  if (isCheckingAuth)
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );

  const { profilePic, fullName, email, createdAt } = authUser;

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;

      const prevProfilePic = authUser?.result?.profilePic;
      setSelectedImg(base64Image);

      try {
        await updateProfile({ profilePic: base64Image });
      } catch (err) {
        setSelectedImg(prevProfilePic || null);
        console.error("Failed to update profile pic:", err);
      }
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen mt-16">
      <div className="max-w-3xl mx-auto">
        <div className="card bg-base-200 shadow-xl">
          {/* Header */}
          <div className="card-body p-0">
            <div className="bg-primary text-primary-content p-6 rounded-t-2xl">
              <h1 className="card-title text-2xl md:text-3xl justify-center">
                Your Profile
              </h1>
              <p className="text-center opacity-90">
                Manage your personal information
              </p>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedImg || profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover border-4 "
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`
                    absolute bottom-0 right-0 
                    bg-base-content hover:scale-105
                    p-2 rounded-full cursor-pointer 
                    transition-all duration-200
                    ${
                      isUpdatingProfile
                        ? "animate-pulse pointer-events-none"
                        : ""
                    }
                  `}
                  >
                    <Camera className="w-5 h-5 text-base-200" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                <p className="text-sm text-zinc-400">
                  {isUpdatingProfile
                    ? "Uploading..."
                    : "Click the camera icon to update your photo"}
                </p>
              </div>
              <div className="divider">Personal Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm opacity-70">Full Name</div>
                        <div className="font-medium">{fullName}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm opacity-70">Email Address</div>
                        <div className="font-medium">{email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Information
                  </h2>

                  <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="stat-title">Member Since</div>
                      <div className="stat-value text-lg">
                        {new Date(createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-figure text-success">
                        <div className="badge badge-success badge-lg">
                          Active
                        </div>
                      </div>
                      <div className="stat-title">Account Status</div>
                      <div className="stat-desc text-success font-medium">
                        Your account is in good standing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
