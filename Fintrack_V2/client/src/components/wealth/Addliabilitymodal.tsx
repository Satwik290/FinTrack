'use client';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface FormData {
  loanName: string;
  totalPrincipal: number;
  interestRate: number;
  remainingBalance: number;
}

export function AddLiabilityModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        loanName: data.loanName,
        interestRate: Number(data.interestRate),
        totalPrincipalInCents: Math.round(Number(data.totalPrincipal) * 100),
        remainingBalanceInCents: Math.round(Number(data.remainingBalance) * 100),
      };
      const res = await api.post('/wealth/liabilities', payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealthSummary'] });
      toast.success('Liability added');
      onClose();
    },
    onError: () => toast.error('Failed to add liability'),
  });

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>Add Liability</h2>
          <button className="btn btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={L}>Loan / Liability Name</label>
            <input {...register('loanName', { required: true })} placeholder="e.g. Home Loan – SBI" className="input" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={L}>Total Principal (₹)</label>
              <input {...register('totalPrincipal', { required: true, min: 1 })} type="number" step="0.01" placeholder="2000000"
                className={`input ${errors.totalPrincipal ? 'input-error' : ''}`} />
            </div>
            <div>
              <label style={L}>Remaining Balance (₹)</label>
              <input {...register('remainingBalance', { required: true, min: 0 })} type="number" step="0.01" placeholder="1500000"
                className={`input ${errors.remainingBalance ? 'input-error' : ''}`} />
            </div>
          </div>

          <div>
            <label style={L}>Interest Rate (%)</label>
            <input {...register('interestRate', { required: true, min: 0, max: 100 })} type="number" step="0.01" placeholder="8.5"
              className={`input ${errors.interestRate ? 'input-error' : ''}`} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Add Liability'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

const L: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' };