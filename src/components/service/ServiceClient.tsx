"use client";

import { ClayStage } from "@/components/clay/ClayStage";
import { HeroLoop } from "@/components/clay/scenes/HeroLoop";
import { PriceBody, PriceToggle } from "@/components/sections/PriceParts";
import { PRICES } from "@/lib/prices";
import type { ServiceId } from "@/lib/prices";
import { usePriceList } from "@/lib/use-price-list";
import type { ServiceStoryDef } from "./ServiceStory";
import styles from "./ServicePage.module.css";

/** The hero's clay object: the Service's own scene finished, or the Loop at rest when it has no story yet. */
export function ServiceHeroStage({ story, name }: { story?: ServiceStoryDef; name: string }) {
  if (!story) {
    return (
      <ClayStage
        className={styles.heroStage}
        scene={({ reduced }) => <HeroLoop reduced={reduced} />}
        still="/stills/loop.png"
        label={`A soft clay infinity loop with mint beads, for ${name}.`}
      />
    );
  }
  const { Scene } = story;
  return (
    <ClayStage
      className={styles.heroStage}
      scene={({ reduced }) => <Scene reduced={reduced} fixed={1} />}
      still={story.still}
      label={story.label}
    />
  );
}

/** Only this Service's price, in the visitor's list (LKR in Sri Lanka, USD elsewhere) with the toggle. */
export function ServicePrice({ serviceId, country }: { serviceId: ServiceId; country: string | null }) {
  const { list, choose } = usePriceList(country);
  return (
    <div>
      <PriceToggle list={list} onChoose={choose} />
      <div className={styles.priceBody}>
        <PriceBody entry={PRICES[list][serviceId]} />
      </div>
    </div>
  );
}
