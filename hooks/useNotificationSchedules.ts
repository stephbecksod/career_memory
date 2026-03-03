import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureAuthSession } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { NotificationSchedule } from '@/types/database';

interface ScheduleInput {
  label?: string;
  cadence_type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  day_of_week?: number | null;
  day_of_month?: number | null;
  notification_time: string;
  timezone: string;
  first_question_preview?: string | null;
  is_active?: boolean;
}

export function useNotificationSchedules() {
  const userId = useUserStore((s) => s.authUser?.id);
  const queryClient = useQueryClient();

  const invalidateAndSync = async () => {
    await queryClient.invalidateQueries({ queryKey: ['notification_schedules', userId] });
    // Re-fetch and sync with native notifications after invalidation (lazy import to avoid web crash)
    const cached = queryClient.getQueryData<NotificationSchedule[]>(['notification_schedules', userId]);
    if (cached) {
      import('@/lib/notifications')
        .then(({ syncAllSchedules }) => syncAllSchedules(cached))
        .catch((err) => console.error('[useNotificationSchedules] Sync failed:', err));
    }
  };

  const query = useQuery<NotificationSchedule[]>({
    queryKey: ['notification_schedules', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_schedules')
        .select('*')
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as NotificationSchedule[];
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (input: ScheduleInput) => {
      const authUserId = await ensureAuthSession();

      const { error } = await supabase.from('notification_schedules').insert({
        user_id: authUserId,
        label: input.label || null,
        cadence_type: input.cadence_type,
        day_of_week: input.day_of_week ?? null,
        day_of_month: input.day_of_month ?? null,
        notification_time: input.notification_time,
        timezone: input.timezone,
        first_question_preview: input.first_question_preview ?? null,
        is_active: input.is_active ?? true,
      });

      if (error) throw error;
    },
    onSuccess: invalidateAndSync,
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...input }: ScheduleInput & { id: string }) => {
      const authUserId = await ensureAuthSession();

      const { error } = await supabase
        .from('notification_schedules')
        .update({
          label: input.label || null,
          cadence_type: input.cadence_type,
          day_of_week: input.day_of_week ?? null,
          day_of_month: input.day_of_month ?? null,
          notification_time: input.notification_time,
          timezone: input.timezone,
          first_question_preview: input.first_question_preview ?? null,
        })
        .eq('schedule_id', id)
        .eq('user_id', authUserId);

      if (error) throw error;
    },
    onSuccess: invalidateAndSync,
  });

  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      const authUserId = await ensureAuthSession();

      // Soft delete
      const { error } = await supabase
        .from('notification_schedules')
        .update({ deleted_at: new Date().toISOString() })
        .eq('schedule_id', scheduleId)
        .eq('user_id', authUserId);

      if (error) throw error;
    },
    onSuccess: invalidateAndSync,
  });

  const toggleSchedule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const authUserId = await ensureAuthSession();

      const { error } = await supabase
        .from('notification_schedules')
        .update({ is_active: active })
        .eq('schedule_id', id)
        .eq('user_id', authUserId);

      if (error) throw error;
    },
    onSuccess: invalidateAndSync,
  });

  return { ...query, createSchedule, updateSchedule, deleteSchedule, toggleSchedule };
}
