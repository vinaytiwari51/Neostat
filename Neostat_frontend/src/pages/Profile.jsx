import { useEffect, useState } from "react";
import { getMyProfile } from "../service/profileService";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const response = await getMyProfile();
        setProfile(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!profile) return null;

  const fullName =
    profile.fullName ||
    profile.name ||
    profile.username ||
    "User";

  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const details = [
    { label: "Full Name", value: profile.fullName || profile.name },
    { label: "Email Address", value: profile.email },
    { label: "Username", value: profile.username },
    { label: "Phone Number", value: profile.phone || profile.phoneNumber },
    { label: "Role", value: profile.role },
    {
      label: "Account Created",
      value: profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString()
        : null,
    },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-300">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your personal information and account details.
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black text-gray-300 shadow-sm">
          <div className="h-28 bg-linear-to-r from-indigo-600 to-blue-500" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end text-gray-300">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-sm">
                {initials}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-semibold text-gray-300">
                  {fullName}
                </h2>

                <p className="text-sm text-gray-400">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-black p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-300">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your details provided during registration.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {details.map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-black p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {item.label}
                </p>

                <p className="mt-2 wrap-break-word font-medium text-gray-400">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;