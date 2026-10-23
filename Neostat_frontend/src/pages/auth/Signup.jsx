
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/auth/AuthLayout";

const Signup = () => {
  const navigate = useNavigate();

  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Public signup users receive the Team Member role.
  const defaultRole = "TEAM_MEMBER";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      fullName,
      email,
      password,
      confirmPassword,
    } = formData;

    // Required fields validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Password matching validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Password length validation
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      // Do not send a role from public signup.
      // Backend assigns TEAM_MEMBER by default.
      await signup({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast.success("Account created successfully");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <p className="text-sm font-medium text-blue-400">
          GET STARTED
        </p>

        <h2 className="mt-3 text-3xl font-bold text-gray-100">
          Create your account
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Join your team and start collaborating.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        {/* Full Name */}
        <InputField
          label="Full name"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          icon={<User size={18} />}
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
        />

        {/* Email */}
        <InputField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          icon={<Mail size={18} />}
          autoComplete="email"
          required
        />

        {/* Account Role */}
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Account role
          </label>

          <div className="relative">
            <ShieldCheck
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="role"
              type="text"
              value="Team Member"
              readOnly
              aria-describedby="role-description"
              className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-gray-400 outline-none"
            />
          </div>

          <p
            id="role-description"
            className="mt-2 text-xs leading-5 text-slate-500"
          >
            Your role is assigned automatically. An administrator
            can change your access permissions later.
          </p>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-12 text-sm text-gray-200 outline-none transition placeholder:text-slate-500 focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-gray-200"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <InputField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={<Lock size={18} />}
          autoComplete="new-password"
          required
          minLength={8}
        />

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserPlus size={18} />

          {loading
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}

        <Link
          to="/login"
          className="font-semibold text-blue-400 transition hover:text-blue-300"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

// Reusable Input Field
const InputField = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon,
  autoComplete,
  required = false,
  minLength,
  maxLength,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-gray-200 outline-none transition placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default Signup;
