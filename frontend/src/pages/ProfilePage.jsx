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
    <div className="relative isolate overflow-hidden p-4 sm:p-6 lg:p-8 min-h-screen bg-black bg-mesh-dark">
      {/* Premium Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 size-72 sm:size-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-6xl space-y-8 relative z-10">
        <div className="flex flex-col gap-2">
          <p className="badge badge-primary gap-1.5 px-3 py-2 bg-primary/10 border-primary/20 text-xs tracking-wider uppercase font-bold w-fit">
            <SparklesIcon className="size-3.5 text-primary animate-pulse" />
            Profile Studio
          </p>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className="gradient-text">Edit Your Profile</span>
            </h1>
            <p className="text-base-content/60 mt-2 max-w-2xl text-sm">
              Update your digital avatar, display name, and information. The live preview updates instantly to show what other language learners will see.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <form onSubmit={handleSubmit} className="card glass-card border border-primary/20 shadow-2xl overflow-hidden glow-border">
            {/* Premium Social Media Banner Header */}
            <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-mesh-dark opacity-60" />
              <div className="absolute bottom-3 right-4 flex items-center gap-2">
                <span className="badge badge-outline border-primary/30 text-white/80 text-[10px] tracking-wider uppercase font-bold bg-black/40 backdrop-blur-md">
                  Active Session
                </span>
              </div>
            </div>

            <div className="card-body p-6 sm:p-8 -mt-20 sm:-mt-24 space-y-6 relative z-10">
              {/* Profile Avatar & Primary details header overlapping the banner */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 text-center sm:text-left">
                  <div className="relative mx-auto sm:mx-0 w-fit">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary via-secondary to-accent blur-md opacity-75" />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="avatar relative cursor-pointer group"
                    >
                      <div className="w-32 sm:w-36 rounded-full ring-4 ring-black bg-base-300 overflow-hidden relative shadow-2xl">
                        <img
                          src={previewImage}
                          alt={formState.fullName || authUser?.fullName || "Profile preview"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = getAvatarFallback(formState.fullName || authUser?.fullName);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-white text-xs font-bold tracking-wider uppercase">
                          <UploadIcon className="size-4 mb-1 animate-bounce text-primary" />
                          Change
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pb-2 space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-1.5">
                      {formState.fullName || authUser?.fullName || "Your name"}
                      <BadgeCheckIcon className="size-5 text-success" />
                    </h2>
                    <p className="text-xs sm:text-sm text-base-content/60 font-medium">{authUser?.email}</p>
                  </div>
                </div>
                
                {/* Profile Avatar Control Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
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
                    className="btn btn-outline btn-xs sm:btn-sm border-primary/20 hover:border-primary/50 text-base-content/90 font-medium"
                  >
                    <UploadIcon className="size-3.5 mr-1.5 text-primary" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAvatar}
                    className="btn btn-ghost btn-xs sm:btn-sm hover:bg-white/5 text-base-content/75 font-medium"
                  >
                    <RefreshCcwIcon className="size-3.5 mr-1.5 text-secondary animate-spin-slow" />
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((current) => ({
                        ...current,
                        profilePic: getAvatarFallback(current.fullName || authUser?.fullName),
                      }))
                    }
                    className="btn btn-ghost btn-xs sm:btn-sm text-base-content/50 hover:bg-white/5 font-medium"
                  >
                    <CameraIcon className="size-3.5 mr-1.5" />
                    Initials
                  </button>
                </div>
              </div>

              <div className="divider opacity-5" />

              {/* Form Input fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Display Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2 text-base-content/85 text-xs tracking-wide uppercase">
                        <UserIcon className="size-3.5 text-primary" />
                        Display name
                      </span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                      <input
                        type="text"
                        value={formState.fullName}
                        onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
                        className="input input-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-primary/50 focus:bg-transparent"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2 text-base-content/85 text-xs tracking-wide uppercase">
                        <GlobeIcon className="size-3.5 text-primary" />
                        Avatar URL
                      </span>
                    </label>
                    <div className="relative">
                      <GlobeIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                      <input
                        type="url"
                        value={formState.profilePic}
                        onChange={(event) => setFormState((current) => ({ ...current, profilePic: event.target.value }))}
                        className="input input-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-primary/50 focus:bg-transparent text-xs"
                        placeholder="Paste image URL or upload one"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/85 text-xs tracking-wide uppercase">
                      <FileTextIcon className="size-3.5 text-secondary" />
                      Bio
                    </span>
                  </label>
                  <div className="relative">
                    <FileTextIcon className="absolute top-4 left-3.5 size-4 text-base-content/40" />
                    <textarea
                      value={formState.bio}
                      onChange={(event) => setFormState((current) => ({ ...current, bio: event.target.value }))}
                      className="textarea textarea-bordered w-full pl-11 pt-3 h-20 bg-white/5 border-primary/20 focus:border-secondary/50 focus:bg-transparent text-sm"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                </div>

                {/* Location & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2 text-base-content/85 text-xs tracking-wide uppercase">
                        <MapPinIcon className="size-3.5 text-accent" />
                        Location
                      </span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                      <input
                        type="text"
                        value={formState.location}
                        onChange={(event) => setFormState((current) => ({ ...current, location: event.target.value }))}
                        className="input input-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-accent/50 focus:bg-transparent"
                        placeholder="e.g., Paris, France"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2 text-base-content/85 text-xs tracking-wide uppercase">
                        <ActivityIcon className="size-3.5 text-accent" />
                        Status
                      </span>
                    </label>
                    <div className="relative">
                      <ActivityIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                      <select
                        value={formState.availability}
                        onChange={(event) => setFormState((current) => ({ ...current, availability: event.target.value }))}
                        className="select select-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-accent/50 focus:bg-transparent"
                      >
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-black text-white">
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Native & Learning Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2 text-base-content/85 text-xs tracking-wide uppercase">
                        <GlobeIcon className="size-3.5 text-secondary" />
                        Native Language
                      </span>
                    </label>
                    <div className="relative">
                      <GlobeIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                      <select
                        value={formState.nativeLanguage}
                        onChange={(event) => setFormState((current) => ({ ...current, nativeLanguage: event.target.value }))}
                        className="select select-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-secondary/50 focus:bg-transparent"
                      >
                        <option value="" className="bg-black text-white">Select language</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()} className="bg-black text-white">
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2 text-base-content/85 text-xs tracking-wide uppercase">
                        <BookOpenIcon className="size-3.5 text-secondary" />
                        Learning Language
                      </span>
                    </label>
                    <div className="relative">
                      <BookOpenIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                      <select
                        value={formState.learningLanguage}
                        onChange={(event) => setFormState((current) => ({ ...current, learningLanguage: event.target.value }))}
                        className="select select-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-secondary/50 focus:bg-transparent"
                      >
                        <option value="" className="bg-black text-white">Select language</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()} className="bg-black text-white">
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Live Preview card */}
                <div className="rounded-2xl border border-primary/15 bg-white/5 p-5 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="size-4 text-primary animate-pulse" />
                    <p className="font-semibold text-white text-sm">Live Preview Card</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
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
                      <p className="font-bold text-white text-base flex items-center gap-1.5">
                        {formState.fullName || authUser?.fullName || "Preview Name"}
                        <span className="badge badge-primary text-[10px] scale-90">Live</span>
                      </p>
                      <p className="text-xs text-base-content/60 mt-0.5">This is what other learners see on Voxora.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit / Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button type="submit" className="btn btn-glowing w-full sm:w-auto min-w-48 font-bold" disabled={isPending}>
                  {isPending ? (
                    <>
                      <LoaderIcon className="size-5 animate-spin mr-2" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <BadgeCheckIcon className="size-5 mr-2" />
                      Save profile changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Sidebar Panel */}
          <aside className="space-y-6">
            {/* Profile Snapshot Card */}
            <div className="card glass-card border border-primary/20 shadow-xl overflow-hidden glow-border">
              <div className="card-body p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Profile Snapshot</h3>
                  <p className="text-xs text-base-content/60 mt-1">Account identity details for current active session.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-primary/15 px-4 py-3 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-base-content/60 font-medium tracking-wide">NAME</span>
                    <span className="text-sm font-semibold text-white text-right">{authUser?.fullName || "Unset"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-primary/15 px-4 py-3 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-base-content/60 font-medium tracking-wide">EMAIL</span>
                    <span className="text-sm font-semibold text-white text-right break-all max-w-[180px]">{authUser?.email}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-primary/15 px-4 py-3 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-base-content/60 font-medium tracking-wide">LANGUAGES</span>
                    <span className="text-sm font-semibold text-white text-right capitalize">
                      {authUser?.nativeLanguage || "None"} ➔ {authUser?.learningLanguage || "None"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-primary/15 px-4 py-3 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-base-content/60 font-medium tracking-wide">LOCATION</span>
                    <span className="text-sm font-semibold text-white text-right">{authUser?.location || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium features info */}
            <div className="card bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 border border-primary/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
              <div className="card-body p-6 space-y-3 relative z-10">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <SparklesIcon className="size-4 text-secondary animate-pulse" />
                  Premium Design Enabled
                </h3>
                <p className="text-xs text-base-content/75 leading-relaxed">
                  Enjoy the brand new customized glassmorphism styling, ambient mesh backgrounds, and modern text gradients designed for professional developers.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="badge badge-primary bg-primary/10 border-primary/20 text-[10px] font-bold">DARK MODE</span>
                  <span className="badge badge-secondary bg-secondary/10 border-secondary/20 text-[10px] font-bold">GLASSMORPHISM</span>
                  <span className="badge badge-accent bg-accent/10 border-accent/20 text-[10px] font-bold">PRO</span>
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