import { createElement } from "react";
import { toast as _toast, type ExternalToast } from "sonner";
import { CustomToastItem, type ToastType } from "../components/stem/ui/CustomToastItem";

const DURATION = 4000;

function build(type: ToastType) {
  return (title: unknown, opts?: ExternalToast) => {
    const id = _toast.custom(
      (toastId) =>
        createElement(CustomToastItem, {
          id: toastId,
          type,
          title: String(title ?? ""),
          description:
            typeof opts?.description === "string" ? opts.description : undefined,
          duration: DURATION,
        }),
      { duration: Infinity, ...(opts?.id !== undefined ? { id: opts.id } : {}) }
    );

    // Auto-dismiss after progress bar finishes — set outside the component
    // so React re-renders cannot reset the timer.
    if (type !== "loading") {
      setTimeout(() => _toast.dismiss(id), DURATION);
    }

    return id;
  };
}

export const toast = Object.assign(build("default"), {
  success: build("success"),
  error:   build("error"),
  info:    build("info"),
  warning: build("warning"),
  loading: build("loading"),
  dismiss: _toast.dismiss,
  promise: _toast.promise,
  custom:  _toast.custom,
  message: build("default"),
}) as typeof _toast;
