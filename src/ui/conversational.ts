import { element, textInput, label } from './ui';
import { column, row } from './panel';
import { button } from './button';
import { svgIcon, Icon } from './icons';
import { Settings, SettingGroup, Setting, float_, int_, group, GroupSetting, SettingAttr } from '../config/settings';
import { SettingsUI } from '../config/settingsui';
import { sendCommandAndGetStatus } from '../http/http';
import { currentState } from '../machine/machine';
import { positionChannel } from '../events/eventbus';

class ConversationalSettings extends Settings {
    root: SettingGroup;
    onConfigChange?: () => void;

    constructor() {
        super();
        this.root = new SettingGroup("conversational", 0);

        // Subgroup: Circular Pattern
        // Path convention ensures unique identification
        const circPattern = new SettingGroup("conversational/circular_pattern", 0);
        circPattern.name = "circular_pattern"; // Explicitly set internal name to match Option value

        circPattern.settings.push(float_("cx", 0.0, -1000, 1000).setDisplayName("Center X"));
        circPattern.settings.push(float_("cy", 0.0, -1000, 1000).setDisplayName("Center Y"));
        circPattern.settings.push(float_("dia", 50.0, 0, 1000).setDisplayName("Diameter"));
        circPattern.settings.push(int_("count", 6, 1, 1000).setDisplayName("Hole Count"));
        circPattern.settings.push(float_("start_angle", 0.0, -360, 360).setDisplayName("Start Angle"));
        circPattern.settings.push(float_("angle_span", 360.0, -360, 360).setDisplayName("Angle Span"));

        // Link Child to Parent
        this.root.groups.push(circPattern);
        circPattern.setParent(this.root);

        // Subgroup: Grid Pattern
        const gridPattern = new SettingGroup("conversational/grid_pattern", 0);
        gridPattern.name = "grid_pattern";

        gridPattern.settings.push(float_("sx", 0.0, -1000, 1000).setDisplayName("Start X"));
        gridPattern.settings.push(float_("sy", 0.0, -1000, 1000).setDisplayName("Start Y"));
        gridPattern.settings.push(int_("nx", 3, 1, 1000).setDisplayName("Count X"));
        gridPattern.settings.push(int_("ny", 2, 1, 1000).setDisplayName("Count Y"));
        gridPattern.settings.push(float_("dx", 10.0, -1000, 1000).setDisplayName("Delta X"));
        gridPattern.settings.push(float_("dy", 10.0, -1000, 1000).setDisplayName("Delta Y"));
        gridPattern.settings.push(float_("angle", 0.0, -360, 360).setDisplayName("Angle"));

        this.root.groups.push(gridPattern);
        gridPattern.setParent(this.root);

        // Operation Selector (GroupSetting)
        // "this" refers to the group containing the setting (root)
        const op = group("this");
        op.setName("operation");
        op.setDisplayName("Operation");

        // Intercept setValue to trigger UI updates when dropdown changes
        const originalSet = op.setValue.bind(op);
        op.setValue = (v: string) => {
            const res = originalSet(v);
            this.onConfigChange?.();
            return res;
        };

        this.root.settings.push(op);
        op.setParent(this.root);

        // Finalize to populate options from the parent's groups
        op.finalize();

        // Default
        op.setValue("circular_pattern");
    }

    protected async loadSettings(): Promise<SettingGroup> {
        return this.root;
    }

    async saveSetting(s: Setting<any, any>): Promise<any> {
        this.onConfigChange?.();
        return Promise.resolve();
    }

    async saveSettings(): Promise<void> {
        return Promise.resolve();
    }
}

class ConversationalUI extends SettingsUI {
    constructor(settings: Settings, id: string) {
        super(settings, id);
    }
}

// Singleton instances
const convSettings = new ConversationalSettings();
const convUI = new ConversationalUI(convSettings, "conv-settings-ui");

let currentHoleIndex = 0;
let lastHoleIndex = -1;
let currentGroup: SettingGroup | undefined; // For position updates

