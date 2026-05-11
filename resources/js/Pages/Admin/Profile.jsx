import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Building, Save, Key, Shield, Camera, Upload } from "lucide-react";

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
    <AdminLayout>
      <Head title="My Profile" />

      <div className="min-h-screen bg-slate-50 py-6">
        <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user.profile_image || previewImage ? (
                      <img
                        src={previewImage || `/storage/${user.profile_image}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shield className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">
                    My Profile
                  </h1>
                  <p className="text-slate-500">
                    Manage your administrator account information
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <User className="w-5 h-5 text-slate-700" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-6">
              <form onSubmit={submit} className="space-y-6">
                {/* Profile Image Upload inside the form */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200">
                        {user.profile_image || previewImage ? (
                          <img
                            src={previewImage || `/storage/${user.profile_image}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Shield className="w-12 h-12 text-slate-400" />
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
                      <p className="text-sm text-slate-500 mt-1">
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
                    <Label htmlFor="firstname" className="text-sm font-medium text-slate-700">
                      First Name
                    </Label>
                    <Input
                      id="firstname"
                      value={data.firstname}
                      onChange={(e) => setData("firstname", e.target.value)}
                      placeholder="Enter your first name"
                      className="w-full border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.firstname && (
                      <p className="text-sm text-red-600">{errors.firstname}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-sm font-medium text-slate-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastname"
                      value={data.lastname}
                      onChange={(e) => setData("lastname", e.target.value)}
                      placeholder="Enter your last name"
                      className="w-full border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.lastname && (
                      <p className="text-sm text-red-600">{errors.lastname}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middlename" className="text-sm font-medium text-slate-700">
                      Middle Name (Optional)
                    </Label>
                    <Input
                      id="middlename"
                      value={data.middlename}
                      onChange={(e) => setData("middlename", e.target.value)}
                      placeholder="Enter your middle name"
                      className="w-full border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.middlename && (
                      <p className="text-sm text-red-600">{errors.middlename}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={data.username}
                      onChange={(e) => setData("username", e.target.value)}
                      placeholder="Enter your username"
                      className="w-full border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                      placeholder="Enter your email"
                      className="w-full border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office" className="text-sm font-medium text-slate-700">
                      Office/Department
                    </Label>
                    <Input
                      id="office"
                      value={data.office}
                      onChange={(e) => setData("office", e.target.value)}
                      placeholder="Enter your office/department"
                      className="w-full border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.office && (
                      <p className="text-sm text-red-600">{errors.office}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 px-6 py-3 font-semibold rounded-2xl shadow-lg transition bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    {processing ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <Key className="w-5 h-5 text-slate-700" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-6">
              <p className="text-slate-600">
                Password changes can be managed through the admin settings panel.
                Navigate to Settings in the sidebar to update your password.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}