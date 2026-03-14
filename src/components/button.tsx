import { Classes, Icon, IconName, IntentProps, Text } from "@blueprintjs/core";
import { intentClass } from "@blueprintjs/core/lib/esm/common/classes";
import { Link, To } from "react-router-dom";

interface AnchorButtonProps extends IntentProps {
  to: To;
  children: string;
  fill?: boolean;
  icon?: IconName;
}

/* Unfortunately react-router Link and blueprint Button don't like cooperating, so I'm forced to make my own. */
export function AnchorButton({ to, fill, intent, icon, children }: AnchorButtonProps) {
  return <Link to={to} className={`${Classes.BUTTON} ${intentClass(intent)} ${fill ? Classes.FILL : ""}`}>
    {icon && <Icon icon={icon} />}
    <Text>{children}</Text>
  </Link>;
}
