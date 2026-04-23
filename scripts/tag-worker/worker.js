// One-shot worker: re-puts every parasha PDF with proper customMetadata.
// Deploy, hit the URL once, then delete.

const FILES = [
  { key: "Yitro_RJD.pdf",                         parasha: "Yitro",            language: "English", year: "2026" },
  { key: "Yitro_RJD (1).pdf",                      parasha: "Yitro",            language: "English", year: "2026" },
  { key: "Nutshell_RJD__Yitro___With_Ad_.pdf",     parasha: "Yitro",            language: "English", year: "2026" },
  { key: "Mishpatim_RJD.pdf",                      parasha: "Mishpatim",        language: "English", year: "2026" },
  { key: "Teruma_RJD.pdf",                         parasha: "Terumah",          language: "English", year: "2026" },
  { key: "Tesave_RJD.pdf",                         parasha: "Tetsaveh",         language: "English", year: "2026" },
  { key: "Tesave_RJD__Hebrew_.pdf",                parasha: "Tetsaveh",         language: "Hebrew",  year: "2026" },
  { key: "Tesave_RJD__Spanish_.pdf",               parasha: "Tetsaveh",         language: "Spanish", year: "2026" },
  { key: "Ki_Tisa_RJD.pdf",                        parasha: "Ki Tissa",         language: "English", year: "2026" },
  { key: "Ki_Tisa_RJD__Hebrew_.pdf",               parasha: "Ki Tissa",         language: "Hebrew",  year: "2026" },
  { key: "Ki_Tisa_RJD__Spanish_.pdf",              parasha: "Ki Tissa",         language: "Spanish", year: "2026" },
  { key: "VP_RJD__English_ (1).pdf",               parasha: "Vayakhel-Pekude", language: "English", year: "2026" },
  { key: "VP_RJD__English_.pdf",                   parasha: "Vayakhel-Pekude", language: "English", year: "2026" },
  { key: "VP_RJD__French_.pdf",                    parasha: "Vayakhel-Pekude", language: "French",  year: "2026" },
  { key: "VP_RJD__Spanish_.pdf",                   parasha: "Vayakhel-Pekude", language: "Spanish", year: "2026" },
  { key: "RJD_Vayikra.pdf",                        parasha: "Vayikra",          language: "English", year: "2026" },
  { key: "RJD_Vayikra__Spanish_.pdf",              parasha: "Vayikra",          language: "Spanish", year: "2026" },
  { key: "RJD_Tsav__Hebrew_.pdf",                  parasha: "Tsav",             language: "Hebrew",  year: "2026" },
  { key: "RJD_Tsav__French_.pdf",                  parasha: "Tsav",             language: "French",  year: "2026" },
  { key: "RJD_Tazria_Metsora.pdf",                 parasha: "Tazria-Metsora",   language: "English", year: "2026" },
  { key: "RJD_Tazria_Metsora__Spanish_.pdf",       parasha: "Tazria-Metsora",   language: "Spanish", year: "2026" },
  { key: "RJD_Tazria_Metsora__French_.pdf",        parasha: "Tazria-Metsora",   language: "French",  year: "2026" },
  { key: "RJD_AK.pdf",                             parasha: "Ahare Mot-Kedoshim", language: "English", year: "2026" },
];

const LANG_CODE = { English: "en", Hebrew: "he", Spanish: "es", French: "fr" };

export default {
  async fetch(request, env) {
    const results = [];

    for (const f of FILES) {
      const obj = await env.BUCKET.get(f.key);
      if (!obj) {
        results.push(`SKIP (not found): ${f.key}`);
        continue;
      }
      const body = await obj.arrayBuffer();
      await env.BUCKET.put(f.key, body, {
        httpMetadata: {
          contentType: "application/pdf",
          contentLanguage: LANG_CODE[f.language] ?? "en",
        },
        customMetadata: {
          parasha: f.parasha,
          language: f.language,
          year: f.year,
        },
      });
      results.push(`OK: ${f.key} → parasha=${f.parasha} language=${f.language} year=${f.year}`);
    }

    return new Response(results.join("\n"), {
      headers: { "Content-Type": "text/plain" },
    });
  },
};
