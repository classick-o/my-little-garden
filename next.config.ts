import type { NextConfig } from "next";

/* Gazda Supabase, de unde vin pozele semnate. Scoasa din adresa proiectului ca
   sa nu existe doua locuri de schimbat cand se schimba proiectul. */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  /* Indicatorul de dev acoperea navigatia de jos in capturile de ecran.
     Erorile de compilare si de runtime sunt afisate in continuare. */
  devIndicators: false,

  images: {
    /* Bucket-ul e privat, deci adresele sunt semnate si expira. Optimizarea
       merge la fel: Next descarca o data si pastreaza rezultatul. */
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/**" }]
      : [],
  },
};

export default nextConfig;
