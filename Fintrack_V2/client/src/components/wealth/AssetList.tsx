import React from 'react';
import { useWealthStore } from '../../store/useWealthStore';
import { ArrowUpRight, Clock, Activity } from 'lucide-react';

interface AssetListProps {
  assets: Array<{
    id: string;
    name: string;
    ticker?: string;
    quantity: number;
    type: string;
    currentValueInCents: number;
  }>;
}

export const AssetList: React.FC<AssetListProps> = ({ assets }) => {
  const { isMasked } = useWealthStore();

  const formatValue = (cents: number) => {
    if (isMasked) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-semibold text-lg">Your Assets</h2>
        <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center">
          Add Asset <ArrowUpRight size={16} className="ml-1" />
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="text-zinc-500 text-center py-8">No assets defined yet.</div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.id} className="flex justify-between items-center p-4 hover:bg-zinc-800/50 rounded-xl border border-zinc-800/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${asset.type === 'Market' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {asset.type === 'Market' ? <Activity size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h3 className="text-white font-medium">{asset.name}</h3>
                  <div className="text-zinc-500 text-xs flex space-x-2 mt-1">
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                      {asset.type}
                    </span>
                    {asset.ticker && <span>• {asset.ticker}</span>}
                    {asset.type === 'Market' && <span>• Qty: {asset.quantity}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{formatValue(asset.currentValueInCents)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
