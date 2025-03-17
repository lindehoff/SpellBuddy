'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: number;
  lastLoginAt: number | null;
  experiencePoints: number;
  level: number;
  isEnabled: boolean;
  totalExercises: number;
  achievementsCount: number;
}

interface UserDetails extends User {
  preferences: {
    age?: number;
    interests?: string;
    difficultyLevel: string;
    topicsOfInterest?: string;
    adaptiveDifficulty: number;
    currentDifficultyScore: number;
  };
  progress: {
    totalExercises: number;
    correctWords: number;
    incorrectWords: number;
    streakDays: number;
    perfectExercises: number;
    longestStreak: number;
    totalExperiencePoints: number;
  };
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    unlockedAt: number;
  }>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newExperience, setNewExperience] = useState(0);
  const [newLevel, setNewLevel] = useState(1);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/users?page=${page}&search=${search}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.data.users);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadUserDetails = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load user details');
      }

      const data = await response.json();
      setSelectedUser(data.data);
      setNewExperience(data.data.experiencePoints);
      setNewLevel(data.data.level);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleUserStatus = async (userId: number, enabled: boolean) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      setSuccess('User status updated successfully');
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetPassword = async (userId: number) => {
    try {
      setError(null);
      setSuccess(null);

      if (!newPassword || newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      setSuccess('Password reset successfully');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateExperience = async (userId: number) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/users/${userId}/experience`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiencePoints: newExperience,
          level: newLevel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update experience');
      }

      setSuccess('Experience updated successfully');
      loadUserDetails(userId);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-white mb-8">👥 User Management</h1>

      {/* Search and filters */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Users table */}
      <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exercises</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Achievements</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white">{user.username}</span>
                    <span className="text-gray-400 text-sm">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-white">
                  Level {user.level} ({user.experiencePoints} XP)
                </td>
                <td className="px-6 py-4 text-white">
                  {user.totalExercises}
                </td>
                <td className="px-6 py-4 text-white">
                  {user.achievementsCount}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => loadUserDetails(user.id)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user.id, !user.isEnabled)}
                    className={`${
                      user.isEnabled ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                    }`}
                  >
                    {user.isEnabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-white">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* User details modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-gray-900 rounded-xl border border-white/10 p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                User Details: {selectedUser.username}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Joined</p>
                    <p>{format(selectedUser.createdAt * 1000, 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Login</p>
                    <p>
                      {selectedUser.lastLoginAt
                        ? format(selectedUser.lastLoginAt * 1000, 'PPP')
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <p className={selectedUser.isEnabled ? 'text-green-400' : 'text-red-400'}>
                      {selectedUser.isEnabled ? 'Active' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Experience and Level */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Experience & Level</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Experience Points
                    </label>
                    <input
                      type="number"
                      value={newExperience}
                      onChange={(e) => setNewExperience(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Level
                    </label>
                    <input
                      type="number"
                      value={newLevel}
                      onChange={(e) => setNewLevel(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => updateExperience(selectedUser.id)}
                  className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200"
                >
                  Update Experience & Level
                </button>
              </div>

              {/* Password Reset */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Password Reset</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={() => resetPassword(selectedUser.id)}
                    className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Reset Password
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Exercises</p>
                    <p className="text-xl font-semibold">{selectedUser.progress?.totalExercises || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Correct Words</p>
                    <p className="text-xl font-semibold">{selectedUser.progress?.correctWords || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Streak</p>
                    <p className="text-xl font-semibold">{selectedUser.progress?.streakDays || 0} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Longest Streak</p>
                    <p className="text-xl font-semibold">{selectedUser.progress?.longestStreak || 0} days</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Achievements ({selectedUser.achievements?.length || 0})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.achievements?.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-black/20 border border-white/10"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="text-white font-medium">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Unlocked: {format(achievement.unlockedAt * 1000, 'PP')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!selectedUser.achievements || selectedUser.achievements.length === 0) && (
                    <div className="col-span-2 text-center py-6 text-gray-400">
                      No achievements unlocked yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 