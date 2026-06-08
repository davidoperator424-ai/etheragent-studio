import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface TokenBalance {
  computeTokens: number;
  totalTokens: number;
  planName: string;
  isInfinite?: boolean;
}

const ADMIN_EMAIL = 'davicho4522@gmail.com';

export function useTokenBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<TokenBalance>({
    computeTokens: 0,
    totalTokens: 0,
    planName: 'FREE',
    isInfinite: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Si es el admin, otorgar créditos infinitos virtualmente
    if (user.email === ADMIN_EMAIL) {
      setBalance({
        computeTokens: 999999,
        totalTokens: 999999,
        planName: 'FOUNDER ACCESS',
        isInfinite: true
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('compute_tokens, total_tokens, plan_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profile) {
        return;
      }

      setBalance({
        computeTokens: profile.compute_tokens ?? 0,
        totalTokens: profile.total_tokens ?? 0,
        planName: profile.plan_name ?? 'FREE',
        isInfinite: false
      });
    } catch (error) {
      // Error silencioso
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const updateBalance = useCallback((newBalance: number) => {
    if (user?.email === ADMIN_EMAIL) return; // No descontar al admin
    setBalance(prev => ({
      ...prev,
      computeTokens: newBalance
    }));
  }, [user?.email]);

  return {
    balance,
    isLoading,
    refreshBalance: fetchBalance,
    updateBalance
  };
}
