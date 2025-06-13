
import { supabase } from '@/integrations/supabase/client';

// Helper function to safely query support tickets
export const getSupportTickets = async () => {
  try {
    // Use type assertion since the TypeScript types haven't been regenerated yet
    const { data, error } = await supabase
      .from('support_tickets' as any)
      .select(`
        *,
        profile:profiles(full_name, email, mobile),
        responses:ticket_responses(
          *,
          responder_profile:profiles(full_name, email)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return { data: null, error };
  }
};

// Helper function to create support ticket
export const createSupportTicket = async (ticketData: {
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets' as any)
      .insert(ticketData)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return { data: null, error };
  }
};

// Helper function to add ticket response
export const addTicketResponse = async (responseData: {
  ticket_id: string;
  responder_id: string;
  message: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('ticket_responses' as any)
      .insert(responseData)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding ticket response:', error);
    return { data: null, error };
  }
};

// Helper function to update ticket status
export const updateTicketStatus = async (ticketId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets' as any)
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return { data: null, error };
  }
};
