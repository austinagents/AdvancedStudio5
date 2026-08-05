import type {StudioBlock} from "../../shared/project";
import {content, edge, node, row} from "../antv-studio/sample-content";
import {defaultControls} from "../antv-studio/theme";
import type {
  AdvancedStudioProject,
  AdvancedStudioScene,
} from "./scene-contract";

const executiveQuestionInfographic: StudioBlock = {
  id: "template-2-executive-question",
  type: "metric",
  title: "The Executive Question",
  x: 0,
  y: 0,
  width: 1080,
  height: 1350,
  designPreset: "hero",
  template: "list-grid-badge-card",
  theme: "dark",
  data: {
    title: "The Executive Question",
    desc: "Which move converts the strongest evidence into durable growth?",
    lists: [
      {
        label: "Decision confidence",
        value: 78,
        desc: "The evidence must clear the operating threshold",
      },
    ],
  },
};

const evidenceInfographic: StudioBlock = {
  id: "template-2-evidence",
  type: "bars",
  title: "Focus the Evidence",
  x: 0,
  y: 0,
  width: 1080,
  height: 1350,
  designPreset: "data",
  template: "chart-bar-plain-text",
  theme: "dark",
  data: {
    title: "Focus the Evidence",
    desc: "Revenue signals carry more decision weight than attention alone",
    values: [
      {label: "Reach", value: 38},
      {label: "Engagement", value: 56},
      {label: "Pipeline", value: 83},
      {label: "Retention", value: 91},
    ],
  },
};

const decisionInfographic: StudioBlock = {
  id: "template-2-decision",
  type: "comparison",
  title: "Frame the Decision",
  x: 0,
  y: 0,
  width: 1080,
  height: 1350,
  designPreset: "balanced",
  template: "compare-binary-horizontal-compact-card-vs",
  theme: "dark",
  data: {
    title: "Frame the Decision",
    desc: "Match the growth move to the evidence and operating readiness",
    compares: [
      {
        label: "Invest now",
        value: 78,
        children: [
          {label: "Demand signal is clear"},
          {label: "Economics support the move"},
        ],
      },
      {
        label: "Sequence the work",
        value: 63,
        children: [
          {label: "Capacity remains constrained"},
          {label: "Handoffs need reinforcement"},
        ],
      },
    ],
  },
};

const executionInfographic: StudioBlock = {
  id: "template-2-execution",
  type: "process",
  title: "Sequence the Work",
  x: 0,
  y: 0,
  width: 1080,
  height: 1350,
  designPreset: "process",
  template: "sequence-steps-simple",
  theme: "dark",
  data: {
    title: "Sequence the Work",
    desc: "A focused operating sequence turns the decision into momentum",
    sequences: [
      {label: "Align", desc: "Commit to the signal"},
      {label: "Enable", desc: "Remove the constraint"},
      {label: "Launch", desc: "Execute the move"},
      {label: "Learn", desc: "Measure and adapt"},
    ],
  },
};

const executiveSignalInfographic: StudioBlock = {
  id: "template-2-executive-signal",
  type: "metrics",
  title: "Executive Signal",
  x: 0,
  y: 0,
  width: 1080,
  height: 1350,
  designPreset: "summary",
  template: "list-grid-compact-card",
  theme: "dark",
  data: {
    title: "Executive Signal",
    desc: "Five connected signals turn evidence into confident action",
    lists: [
      {label: "Read the Signal", desc: "Find the evidence that matters"},
      {label: "Weigh the Evidence", desc: "Separate attention from impact"},
      {label: "Choose the Move", desc: "Match ambition to readiness"},
      {label: "Act in Sequence", desc: "Turn the decision into momentum"},
      {label: "Measure the Lift", desc: "Confirm the result and adapt"},
    ],
  },
};

const crossfade = (durationFrames = 12) => ({
  preset: "crossfade" as const,
  durationFrames,
});

