import api from "./axios";

export const getProjects = async (params = {}) => {
  const response = await api.get("/projects", { params });

  return response.data.data;
};

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);

  return response.data.data.project;
};

export const createProject = async (projectData) => {
  const response = await api.post("/projects", projectData);

  return response.data.data.project;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(
    `/projects/${projectId}`,
    projectData
  );

  return response.data.data.project;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);

  return response.data;
};

export const addProjectMember = async (
  projectId,
  userId,
  role = "MEMBER"
) => {
  const response = await api.post(
    `/projects/${projectId}/members`,
    { userId, role }
  );

  return response.data.data.project;
};

export const updateProjectMemberRole = async (
  projectId,
  userId,
  role
) => {
  const response = await api.patch(
    `/projects/${projectId}/members/${userId}`,
    { role }
  );

  return response.data.data.project;
};

export const removeProjectMember = async (
  projectId,
  userId
) => {
  const response = await api.delete(
    `/projects/${projectId}/members/${userId}`
  );

  return response.data;
};