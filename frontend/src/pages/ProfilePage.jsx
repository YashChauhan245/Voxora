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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="container mx-auto max-w-6xl space-y-6">
        
        {/* Page Header */}
        <div className="page-header">
          <p className="badge badge-primary gap-1 px-2.5 py-1 text-[10px] tracking-wider uppercase font-bold w-fit bg-primary/10 border-primary/20">
            <SparklesIcon className="size-3 text-primary animate-pulse" />
            Profile Studio
          </p>
          <h1 className="page-header-title mt-2">Edit Your Profile</h1>
          <p className="page-header-subtitle">
            Update your digital avatar, display name, and preferences. The live preview updates instantly to show what other language learners will see.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.35fr_0.85fr]">
          <form onSubmit={handleSubmit} className="card bg-base-200 border border-primary/15 shadow-2xl overflow-hidden">
            {/* Banner Background */}
            <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-primary/25 via-secondary/20 to-accent/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-mesh opacity-40" />
            </div>

            <div className="card-body p-6 sm:p-8 -mt-20 sm:-mt-24 space-y-6 relative z-10">
              {/* Profile Avatar & Primary details header overlapping the banner */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 text-center sm:text-left">
                  <div className="relative mx-auto sm:mx-0 w-fit">
                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary via-secondary to-accent blur-md opacity-60" />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="avatar relative cursor-pointer group"
                    >
                      <div className="w-28 sm:w-32 rounded-full ring-4 ring-base-200 bg-base-300 overflow-hidden relative shadow-2xl">
                        <img
                          src={previewImage}
                          alt={formState.fullName || authUser?.fullName || "Profile preview"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = getAvatarFallback(formState.fullName || authUser?.fullName);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-white text-[10px] font-bold tracking-wider uppercase">
                          <UploadIcon className="size-4 mb-1 text-primary animate-pulse" />
                          Change
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pb-2 space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-base-content flex items-center justify-center sm:justify-start gap-1.5">
                      {formState.fullName || authUser?.fullName || "Your name"}
                      <BadgeCheckIcon className="size-5 text-success" />
                    </h2>
                    <p className="text-xs sm:text-sm text-base-content/40 font-medium">{authUser?.email}</p>
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
                    className="btn btn-outline btn-xs border-primary/20 hover:border-primary/50 text-base-content/80 font-semibold"
                  >
                    <UploadIcon className="size-3.5 text-primary" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAvatar}
                    className="btn btn-ghost btn-xs text-base-content/60 font-semibold hover:bg-base-300"
                  >
                    <RefreshCcwIcon className="size-3.5 text-secondary" />
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
                    className="btn btn-ghost btn-xs text-base-content/40 font-semibold hover:bg-base-300"
                  >
                    <CameraIcon className="size-3.5" />
                    Initials
                  </button>
                </div>
              </div>

              <div className="divider opacity-5" />

              {/* Form Input fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Display Name */}
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold flex items-center gap-2 text-base-content/50 text-[10px] tracking-wider uppercase">
                        <UserIcon className="size-3.5 text-primary" />
                        Display name
                      </span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/30" />
                      <input
                        type="text"
                        value={formState.fullName}
                        onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
                        className="input input-bordered w-full pl-11 bg-base-100/50 border-primary/15 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold flex items-center gap-2 text-base-content/50 text-[10px] tracking-wider uppercase">
                        <GlobeIcon className="size-3.5 text-primary" />
                        Avatar URL
                      </span>
                    </label>
                    <div className="relative">
                      <GlobeIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/30" />
                      <input
                        type="url"
                        value={formState.profilePic}
                        onChange={(event) => setFormState((current) => ({ ...current, profilePic: event.target.value }))}
                        className="input input-bordered w-full pl-11 bg-base-100/50 border-primary/15 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-xs"
                        placeholder="Paste image URL or upload one"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold flex items-center gap-2 text-base-content/50 text-[10px] tracking-wider uppercase">
                      <FileTextIcon className="size-3.5 text-secondary" />
                      Bio
                    </span>
                  </label>
                  <div className="relative">
                    <FileTextIcon className="absolute top-4 left-3.5 size-4 text-base-content/30" />
                    <textarea
                      value={formState.bio}
                      onChange={(event) => setFormState((current) => ({ ...current, bio: event.target.value }))}
                      className="textarea textarea-bordered w-full pl-11 pt-3.5 h-20 bg-base-100/50 border-primary/15 hover:border-primary/25 focus:border-secondary focus:bg-base-100 transition-all text-sm leading-relaxed"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                </div>

                {/* Location & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold flex items-center gap-2 text-base-content/50 text-[10px] tracking-wider uppercase">
                        <MapPinIcon className="size-3.5 text-accent" />
                        Location
                      </span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/30" />
                      <input
                        type="text"
                        value={formState.location}
                        onChange={(event) => setFormState((current) => ({ ...current, location: event.target.value }))}
                        className="input input-bordered w-full pl-11 bg-base-100/50 border-primary/15 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                        placeholder="e.g., Paris, France"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold flex items-center gap-2 text-base-content/50 text-[10px] tracking-wider uppercase">
                        <ActivityIcon className="size-3.5 text-accent" />
                        Status
                      </span>
                    </label>
                    <div className="relative">
                      <ActivityIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/30" />
                      <select
                        value={formState.availability}
                        onChange={(event) => setFormState((current) => ({ ...current, availability: event.target.value }))}
                        className="select select-bordered w-full pl-11 bg-base-100/50 border-primary/15 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                      >
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-base-200 text-base-content">
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Native & Learning Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold flex items-center gap-2 text-base-content/50 text-[10px] tracking-wider uppercase">
                        <GlobeIcon className="size-3.5 text-secondary" />
                        Native Language
                      </span>
                    </label>
                    <div className="relative">
                      <GlobeIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/30" />
                      <select
                        value={formState.nativeLanguage}
                        onChange={(event) => setFormState((current) => ({ ...current, nativeLanguage: event.target.value }))}
                        className="select select-bordered w-full pl-11 bg-base-100/50 border-primary/15 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                      >
                        <option value="" className="bg-base-200 text-base-content">Select language</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()} className="bg-base-200 text-base-content">
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold flex items-center gap-2 text-base-content/50 text-[10px] tracking-wider uppercase">
                        <BookOpenIcon className="size-3.5 text-secondary" />
                        Learning Language
                      </span>
                    </label>
                    <div className="relative">
                      <BookOpenIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/30" />
                      <select
                        value={formState.learningLanguage}
                        onChange={(event) => setFormState((current) => ({ ...current, learningLanguage: event.target.value }))}
                        className="select select-bordered w-full pl-11 bg-base-100/50 border-primary/15 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                      >
                        <option value="" className="bg-base-200 text-base-content">Select language</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()} className="bg-base-200 text-base-content">
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Live Preview card */}
                <div className="rounded-xl border border-primary/10 bg-base-100/30 p-4 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="size-3.5 text-primary animate-pulse" />
                    <p className="font-bold text-base-content/80 text-xs uppercase tracking-wider">Live Preview Snapshot</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="avatar">
                      <div className="w-14 rounded-full ring-2 ring-primary ring-offset-base-200 ring-offset-2">
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
                      <p className="font-bold text-base-content text-sm flex items-center gap-1.5">
                        {formState.fullName || authUser?.fullName || "Preview Name"}
                        <span className="badge badge-primary text-[9px] font-bold px-1.5 py-0.5">Live</span>
                      </p>
                      <p className="text-[11px] text-base-content/40 mt-1">This is how other language partners see you in searches.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit / Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button type="submit" className="btn btn-primary w-full sm:w-auto min-w-48 font-bold" disabled={isPending}>
                  {isPending ? (
                    <>
                      <LoaderIcon className="size-4 animate-spin mr-2" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <BadgeCheckIcon className="size-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Sidebar Panel */}
          <aside className="space-y-4">
            {/* Profile Snapshot Card */}
            <div className="card bg-base-200 border border-primary/15 shadow-xl">
              <div className="card-body p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Profile Status</h3>
                  <p className="text-[10px] text-base-content/30 mt-0.5">Account identity details for current session.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-base-100/40 border border-primary/5 px-3 py-2">
                    <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider shrink-0">NAME</span>
                    <span className="text-xs font-semibold text-base-content/85 truncate">{authUser?.fullName || "Unset"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-base-100/40 border border-primary/5 px-3 py-2">
                    <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider shrink-0">EMAIL</span>
                    <span className="text-[11px] font-semibold text-base-content/85 truncate max-w-[150px]">{authUser?.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-base-100/40 border border-primary/5 px-3 py-2">
                    <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider shrink-0">LANGUAGES</span>
                    <span className="text-xs font-semibold text-base-content/85 capitalize truncate">
                      {authUser?.nativeLanguage || "None"} ➔ {authUser?.learningLanguage || "None"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-base-100/40 border border-primary/5 px-3 py-2">
                    <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider shrink-0">LOCATION</span>
                    <span className="text-xs font-semibold text-base-content/85 truncate">{authUser?.location || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium features info */}
            <div className="card bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 border border-primary/15 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-2xl rounded-full" />
              <div className="card-body p-5 space-y-2 relative z-10">
                <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 uppercase tracking-wider">
                  <SparklesIcon className="size-3.5 text-secondary animate-pulse" />
                  Premium Design Enabled
                </h3>
                <p className="text-[11.5px] text-base-content/50 leading-relaxed">
                  Enjoy the brand new customized obsidian layout, grain noise depth overlays, and animated sidebar navigation transitions.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="badge bg-primary/10 border-primary/20 text-[9px] font-bold">DARK MODE</span>
                  <span className="badge bg-secondary/10 border-secondary/20 text-[9px] font-bold">GRAIN OVERLAY</span>
                  <span className="badge bg-accent/10 border-accent/20 text-[9px] font-bold">PRO</span>
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