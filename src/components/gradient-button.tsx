import { Button, type buttonVariants } from "@/components/ui/button";

type Variant = NonNullable<Parameters<typeof buttonVariants>[0]>["variant"];

export function GradientButton({
  variant = "primary",
  ...props
}: React.ComponentProps<typeof Button> & { variant?: Variant }) {
  return <Button variant={variant} {...props} />;
}