export function conversationalPanel() {
    // Ensure settings are "loaded"
    convSettings.load().then(() => { });

    const canvas = element('canvas', 'conv-canvas', undefined) as HTMLCanvasElement;
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "contain";
    canvas.style.border = "1px solid #ccc";
    canvas.style.backgroundColor = "#fff";
    canvas.style.alignSelf = "center";

    const contentDiv = column('conv-content').build();
    contentDiv.style.height = "100%";
    contentDiv.style.overflowY = "hidden";

    const update = () => {
        contentDiv.innerHTML = "";

        // Cleanup listeners
        canvas.onclick = null;
        convSettings.onConfigChange = undefined;

        // Create Main Pane (Handles Selector + Active Subgroup)
        const pane = convUI.createPane(convSettings.root);
        pane.style.height = "100%";
        pane.style.overflowY = "auto";

        // Reset state
        currentHoleIndex = 0;
        lastHoleIndex = -1;

        // Layout
        const splitLayout = row()
            .gap("10px")
            .add("1fr", pane)
            .add("2fr", canvas)
            .build();
        splitLayout.style.height = "100%";

        contentDiv.appendChild(splitLayout);

        // Initial Draw
        drawPattern(canvas, convSettings.root);

        // Click Handler (Dynamic based on selected group)
        canvas.onclick = (e) => {
            const op = convSettings.root.getSetting("operation") as GroupSetting;
            const group = op.getSelectedGroup();

            if (!group) return;

            // Common Calculations for Scale & Transform
            // Note: We duplicate draw logic here to map click -> world. 
            // Ideally should refactor into a shared "getPointsAndTransform" helper.
            const rect = canvas.getBoundingClientRect();
            // DOM Scale (if CSS size != attribute size)
            const scaleX_DOM = canvas.width / rect.width;
            const scaleY_DOM = canvas.height / rect.height;
            const clickX_Canv = (e.clientX - rect.left) * scaleX_DOM;
            const clickY_Canv = (e.clientY - rect.top) * scaleY_DOM;

            const w = canvas.width;
            const h = canvas.height;
            const padding = 20;

            let points: { x: number, y: number, i: number }[] = [];

            // --- Generate Points based on Type ---
            if (group.name === "circular_pattern") {
                const cx = group.getSetting<number>("cx")?.getValue() ?? 0;
                const cy = group.getSetting<number>("cy")?.getValue() ?? 0;
                const dia = group.getSetting<number>("dia")?.getValue() ?? 50;
                const count = group.getSetting<number>("count")?.getValue() ?? 6;
                const startAngle = group.getSetting<number>("start_angle")?.getValue() ?? 0;
                const angleSpan = group.getSetting<number>("angle_span")?.getValue() ?? 360;
                const radius = dia / 2;

                let step = 0;
                if (count > 0) {
                    if (Math.abs(angleSpan - 360) < 0.001) step = 360 / count;
                    else step = count > 1 ? angleSpan / (count - 1) : 0;
                }

                for (let i = 0; i < count; i++) {
                    const angleDeg = startAngle + (i * step);
                    const angleRad = angleDeg * Math.PI / 180;
                    const rx = radius * Math.cos(angleRad);
                    const ry = radius * Math.sin(angleRad);
                    points.push({ x: cx + rx, y: cy + ry, i });
                }
            } else if (group.name === "grid_pattern") {
                const sx = group.getSetting<number>("sx")?.getValue() ?? 0;
                const sy = group.getSetting<number>("sy")?.getValue() ?? 0;
                const nx = group.getSetting<number>("nx")?.getValue() ?? 1;
                const ny = group.getSetting<number>("ny")?.getValue() ?? 1;
                const dx = group.getSetting<number>("dx")?.getValue() ?? 10;
                const dy = group.getSetting<number>("dy")?.getValue() ?? 10;
                const angle = group.getSetting<number>("angle")?.getValue() ?? 0;

                const rad = angle * Math.PI / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);

                let idx = 0;
                for (let iy = 0; iy < ny; iy++) {
                    for (let ix = 0; ix < nx; ix++) {
                        // Local grid coords
                        const lgx = ix * dx;
                        const lgy = iy * dy;

                        // Rotate
                        const rgx = lgx * cos - lgy * sin;
                        const rgy = lgx * sin + lgy * cos;

                        // Translate
                        points.push({ x: sx + rgx, y: sy + rgy, i: idx++ });
                    }
                }
            } else {
                return;
            }

            // --- Determine Bounds & Scale ---
            if (points.length === 0) return;
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            points.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });

            // Prevent singular bounds
            if (maxX - minX < 1) { maxX += 1; minX -= 1; }
            if (maxY - minY < 1) { maxY += 1; minY -= 1; }

            const scaleX = (w - 2 * padding) / (maxX - minX);
            const scaleY = (h - 2 * padding) / (maxY - minY);
            const scale = Math.min(scaleX, scaleY);

            // Center calculation (centers the bounding box on canvas)
            const midX = (minX + maxX) / 2;
            const midY = (minY + maxY) / 2;

            // --- Hit Test ---
            for (const pt of points) {
                // World -> Canvas
                const px = w / 2 + (pt.x - midX) * scale;
                const py = h / 2 - (pt.y - midY) * scale; // Flip Y

                const distSq = (clickX_Canv - px) ** 2 + (clickY_Canv - py) ** 2;
                if (distSq < 25 * 25) {
                    // Hit!
                    lastHoleIndex = pt.i;
                    const count = points.length;

                    sendCommandAndGetStatus("G90")
                        .then(() => sendCommandAndGetStatus(`G0 X${pt.x.toFixed(4)} Y${pt.y.toFixed(4)}`))
                        .then(() => {
                            currentHoleIndex = pt.i + 1;
                            if (currentHoleIndex >= count) currentHoleIndex = 0;
                            drawPattern(canvas, convSettings.root);
                        });

                    drawPattern(canvas, convSettings.root);
                    break;
                }
            }
        };

        // Re-draw on any change
        convSettings.onConfigChange = () => {
            drawPattern(canvas, convSettings.root);
        };
    };

    // Subscribe to machine position updates
    positionChannel.register(() => {
        // Redraw current active group via root
        drawPattern(canvas, convSettings.root);
    });

    // Defer initial update
    setTimeout(update, 0);

    return column('conversational')
        .overflow("hidden")
        .add("1fr", contentDiv)
        .build();
}

