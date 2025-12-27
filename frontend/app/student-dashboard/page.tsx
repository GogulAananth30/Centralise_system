"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  User,
  BookOpen,
  Award,
  Activity,
  FileText,
  Share2,
  CheckCircle,
  Clock,
  XCircle,
  LogOut,
  Plus,
  Upload,
  X,
  Edit
} from "lucide-react";

// Interfaces
interface UserProfile {
  full_name: string;
  email: string;
  role: string;
  department: string;
  year?: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  skills_gained?: string[];
}

interface AcademicRecord {
  semester: string;
  gpa: number;
  credits_earned: number;
  total_credits: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    category: "Technical",
    duration: "1 week",
    skills_gained: "",
    proof_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editUser, setEditUser] = useState({
    full_name: "",
    department: "",
    year: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const API_BASE = "http://127.0.0.1:8000";

      // Parallel data fetching
      const [userRes, activityRes, academicRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/auth/me`, config),
        axios.get(`${API_BASE}/activities/`, config),
        axios.get(`${API_BASE}/academic/academic-records/`, config)
      ]);

      // Handle User Profile
      if (userRes.status === "fulfilled") {
        setUser(userRes.value.data);
        // Role Guard
        if (userRes.value.data.role !== "student") {
          alert("Access Denied: Student Only");
          router.push("/login");
          return;
        }
      } else {
        throw new Error("Failed to load profile");
      }

      // Handle Activities
      if (activityRes.status === "fulfilled") {
        setActivities(activityRes.value.data);
      }

      // Handle Academics
      if (academicRes.status === "fulfilled") {
        setAcademicRecords(academicRes.value.data);
      }

    } catch (error) {
      console.error("Dashboard Error:", error);
      // alert("Error loading dashboard data. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const API_BASE = "http://127.0.0.1:8000";
      const res = await axios.put(`${API_BASE}/auth/profile`, editUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setIsProfileModalOpen(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile");
    }
  };

  const openProfileModal = () => {
    if (user) {
      setEditUser({
        full_name: user.full_name,
        department: user.department || "",
        year: user.year || ""
      });
      setIsProfileModalOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-100 border-green-200";
      case "rejected": return "text-red-600 bg-red-100 border-red-200";
      default: return "text-yellow-600 bg-yellow-100 border-yellow-200";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = "http://127.0.0.1:8000";

      const res = await axios.post(`${API_BASE}/activities/upload-proof`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setNewActivity({ ...newActivity, proof_url: res.data.url });
      alert("Certificate uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload certificate");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const API_BASE = "http://127.0.0.1:8000";

      // Convert comma-separated skills to array
      const payload = {
        ...newActivity,
        skills_gained: newActivity.skills_gained.split(',').map(s => s.trim()).filter(s => s.length > 0)
      };

      const res = await axios.post(`${API_BASE}/activities/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActivities([res.data, ...activities]);
      setIsModalOpen(false);
      setNewActivity({
        title: "",
        description: "",
        category: "Technical",
        duration: "1 week",
        skills_gained: "",
        proof_url: ""
      });
      alert("Activity submitted for approval!");

    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit activity");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-5 h-5" />;
      case "rejected": return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  // metrics
  const approvedCount = activities.filter(a => a.status === 'approved').length;
  const pendingCount = activities.filter(a => a.status === 'pending').length;
  const totalCredits = academicRecords.reduce((acc, curr) => acc + curr.credits_earned, 0);

  // Derived state for skills
  const approvedSkills = Array.from(new Set(
    activities
      .filter(a => a.status === 'approved')
      .flatMap(a => a.skills_gained || [])
  ));

  const handleGeneratePDF = () => {
    window.print();
  };

  const handleShareLink = async () => {
    // In a real app, this would link to a public profile page
    // For now, we'll copy a hypothetical URL
    const publicUrl = `${window.location.origin}/student-profile/${user?.email || 'uid'}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      alert(`Public profile link copied: ${publicUrl}`);
    } catch (err) {
      console.error('Clipboard API failed: ', err);
      // Fallback for older browsers or restricted contexts
      try {
        const textArea = document.createElement("textarea");
        textArea.value = publicUrl;

        // Ensure it's not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          alert(`Public profile link copied: ${publicUrl}`);
        } else {
          throw new Error("execCommand failed");
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
        alert("Failed to copy link to clipboard. Please manually copy: " + publicUrl);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm font-medium hidden md:block">Welcome, {user.full_name}</span>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">

        {/* 1. Digital Identity Card */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <User className="w-32 h-32" />
            </div>
            <button
              onClick={openProfileModal}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-20 group"
              title="Edit Profile"
            >
              <Edit className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-3xl font-bold border-2 border-white/50">
                {user?.full_name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold">{user?.full_name}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm border border-white/10">
                  {user?.department || "General"}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm border border-white/10">
                  Year: {user?.year || "N/A"}
                </span>
                <span className="px-3 py-1 bg-green-500/80 rounded-full text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified Student
                </span>
              </div>
            </div>
          </div>

          {/* 2. Progress Overview */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Activities</p>
                  <p className="text-2xl font-bold">{activities.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Credits</p>
                  <p className="text-2xl font-bold">{totalCredits}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Academic & Portfolio Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Academic Records */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" /> Academic Records
            </h3>
            {academicRecords.length > 0 ? (
              <div className="space-y-4">
                {academicRecords.map((record, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{record.semester}</span>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">GPA</p>
                      <p className="font-bold text-lg text-blue-600">{record.gpa.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p>No academic records found</p>
              </div>
            )}
          </div>

          {/* Portfolio & Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" /> Skills & Portfolio
            </h3>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Verified Skills</h4>
              <div className="flex flex-wrap gap-2">
                {approvedSkills.length > 0 ? (
                  approvedSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-800">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No verified skills yet.</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGeneratePDF}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-medium transition flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" /> Generate PDF Portfolio
              </button>
              <button
                onClick={handleShareLink}
                className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" /> Share Public Link
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Your portfolio reflects {approvedCount} approved achievements.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Activity Timeline */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Activity Timeline
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" /> Add Activity
              </button>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
                Showing all
              </span>
            </div>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className={`mt-1 flex-shrink-0 ${activity.status === 'approved' ? 'text-green-500' :
                    activity.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{activity.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize border ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Submitted on {new Date(activity.created_at || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No activities recorded yet.</p>
              <button className="mt-4 text-blue-500 font-medium hover:underline">Add your first activity</button>
            </div>
          )}
        </section>
      </main>

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold">Add New Activity</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  value={newActivity.title}
                  onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="e.g. Hackathon Winner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  rows={3}
                  value={newActivity.description}
                  onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Describe your achievement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    value={newActivity.category}
                    onChange={e => setNewActivity({ ...newActivity, category: e.target.value })}
                  >
                    <option>Technical</option>
                    <option>Cultural</option>
                    <option>Sports</option>
                    <option>Social Service</option>
                    <option>Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    value={newActivity.duration}
                    onChange={e => setNewActivity({ ...newActivity, duration: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills Gained (comma separated)</label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  value={newActivity.skills_gained}
                  onChange={e => setNewActivity({ ...newActivity, skills_gained: e.target.value })}
                  placeholder="e.g. Leadership, Python, Teamwork"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Upload Certificate</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{uploading ? "Uploading..." : "Choose File"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                  </label>
                  {newActivity.proof_url && <span className="text-xs text-green-500">File attached ✓</span>}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Submit Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  value={editUser.full_name}
                  onChange={e => setEditUser({ ...editUser, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  value={editUser.department}
                  onChange={e => setEditUser({ ...editUser, department: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  value={editUser.year}
                  onChange={e => setEditUser({ ...editUser, year: e.target.value })}
                  placeholder="e.g. 3rd Year"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
