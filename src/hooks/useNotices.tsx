
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  type: 'general' | 'urgent' | 'maintenance' | 'event';
  created_at: string;
  created_by: string | null;
  is_active: boolean;
}

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type-safe data processing
      const processedNotices: Notice[] = (data || []).map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        priority: notice.priority as 'low' | 'medium' | 'high',
        type: notice.type as 'general' | 'urgent' | 'maintenance' | 'event',
        created_at: notice.created_at,
        created_by: notice.created_by,
        is_active: notice.is_active
      }));

      setNotices(processedNotices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotice = async (notice: { title: string; content: string; priority: string; type: string }) => {
    try {
      const { error } = await supabase
        .from('notices')
        .insert({
          title: notice.title,
          content: notice.content,
          priority: notice.priority,
          type: notice.type,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      await fetchNotices();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchNotices();

    // Set up real-time subscription
    const channel = supabase
      .channel('notices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notices'
        },
        () => {
          fetchNotices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notices,
    loading,
    addNotice,
    refetch: fetchNotices
  };
};
