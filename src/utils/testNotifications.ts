import { supabase } from "@/integrations/supabase/client";

export const testNotificationTrigger = async () => {
  try {
    console.log("Testing notification trigger...");
    
    // Get a pending application to test with
    const { data: pendingApp, error: fetchError } = await supabase
      .from('applications')
      .select('id, status, run_club_id, opportunity_id')
      .eq('status', 'pending')
      .limit(1)
      .single();

    if (fetchError || !pendingApp) {
      console.log("No pending applications found to test with");
      return;
    }

    console.log("Found test application:", pendingApp);

    // Check notifications before update
    const { data: notificationsBefore, error: beforeError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', pendingApp.run_club_id);

    if (beforeError) throw beforeError;
    console.log("Notifications before update:", notificationsBefore?.length || 0);

    // Simulate accepting the application
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'accepted' })
      .eq('id', pendingApp.id);

    if (updateError) throw updateError;
    console.log("Application status updated to accepted");

    // Wait a moment for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check notifications after update
    const { data: notificationsAfter, error: afterError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', pendingApp.run_club_id)
      .order('created_at', { ascending: false });

    if (afterError) throw afterError;
    console.log("Notifications after update:", notificationsAfter?.length || 0);
    
    const newNotifications = notificationsAfter?.filter(n => 
      !notificationsBefore?.some(b => b.id === n.id)
    ) || [];
    
    console.log("New notifications created:", newNotifications);

    return {
      success: true,
      notificationsCreated: newNotifications.length,
      newNotifications
    };

  } catch (error) {
    console.error("Test failed:", error);
    return {
      success: false,
      error
    };
  }
};

// Make this available in the console for testing
if (typeof window !== 'undefined') {
  (window as any).testNotificationTrigger = testNotificationTrigger;
} 