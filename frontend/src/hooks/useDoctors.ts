"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Doctor } from "@/types/doctor";

interface DoctorsResponse {
  data: Doctor[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export function useDoctors(filters?: { department?: string; availability?: string; limit?: number; page?: number }) {
  return useQuery({
    queryKey: ["doctors", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.department) params.department = filters.department;
      if (filters?.availability) params.availability = filters.availability;
      if (filters?.limit) params.limit = String(Math.min(filters.limit, 100));
      if (filters?.page) params.page = String(filters.page);
      const { data } = await apiClient.get<DoctorsResponse>("/doctors", { params });
      return data;
    },
    // 401 handling is centralised in apiClient.ts interceptor — it silently
    // refreshes the token and retries before ever surfacing an error here.
    retry: false,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Doctor, "id">) => {
      const { data } = await apiClient.post<{ data: Doctor }>("/doctors", payload);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

