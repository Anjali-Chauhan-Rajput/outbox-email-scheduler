
import { useEffect, useState } from 'react'

type Campaign = {
  id: string
  name: string
  subject: string
  body: string
  scheduled_at: string | null
  status: 'draft' | 'scheduled' | 'processing' | 'sent' | 'failed'
  created_at: string
}

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  
const [selectedCampaignId, setSelectedCampaignId] = useState('')
const [recipientEmails, setRecipientEmails] = useState('')
const [recipients, setRecipients] = useState<
  { id: string; email: string; status: string }[]
>([])
const [recipientMessage, setRecipientMessage] = useState('')
const [addingRecipients, setAddingRecipients] = useState(false)
const [loadingRecipients, setLoadingRecipients] = useState(false)


  async function loadCampaigns() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:3000/api/campaigns')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load campaigns')
      }

      setCampaigns(data.campaigns)
    } catch {
      setError('Could not load campaigns. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

async function loadRecipients(campaignId: string) {
  if (!campaignId) {
    setRecipients([])
    return
  }

  try {
    setLoadingRecipients(true)
    setRecipientMessage('')

    const response = await fetch(
      `http://localhost:3000/api/campaigns/${campaignId}/recipients`,
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load recipients')
    }

    setRecipients(data.recipients)
  } catch (err) {
    setRecipientMessage(
      err instanceof Error ? err.message : 'Could not load recipients.',
    )
  } finally {
    setLoadingRecipients(false)
  }
}

async function addRecipients(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()

  if (!selectedCampaignId) {
    setRecipientMessage('Please select a campaign.')
    return
  }

  const emails = recipientEmails
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (emails.length === 0) {
    setRecipientMessage('Please enter at least one email address.')
    return
  }

  try {
    setAddingRecipients(true)
    setRecipientMessage('')

    const response = await fetch(
      `http://localhost:3000/api/campaigns/${selectedCampaignId}/recipients`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add recipients')
    }

    setRecipientEmails('')
    setRecipientMessage(`${data.added} recipient(s) added successfully.`)
    await loadRecipients(selectedCampaignId)
  } catch (err) {
    setRecipientMessage(
      err instanceof Error ? err.message : 'Could not add recipients.',
    )
  } finally {
    setAddingRecipients(false)
  }
}

  async function createCampaign(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setSaving(true)
    setFormMessage('')

    try {
      const response = await fetch('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          body: body.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      setName('')
      setSubject('')
      setBody('')
      setShowForm(false)
      setFormMessage('Campaign created successfully!')

      await loadCampaigns()
    } catch (err) {
      setFormMessage(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    void loadCampaigns()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Outbox</h1>
            <p className="mt-2 text-sm text-gray-500">
              Email campaign dashboard
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadCampaigns()}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-100 disabled:opacity-60"
            >
              {loading ? 'Refreshing...' : 'Refresh campaigns'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm((previous) => !previous)
                setFormMessage('')
              }}
              className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
            >
              {showForm ? 'Cancel' : '+ Create Campaign'}
            </button>
          </div>
        </header>

        {formMessage && (
          <p
            role="status"
            className={`mb-4 rounded-lg p-3 text-sm ${
              formMessage.includes('successfully')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {formMessage}
          </p>
        )}

        {showForm && (
          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-xl font-semibold">Create a campaign</h2>

            <form onSubmit={createCampaign} className="space-y-4">
              <div>
                <label
                  htmlFor="campaign-name"
                  className="mb-1 block text-sm font-medium"
                >
                  Campaign name
                </label>
                <input
                  id="campaign-name"
                  type="text"
                  required
                  maxLength={200}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Product launch"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="campaign-subject"
                  className="mb-1 block text-sm font-medium"
                >
                  Email subject
                </label>
                <input
                  id="campaign-subject"
                  type="text"
                  required
                  maxLength={500}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Introducing our new product"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="campaign-body"
                  className="mb-1 block text-sm font-medium"
                >
                  Email body
                </label>
                <textarea
                  id="campaign-body"
                  required
                  rows={5}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write your email content..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
            </form>
          </section>
        )}

<section className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
  <h2 className="mb-4 text-xl font-semibold">Manage Recipients</h2>

  <form onSubmit={addRecipients} className="space-y-4">
    <div>
      <label
        htmlFor="recipient-campaign"
        className="mb-1 block text-sm font-medium"
      >
        Select campaign
      </label>
      <select
        id="recipient-campaign"
        value={selectedCampaignId}
        onChange={(event) => {
          const campaignId = event.target.value
          setSelectedCampaignId(campaignId)
          void loadRecipients(campaignId)
        }}
        required
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
      >
        <option value="">Choose a campaign</option>
        {campaigns.map((campaign) => (
          <option key={campaign.id} value={campaign.id}>
            {campaign.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label
        htmlFor="recipient-emails"
        className="mb-1 block text-sm font-medium"
      >
        Recipient email addresses
      </label>
      <textarea
        id="recipient-emails"
        value={recipientEmails}
        onChange={(event) => setRecipientEmails(event.target.value)}
        required
        rows={3}
        placeholder="person1@example.com, person2@example.com"
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
      />
      <p className="mt-1 text-xs text-gray-500">
        Separate addresses with commas, spaces, or new lines.
      </p>
    </div>

    <button
      type="submit"
      disabled={addingRecipients || !selectedCampaignId}
      className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-60"
    >
      {addingRecipients ? 'Adding...' : 'Add Recipients'}
    </button>
  </form>

  {recipientMessage && (
    <p role="status" className="mt-3 text-sm text-gray-700">
      {recipientMessage}
    </p>
  )}

  <div className="mt-6">
    <h3 className="mb-3 font-semibold">Saved recipients</h3>

    {loadingRecipients ? (
      <p className="text-sm text-gray-500">Loading recipients...</p>
    ) : recipients.length === 0 ? (
      <p className="text-sm text-gray-500">
        No recipients found for this campaign.
      </p>
    ) : (
      <ul className="space-y-2">
        {recipients.map((recipient) => (
          <li
            key={recipient.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 p-3"
          >
            <span>{recipient.email}</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
              {recipient.status}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
</section>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total campaigns</p>
            <p className="mt-2 text-3xl font-bold">{campaigns.length}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Drafts</p>
            <p className="mt-2 text-3xl font-bold">
              {campaigns.filter((campaign) => campaign.status === 'draft').length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="mt-2 text-3xl font-bold">
              {campaigns.filter((campaign) => campaign.status === 'scheduled').length}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Your campaigns</h2>
            <p className="mt-1 text-sm text-gray-500">
              Campaigns saved in your database
            </p>
          </div>

          {loading && (
            <p className="text-gray-500">Loading campaigns...</p>
          )}

          {!loading && error && (
            <div>
              <p className="text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadCampaigns()}
                className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-white"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && campaigns.length === 0 && (
            <p className="text-gray-500">No campaigns yet. Create your first one.</p>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="px-3 py-3">Campaign name</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-4 font-medium">
                        {campaign.name}
                      </td>
                      <td className="px-3 py-4">{campaign.subject}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
