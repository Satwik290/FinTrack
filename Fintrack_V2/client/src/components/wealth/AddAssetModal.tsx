'use client';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface FormData {
  name: string;
  type: 'Market' | 'Manual';
  ticker?: string;
  quantity?: number;
  currentValueInCents: number;
}

export function AddAssetModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { type: 'Manual', quantity: 1 },
  });
  const assetType = watch('type');

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        quantity: Number(data.quantity ?? 1),
        currentValueInCents: Math.round(Number(data.currentValueInCents) * 100),
      };
      const res = await api.post('/wealth/assets', payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealthSummary'] });
      toast.success('Asset added! 📈');
      onClose();
    },
    onError: () => toast.error('Failed to add asset'),
  });

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>Add Asset</h2>
          <button className="btn btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={L}>Asset Name</label>
            <input {...register('name', { required: true })} placeholder="e.g. Tata Consultancy Services" className="input" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={L}>Type</label>
              <select {...register('type')} className="input">
                <option value="Manual">Manual (property, FD, etc.)</option>
                <option value="Market">Market (stocks, crypto)</option>
              </select>
            </div>
            {assetType === 'Market' && (
              <div>
                <label style={L}>Ticker Symbol</label>
                <input {...register('ticker')} placeholder="e.g. TCS.NS" className="input" />
              </div>
            )}
          </div>

          {assetType === 'Market' && (
            <div>
              <label style={L}>Quantity / Units</label>
              <input {...register('quantity')} type="number" step="0.01" placeholder="10" className="input" />
            </div>
          )}

          <div>
            <label style={L}>Current Value (₹)</label>
            <input
              {...register('currentValueInCents', { required: true, min: 0.01 })}
              type="number" step="0.01" placeholder="50000"
              className={`input ${errors.currentValueInCents ? 'input-error' : ''}`}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Enter value in ₹ — stored in paise internally</p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

const L: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' };