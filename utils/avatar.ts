export const DEFAULT_AVATAR_PATH = "/default-avatar.svg";

export const getAvatarSrc = (avatar?: string) => {
  if (!avatar) return DEFAULT_AVATAR_PATH;
  const trimmed = avatar.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_AVATAR_PATH;
};
