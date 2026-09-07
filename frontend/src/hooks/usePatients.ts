"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface ApiPatient {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: { name: string; phone: string; relation: string };
  admissionStatus: "OPD" | "Admitted" | "Discharged";
  registeredDate: string;
}

interface PatientsResponse {
  data: ApiPatient[];
  meta: { total: number; page: number; limit: number; pages: number };
}

interface PatientDetailResponse {
  data: ApiPatient & {
    visits: unknown[];
    labOrders: unknown[];
    bills: unknown[];
  };
}

export function usePatients(filters?: { search?: string; status?: string; bloodGroup?: string; limit?: number; page?: number }) {
  return useQuery({
    queryKey: ["patients", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.status) params.status = filters.status;
      if (filters?.bloodGroup) params.bloodGroup = filters.bloodGroup;
      if (filters?.limit) params.limit = String(Math.min(filters.limit, 100));
      if (filters?.page) params.page = String(filters.page);
      const { data } = await apiClient.get<PatientsResponse>("/patients", { params });
      return data;
    },
    // 401 handling is centralised in apiClient.ts interceptor — it silently
    // refreshes the token and retries before ever surfacing an error here.
    retry: false,
  });
}

export function usePatientDetail(id: string | null) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: async () => {
      const { data } = await apiClient.get<PatientDetailResponse>(`/patients/${id}`);
      return data.data;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Omit<ApiPatient, "id" | "registeredDate">>) => {
      const { data } = await apiClient.patch<{ data: ApiPatient }>(`/patients/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ApiPatient, "id" | "registeredDate">) => {
      const { data } = await apiClient.post<{ data: ApiPatient }>("/patients", payload);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

