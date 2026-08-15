const base = '/image';

export const imageAssets = {
  backgrounds: {
    page: `${base}/storyhop-page-background.png`,
    pageLandscape: `${base}/storyhop-page-landscape.png`,
    mobile: `${base}/storyhop-mobile-background.png`,
    mobileTruncated: `${base}/storyhop-mobile-background-truncated.png`,
    sidebarLandscape: `${base}/sidebar-landscape.png`,
    sidebarLandscapeCropped: `${base}/sidebar-landscape-cropped.png`,
  },
  home: {
    hero: `${base}/home-hero.png`,
    activeSeason: `${base}/home-active-season.png`,
    emptySeasons: `${base}/empty-seasons.png`,
    benefits: {
      forKids: `${base}/home-empty-benefit-kids-wide.png`,
      forParents: `${base}/home-empty-benefit-parents-wide.png`,
      /** Previous versions — swap paths here to revert */
      forKidsLegacy: `${base}/home-empty-benefit-kids.png`,
      forParentsLegacy: `${base}/home-empty-benefit-parents.png`,
    },
    emptyCta: {
      demo: `${base}/home-empty-cta-demo.png`,
      story: `${base}/home-empty-cta-story.png`,
    },
    features: {
      audio: `${base}/home-feature-audio.png`,
      choices: `${base}/home-feature-choices.png`,
      speaking: `${base}/home-feature-speaking.png`,
      crystals: `${base}/home-feature-crystals.png`,
      storybook: `${base}/home-feature-storybook.png`,
      parentProgress: `${base}/home-feature-parent-progress.png`,
      privacy: `${base}/home-feature-privacy.png`,
    },
    exploreIcons: {
      audio: `${base}/explore-icons/explore-icon-audio.png`,
      choices: `${base}/explore-icons/explore-icon-choices.png`,
      speaking: `${base}/explore-icons/explore-icon-speaking.png`,
      crystals: `${base}/explore-icons/explore-icon-crystals.png`,
      storybook: `${base}/explore-icons/explore-icon-storybook.png`,
      progress: `${base}/explore-icons/explore-icon-progress.png`,
    },
    exploreThumbs: {
      audio: `${base}/explore-thumbs/explore-thumb-audio.png`,
      choices: `${base}/explore-thumbs/explore-thumb-choices.png`,
      speaking: `${base}/explore-thumbs/explore-thumb-speaking.png`,
      crystals: `${base}/explore-thumbs/explore-thumb-crystals.png`,
      storybook: `${base}/explore-thumbs/explore-thumb-storybook.png`,
      progress: `${base}/explore-thumbs/explore-thumb-progress.png`,
    },
    practice: {
      writing: `${base}/home-practice-writing.png`,
      speaking: `${base}/home-practice-speaking.png`,
    },
    statsIcons: {
      episodes: `${base}/stats-icons/stats-icon-episodes.png`,
      audio: `${base}/stats-icons/stats-icon-audio.png`,
      illustrations: `${base}/stats-icons/stats-icon-illustrations.png`,
      allSet: `${base}/stats-icons/stats-icon-all-set.png`,
    },
  },
  states: {
    generationLoading: `${base}/generation-loading.png`,
    seasonCreatingCastle: `${base}/season-creating-castle.png`,
    seasonReady: `${base}/season-ready.png`,
    friendlyError: `${base}/friendly-error.png`,
    lockedStory: `${base}/locked-story.png`,
    notEnoughCrystals: `${base}/not-enough-crystals.png`,
    storybookMomentFallback: `${base}/storybook-moment-fallback.png`,
    parentNoActivity: `${base}/parent-no-activity.png`,
    notFound: `${base}/not-found-404.png`,
  },
  parent: {
    shareWithParents: `${base}/share-with-parents.png`,
    illustration: `${base}/parent.png`,
    summaryListening: `${base}/parent-summary-listening.png`,
    summarySpeaking: `${base}/parent-summary-speaking.png`,
    summaryVocab: `${base}/parent-summary-vocab.png`,
    footerBook: `${base}/parent-footer-book.png`,
    skillEmpty: `${base}/parent-skill-empty.png`,
  },
  referral: {
    inviteKids: `${base}/referral-invite-kids.png`,
    chest: `${base}/referral-chest.png`,
  },
} as const;

export type ImageAssetKey = typeof imageAssets;
