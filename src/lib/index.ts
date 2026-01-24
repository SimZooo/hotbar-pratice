import { persisted, type Persisted } from "svelte-persisted-store";

export enum Page {
    Main,
    Running,
    Options,
}

export let settings: Persisted<object> = persisted("settings", {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    offhand: "f",
});

export let stats: Persisted<{ pb_cps: number }> = persisted("stats", {
    pb_cps: 0,
});
