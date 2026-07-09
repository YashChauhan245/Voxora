import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile } from "../lib/api";
import { getAvatarFallback, getProfileImage } from "../lib/utils";
import { LANGUAGES, AVAILABILITY_OPTIONS } from "../constants";
import {
  CameraIcon,
  LoaderIcon,
  RefreshCcwIcon,
  SparklesIcon,
  UserIcon,
  MailIcon,
  BadgeCheckIcon,
  MapPinIcon,
  GlobeIcon,
  BookOpenIcon,
  ActivityIcon,
  FileTextIcon,
  UploadIcon,
} from "lucide-react";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    profilePic: authUser?.profilePic || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    availability: authUser?.availability || "available",
  });

  useEffect(() => {
    if (!authUser) return;

    setFormState({
      fullName: authUser.fullName || "",
      profilePic: authUser.profilePic || "",
      bio: authUser.bio || "",
      location: authUser.location || "",
      nativeLanguage: authUser.nativeLanguage || "",
      learningLanguage: authUser.learningLanguage || "",
      availability: authUser.availability || "available",
    });
  }, [authUser]);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfile({
      fullName: formState.fullName,
      profilePic: formState.profilePic,
      bio: formState.bio,
      location: formState.location,
      nativeLanguage: formState.nativeLanguage,
      learningLanguage: formState.learningLanguage,
      availability: formState.availability,
    });
  };

  const handleGenerateAvatar = () => {
    const seed = `${formState.fullName || authUser?.fullName || "user"}-${Math.random().toString(36).slice(2, 8)}`;
    setFormState((current) => ({
      ...current,
      profilePic: getAvatarFallback(seed),
    }));
    toast.success("Fresh avatar generated");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({ ...prev, profilePic: reader.result }));
      toast.success("Profile photo uploaded! Save profile to persist.");
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const previewImage = getProfileImage(formState.profilePic, formState.fullName || authUser?.fullName);

  return (
    <div className="relative isolate overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10" />
      <div className="absolute -top-24 right-0 -z-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />

      <div className="container mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-2">
          <p className="badge badge-outline badge-primary w-fit gap-2">
            <SparklesIcon className="size-3.5" />
            Profile Studio
          </p>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Edit your profile</h1>
            <p className="opacity-70 mt-2 max-w-2xl">
              Update your display name and avatar, then use the profile preview to keep your presence polished across Voxora.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <form onSubmit={handleSubmit} className="card bg-base-200/90 border border-base-300 shadow-2xl backdrop-blur-xl">
            <div className="card-body p-5 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold">Profile details</h2>
                  <p className="text-sm opacity-70 mt-1">Your name and avatar appear in chat, calls, and friend cards.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <BadgeCheckIcon className="size-4 text-success" />
                  Auto-synced with your workspace profile
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-4 rounded-3xl border border-base-300 bg-base-100/80 p-4 shadow-sm">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 blur-xl" />
                    <div className="avatar relative">
                      <div className="w-40 rounded-full ring-4 ring-base-100 shadow-xl">
                        <img
                          src={previewImage}
                          alt={formState.fullName || authUser?.fullName || "Profile preview"}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = getAvatarFallback(formState.fullName || authUser?.fullName);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-lg font-semibold">{formState.fullName || authUser?.fullName || "Your name"}</p>
                    <p className="text-sm opacity-70">{authUser?.email}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary btn-sm w-full"
                    >
                      <UploadIcon className="size-4 mr-2" />
                      Upload Photo
                    </button>
                    <button type="button" onClick={handleGenerateAvatar} className="btn btn-outline btn-sm w-full">
                      <RefreshCcwIcon className="size-4 mr-2" />
                      Generate avatar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          profilePic: getAvatarFallback(current.fullName || authUser?.fullName),
                        }))
                      }
                      className="btn btn-ghost btn-sm w-full"
                    >
                      <CameraIcon className="size-4 mr-2" />
                      Use initials avatar
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <UserIcon className="size-4 opacity-70" />
                        Display name
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formState.fullName}
                      onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
                      className="input input-bordered w-full bg-base-100/80"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <MailIcon className="size-4 opacity-70" />
                        Avatar URL
                      </span>
                    </label>
                    <input
                      type="url"
                      value={formState.profilePic}
                      onChange={(event) => setFormState((current) => ({ ...current, profilePic: event.target.value }))}
                      className="input input-bordered w-full bg-base-100/80"
                      placeholder="Paste an image URL or keep the generated avatar"
                    />
                    <label className="label">
                      <span className="label-text-alt opacity-60">
                        Any reachable image URL works. If empty, Voxora shows an initials avatar.
                      </span>
                    </label>
                  </div>

                  {/* Bio */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FileTextIcon className="size-4 opacity-70" />
                        Bio
                      </span>
                    </label>
                    <textarea
                      value={formState.bio}
                      onChange={(event) => setFormState((current) => ({ ...current, bio: event.target.value }))}
                      className="textarea textarea-bordered w-full bg-base-100/80 h-20"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>

                  {/* Location & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <MapPinIcon className="size-4 opacity-70" />
                          Location
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formState.location}
                        onChange={(event) => setFormState((current) => ({ ...current, location: event.target.value }))}
                        className="input input-bordered w-full bg-base-100/80"
                        placeholder="e.g., Paris, France"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <ActivityIcon className="size-4 opacity-70" />
                          Status
                        </span>
                      </label>
                      <select
                        value={formState.availability}
                        onChange={(event) => setFormState((current) => ({ ...current, availability: event.target.value }))}
                        className="select select-bordered w-full bg-base-100/80"
                      >
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Native & Learning Languages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <GlobeIcon className="size-4 opacity-70" />
                          Native Language
                        </span>
                      </label>
                      <select
                        value={formState.nativeLanguage}
                        onChange={(event) => setFormState((current) => ({ ...current, nativeLanguage: event.target.value }))}
                        className="select select-bordered w-full bg-base-100/80"
                      >
                        <option value="">Select language</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <BookOpenIcon className="size-4 opacity-70" />
                          Learning Language
                        </span>
                      </label>
                      <select
                        value={formState.learningLanguage}
                        onChange={(event) => setFormState((current) => ({ ...current, learningLanguage: event.target.value }))}
                        className="select select-bordered w-full bg-base-100/80"
                      >
                        <option value="">Select language</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100/70 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <SparklesIcon className="size-4 text-primary" />
                      <p className="font-medium">Live preview</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="avatar">
                        <div className="w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={previewImage}
                            alt="Preview avatar"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = getAvatarFallback(formState.fullName || authUser?.fullName);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{formState.fullName || authUser?.fullName || "Preview name"}</p>
                        <p className="text-sm opacity-70">This is what other learners will see in the app.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full sm:w-auto min-w-48" disabled={isPending}>
                {isPending ? (
                  <>
                    <LoaderIcon className="size-5 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <BadgeCheckIcon className="size-5" />
                    Save profile changes
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="card bg-base-200/90 border border-base-300 shadow-xl backdrop-blur-xl">
              <div className="card-body p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Profile snapshot</h3>
                  <p className="text-sm opacity-70 mt-1">A quick summary of the account identity tied to your sessions.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-base-100/80 px-4 py-3">
                    <span className="text-sm opacity-70">Name</span>
                    <span className="font-medium text-right">{authUser?.fullName || "Unset"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-base-100/80 px-4 py-3">
                    <span className="text-sm opacity-70">Email</span>
                    <span className="font-medium text-right break-all">{authUser?.email}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-base-100/80 px-4 py-3">
                    <span className="text-sm opacity-70">Language pair</span>
                    <span className="font-medium text-right">
                      {authUser?.nativeLanguage || "Native"} → {authUser?.learningLanguage || "Learning"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-base-100/80 px-4 py-3">
                    <span className="text-sm opacity-70">Location</span>
                    <span className="font-medium text-right">{authUser?.location || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary/15 via-base-200 to-secondary/15 border border-base-300 shadow-xl">
              <div className="card-body p-5 space-y-3">
                <h3 className="text-lg font-semibold">Why this section feels better</h3>
                <p className="text-sm opacity-75 leading-relaxed">
                  The layout uses a stronger visual hierarchy, a larger avatar preview, and quick avatar actions so the edit flow feels intentional instead of plain form fields.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="badge badge-primary badge-outline">Responsive</span>
                  <span className="badge badge-secondary badge-outline">Avatar preview</span>
                  <span className="badge badge-accent badge-outline">Fast save</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;