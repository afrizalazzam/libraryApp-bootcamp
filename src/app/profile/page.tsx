"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopNav } from "@/components/user/top-nav";
import { Footer } from "@/components/footer";
import { AccountTabs } from "@/components/user/account-tabs";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/lib/redux/hooks";
import { useProfileQuery, useUpdateProfileMutation } from "@/lib/api/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isHydrated } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (data) {
      setName(data.profile.name);
      setPhone(data.profile.phone ?? "");
    }
  }, [data]);

  if (!isHydrated || !user) return null;

  const profile = data?.profile;

  function startEditing() {
    if (!profile) return;
    setName(profile.name);
    setPhone(profile.phone ?? "");
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    updateMutation.mutate(
      { name, phone, profilePhoto: photoFile },
      {
        onSuccess: () => {
          showToast("Profile updated.");
          setIsEditing(false);
          setPhotoFile(null);
          setPhotoPreview(null);
        },
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <AccountTabs />

        <h1 className="mt-6 text-display-xs font-bold text-foreground">Profile</h1>

        {isError ? (
          <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
            {error.message}
          </p>
        ) : isLoading || !profile ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading profile...</p>
        ) : (
          <>
            <div className="mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Borrowed", value: data.loanStats.borrowed },
                { label: "Late", value: data.loanStats.late },
                { label: "Returned", value: data.loanStats.returned },
                { label: "Total Loans", value: data.loanStats.total },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-card p-4 text-center shadow-md"
                >
                  <p className="text-display-xs font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 max-w-xl rounded-2xl bg-card p-5 shadow-md">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted">
              <Image
                src={photoPreview ?? profile.profilePhoto ?? "/foto-profil.png"}
                alt={profile.name}
                fill
                className="object-cover"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-medium text-white opacity-0 transition-opacity hover:opacity-100"
                >
                  Change
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {isEditing ? (
              <div className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-md">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-md">
                    Nomor Handphone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 rounded-full"
                    onClick={cancelEditing}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 rounded-full"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 flex flex-col gap-2">
                  <div className="flex flex-col gap-0.5 text-md sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold text-foreground">{profile.name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-md sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold text-foreground">{profile.email}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-md sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <span className="text-muted-foreground">Nomor Handphone</span>
                    <span className="font-semibold text-foreground">
                      {profile.phone || "-"}
                    </span>
                  </div>
                </div>

                <Button size="lg" className="mt-5 w-full rounded-full" onClick={startEditing}>
                  Update Profile
                </Button>
              </>
            )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
