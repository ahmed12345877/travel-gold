import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Calendar,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function AdminUsers() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const limit = 20;

  const usersQuery = trpc.users.list.useQuery(
    { limit, offset: page * limit },
    { enabled: !isSearching },
  );

  const searchResults = trpc.users.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: isSearching && searchQuery.length > 0 },
  );

  const statsQuery = trpc.users.stats.useQuery();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      statsQuery.refetch();
    },
  });

  const displayedUsers = isSearching
    ? (searchResults.data ?? [])
    : (usersQuery.data?.users ?? []);

  const totalUsers = usersQuery.data?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / limit);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setIsSearching(value.length > 0);
    if (value.length === 0) {
      setPage(0);
    }
  };

  const handleRoleToggle = (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`,
      )
    ) {
      updateRoleMutation.mutate({
        id: userId,
        role: newRole as "user" | "admin",
      });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--theme-primary)]" />
            User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage registered users and their roles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--theme-primary)]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--theme-primary)]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Users</p>
              <p className="text-white text-xl font-bold">
                {statsQuery.data?.total ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Admins</p>
              <p className="text-white text-xl font-bold">
                {statsQuery.data?.admins ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Last 30 Days</p>
              <p className="text-white text-xl font-bold">
                {statsQuery.data?.recentSignups ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Today</p>
              <p className="text-white text-xl font-bold">
                {statsQuery.data?.todaySignups ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-[var(--card)] border border-[#2a2a3e] rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[var(--card)] border border-[#2a2a3e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3e]">
                <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">
                  User
                </th>
                <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">
                  Contact
                </th>
                <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">
                  Role
                </th>
                <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">
                  Joined
                </th>
                <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">
                  Last Sign In
                </th>
                <th className="text-right text-gray-400 text-xs font-medium py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(usersQuery.isLoading || searchResults.isLoading) && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-[var(--theme-primary)] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-2">
                      Loading users...
                    </p>
                  </td>
                </tr>
              )}

              {!usersQuery.isLoading &&
                !searchResults.isLoading &&
                displayedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <UserX className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-gray-500 text-sm mt-2">
                        {isSearching
                          ? "No users found matching your search"
                          : "No users registered yet"}
                      </p>
                    </td>
                  </tr>
                )}

              {displayedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#2a2a3e]/50 hover:bg-[#2a2a3e]/30 transition-colors"
                >
                  {/* User Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/20 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[var(--theme-primary)] text-sm font-bold">
                            {(user.name || "U")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="text-gray-600 text-xs">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      {user.email && (
                        <p className="text-gray-300 text-xs flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-500" />
                          {user.email}
                        </p>
                      )}
                      {user.phone && (
                        <p className="text-gray-300 text-xs flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-500" />
                          {user.phone}
                        </p>
                      )}
                      {!user.email && !user.phone && (
                        <p className="text-gray-600 text-xs">No contact info</p>
                      )}
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <UserCheck className="w-3 h-3" />
                      )}
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="py-3 px-4">
                    <p className="text-gray-400 text-xs flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-600" />
                      {formatDate(user.createdAt)}
                    </p>
                  </td>

                  {/* Last Sign In */}
                  <td className="py-3 px-4">
                    <p className="text-gray-400 text-xs">
                      {formatDate(user.lastSignedIn)}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleToggle(user.id, user.role)}
                      disabled={updateRoleMutation.isPending}
                      className={`text-xs border-[#2a2a3e] hover:border-[var(--theme-primary)]/30 ${
                        user.role === "admin"
                          ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          : "text-[var(--theme-primary)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
                      }`}
                    >
                      {updateRoleMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : user.role === "admin" ? (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a3e]">
            <p className="text-gray-500 text-xs">
              Showing {page * limit + 1}-
              {Math.min((page + 1) * limit, totalUsers)} of {totalUsers} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="text-xs border-[#2a2a3e] text-gray-400 hover:text-white hover:border-[var(--theme-primary)]/30"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Previous
              </Button>
              <span className="text-gray-500 text-xs">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="text-xs border-[#2a2a3e] text-gray-400 hover:text-white hover:border-[var(--theme-primary)]/30"
              >
                Next
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
