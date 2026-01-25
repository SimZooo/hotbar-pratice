<script lang="ts">
    import {
        default_settings,
        hotbar,
        Item,
        Page,
        settings,
        stats,
    } from "$lib";
    import { onMount } from "svelte";
    let durations = [5, 10, 30, 60, 120];

    let new_slot = (ignore: number[] | null): number => {
        let r = Math.min(Math.ceil(Math.random() * 9), 8);
        if (ignore !== null) {
            while (ignore.includes(r)) {
                ((r = Math.floor(Math.random() * 9)), 8);
            }
        }
        return r;
    };

    let slots: HTMLImageElement[] = $state([]);
    let to_select = $state(new_slot(null));
    let start_time: number = $state(0);
    let duration: number = $state(durations[0]);
    let editing_keybind: string | null = $state(null);
    let current_clicks = $state(0);
    let current_cps: number | null = $state(null);
    let interval_id = 0;
    let now = $state(Date.now());
    let app: HTMLDivElement | null = $state(null);

    let current_page = $state(Page.Main);

    let container: HTMLDivElement;
    let selectedPos = $state({ left: 0, top: 0 });

    // Check if settings are correct (not old version)
    if ($settings.keybinds === undefined || $settings.options === undefined) {
        settings.update((sets) => {
            return default_settings;
        });
    }

    function randomise_hotbar() {
        let items = Object.values(Item).filter(
            (item) => typeof item === "string" && item !== Item.None.toString(),
        );

        let ignore = [];

        for (const _ in $hotbar) {
            let i = Math.floor(Math.random() * items.length);
            let rand_item = items[i] as Item;
            items.splice(i, 1);

            let j = new_slot(ignore);
            ignore.push(j);
            $hotbar[j] = rand_item;

            if (items.length === 0) {
                return;
            }
        }
    }

    // Update selectedPos after the component mounts or when to_select changes
    function updateSelectedPos() {
        const slot = slots[to_select];
        if (slot && container) {
            const containerRect = container.getBoundingClientRect();
            let slot_r = slot.getBoundingClientRect();

            selectedPos.left = slot_r.left - containerRect.left;
            selectedPos.top = slot_r.top - containerRect.top;
        }
    }

    function reset() {
        current_clicks = 0;
        start_time = 0;
    }

    function start() {
        start_time = Date.now();
        current_page = Page.Running;
        randomise_hotbar();
        interval_id = setInterval(() => {
            now = Date.now();
            if (Date.now() - start_time >= duration * 1000) {
                current_page = Page.Main;
                start_time = 0;

                if ($stats.pb_cps < current_cps!) {
                    stats.update((stats) => {
                        stats.pb_cps = current_cps!;
                        return stats;
                    });
                }

                clearInterval(interval_id);
            } else {
                let elapsed_s = (now - start_time) / 1000;
                current_cps = current_clicks / elapsed_s;
            }
        }, 100);
    }

    onMount(() => {
        updateSelectedPos();
        window.addEventListener("resize", (e) => {
            updateSelectedPos();
        });

        history.pushState(null, "", location.href);
        window.addEventListener("popstate", () => {
            history.pushState(null, "", location.href);
        });

        app?.addEventListener("pointerdown", (e) => {
            if (current_page === Page.Options && editing_keybind !== null) {
                let button_label = "Mouse" + e.button;
                settings.update((sets) => {
                    if (!Object.values(sets.keybinds).includes(button_label)) {
                        sets.keybinds[editing_keybind] = button_label;
                    }
                    return sets;
                });
                editing_keybind = null;
            } else if (
                current_page === Page.Running &&
                "Mouse" + e.button ===
                    $settings.keybinds[(to_select + 1).toString()]
            ) {
                to_select = new_slot([to_select]);
                updateSelectedPos();
                current_clicks += 1;
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.repeat) {
                return;
            }
            if (current_page === Page.Options && editing_keybind !== null) {
                settings.update((sets) => {
                    if (!Object.values(sets.keybinds).includes(e.key)) {
                        sets.keybinds[editing_keybind] = e.key;
                    }
                    return sets;
                });
                editing_keybind = null;
            }

            if (
                current_page === Page.Running &&
                e.key === $settings.keybinds[(to_select + 1).toString()]
            ) {
                to_select = new_slot([to_select]);
                updateSelectedPos();
                current_clicks += 1;
            }
        });
    });

    $effect(() => {
        to_select;
        slots[to_select];

        updateSelectedPos();
    });
</script>

<div
    bind:this={app}
    class="relative w-screen h-screen overflow-hidden"
    bind:this={container}
