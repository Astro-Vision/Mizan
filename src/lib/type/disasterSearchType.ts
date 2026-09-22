
export type DisasterCandidateType = {
    id: string;
    name: string;
    description: string;
    disasterType: "GEMPA_BUMI" | "BANJIR" | "TANAH_LONGSOR" | "KARHUTLA" | "TSUNAMI" | "ERUPSI_GUNUNG_API" | "KEKERINGAN" | "LAINNYA";
    locationName: string;
    province: string;
    city?: string;
    eventDate: string;
    sourceUrl: string;
    sourceName: string;
    sourceType: "OFFICIAL" | "NEWS" | "SOCIAL_MEDIA";
}