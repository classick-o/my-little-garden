import type { NextConfig } from "next";

/* Gazda Supabase, de unde vin pozele semnate. Scoasa din adresa proiectului ca
   sa nu existe doua locuri de schimbat cand se schimba proiectul.
   Protocolul si portul se iau tot de acolo: in cloud e https fara port, local e
   http pe 54321. Fixate pe https, pozele locale nu se incarca deloc. */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : undefined;

const isLocalHost = supabaseUrl
  ? ["localhost", "127.0.0.1", "::1"].includes(supabaseUrl.hostname)
  : false;

const nextConfig: NextConfig = {
  /* Indicatorul de dev acoperea navigatia de jos in capturile de ecran.
     Erorile de compilare si de runtime sunt afisate in continuare. */
  devIndicators: false,

  experimental: {
    serverActions: {
      /* Poza merge la server prin actiune, deja micsorata in browser la ~200-400
         KB. Limita implicita de 1 MB e stramta pentru pozele mai detaliate, iar
         multipart mai adauga cateva zeci de KB peste continut. */
      bodySizeLimit: "3mb",
    },
  },

  images: {
    /* Next refuza sa aduca imagini de pe IP-uri private, ca protectie
       impotriva SSRF. Stack-ul Supabase local sta pe 127.0.0.1, deci fara
       exceptia asta nicio poza nu se vede in dezvoltare.

       Pornita numai cand gazda chiar e locala: in productie Supabase e un
       domeniu public, conditia e falsa si protectia ramane intreaga. */
    dangerouslyAllowLocalIP: isLocalHost,

    /* Bucket-ul e privat, deci adresele sunt semnate si expira. Optimizarea
       merge la fel: Next descarca o data si pastreaza rezultatul. */
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
