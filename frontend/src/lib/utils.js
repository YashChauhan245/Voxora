export const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const getAvatarFallback = (name = "user") => {
	const seed = encodeURIComponent(name || "user");
	return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&radius=50&fontSize=42&backgroundColor=0f766e,1d4ed8,4338ca&textColor=ffffff`;
};

export const getProfileImage = (profilePic, name = "user") => {
	if (!profilePic) return getAvatarFallback(name);

	const isOldAvatarStyle =
		profilePic.includes("api.dicebear.com/9.x/adventurer-neutral") ||
		profilePic.includes("avatar.iran.liara.run");

	if (isOldAvatarStyle) return getAvatarFallback(name);

	return profilePic;
};