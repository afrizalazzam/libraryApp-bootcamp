import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";

export type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  role: string;
  createdAt: string;
};

type ProfileResult = {
  profile: Profile;
  loanStats: {
    borrowed: number;
    late: number;
    returned: number;
    total: number;
  };
  reviewsCount: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function fetchProfile(token: string): Promise<ProfileResult> {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body: ApiEnvelope<ProfileResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load profile.");
  }

  return body.data;
}

export function useProfileQuery() {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(token as string),
    enabled: !!token,
  });
}

export type UpdateProfilePayload = {
  name: string;
  phone: string;
  profilePhoto?: File | null;
};

async function updateProfile(token: string, payload: UpdateProfilePayload): Promise<Profile> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("phone", payload.phone);
  if (payload.profilePhoto) formData.append("profilePhoto", payload.profilePhoto);

  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const body: ApiEnvelope<Profile> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to update profile.");
  }

  return body.data;
}

export function useUpdateProfileMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
