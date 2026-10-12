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
};

export const STORY_ID = "service-story";

/**
 * The scroll story. Desktop: the section pins and the scene is scrubbed through the scroll.
 * Phones: no pinning; the scene follows normal scroll. Reduced motion: finished pose, no scrubbing.
 * `steps` are the page's own "included" lines, shown one at a time as the story moves along.
 */
export function ServiceStory({
  story,
  label,
  steps,
  section,
}: {
  story: ServiceStoryDef;
  label: string;
  steps: string[];
  section: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const { Scene } = story;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current;
      if (!el) return;
      const show = (p: number) => {
        setProgress(STORY_ID, p);
        if (caption.current) caption.current.textContent = steps[Math.min(steps.length - 1, Math.floor(p * steps.length))] ?? "";
      };
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
            {label}
          </h2>
          <p ref={caption} className={styles.storyCaption} aria-hidden="true">
            {steps[steps.length - 1]}
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
