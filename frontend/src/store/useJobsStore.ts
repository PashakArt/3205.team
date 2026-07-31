import { create } from "zustand";
import {
  jobsControllerCancel,
  jobsControllerCreate,
  jobsControllerFindAll,
  jobsControllerFindOne,
} from "../api/generated";
import type { JobDto, JobListItemDto } from "../api/generated";

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

interface JobsState {
  jobs: JobListItemDto[];
  activeJobId: string | null;
  activeJobDetails: JobDto | null;
  isLoadingJobs: boolean;
  isLoadingDetails: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchJobs: () => Promise<void>;
  selectJob: (jobId: string) => Promise<void>;
  createJob: (urls: string[]) => Promise<string | null>;
  cancelJob: (jobId: string) => Promise<void>;
  stopPolling: () => void;
}

let pollingTimeoutId: ReturnType<typeof setTimeout> | null = null;
let currentSessionId = 0;

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  activeJobId: null,
  activeJobDetails: null,
  isLoadingJobs: false,
  isLoadingDetails: false,
  isSubmitting: false,
  error: null,

  stopPolling: () => {
    currentSessionId++; // Инвалидируем текущую сессию
    if (pollingTimeoutId) {
      clearTimeout(pollingTimeoutId);
      pollingTimeoutId = null;
    }
  },

  fetchJobs: async () => {
    set({ isLoadingJobs: true, error: null });
    try {
      const response = await jobsControllerFindAll();
      const jobs = response.data ?? [];
      set({ jobs, isLoadingJobs: false });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      set({
        error: "Не удалось загрузить список заданий",
        isLoadingJobs: false,
      });
    }
  },

  selectJob: async (jobId: string) => {
    const { stopPolling, fetchJobs } = get();

    stopPolling();
    const sessionId = currentSessionId;

    set({
      activeJobId: jobId,
      isLoadingDetails: true,
      error: null,
    });

    const poll = async () => {
      try {
        const response = await jobsControllerFindOne({
          path: { id: jobId },
        });

        const details = response.data;

        if (sessionId !== currentSessionId || !details) {
          return;
        }

        set({ activeJobDetails: details, isLoadingDetails: false });

        void fetchJobs();

        if (!TERMINAL_STATUSES.has(details.status)) {
          pollingTimeoutId = setTimeout(poll, 2000);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        if (sessionId === currentSessionId) {
          set({
            error: `Ошибка при загрузке задания ${jobId}`,
            isLoadingDetails: false,
          });
        }
      }
    };

    await poll();
  },

  createJob: async (urls: string[]) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await jobsControllerCreate({
        body: { urls },
      });

      const newJobId = response.data?.jobId;
      set({ isSubmitting: false });

      if (newJobId) {
        await get().fetchJobs();
        await get().selectJob(newJobId);
        return newJobId;
      }

      return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      set({
        error: "Не удалось создать задание.",
        isSubmitting: false,
      });
      return null;
    }
  },

  cancelJob: async (jobId: string) => {
    try {
      const response = await jobsControllerCancel({
        path: { id: jobId },
      });

      if (get().activeJobId === jobId && response.data) {
        set({ activeJobDetails: response.data });
      }

      await get().fetchJobs();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      set({ error: `Не удалось отменить задание ${jobId}` });
    }
  },
}));