const template2Scenes: AdvancedStudioScene[] = [
  {
    id: "template-2-01-executive-question",
    type: "board",
    title: "The Executive Question",
    durationFrames: 90,
    content: {
      activeBlockId: null,
      animation: "overview",
      stableTextMotion: true,
      infographic: executiveQuestionInfographic,
    },
    transitionOut: crossfade(),
    cameraPath: {preset: "push-in"},
  },
  {
    id: "template-2-02-noisy-signals",
    type: "g2",
    title: "Signals Compete",
    durationFrames: 90,
    content: {
      designId: "g2-revenue-ranking",
      content: content(
        "Signals Compete",
        "Decision impact reveals which signals deserve attention",
        [
          row("reach", "Reach", 38, "Attention"),
          row("engagement", "Engagement", 56, "Attention"),
          row("pipeline", "Pipeline", 83, "Revenue"),
          row("retention", "Retention", 91, "Revenue"),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "drift-right"},
  },
  {
    id: "template-2-03-signal-system",
    type: "g6",
    title: "The Signal System",
    durationFrames: 90,
    content: {
      designId: "g6-central-topic-explainer",
      content: content(
        "The Signal System",
        "Three evidence clusters shape the growth decision",
        [row("nodes", "Signals", 7)],
        [
          node("decision", "Growth Decision"),
          node("demand", "Demand", "Market"),
          node("reach", "Reach", "Market"),
          node("capacity", "Capacity", "Operations"),
          node("speed", "Speed", "Operations"),
          node("value", "Value", "Economics"),
          node("retention", "Retention", "Economics"),
        ],
        [
          edge("decision", "demand"),
          edge("demand", "reach"),
          edge("decision", "capacity"),
          edge("capacity", "speed"),
          edge("decision", "value"),
          edge("value", "retention"),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "overview-sweep"},
  },
  {
    id: "template-2-04-evidence-focus",
    type: "board",
    title: "Focus the Evidence",
    durationFrames: 75,
    content: {
      activeBlockId: null,
      animation: "overview",
      stableTextMotion: true,
      infographic: evidenceInfographic,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "push-left"},
  },
  {
    id: "template-2-05-constraint-map",
    type: "g6",
    title: "The Constraint",
    durationFrames: 90,
    content: {
      designId: "g6-symptom-cause-map",
      content: content(
        "The Constraint",
        "Growth stalls when the operating system cannot absorb demand",
        [row("nodes", "Constraints", 6)],
        [
          node("stall", "Growth Stalls"),
          node("message", "Mixed Message"),
          node("handoff", "Slow Handoff"),
          node("capacity", "Thin Capacity"),
          node("followup", "Weak Follow-up"),
          node("feedback", "Late Feedback"),
        ],
        [
          edge("stall", "message"),
          edge("stall", "handoff"),
          edge("stall", "capacity"),
          edge("stall", "followup"),
          edge("stall", "feedback"),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "diagonal-in"},
  },
  {
    id: "template-2-06-operating-lift",
    type: "s2",
    title: "Operating Lift",
    durationFrames: 105,
    content: {
      designId: "s2-before-after-metrics",
      content: content(
        "Operating Lift",
        "The evidence shows where disciplined execution compounds",
        [
          row("response", "Response speed", 84, "Before vs after", 46, 90),
          row("conversion", "Conversion", 68, "Before vs after", 41, 72),
          row("retention", "Retention", 81, "Before vs after", 63, 85),
          row("capacity", "Capacity used", 76, "Before vs after", 58, 80),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "tilt-down"},
  },
  {
    id: "template-2-07-decision-frame",
    type: "board",
    title: "Frame the Decision",
    durationFrames: 75,
    content: {
      activeBlockId: null,
      animation: "overview",
      stableTextMotion: true,
      infographic: decisionInfographic,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "snap-focus"},
  },
  {
    id: "template-2-08-result-drivers",
    type: "g2",
    title: "What Creates the Result",
    durationFrames: 105,
    content: {
      designId: "g2-revenue-ranking",
      content: content(
        "What Creates the Result",
        "Execution gains outweigh the remaining drag",
        [
          row("focus", "Sharper Focus", 18, "Gain"),
          row("speed", "Faster Handoff", 14, "Gain"),
          row("retention", "Retention Lift", 11, "Gain"),
          row("friction", "Process Drag", 7, "Drag"),
          row("delay", "Decision Delay", 4, "Drag"),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "rise-up"},
  },
  {
    id: "template-2-09-decision-path",
    type: "g6",
    title: "Decision Path",
    durationFrames: 90,
    content: {
      designId: "g6-diagnostic-flow",
      content: content(
        "Decision Path",
        "Choose the move that matches the evidence",
        [row("nodes", "Decision points", 6)],
        [
          node("signal", "Signal Clear?"),
          node("capacity", "Capacity Ready?"),
          node("invest", "Invest Now"),
          node("sequence", "Sequence Work"),
          node("test", "Run Focused Test"),
          node("measure", "Measure Again"),
        ],
        [
          edge("signal", "capacity", "Yes"),
          edge("signal", "test", "No"),
          edge("capacity", "invest", "Yes"),
          edge("capacity", "sequence", "No"),
          edge("test", "measure"),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "push-right"},
  },
  {
    id: "template-2-10-execution-sequence",
    type: "board",
    title: "Sequence the Work",
    durationFrames: 75,
    content: {
      activeBlockId: null,
      animation: "overview",
      stableTextMotion: true,
      infographic: executionInfographic,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "pull-back"},
  },
  {
    id: "template-2-11-operating-plan",
    type: "g6",
    title: "The Operating Plan",
    durationFrames: 90,
    content: {
      designId: "g6-four-step-process",
      content: content(
        "The Operating Plan",
        "A focused sequence turns the decision into momentum",
        [row("nodes", "Steps", 4)],
        [
          node("align", "Align"),
          node("enable", "Enable"),
          node("launch", "Launch"),
          node("learn", "Learn"),
        ],
        [
          edge("align", "enable"),
          edge("enable", "launch"),
          edge("launch", "learn"),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "drift-left"},
  },
  {
    id: "template-2-12-confidence-threshold",
    type: "g2",
    title: "Confidence Threshold",
    durationFrames: 90,
    content: {
      designId: "g2-kpi-sparkline",
      content: content(
        "Confidence Threshold",
        "The decision is ready when the evidence clears the bar",
        [
          row("signal", "Signal", 42),
          row("alignment", "Alignment", 51),
          row("capacity", "Capacity", 63),
          row("economics", "Economics", 71),
          row("ready", "Ready", 78),
        ],
      ),
      controls: defaultControls,
    },
    transitionIn: crossfade(),
    transitionOut: crossfade(),
    cameraPath: {preset: "push-in"},
  },
  {
    id: "template-2-13-system-overview",
    type: "board",
    title: "Executive Signal",
    durationFrames: 105,
    content: {
      activeBlockId: null,
      animation: "overview",
      stableTextMotion: true,
      infographic: executiveSignalInfographic,
    },
    transitionIn: crossfade(),
    cameraPath: {preset: "overview-sweep"},
  },
];

export const advancedStudioTemplate2Project: AdvancedStudioProject = {
  title: "Advanced Studio Template 2",
  scenes: template2Scenes,
};
