
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSupportTickets, addTicketResponse, updateTicketStatus as updateTicketStatusHelper } from '@/utils/databaseHelpers';

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  profile?: {
    full_name: string;
    email: string;
    mobile: string;
  };
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticket_id: string;
  responder_id: string;
  message: string;
  created_at: string;
  responder_profile?: {
    full_name: string;
    email: string;
  };
}

export const useIssues = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      console.log('Fetching support tickets...');
      const { data, error } = await getSupportTickets();
      
      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }
      
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addResponse = async (ticketId: string, message: string) => {
    try {
      console.log('Adding response to ticket:', ticketId);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { error } = await addTicketResponse({
        ticket_id: ticketId,
        responder_id: user.id,
        message: message
      });

      if (error) throw error;

      // Update ticket status to in_progress if it was open
      await updateTicketStatusHelper(ticketId, 'in_progress');

      await fetchTickets();
      return { error: null };
    } catch (error) {
      console.error('Error adding response:', error);
      return { error };
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      console.log('Updating ticket status:', ticketId, status);
      
      const { error } = await updateTicketStatusHelper(ticketId, status);

      if (error) throw error;

      await fetchTickets();
      return { error: null };
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchTickets();

    // Set up real-time subscription
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          console.log('Support ticket change detected');
          fetchTickets();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_responses'
        },
        () => {
          console.log('Ticket response change detected');
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tickets,
    loading,
    addResponse,
    updateTicketStatus,
    refetch: fetchTickets
  };
};
