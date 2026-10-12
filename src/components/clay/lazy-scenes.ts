"use client";

import dynamic from "next/dynamic";

/*
 * Every clay scene, loaded on demand. Sections import scenes from here, never from ./scenes directly,
 * so three.js, R3F and drei stay out of the first-load bundle and only arrive when ClayStage mounts a canvas.
 */
export const HeroLoop = dynamic(() => import("./scenes/HeroLoop").then((m) => m.HeroLoop), { ssr: false });
export const StatementLoop = dynamic(() => import("./scenes/StatementLoop").then((m) => m.StatementLoop), { ssr: false });
export const ServicesTurntable = dynamic(() => import("./scenes/ServicesTurntable").then((m) => m.ServicesTurntable), { ssr: false });
export const ServiceRest = dynamic(() => import("./scenes/ServicesTurntable").then((m) => m.ServiceRest), { ssr: false });
export const ProcessStack = dynamic(() => import("./scenes/ProcessStack").then((m) => m.ProcessStack), { ssr: false });
export const KeysDoor = dynamic(() => import("./scenes/KeysDoor").then((m) => m.KeysDoor), { ssr: false });
export const ContactLoop = dynamic(() => import("./scenes/ContactLoop").then((m) => m.ContactLoop), { ssr: false });
export const WebsiteBuild = dynamic(() => import("./scenes/WebsiteBuild").then((m) => m.WebsiteBuild), { ssr: false });
export const AgentGears = dynamic(() => import("./scenes/AgentGears").then((m) => m.AgentGears), { ssr: false });
export const ClaudePlug = dynamic(() => import("./scenes/ClaudePlug").then((m) => m.ClaudePlug), { ssr: false });
export const TeachingTable = dynamic(() => import("./scenes/TeachingTable").then((m) => m.TeachingTable), { ssr: false });
