
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";

const getToken = () => {
  return localStorage.getItem("accessToken");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

export const getProjectTeam = (projectId) => {
  return request(`/projects/${projectId}/team`);
};

export const addProjectMember = (projectId, email) => {
  return request(`/projects/${projectId}/team`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const removeProjectMember = (projectId, userId) => {
  return request(`/projects/${projectId}/team/${userId}`, {
    method: "DELETE",
  });
};

export const addWorkResponse = (
  projectId,
  userId,
  workTitle,
  message
) => {
  return request(
    `/projects/${projectId}/team/${userId}/responses`,
    {
      method: "POST",
      body: JSON.stringify({
        workTitle,
        message,
      }),
    }
  );
};

export const getWorkResponses = (projectId, userId) => {
  return request(
    `/projects/${projectId}/team/${userId}/responses`
  );
};
