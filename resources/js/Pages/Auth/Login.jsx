import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Lock } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('login'), { onFinish: () => reset('password') });
  };

  return (
    <GuestLayout>
      <Head title="Log in" />

      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-4xl rounded-3xl shadow-2xl flex overflow-hidden border border-gray-700">
          {/* Left side - Logo */}
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img
              src="/img/depedlogo.png"
              alt="School Logo"
              className="h-64 w-auto animate-float"
            />
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-1/2 px-12 py-12 bg-[#111827]">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center md:text-left">
              Welcome Back
            </h2>

            {status && (
              <div className="text-center md:text-left text-green-700 font-medium mb-6">
                {status}
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              {/* Username */}
              <div>
                <InputLabel
                  htmlFor="username"
                  value="Username"
                  className="text-sm font-semibold text-white"
                />
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-5 w-5" />
                  <TextInput
                    id="username"
                    type="text"
                    name="username"
                    value={data.username}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-400 text-base sm:text-lg text-white bg-[#111827] placeholder-gray-400"
                    autoComplete="username"
                    isFocused={true}
                    onChange={(e) => setData('username', e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <InputError message={errors.username} className="mt-1 text-red-400" />
              </div>

              {/* Password */}
              <div>
                <InputLabel
                  htmlFor="password"
                  value="Password"
                  className="text-sm font-semibold text-white"
                />
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-5 w-5" />
                  <TextInput
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-400 text-base sm:text-lg text-white bg-[#111827] placeholder-gray-400"
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                <InputError message={errors.password} className="mt-1 text-red-400" />
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    name="remember"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-white">Remember me</span>
                </div>

                {canResetPassword && (
                  <Link
                    href={route('password.request')}
                    className="text-sm text-blue-500 hover:text-blue-300 underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

              {/* Submit */}
              <PrimaryButton
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-700 text-white rounded-xl py-3 sm:py-4 text-base sm:text-lg md:text-xl transition-all duration-200"
                disabled={processing}
              >
                Log in
              </PrimaryButton>
            </form>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}