function drawPattern(canvas: HTMLCanvasElement, root: SettingGroup) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine active group
    const op = root.getSetting("operation") as GroupSetting;
    const group = op?.getSelectedGroup();

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!group || (group.name !== "circular_pattern" && group.name !== "grid_pattern")) {
        ctx.fillStyle = "#888";
        ctx.textAlign = "center";
        ctx.font = "20px sans-serif";
        ctx.fillText("Visualization not implemented for this type", w / 2, h / 2);
        return;
    }

    // Update active group ref for position updates
    currentGroup = group;

    let points: { x: number, y: number, i: number }[] = [];

    // --- Generate Points ---
    if (group.name === "circular_pattern") {
        const cx = group.getSetting<number>("cx")?.getValue() ?? 0;
        const cy = group.getSetting<number>("cy")?.getValue() ?? 0;
        const dia = group.getSetting<number>("dia")?.getValue() ?? 50;
        const count = group.getSetting<number>("count")?.getValue() ?? 6;
        const startAngle = group.getSetting<number>("start_angle")?.getValue() ?? 0;
        const angleSpan = group.getSetting<number>("angle_span")?.getValue() ?? 360;
        const radius = dia / 2;

        let step = 0;
        if (count > 0) {
            if (Math.abs(angleSpan - 360) < 0.001) step = 360 / count;
            else step = count > 1 ? angleSpan / (count - 1) : 0;
        }

        for (let i = 0; i < count; i++) {
            const angleDeg = startAngle + (i * step);
            const angleRad = angleDeg * Math.PI / 180;
            const rx = radius * Math.cos(angleRad);
            const ry = radius * Math.sin(angleRad);
            points.push({ x: cx + rx, y: cy + ry, i });
        }
    } else if (group.name === "grid_pattern") {
        const sx = group.getSetting<number>("sx")?.getValue() ?? 0;
        const sy = group.getSetting<number>("sy")?.getValue() ?? 0;
        const nx = group.getSetting<number>("nx")?.getValue() ?? 1;
        const ny = group.getSetting<number>("ny")?.getValue() ?? 1;
        const dx = group.getSetting<number>("dx")?.getValue() ?? 10;
        const dy = group.getSetting<number>("dy")?.getValue() ?? 10;
        const angle = group.getSetting<number>("angle")?.getValue() ?? 0;

        const rad = angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        let idx = 0;
        for (let iy = 0; iy < ny; iy++) {
            for (let ix = 0; ix < nx; ix++) {
                const lgx = ix * dx;
                const lgy = iy * dy;
                const rgx = lgx * cos - lgy * sin;
                const rgy = lgx * sin + lgy * cos;
                points.push({ x: sx + rgx, y: sy + rgy, i: idx++ });
            }
        }
    }

    // --- Determine Bounds & Scale ---
    if (points.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });

    if (maxX - minX < 1) { maxX += 1; minX -= 1; }
    if (maxY - minY < 1) { maxY += 1; minY -= 1; }

    const padding = 20;
    const scaleX = (w - 2 * padding) / (maxX - minX);
    const scaleY = (h - 2 * padding) / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    // --- Draw Axis Helper ---
    ctx.strokeStyle = '#eee';
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();

    // --- Draw Points ---
    for (const pt of points) {
        // World -> Canvas
        const px = w / 2 + (pt.x - midX) * scale;
        const py = h / 2 - (pt.y - midY) * scale;

        ctx.beginPath();
        if (pt.i === lastHoleIndex) {
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'darkred';
            ctx.arc(px, py, 18, 0, 2 * Math.PI);
            ctx.fill();
        } else if (pt.i === currentHoleIndex) {
            ctx.fillStyle = '#ffecb3';
            ctx.strokeStyle = '#ffb300';
            ctx.arc(px, py, 18, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ccc';
            ctx.strokeStyle = '#999';
            ctx.arc(px, py, 18, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = "center";

        ctx.fillText((pt.i + 1).toString(), px, py + 5);
    }

    // Draw Center/Origin Relative to bounds if visible? 
    // Actually our view is centered on the Bounding Box of the points.
    // The "World Origin" might be off screen. 
    // Let's draw the World Origin if it's within logical view? 
    // For now, center blue dot is canvas center (which is bounding box center).
    // Let's make the canvas center dot distinct (Center of Pattern)
    ctx.fillStyle = 'blue';
    ctx.fillRect(w / 2 - 2, h / 2 - 2, 4, 4);

    // --- Draw Machine Position Crosshair ---
    if (currentState && currentState.wpos) {
        const mx = currentState.wpos[0];
        const my = currentState.wpos[1];

        const mpx = w / 2 + (mx - midX) * scale;
        const mpy = h / 2 - (my - midY) * scale;

        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mpx - 10, mpy);
        ctx.lineTo(mpx + 10, mpy);
        ctx.moveTo(mpx, mpy - 10);
        ctx.lineTo(mpx, mpy + 10);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

}

function option(text: string) {
    const opt = document.createElement('option');
    opt.text = text;
    opt.value = text;
    return opt;
}

function optGroup(label: string, opts: HTMLElement[]) {
    const group = document.createElement('optgroup');
    group.label = label;
    opts.forEach(o => group.appendChild(o));
    return group;
}
