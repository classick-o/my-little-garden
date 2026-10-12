"use client";

import { Droplets } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { waterPlantAction } from "@/app/(app)/plants/actions";

/**
 * Butonul de udare.
 *
 * Formular, nu buton simplu: asa merge si fara JavaScript, si tot el ne da
 * starea de asteptare prin `useFormStatus`.
 */
export function WaterButton({
  plantId,
  wateredToday,
  size = "md",
  className,
}: {
  plantId: string;
  wateredToday: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <form action={waterPlantAction} className={className}>
      <input type="hidden" name="plantId" value={plantId} />
      <Submit wateredToday={wateredToday} size={size} />
    </form>
  );
}

function Submit({
  wateredToday,
  size,
}: {
  wateredToday: boolean;
  size: "md" | "lg";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size={size}
      /* Verdele plin inseamna "ai ceva de facut". Udata deja, butonul se
         retrage in sticla. */
      variant={wateredToday ? "soft" : "primary"}
      disabled={wateredToday || pending}
      className="w-full"
    >
      <Droplets className="size-[18px]" />
      {wateredToday ? "Udata astazi" : pending ? "Se salveaza..." : "Uda planta"}
    </Button>
  );
}
