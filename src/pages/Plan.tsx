import { useEffect, useState } from 'react'
import { isEditMode } from '../config'
import { loadJournal } from '../data/loadJournal'
import { getPlans, addPlan, updatePlan, deletePlan, type Plan as PlanType, type PlanStatus } from '../db/plans'

const STATUSES: PlanStatus[] = ['not_started', 'in_progress', 'done']

export default function Plan() {
  const [plans, setPlans] = useState<PlanType[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newStatus, setNewStatus] = useState<PlanStatus>('not_started')

  const refresh = () => {
    if (isEditMode) setPlans(getPlans())
  }

  useEffect(() => {
    if (isEditMode) {
      refresh()
    } else {
      loadJournal().then((snapshot) => {
        if (snapshot) setPlans(snapshot.plans)
      })
    }
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addPlan({ title: newTitle.trim(), description: newDescription.trim() || '', status: newStatus, targetDate: null, sortOrder: 0 })
    setNewTitle('')
    setNewDescription('')
    setNewStatus('not_started')
    refresh()
  }

  const handleUpdate = async (id: string, updates: Partial<Pick<PlanType, 'title' | 'description' | 'status'>>) => {
    await updatePlan(id, updates)
    setEditingId(null)
    refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this plan item?')) {
      await deletePlan(id)
      refresh()
    }
  }

  return (
    <>
      <h2 className="page-title">Plan</h2>
      <p style={{ marginBottom: '1.5rem' }}>Goals and milestones for your game-making journey.</p>

      {isEditMode && (
        <form onSubmit={handleAdd} style={{ marginBottom: '2rem', padding: '1rem', border: '2px solid var(--border)' }}>
          <p style={{ margin: '0 0 0.5rem' }}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              style={{ width: '100%', maxWidth: '400px' }}
            />
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              style={{ width: '100%', maxWidth: '400px', resize: 'vertical' }}
            />
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as PlanStatus)}
              style={{ marginRight: '0.5rem' }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <button type="submit">Add</button>
          </p>
        </form>
      )}

      <ul className="list-unstyled">
        {plans.length === 0 && <li><em>No plan items yet.</em></li>}
        {plans.map((p) => (
          <li key={p.id} style={{ border: '2px solid var(--border)', padding: '1rem', marginBottom: '0.5rem' }}>
            {editingId === p.id && isEditMode ? (
              <PlanEditForm
                plan={p}
                onSave={(updates) => handleUpdate(p.id, updates)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <strong>{p.title}</strong>
                {p.description && <p style={{ margin: '0.25rem 0 0', color: 'var(--text)' }}>{p.description}</p>}
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                  Status: {p.status.replace('_', ' ')}
                </p>
                {isEditMode && (
                  <p style={{ margin: '0.5rem 0 0' }}>
                    <button type="button" onClick={() => setEditingId(p.id)}>Edit</button>
                    {' '}
                    <button type="button" onClick={() => handleDelete(p.id)}>Delete</button>
                  </p>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

function PlanEditForm({
  plan,
  onSave,
  onCancel,
}: {
  plan: PlanType
  onSave: (u: Partial<Pick<PlanType, 'title' | 'description' | 'status'>>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(plan.title)
  const [description, setDescription] = useState(plan.description)
  const [status, setStatus] = useState<PlanStatus>(plan.status)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ title, description, status })
      }}
    >
      <p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />
      </p>
      <p>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} />
      </p>
      <p>
        <select value={status} onChange={(e) => setStatus(e.target.value as PlanStatus)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </p>
      <p>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </p>
    </form>
  )
}
