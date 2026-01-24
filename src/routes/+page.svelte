<script lang="ts">
    import { Page, settings, stats } from "$lib";
    import { onMount } from "svelte";

    let new_slot = (): number => {
        return Math.min(Math.ceil(Math.random() * 9), 8);
    };

    let durations = [5, 10, 30, 60, 120];

    let slots: HTMLImageElement[] = $state([]);
    let to_select = $state(new_slot());
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
        interval_id = setInterval(() => {
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

            now = Date.now();
        }, 100);
    }

    onMount(() => {
        updateSelectedPos();
        window.addEventListener("resize", (e) => {
            updateSelectedPos();
        });

        app?.addEventListener("click", () => (app?.focus(), { once: true }));

        history.pushState(null, "", location.href);
        window.addEventListener("popstate", () => {
            history.pushState(null, "", location.href);
        });

        app?.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (current_page === Page.Options && editing_keybind !== null) {
                let button_label = "Mouse" + e.button;
                settings.update((sets) => {
                    if (!Object.values(sets).includes(button_label)) {
                        sets[editing_keybind] = button_label;
                    }
                    return sets;
                });
                editing_keybind = null;
            } else if (
                current_page === Page.Running &&
                "Mouse" + e.button === $settings[(to_select + 1).toString()]
            ) {
                to_select = new_slot();
                updateSelectedPos();
                current_clicks += 1;
            }
        });

        app?.addEventListener("keydown", (e) => {
            if (current_page === Page.Options && editing_keybind !== null) {
                settings.update((sets) => {
                    if (!Object.values(sets).includes(e.key)) {
                        sets[editing_keybind] = e.key;
                    }
                    return sets;
                });
                editing_keybind = null;
            }

            if (
                current_page === Page.Running &&
                e.key === $settings[(to_select + 1).toString()]
            ) {
                to_select = new_slot();
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
    tabindex="0"
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
            class="absolute w-1/3 place-self-center top-10 h-full text-white flex flex-col gap-30 text-xl"
        >
            <p class=" text-4xl">Options</p>
            <div class="flex-col grid grid-cols-2 grid-rows-10 gap-5">
                {#each Object.keys($settings) as setting}
                    <p class="text-start">Hotbar Slot {setting}</p>
                    <button
                        class="bg-[#707070] p-2 w-50 border border-black outline-none text-center hover:cursor-pointer"
                        onclick={() => (editing_keybind = setting)}
                    >
                        {#if editing_keybind === setting}
                            _
                        {:else}
                            {$settings[setting]}
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
            <div class="flex justify-center items-center size-full gap-3">
                <img
                    src="./offhand.png"
                    alt=""
                    class="h-42 aspect-square shadow-2xl shadow-black place-self-center"
                />
                <div class="flex">
                    {#each Array(9) as _, i}
                        <img
                            src="./slot.png"
                            alt=""
                            class="h-40 aspect-square shadow-2xl shadow-black"
                            bind:this={slots[i]}
                            onload={updateSelectedPos}
                        />
                    {/each}
                </div>
            </div>

            <img
                src="./selected.png"
                alt=""
                class="h-42 aspect-square absolute"
                style="left: {selectedPos.left}px; top: {selectedPos.top - 4}px"
            />

            <button
                class="right-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
                onclick={() => (current_page = Page.Options)}>Options</button
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

        <button
            class="right-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
            onclick={() => (current_page = Page.Options)}>Options</button
        >
    {/if}
</div>

<style>
    * {
        font-family: "Minecraftia";
    }
</style>
