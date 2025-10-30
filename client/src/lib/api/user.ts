export default interface UserProfle {
  userName: string;
  profession: string;
  city: string;
  state: string;
  profileImage?: string | null;
}

export const getUserProfile = async () => {
  {/* Mock backend data for time being */}
  return {
    userName: "Chandhru L",
    profession: "Software developer",
    city: "Chennai",
    state: "Tamil Nadu",
    profileImage: null,
  };
};
