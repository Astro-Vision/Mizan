
export type DisasterCandidateType = {
    id: string;
    name: string;
    description: string;
    disasterType : "GEMPA_BUMI" | "BANJIR" | "TANAH_LONGSOR" | "KEBAKARAN" | "TSUNAMI" | "ERUPSI_GUNUNG_API" | "ANGIN_PUTING_BELIUNG" | "KEKERINGAN" | "LAINNYA";
    locationName: string;
    province: string;
    capitalCity: string;
    eventDate: string;
    sourceUrl: string;
    sourceName: string;
    sourceType: "OFFICIAL" | "NEWS" | "SOCIAL_MEDIA";
}