/**
 * Playbook utilities – map a `TrainingAction` together with a target platform
 * to a deterministic, human‑readable set of instructions. The playbook is
 * deliberately simple and does not perform any network calls; it only
 * combines the static information from the action with a few platform‑aware
 * templates.
 */

import { TrainingAction, TrainingPlatform } from "./types";

/**
 * The shape of the instruction block that will be rendered by the UI.
 *
 * - `what` – a short, imperative description of the activity.
 * - `why` – the motivation, reused from the underlying action.
 * - `how` – a concise, platform‑specific tip on how to perform the
 *   activity.
 * - `do` – list of recommended behaviours.
 * - `dont` – list of behaviours to avoid.
 */
export interface PlatformInstruction {
  what: string;
  why: string;
  how: string;
  do: string[];
  dont: string[];
}

/**
 * Return a deterministic instruction set for a given action / platform.
 *
 * The implementation follows a series of simple templates. Because the
 * function is pure and only relies on the supplied arguments, the output is
 * fully deterministic – a requirement for the “Platform Playbook” feature.
 */
export function getPlaybookInstruction(
  action: TrainingAction,
  platform: TrainingPlatform
): PlatformInstruction {
  // Base fields that are always present
  const base = {
    why: action.why,
    // Default placeholders – will be overridden per action type
    what: "",
    how: "",
    do: [] as string[],
    dont: [] as string[],
  };

  // Helper to insert the platform name in a sentence while keeping the
  // first‑letter capitalised for readability.
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  switch (action.type) {
    case "WATCH": {
      const a = action as any; // narrower type for convenience
      const what = `Watch ${a.contentPreferenceName} ${a.topicName} content`;
      const how = `Open ${platformName} and watch videos that match "${a.topicName}". Spend the full watch time to signal intent.`;
      const doList = ["Watch the video without skipping", "Pay attention to the core message"];
      const dontList = ["Scroll past quickly", "Engage with unrelated content"];
      return { ...base, what, how, do: doList, dont: dontList };
    }
    case "SEARCH": {
      const a = action as any;
      const what = `Search for "${a.query}"`;
      const how = `In ${platformName}'s search bar, type the query exactly as shown and explore the top results.`;
      const doList = ["Select results that truly match the intent", "Bookmark or save useful findings"];
      const dontList = ["Click click‑bait thumbnails", "Ignore the relevance of the results"];
      return { ...base, what, how, do: doList, dont: dontList };
    }
    case "FOLLOW":
    case "SUBSCRIBE": {
      const a = action as any;
      const verb = action.type === "FOLLOW" ? "follow" : "subscribe to";
      const what = `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${a.creator.name} on ${platformName}`;
      const how = `Navigate to ${a.creator.name}'s ${platformName} profile and hit the ${verb} button.`;
      const doList = [`Ensure the creator covers ${a.topicName} topics`, `Engage with a few of their posts`];
      const dontList = ["Follow unrelated creators", "Subscribe without checking their content"];
      return { ...base, what, how, do: doList, dont: dontList };
    }
    case "ENGAGE": {
      const what = `Engage with content related to your interests`;
      const how = `On ${platformName}, like, comment, or share content that aligns with your goals.`;
      const doList = ["Leave a meaningful comment", "Like posts you truly appreciate"];
      const dontList = ["Leave generic spam comments", "Like everything indiscriminately"];
      return { ...base, what, how, do: doList, dont: dontList };
    }
    case "AVOID": {
      const a = action as any;
      const what = `Avoid ${a.filter} content`;
      const how = `When browsing ${platformName}, deliberately skip ${a.filter.toLowerCase()} posts and do not interact with them.`;
      const doList = ["Scroll past these items", "Report or mute if possible"];
      const dontList = ["Accidentally like or share", "Spend time on them"];
      return { ...base, what, how, do: doList, dont: dontList };
    }
    default: {
      // Fallback for any future action types – keep it generic.
      const anyAction = action as any;
      return {
        ...base,
        what: `Perform the ${anyAction.type?.toLowerCase() ?? "action"} action`,
        how: `Use ${platformName} according to the action description.`,
        do: [],
        dont: [],
      };
    }
  }
}
