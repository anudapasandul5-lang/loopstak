"use client";

import { useRef, type ComponentType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ClayStage } from "@/components/clay/ClayStage";
import type { StoryProps } from "@/components/clay/scenes/WebsiteBuild";
import { setProgress } from "@/lib/scroll-store";
import styles from "./ServicePage.module.css";

export type ServiceStoryDef = {
  Scene: ComponentType<StoryProps>;
  still: string;
  label: string;
  /** Optional story heading; defaults to the page-level one. */
  heading?: string;
};

export const STORY_ID = "service-story";

/**
 * The scroll story. Desktop: the section pins and the scene is scrubbed through the scroll.
 * Phones: no pinning; the scene follows normal scroll. Reduced motion: finished pose, no scrubbing.
 * `caption` is one fixed line from the page copy; the scene carries the story.
 */
export function ServiceStory({
  story,
  label,
  caption,
  section,
}: {
  story: ServiceStoryDef;
  label: string;
  caption: string;
  section: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { Scene } = story;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current;
      if (!el) return;
      const show = (p: number) => setProgress(STORY_ID, p);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        show(1);
      });
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        show(0);
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "+=240%",
          pin: true,
          scrub: true,
          onUpdate: (self) => show(self.progress),
        });
      });
      mm.add("(prefers-reduced-motion: no-preference) and (max-width: 767px)", () => {
        show(0);
        ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          end: "bottom 45%",
          onUpdate: (self) => show(self.progress),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={styles.story} aria-labelledby="story-label" data-story={section}>
      <div className={styles.storyInner}>
        <div className={styles.storyCopy}>
          <h2 id="story-label" className={styles.label}>
            {story.heading ?? label}
          </h2>
          <p className={styles.storyCaption}>
            {caption}
          </p>
        </div>
        <ClayStage
          className={styles.storyStage}
          scene={({ reduced }) => <Scene reduced={reduced} progressId={STORY_ID} />}
          still={story.still}
          label={story.label}
        />
      </div>
    </section>
  );
}
