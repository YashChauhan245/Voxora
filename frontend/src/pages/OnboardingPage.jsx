import { useState, useRef } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import {
  CameraIcon,
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  UploadIcon,
  UserIcon,
  GlobeIcon,
  BookOpenIcon,
  ActivityIcon,
  SparklesIcon,
  FileTextIcon,
} from "lucide-react";
import { AVAILABILITY_OPTIONS, LANGUAGES } from "../constants";
import { getAvatarFallback } from "../lib/utils";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    availability: authUser?.availability || "available",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const randomSeed = `${formState.fullName || "user"}-${Math.random().toString(36).slice(2, 8)}`;
    const randomAvatar = getAvatarFallback(randomSeed);

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
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
      toast.success("Profile photo uploaded!");
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-black bg-mesh-dark flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Decorative Glow Nodes */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 size-72 sm:size-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="card glass-card w-full max-w-3xl shadow-2xl relative z-10 border border-primary/20 glow-border">
        <div className="card-body p-6 sm:p-10">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <span className="badge badge-primary gap-1.5 mb-3 px-3 py-2 bg-primary/10 border-primary/20 text-xs tracking-wider uppercase font-bold">
              <SparklesIcon className="size-3 text-primary animate-pulse" />
              Onboarding Setup
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              <span className="gradient-text">Complete Your Profile</span>
            </h1>
            <p className="text-base-content/60 text-sm max-w-md">
              Customize your digital presence to start learning and interacting in the Voxora community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative size-32 rounded-full p-1 bg-gradient-to-tr from-primary via-secondary to-accent shadow-lg glow-hover overflow-hidden group cursor-pointer"
              >
                <div className="w-full h-full rounded-full bg-base-300 overflow-hidden relative">
                  {formState.profilePic ? (
                    <img
                      src={formState.profilePic}
                      alt="Profile Preview"
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CameraIcon className="size-10 text-base-content opacity-40 group-hover:opacity-75 transition-opacity" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-white">
                    <UploadIcon className="size-5 mb-1 animate-bounce" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase">Upload</span>
                  </div>
                </div>
              </div>

              {/* Avatar Control BTNs */}
              <div className="flex flex-wrap items-center justify-center gap-3">
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
                  className="btn btn-outline btn-sm border-primary/20 hover:border-primary/50 text-base-content/90 font-medium"
                >
                  <UploadIcon className="size-4 mr-2 text-primary" />
                  Upload Photo
                </button>
                <button 
                  type="button" 
                  onClick={handleRandomAvatar} 
                  className="btn btn-ghost btn-sm text-base-content/70 hover:text-base-content hover:bg-white/5"
                >
                  <ShuffleIcon className="size-4 mr-2 text-secondary" />
                  Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <UserIcon className="size-4 text-primary" />
                  Full Name
                </span>
              </label>
              <div className="relative">
                <UserIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="input input-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-primary/50 focus:bg-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FileTextIcon className="size-4 text-primary" />
                  Bio
                </span>
              </label>
              <div className="relative">
                <FileTextIcon className="absolute top-4 left-3.5 size-4 text-base-content/40" />
                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="textarea textarea-bordered w-full pl-11 pt-3 h-24 bg-white/5 border-primary/20 focus:border-primary/50 focus:bg-transparent"
                  placeholder="Tell others about yourself and your language learning goals"
                />
              </div>
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <GlobeIcon className="size-4 text-secondary" />
                    Native Language
                  </span>
                </label>
                <div className="relative">
                  <GlobeIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                  <select
                    name="nativeLanguage"
                    value={formState.nativeLanguage}
                    onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                    className="select select-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-secondary/50 focus:bg-transparent"
                    required
                  >
                    <option value="" className="bg-black text-white">Select native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()} className="bg-black text-white">
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <BookOpenIcon className="size-4 text-secondary" />
                    Learning Language
                  </span>
                </label>
                <div className="relative">
                  <BookOpenIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                  <select
                    name="learningLanguage"
                    value={formState.learningLanguage}
                    onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                    className="select select-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-secondary/50 focus:bg-transparent"
                    required
                  >
                    <option value="" className="bg-black text-white">Select language learning</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang.toLowerCase()} className="bg-black text-white">
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* LOCATION & AVAILABILITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LOCATION */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <MapPinIcon className="size-4 text-accent" />
                    Location
                  </span>
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                  <input
                    type="text"
                    name="location"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="input input-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-accent/50 focus:bg-transparent"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* AVAILABILITY */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <ActivityIcon className="size-4 text-accent" />
                    Availability
                  </span>
                </label>
                <div className="relative">
                  <ActivityIcon className="absolute top-1/2 transform -translate-y-1/2 left-3.5 size-4 text-base-content/40" />
                  <select
                    name="availability"
                    value={formState.availability}
                    onChange={(e) => setFormState({ ...formState, availability: e.target.value })}
                    className="select select-bordered w-full pl-11 bg-white/5 border-primary/20 focus:border-accent/50 focus:bg-transparent"
                  >
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-black text-white">
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button className="btn btn-glowing w-full mt-6 py-3 font-bold" disabled={isPending} type="submit">
              {!isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <ShipWheelIcon className="size-5 animate-pulse" />
                  Complete Onboarding & Explore
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LoaderIcon className="animate-spin size-5" />
                  Setting up profile...
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;