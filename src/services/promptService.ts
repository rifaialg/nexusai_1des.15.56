import { VideoObjective, PromoType } from '../types/basicMode';

/**
 * Service untuk menangani logika perluasan prompt menggunakan AI.
 * Menggunakan logika "Sutradara Virtual" untuk hasil yang sinematik dan naratif.
 */

interface PromptContext {
  location?: string;
  objective?: VideoObjective;
  promoType?: PromoType;
  brand?: string;
  productName?: string;
}

export const promptService = {
  /**
   * Memperluas prompt singkat menjadi deskripsi detail dalam Bahasa Indonesia.
   * (Single Shot Logic)
   */
  enhance: async (originalPrompt: string, context?: PromptContext): Promise<string> => {
    // Simulasi delay network
    await new Promise(resolve => setTimeout(resolve, 800));

    const baseLogic = generateBaseLogic(originalPrompt, context);
    
    return `
      ${baseLogic.structure}
      
      DESKRIPSI UTAMA:
      Setting: ${baseLogic.location}.
      Subjek: ${baseLogic.coreSubject}.
      
      ${baseLogic.marketingInstruction}
      
      ${baseLogic.precisionInstruction}
      
      DETAIL TEKNIS:
      Render fotorealistik 8k, pencahayaan volumetrik, color grading profesional.
      Isi visual video (konteks budaya/lingkungan) bernuansa Indonesia.
      
      CAMERA MOVEMENT (WAJIB):
      Mulai video dengan gerakan kamera "Slow Dolly In" atau "Tracking Shot" sejak detik pertama. Jangan diam.
    `.trim().replace(/\s+/g, ' ');
  },

  /**
   * Menghasilkan cerita multi-scene yang kohesif untuk video promosi profesional.
   */
  enhanceStorySequence: async (
    currentScenes: string[], 
    context?: PromptContext
  ): Promise<string[]> => {
    // Simulasi waktu berpikir AI
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalScenes = currentScenes.length;
    
    // Generate logic dasar untuk setiap scene
    const enhancedScenes = currentScenes.map((rawText, index) => {
        const isFirst = index === 0;
        const isLast = index === totalScenes - 1;
        
        // 1. DUPLIKASI LOGIKA DASAR (Single Shot Logic)
        const baseLogic = generateBaseLogic(rawText, context);

        // 2. TENTUKAN PERAN SCENE (Story Arc)
        let sceneRole = "";
        if (isFirst) sceneRole = "THE HOOK (Menarik Perhatian)";
        else if (isLast) sceneRole = "THE CLIMAX & CALL TO ACTION";
        else sceneRole = "THE JOURNEY/DEMO (Mempertahankan Minat)";

        // 3. INSTRUKSI KONTINUITAS (Continuous Story) - KHUSUS MULTI SCENE
        let continuityInstruction = "";
        if (isFirst) {
            continuityInstruction = "ANCHOR SCENE: Tetapkan karakter utama, pakaian, dan pencahayaan di sini. Ini adalah referensi visual mutlak untuk scene berikutnya.";
        } else {
            continuityInstruction = `CONTINUITY MANDATE (WAJIB): Pertahankan konsistensi 100% dengan Scene 1. Karakter harus orang yang SAMA, memakai baju yang SAMA PERSIS. Pencahayaan dan tone warna harus menyambung (match cut) dari scene sebelumnya. Jangan ubah properti fisik subjek.`;
        }

        // 4. INSTRUKSI ALUR (Flow)
        const flowInstruction = `NARRATIVE FLOW: Scene ini adalah bagian ${index + 1} dari ${totalScenes}. Pastikan aksi di scene ini melanjutkan logika cerita dari scene sebelumnya secara mulus.`;

        // 5. RAKIT PROMPT FINAL
        return `
            [SCENE ${index + 1}/${totalScenes}: ${sceneRole}]
            
            ${baseLogic.structure}
            
            DESKRIPSI VISUAL:
            Setting: ${baseLogic.location}.
            Aksi: ${baseLogic.coreSubject || "Kelanjutan aksi karakter utama yang relevan dengan produk"}.
            
            ${continuityInstruction}
            
            ${flowInstruction}
            
            ${baseLogic.marketingInstruction}
            
            ${baseLogic.precisionInstruction}
            
            DETAIL TEKNIS:
            Render fotorealistik 8k, konsistensi karakter tingkat tinggi.
            
            CAMERA:
            Start with dynamic motion. No static frames.
        `.trim().replace(/\s+/g, ' ');
    });

    return enhancedScenes;
  },

  /**
   * Menghasilkan cerita multi-scene berdasarkan analisis gambar visual (Simulasi).
   */
  generateStoryFromVisuals: async (
    sceneCount: number, 
    context?: PromptContext
  ): Promise<string[]> => {
    // Simulasi waktu analisis AI (Vision Analysis)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const location = context?.location || "Lokasi Sinematik";
    const objective = context?.objective || 'general';
    const brandInfo = context?.brand ? `Brand ${context.brand}` : "Produk";

    // Template Cerita Berdasarkan Objective
    let storyArc: string[] = [];

    if (objective === 'promo') {
      // Alur Iklan
      storyArc = [
        `SCENE 1 (HOOK): Establishing shot di ${location}. Kamera tracking shot mendekati subjek utama yang memegang ${brandInfo}. Pencahayaan dramatis menonjolkan detail tekstur.`,
        `SCENE 2 (ACTION): Close-up ekstrem pada interaksi produk. Menunjukkan fitur utama atau penggunaan produk dengan gerakan slow-motion yang elegan.`,
        `SCENE 3 (BENEFIT): Medium shot menampilkan reaksi bahagia/puas dari subjek setelah menggunakan produk. Atmosfer menjadi lebih cerah dan positif.`,
        `SCENE 4 (LIFESTYLE): Wide shot memperlihatkan produk terintegrasi dalam gaya hidup sehari-hari di ${location}.`,
        `SCENE 5 (CLIMAX): Packshot produk yang berputar perlahan dengan pencahayaan "Hero Light". Kesan premium dan eksklusif.`
      ];
    } else {
      // Alur Sinematik Umum
      storyArc = [
        `SCENE 1 (INTRO): Kamera pan perlahan di ${location}, memperkenalkan atmosfer misterius. Subjek utama terlihat siluet atau dari belakang.`,
        `SCENE 2 (REVEAL): Dolly zoom in ke wajah/objek utama. Pencahayaan berubah menjadi hangat, mengungkapkan detail visual yang tajam.`,
        `SCENE 3 (JOURNEY): Subjek bergerak dinamis melintasi ${location}. Kamera mengikuti (tracking shot) dengan stabil.`,
        `SCENE 4 (CONFLICT/ACTION): Momen intensitas tinggi atau interaksi visual yang kompleks. Partikel debu atau cahaya menari di udara.`,
        `SCENE 5 (RESOLUTION): Kamera perlahan mundur (pull back). Subjek berdiri tenang, menatap ke arah cakrawala. Fade to black.`
      ];
    }

    // Potong array sesuai jumlah scene yang diminta user
    const finalScenes = storyArc.slice(0, sceneCount).map((desc, idx) => {
        const consistencyNote = idx > 0 ? " [KONSISTENSI: Pertahankan karakter, pakaian, dan pencahayaan SAMA PERSIS dengan Scene 1]" : "";
        // Force motion in generated story
        const motionNote = " [CAMERA: Dynamic Motion Start]";
        return desc + consistencyNote + motionNote;
    });

    return finalScenes;
  }
};

