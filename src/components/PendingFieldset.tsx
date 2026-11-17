import { PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";

export default function PendingFieldset({ pending, children }: PropsWithChildren<{ pending?: boolean }>) {
  const form = useFormStatus();
  return <fieldset className="pending-fieldset" disabled={pending ?? form.pending}>
    {children}
  </fieldset>;
}