>
    <img
        src="./bg/background.webp"
        alt=""
        class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
    />

    {#if current_page === Page.Options}
        <button
            class="right-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
            onclick={() => (current_page = Page.Main)}>Back</button
        >

        <div
            class="absolute w-1/3 place-self-center top-10 h-full text-white flex flex-col gap-30 text-xl min-h-0 overflow-y-auto"
        >
            <p class="text-4xl">Options</p>
            <div class="grid grid-cols-2 align-middle">
                <p class="text-start">Show Offhand Slot</p>
                <button
                    class="bg-[#707070] p-2 w-50 border border-black outline-none text-center hover:cursor-pointer"
                    onclick={() =>
                        ($settings.options.offhand_enabled =
                            !$settings.options.offhand_enabled)}
                >
                    {$settings.options.offhand_enabled}
                </button>
            </div>
            <p class="text-4xl">Keybinds</p>
            <div class="grid grid-cols-2 grid-rows-auto gap-5 items-center">
                {#each Object.keys($settings.keybinds) as setting}
                    <p class="text-start">Hotbar Slot {setting}</p>
                    <button
                        class="bg-[#707070] p-2 w-50 border border-black outline-none text-center hover:cursor-pointer"
                        onclick={() => (editing_keybind = setting)}
                    >
                        {#if editing_keybind === setting}
                            _
                        {:else}
                            {$settings.keybinds[setting]}
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    {:else if current_page === Page.Running}
        <div class="relative z-10 w-full h-full">
            <div
                class="place-self-center text-white mt-50 absolute flex items-end"
            >
                <p class="text-5xl">HOTBAR PRACTICE</p>
                <p class="">v0.1</p>
            </div>
            <div
                class="place-self-center text-white mt-100 absolute flex flex-col items-end"
            >
                <p class="text-2xl">
                    CPS: {Math.floor(current_cps * 100) / 100}
                </p>
                <p class="text-2xl">
                    Time: {Math.floor((now - start_time) / 1000) + 1}
                </p>
            </div>
            <div class="flex justify-center items-center size-full gap-12">
                {#if $settings.options.offhand_enabled}
                    <img
                        src="./offhand.png"
                        alt=""
                        class="h-32 aspect-square shadow-2xl shadow-black place-self-center"
                    />
                {/if}
                <div class="flex">
                    {#each Array(9) as _, i}
                        <div class="relative h-30 aspect-square">
                            <img
                                src="./slot.png"
                                alt=""
                                class="h-full w-full shadow-2xl shadow-black"
                                bind:this={slots[i]}
                                onload={updateSelectedPos}
                            />

                            <p
                                class="absolute inset-0 flex items-center justify-center
                                       text-white text-xl pointer-events-none z-10"
                            >
                                {$hotbar[i]}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>

            <img
                src="./selected.png"
                alt=""
                class="h-32 aspect-square absolute"
                style="left: {selectedPos.left}px; top: {selectedPos.top - 4}px"
            />
        </div>
        <button
            class="left-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg z-1000"
            onclick={() => {
                current_page = Page.Main;
                reset();
            }}>Back</button
        >
    {:else if current_page === Page.Tutorial}
        <div
            class="relative flex flex-col size-full justify-center z-20 text-white text-center text-3xl"
        >
            <p>
                Press the hotbar keybind corresponding to the highlighted slot.
            </p>
            <p>You can edit your preferred keybinds in the options!</p>
            <button
                class="left-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg z-1000"
                onclick={() => {
                    current_page = Page.Main;
                    reset();
                }}>Back</button
            >
        </div>
    {:else}
        <div class="place-self-center text-white mt-50 absolute flex items-end">
            <p class="text-5xl">HOTBAR PRACTICE</p>
            <p class="">v0.1</p>
        </div>

        <div
            class="place-self-center text-white mt-100 absolute flex flex-col text-2xl"
        >
            <p>
                PB: {Math.floor($stats.pb_cps * 100) / 100}
            </p>
            {#if current_cps}
                <p>
                    Last round: {Math.floor(current_cps * 100) / 100}
                </p>
            {/if}
        </div>

        <button
            class="top-100 place-self-center absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
            onclick={() => start()}>Start</button
        >

        <div class="absolute top-150 w-full flex justify-center gap-10">
            {#each durations as dur, i}
                <button
                    onclick={() => (duration = dur)}
                    class="text-white bg-[#6F6F6F] w-60 h-15 border-3 hover:cursor-pointer text-shadow-black text-shadow-lg text-lg {dur ===
                    duration
                        ? 'border-white'
                        : 'border-black'}">{dur}s</button
                >
            {/each}
        </div>

        <div
            class="absolute right-25 top-5 flex flex-col w-fit justify-center gap-5"
        >
            <button
                class="text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
                onclick={() => (current_page = Page.Options)}>Options</button
            >
            <button
                class="text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
                onclick={() => (current_page = Page.Tutorial)}
                >How to Play</button
            >
        </div>
    {/if}
    <a
        href="https://buymeacoffee.com/simzooo"
        target="_black"
        class="absolute bottom-10 left-10 bg-[#FFDD00] flex flex-row gap-2 rounded items-center p-2"
    >
        <img
            src="https://cdn.buymeacoffee.com/widget/assets/coffee%20cup.svg"
            alt="Buy Me A Coffee"
            style="height: 36px; width: 36px; margin: 0; padding: 0;"
        />
        Support me!
    </a>
</div>

<style>
    * {
        font-family: "Minecraftia";
    }
</style>
