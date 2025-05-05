
import { toast as sonnerToast } from "sonner";
import { useToast as useHookToast } from "@/hooks/use-toast";

// Re-export the toast function with a compatible API
export const toast = sonnerToast;
export const useToast = useHookToast;
