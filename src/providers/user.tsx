import { Button, Classes, InputGroup, Intent, PopoverNext as Popover } from "@blueprintjs/core";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { ApiUser } from "../apiTypes";
import PendingFieldset from "../components/PendingFieldset";
import { toastErrors, useAction } from "../site/action";
import { useSite } from "../site/context";
import { showError } from "../site/toast";

interface UserData {
  user: ApiUser | null;
  update: () => Promise<void>;
}

export const User = createContext<UserData>({
  user: null,
  update: () => {
    throw new Error("No user context provided");
  },
});

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const { api } = useSite();

  const update = useCallback(async () => {
    try {
      const u = await api.general<ApiUser | null>("/me");
      setUser(u);

      try {
        localStorage.setItem("user", JSON.stringify(u));
      } catch (err) {
        if (err instanceof DOMException) {
          showError(new Error(`Failed to sync: ${err.name}: ${err.message}`));
        } else {
          throw err;
        }
      }
    } catch (err) {
      showError(err);
    }
  }, [api]);

  useEffect(() => {
    update();

    const id = setInterval(() => update(), 1_000 * 60 * 10);

    return () => clearInterval(id);
  }, [update]);

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue !== null) {
        const user = JSON.parse(e.newValue) as ApiUser | null;
        console.log("Synced user:", user);
        setUser(user);
      }
    };
    addEventListener("storage", handle);
    return () => removeEventListener("storage", handle);
  }, []);

  return <User value={{ user, update }}>{children}</User>;
}

function LoginButton() {
  const { pending } = useFormStatus();
  return <Button fill intent="success" text="Log in" type="submit" loading={pending} />;
}

export function Login() {
  const user = useContext(User);
  const { api } = useSite();

  const login = toastErrors(async (data: FormData) => {
    await api.general("/login", "POST", data);
    await user.update();
  });

  return <Popover
    interactionKind="click"
    placement="bottom"
    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
    content={
      <form action={login}>
        <PendingFieldset>
          <InputGroup name="username" placeholder="Username" />
          <InputGroup name="secret" placeholder="Password" type="password" />
          <LoginButton />
        </PendingFieldset>
      </form>
    }
  >
    <a>Not logged in.</a>
  </Popover>;
}

export function Logout() {
  const user = useContext(User);
  const { api } = useSite();
  const [pending, run] = useAction();

  const signout = () =>
    run(async () => {
      await api.general("/logout", "POST");
      await user.update();
    });

  return <Popover
    interactionKind="click"
    placement="bottom"
    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
    content={<Button intent={Intent.DANGER} text="Sign out" onClick={signout} loading={pending} />}
  >
    <a>{user.user?.name}</a>
  </Popover>;
}
