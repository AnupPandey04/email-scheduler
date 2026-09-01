import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { scheduleEmail } from "../api/emails";

function Compose() {
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    const selectedDate = new Date(scheduledAt);

    if (selectedDate <= new Date()) {
      setError("Scheduled time must be in the future.");
      return;
    }

    setLoading(true);

    try {
      const result = await scheduleEmail({
        recipient: recipient.trim(),
        subject: subject.trim(),
        body: body.trim(),

        // Convert browser local time to ISO/UTC.
        scheduledAt: selectedDate.toISOString(),
      });

      setSuccess(
        `Email scheduled successfully. Job ID: ${result.data.jobId}`
      );

      setRecipient("");
      setSubject("");
      setBody("");
      setScheduledAt("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to schedule email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Compose Email
          </h1>

          <p className="mt-2 text-gray-500">
            Write an email and choose when it should be sent.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="recipient"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Recipient
              </label>

              <input
                id="recipient"
                type="email"
                value={recipient}
                onChange={(event) =>
                  setRecipient(event.target.value)
                }
                placeholder="recipient@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject
              </label>

              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                placeholder="Email subject"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="body"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Message
              </label>

              <textarea
                id="body"
                value={body}
                onChange={(event) =>
                  setBody(event.target.value)
                }
                placeholder="Write your message..."
                rows={8}
                required
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="scheduledAt"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Schedule date & time
              </label>

              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) =>
                  setScheduledAt(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                The selected time is based on your local timezone.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Scheduling..."
                  : "Schedule Email"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Compose;