import UsersLayout from "@/Layouts/UsersLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Building, Save, Key, Camera, Upload } from "lucide-react";

export default function Profile({ mustVerifyEmail, status }) {
  const user = usePage().props.auth.user;
  const [previewImage, setPreviewImage] = useState(null);

  const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    middlename: user.middlename || "",
    username: user.username || "",
    email: user.email || "",
    office: user.office || "",
    profile_image: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("profile_image", file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const submit = (e) => {
    e.preventDefault();

    // Use post method for file uploads
    post(route("profile.update"), {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        setPreviewImage(null);
      },
      onError: () => {
        toast.error("Failed to update profile. Please check the form.");
      },
    });
  };

  return (
    <UsersLayout>
      <Head title="My Profile" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user.profile_image || previewImage ? (
                    <img
                      src={previewImage || `/storage/${user.profile_image}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Profile
                </h1>
                <p className="text-gray-600">
                  Manage your account information and preferences
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-6">
                {/* Profile Image Upload inside the form */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                        {user.profile_image || previewImage ? (
                          <img
                            src={previewImage || `/storage/${user.profile_image}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="profile_image" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <Upload className="w-4 h-4" />
                          {user.profile_image ? "Change Profile Picture" : "Upload Profile Picture"}
                        </div>
                        <Input
                          id="profile_image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG, GIF up to 2MB. Optional.
                      </p>
                      {errors.profile_image && (
                        <p className="text-sm text-red-600 mt-1">{errors.profile_image}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">First Name</Label>
                    <Input
                      id="firstname"
                      value={data.firstname}
                      onChange={(e) => setData("firstname", e.target.value)}
                      placeholder="Enter your first name"
                      className="w-full"
                    />
                    {errors.firstname && (
                      <p className="text-sm text-red-600">{errors.firstname}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input
                      id="lastname"
                      value={data.lastname}
                      onChange={(e) => setData("lastname", e.target.value)}
                      placeholder="Enter your last name"
                      className="w-full"
                    />
                    {errors.lastname && (
                      <p className="text-sm text-red-600">{errors.lastname}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middlename">Middle Name (Optional)</Label>
                    <Input
                      id="middlename"
                      value={data.middlename}
                      onChange={(e) => setData("middlename", e.target.value)}
                      placeholder="Enter your middle name"
                      className="w-full"
                    />
                    {errors.middlename && (
                      <p className="text-sm text-red-600">{errors.middlename}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={data.username}
                      onChange={(e) => setData("username", e.target.value)}
                      placeholder="Enter your username"
                      className="w-full"
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                      placeholder="Enter your email"
                      className="w-full"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office">Office/Department</Label>
                    <Input
                      id="office"
                      value={data.office}
                      onChange={(e) => setData("office", e.target.value)}
                      placeholder="Enter your office/department"
                      className="w-full"
                    />
                    {errors.office && (
                      <p className="text-sm text-red-600">{errors.office}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    {processing ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                For security reasons, password changes are handled through the admin panel.
                Please contact your administrator if you need to change your password.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </UsersLayout>
  );
}