interface Email {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  status: string;
  sentAt: string | null;
}

interface EmailCardProps {
  email: Email;
  onCancel?: (id: number) => void;
  cancelling?: boolean;
}

function EmailCard({
  email,
  onCancel,
  cancelling = false,
}: EmailCardProps) {
  const date = new Date(email.scheduledAt);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">
            {email.subject}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            To: {email.recipient}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            email.status === "SENT"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {email.status}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-gray-600">
        {email.body}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-400">
          {email.status === "SENT" && email.sentAt
            ? `Sent ${new Date(
                email.sentAt
              ).toLocaleString()}`
            : `Scheduled ${date.toLocaleString()}`}
        </p>

        {email.status === "SCHEDULED" && onCancel && (
          <button
            onClick={() => onCancel(email.id)}
            disabled={cancelling}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}

export default EmailCard;