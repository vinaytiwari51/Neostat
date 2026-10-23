
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Mail,
  MessageSquare,
  Trash2,
  X,
  Send,
  Clock,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import {
  getProjectTeam,
  addProjectMember,
  removeProjectMember,
  addWorkResponse,
  getWorkResponses,
} from "../service/teamService";

const getUserId = (user) => {
  if (!user) return "";
  return user._id || user.id || "";
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const formatDate = (date) => {
  if (!date) return "Recently";

  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getRoleLabel = (role) => {
  if (!role) return "Team Member";

  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Avatar = ({ name, size = "md" }) => {
  const sizeClass =
    size === "lg"
      ? "h-12 w-12 text-sm"
      : "h-10 w-10 text-xs";

  return (
    <div
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 font-semibold text-indigo-300 ring-1 ring-indigo-500/20`}
    >
      {getInitials(name) || <UserRound size={18} />}
    </div>
  );
};

const Modal = ({ title, subtitle, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const TeamMembers = () => {
  const { projectId } = useParams();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addError, setAddError] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [workTitle, setWorkTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const loadTeam = useCallback(async () => {
    if (!projectId) {
      setPageError("Project ID is missing from the URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setPageError("");

      const result = await getProjectTeam(projectId);

      setMembers(result.data || []);
    } catch (error) {
      setPageError(error.message || "Unable to load team members.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const filteredMembers = members.filter((membership) => {
    const user = membership.user || {};

    const searchValue = search.toLowerCase();

    return (
      user.fullName?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue) ||
      user.role?.toLowerCase().includes(searchValue)
    );
  });

  const openAddModal = () => {
    setMemberEmail("");
    setAddError("");
    setShowAddModal(true);
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!memberEmail.trim()) {
      setAddError("Please enter a member email.");
      return;
    }

    try {
      setAddingMember(true);
      setAddError("");

      await addProjectMember(projectId, memberEmail.trim());

      setShowAddModal(false);
      setMemberEmail("");
      setSuccessMessage("Team member added successfully.");

      await loadTeam();
    } catch (error) {
      setAddError(error.message || "Unable to add member.");
    } finally {
      setAddingMember(false);
    }
  };

  const openFeedbackModal = async (member) => {
    const user = member.user;

    if (!user) return;

    setSelectedMember(user);
    setWorkTitle("");
    setFeedbackMessage("");
    setFeedbackHistory([]);
    setFeedbackError("");
    setShowFeedbackModal(true);
    setLoadingFeedback(true);

    try {
      const result = await getWorkResponses(projectId, getUserId(user));

      setFeedbackHistory(result.data || []);
    } catch (error) {
      setFeedbackError(error.message || "Unable to load feedback history.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleSendFeedback = async (event) => {
    event.preventDefault();

    if (!selectedMember) return;

    if (!feedbackMessage.trim()) {
      setFeedbackError("Please enter a feedback message.");
      return;
    }

    try {
      setSendingFeedback(true);
      setFeedbackError("");

      const result = await addWorkResponse(
        projectId,
        getUserId(selectedMember),
        workTitle.trim(),
        feedbackMessage.trim()
      );

      if (result.data) {
        setFeedbackHistory((previous) => [result.data, ...previous]);
      }

      setWorkTitle("");
      setFeedbackMessage("");
      setSuccessMessage("Feedback sent successfully.");
    } catch (error) {
      setFeedbackError(error.message || "Unable to send feedback.");
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove?.user) return;

    try {
      setRemovingMember(true);
      setRemoveError("");

      await removeProjectMember(
        projectId,
        getUserId(memberToRemove.user)
      );

      setMembers((previous) =>
        previous.filter(
          (membership) =>
            getUserId(membership.user) !== getUserId(memberToRemove.user)
        )
      );

      setMemberToRemove(null);
      setSuccessMessage("Member removed from this project.");
    } catch (error) {
      setRemoveError(error.message || "Unable to remove member.");
    } finally {
      setRemovingMember(false);
    }
  };

  useEffect(() => {
    if (!successMessage) return;

    const timeout = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timeout);
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-[#0B1120] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
              <Users size={16} />
              <span>Project Workspace</span>
              <span>/</span>
              <span className="text-slate-200">Team Members</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Team Members
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage your project team and share work feedback.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadTeam}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
            >
              <UserPlus size={17} />
              Add Member
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Project Members</p>
              <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300">
                <Users size={18} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {loading ? "—" : members.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Assigned to this project
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Active Accounts</p>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {loading
                ? "—"
                : members.filter((membership) => membership.user?.isActive)
                    .length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Members with active accounts
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Feedback Entries</p>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-300">
                <MessageSquare size={18} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {showFeedbackModal ? feedbackHistory.length : "—"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              For the selected member
            </p>
          </div>
        </div>

        {/* Search and Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">Project Team</h2>
              <p className="mt-1 text-sm text-slate-400">
                Members assigned to this project.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members..."
                className="w-full rounded-xl border border-white/10 bg-[#0B1120] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50"
              />
            </div>
          </div>

          {pageError && (
            <div className="m-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Unable to load team</p>
                <p className="mt-1 text-red-300/80">{pageError}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <LoaderCircle size={20} className="animate-spin" />
                Loading team members...
              </div>
            </div>
          ) : !pageError && filteredMembers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 rounded-2xl bg-white/5 p-4 text-slate-400">
                <Users size={28} />
              </div>

              <h3 className="font-semibold text-white">
                {search ? "No matching members" : "No team members yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-400">
                {search
                  ? "Try searching with another name or email."
                  : "Add registered users to this project to start collaborating."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  <UserPlus size={16} />
                  Add your first member
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4 font-medium">Member</th>
                    <th className="px-5 py-4 font-medium">Role</th>
                    <th className="px-5 py-4 font-medium">Account</th>
                    <th className="px-5 py-4 font-medium">Added On</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredMembers.map((membership) => {
                    const user = membership.user;

                    if (!user) return null;

                    return (
                      <tr
                        key={membership._id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.fullName} />

                            <div>
                              <p className="font-medium text-white">
                                {user.fullName}
                              </p>

                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                <Mail size={12} />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300">
                            <ShieldCheck size={13} />
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-red-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                              Disabled
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(membership.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openFeedbackModal(membership)}
                              title="Send work feedback"
                              className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20"
                            >
                              <MessageSquare size={14} />
                              Feedback
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMemberToRemove(membership);
                                setRemoveError("");
                              }}
                              title="Remove member"
                              className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-300 transition hover:bg-red-500/15"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <Modal
          title="Add Team Member"
          subtitle="Add an existing registered user to this project."
          onClose={() => setShowAddModal(false)}
        >
          <form onSubmit={handleAddMember}>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Member Email
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                required
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="member@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0B1120] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              The user must already have an account in CollabFlow.
            </p>

            {addError && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-300">
                <AlertCircle size={15} />
                {addError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={addingMember}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
              >
                {addingMember ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}

                {addingMember ? "Adding..." : "Add Member"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedMember && (
        <Modal
          title="Work Feedback"
          subtitle="Send feedback and review previous responses."
          onClose={() => setShowFeedbackModal(false)}
        >
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <Avatar name={selectedMember.fullName} size="lg" />

            <div>
              <p className="font-medium text-white">
                {selectedMember.fullName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {selectedMember.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSendFeedback}>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Work Title
            </label>

            <input
              type="text"
              value={workTitle}
              onChange={(event) => setWorkTitle(event.target.value)}
              placeholder="e.g. Dashboard UI"
              maxLength={150}
              className="mb-4 w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50"
            />

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Feedback Message
            </label>

            <textarea
              required
              rows={4}
              value={feedbackMessage}
              onChange={(event) => setFeedbackMessage(event.target.value)}
              placeholder="Write your feedback about their work..."
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50"
            />

            <div className="mt-2 text-right text-xs text-slate-500">
              {feedbackMessage.length}/2000
            </div>

            {feedbackError && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-300">
                <AlertCircle size={15} />
                {feedbackError}
              </p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={sendingFeedback}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
              >
                {sendingFeedback ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}

                {sendingFeedback ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Feedback History</h3>

              <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400">
                {feedbackHistory.length} entries
              </span>
            </div>

            {loadingFeedback ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                <LoaderCircle size={17} className="animate-spin" />
                Loading feedback...
              </div>
            ) : feedbackHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-6 text-center">
                <MessageSquare
                  size={22}
                  className="mx-auto mb-2 text-slate-500"
                />

                <p className="text-sm text-slate-400">
                  No feedback has been shared yet.
                </p>
              </div>
            ) : (
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {feedbackHistory.map((response) => (
                  <div
                    key={response._id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {response.workTitle || "Work Feedback"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          By{" "}
                          {response.respondedBy?.fullName || "Project Manager"}
                        </p>
                      </div>

                      <Clock
                        size={14}
                        className="mt-1 shrink-0 text-slate-500"
                      />
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {response.message}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      {formatDate(response.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Remove Member Confirmation */}
      {memberToRemove && (
        <Modal
          title="Remove Team Member?"
          subtitle="This action removes the member from this project only."
          onClose={() => setMemberToRemove(null)}
        >
          <div className="flex items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 p-4">
            <Avatar name={memberToRemove.user?.fullName} />

            <div>
              <p className="font-medium text-white">
                {memberToRemove.user?.fullName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {memberToRemove.user?.email}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            This member will no longer be assigned to this project. Their
            account and assignments in other projects will remain unchanged.
          </p>

          {removeError && (
            <p className="mt-3 flex items-center gap-2 text-sm text-red-300">
              <AlertCircle size={15} />
              {removeError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setMemberToRemove(null)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleRemoveMember}
              disabled={removingMember}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
            >
              {removingMember ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}

              {removingMember ? "Removing..." : "Remove Member"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeamMembers;
