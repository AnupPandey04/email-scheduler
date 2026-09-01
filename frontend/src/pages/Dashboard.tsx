import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import EmailCard from "../components/EmailCard";
import {
  getScheduledEmails,
  getSentEmails,
  cancelEmail,
} from "../api/emails";

interface Email {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: string;
  sentAt: string | null;
}

function Dashboard() {
  const [scheduled, setScheduled] = useState<Email[]>([]);
  const [sent, setSent] = useState<Email[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] =
    useState<number | null>(null);

  async function loadEmails() {
    try {
      setLoading(true);
      setError("");

      const [scheduledResponse, sentResponse] =
        await Promise.all([
          getScheduledEmails(),
          getSentEmails(),
        ]);

      setScheduled(scheduledResponse.data || []);
      setSent(sentResponse.data || []);
    } catch (error: any) {
      console.error("Failed to load emails:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load emails"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(emailId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this email?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(emailId);
      setError("");

      await cancelEmail(emailId);

      await loadEmails();
    } catch (error: any) {
      console.error("Failed to cancel email:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to cancel email"
      );
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    loadEmails();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your scheduled and sent emails.
            </p>
          </div>

          <button
            onClick={loadEmails}
            disabled={loading}
            className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Scheduled
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {scheduled.length}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-700">
                Pending
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Sent
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {sent.length}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                Delivered
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading your emails...
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Scheduled Emails */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Scheduled Emails
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Emails waiting to be sent.
                </p>
              </div>

              {scheduled.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                  <h3 className="font-semibold text-gray-700">
                    No scheduled emails
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Schedule an email to see it here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {scheduled.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      onCancel={handleCancel}
                      cancelling={
                        cancellingId === email.id
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Sent Emails */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Sent Emails
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Successfully processed emails.
                </p>
              </div>

              {sent.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                  <h3 className="font-semibold text-gray-700">
                    No sent emails
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Sent emails will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {sent.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;