// --- INTERNAL HELPER: Shared Logic Generator ---
function generateBaseLogic(promptText: string, context?: PromptContext) {
    const location = context?.location || "Lokasi yang sesuai";
    const objective = context?.objective || 'general';
    const promoType = context?.promoType || 'soft_selling';
    
    // 1. LOGIKA MARKETING
    let marketingInstruction = "";
    let structure = "";

    switch (objective) {
      case 'promo':
        if (promoType === 'hard_selling') {
          structure = "Struktur: [Masalah/Kebutuhan] -> [Solusi Produk] -> [Hasil Dramatis].";
          marketingInstruction = "Tampilkan efektivitas produk secara visual.";
        } else if (promoType === 'awareness') {
          structure = "Struktur: [Hook Visual] -> [Estetika Produk].";
          marketingInstruction = "Fokus pada estetika visual dan pencahayaan premium.";
        } else { // soft_selling
          structure = "Struktur: [Scene Lifestyle] -> [Integrasi Produk Natural].";
          marketingInstruction = "Tunjukkan produk menyatu dalam kehidupan sehari-hari.";
        }
        break;
      default: // general
        structure = "Struktur: [Cinematic Opening] -> [Dynamic Action].";
        marketingInstruction = "Fokus pada keindahan sinematik.";
        break;
    }

    // 2. LOGIKA PRESISI
    const precisionInstruction = "SKALA & POSISI: Pastikan produk terlihat PRESISI dan REALISTIS. Ukuran produk tidak boleh terlalu besar (raksasa) atau terlalu kecil. Harus proporsional dengan subjek manusia.";

    // Normalisasi input
    let coreSubject = promptText.trim();
    if (!coreSubject) coreSubject = ""; 

    return {
        location,
        coreSubject,
        marketingInstruction,
        structure,
        precisionInstruction
    };
}
