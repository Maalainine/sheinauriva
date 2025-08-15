import { IconShoppingCart, IconUser, IconMenu2 } from "@tabler/icons-react";

export const CartIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <IconShoppingCart aria-label="Cart" {...props} />
);

export const UserIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <IconUser aria-label="User" {...props} />
);

export const MenuIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <IconMenu2 aria-label="Menu" {...props} />
);
