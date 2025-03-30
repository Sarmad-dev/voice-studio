interface Labels {
    accent: string;
    age: string;
    description: string;
    gender: string;
    use_case: string;
  }
  
  interface SpeakerSeparation {
    voice_id: string;
    sample_id: string;
    status: string;
  }
  
  interface Sample {
    sample_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    hash: string;
    duration_secs: number;
    remove_background_noise: boolean;
    has_isolated_audio: boolean;
    has_isolated_audio_preview: boolean;
    speaker_separation: SpeakerSeparation;
  }
  
  interface Recording {
    recording_id: string;
    mime_type: string;
    size_bytes: number;
    upload_date_unix: number;
    transcription: string;
  }
  
  interface VerificationAttempt {
    text: string;
    date_unix: number;
    accepted: boolean;
    similarity: number;
    levenshtein_distance: number;
    recording: Recording;
  }
  
  interface ManualVerificationFile {
    file_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    upload_date_unix: number;
  }
  
  interface ManualVerification {
    extra_text: string;
    request_time_unix: number;
    files: ManualVerificationFile[];
  }
  
  interface FineTuning {
    is_allowed_to_fine_tune: boolean;
    state: Record<string, string>;
    verification_failures: string[];
    verification_attempts_count: number;
    manual_verification_requested: boolean;
    language: string;
    progress: Record<string, number>;
    message: Record<string, string>;
    dataset_duration_seconds: number;
    verification_attempts: VerificationAttempt[];
    slice_ids: string[];
    manual_verification: ManualVerification;
    max_verification_attempts: number;
    next_max_verification_attempts_reset_unix_ms: number;
  }
  
  interface Settings {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    speed: number;
  }
  
  interface ModerationCheck {
    date_checked_unix: number;
    name_value: string;
    name_check: boolean;
    description_value: string;
    description_check: boolean;
    sample_ids: string[];
    sample_checks: number[];
    captcha_ids: string[];
    captcha_checks: number[];
  }
  
  interface ReaderRestrictedOn {
    resource_type: string;
    resource_id: string;
  }
  
  interface Sharing {
    status: string;
    date_unix: number;
    whitelisted_emails: string[];
    public_owner_id: string;
    original_voice_id: string;
    financial_rewards_enabled: boolean;
    free_users_allowed: boolean;
    live_moderation_enabled: boolean;
    notice_period: number;
    voice_mixing_allowed: boolean;
    featured: boolean;
    category: string;
    liked_by_count: number;
    cloned_by_count: number;
    name: string;
    labels: {
      accent: string;
      gender: string;
    };
    review_status: string;
    enabled_in_library: boolean;
    history_item_sample_id: string;
    rate: number;
    disable_at_unix: number;
    reader_app_enabled: boolean;
    image_url: string;
    ban_reason: string;
    description: string;
    review_message: string;
    instagram_username: string;
    twitter_username: string;
    youtube_username: string;
    tiktok_username: string;
    moderation_check: ModerationCheck;
    reader_restricted_on: ReaderRestrictedOn[];
  }
  
  interface VerifiedLanguage {
    language: string;
    model_id: string;
    accent: string;
    preview_url: string;
  }
  
  interface VoiceVerification {
    requires_verification: boolean;
    is_verified: boolean;
    verification_failures: string[];
    verification_attempts_count: number;
    language: string;
    verification_attempts: VerificationAttempt[];
  }
  
  interface Voice {
    voice_id: string;
    name: string;
    category: string;
    labels: Labels;
    available_for_tiers: string[];
    high_quality_base_model_ids: string[];
    samples: Sample[];
    fine_tuning: FineTuning;
    description: string;
    preview_url: string;
    settings: Settings;
    sharing: Sharing;
    verified_languages: VerifiedLanguage[];
    safety_control: string;
    voice_verification: VoiceVerification;
    permission_on_resource: string;
    is_owner: boolean;
    is_legacy: boolean;
    is_mixed: boolean;
    created_at_unix: number;
  }