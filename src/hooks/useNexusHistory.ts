import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface NexusCampaign {
    id: string;
    target_url: string;
    detected_sector: string;
    strategy_score: number;
    campaign_data: any;
    created_at: string;
}

export function useNexusHistory() {
    const [campaigns, setCampaigns] = useState<NexusCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchHistory() {
            if (!user) {
                setCampaigns([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('nexus_youtube_ads')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setCampaigns(data as NexusCampaign[]);
                }
            } catch (err: any) {
                console.error('Error accediendo al archivo Nexus:', err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchHistory();

        const subscription = supabase.channel('public:nexus_youtube_ads')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'nexus_youtube_ads', filter: `user_id=eq.${user?.id}` }, () => {
                fetchHistory();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    return { campaigns, isLoading };
}
