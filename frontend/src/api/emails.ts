import apiClient from "./client";

export interface ScheduleEmailData {
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
}

export async function scheduleEmail(
  data: ScheduleEmailData
) {
  const response = await apiClient.post(
    "/emails",
    data
  );

  return response.data;
}

export async function getScheduledEmails() {
  const response = await apiClient.get(
    "/emails/scheduled"
  );

  return response.data;
}

export async function getSentEmails() {
  const response = await apiClient.get(
    "/emails/sent"
  );

  return response.data;
}

export async function getEmail(id: number) {
  const response = await apiClient.get(
    `/emails/${id}`
  );

  return response.data;
}

export async function cancelEmail(id: number) {
  const response = await apiClient.delete(
    `/emails/${id}`
  );

  return response.data;
}